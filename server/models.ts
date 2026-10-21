import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { config } from './config.js';
import {
  buildSystemInstruction,
  getGuidedApps,
  RoutineStatePayload,
  ProgressSummaryPayload,
  ToolsProfilePayload,
  UserProjectPayload,
  LatestAuditPayload,
} from './knowledge.js';
import { getProductById } from './products.js';
import { toolDeclarations, executeServerTool } from './tools.js';

export { toolDeclarations, executeServerTool };

export type TextTaskType = 'chat' | 'summary' | 'reportDraft';

/**
 * Automatic thinking level per text request, set in code, never by the user:
 * - "chat" (/api/chat): low. Fast and cheap; these are short coaching replies.
 * - "summary" (/api/summarize): high. Accuracy matters, user isn't waiting on it, runs rarely.
 * - "reportDraft" (/api/report/draft): high.
 */
export function thinkingFor(task: TextTaskType): ThinkingLevel {
  switch (task) {
    case 'chat':
      return ThinkingLevel.LOW;
    case 'summary':
      return ThinkingLevel.HIGH;
    case 'reportDraft':
      return ThinkingLevel.HIGH;
  }
}

export function getThinkingLevelsConfig(): Record<TextTaskType, 'low' | 'high'> {
  return {
    chat: 'low',
    summary: 'high',
    reportDraft: 'high',
  };
}

export interface ModelHealthStatus {
  checkedAt: string;
  liveModel: string;
  textModel: string;
  textModelFallback: string | null;
  liveModelOk: boolean;
  textModelOk: boolean;
  textModelFallbackOk: boolean;
  liveAvailable: boolean;
  newerLiveModelSuggestion: string | null;
  warningMessage: string | null;
  thinkingLevels: Record<TextTaskType, 'low' | 'high'>;
  availableModels: string[];
}

const thinkingWarnings = new Set<string>();
let baseCatalogWarning: string | null = 'Model health check in progress...';

function composeWarningMessage(): string | null {
  const parts: string[] = [];
  if (baseCatalogWarning) {
    parts.push(baseCatalogWarning);
  }
  for (const w of thinkingWarnings) {
    if (!parts.includes(w)) {
      parts.push(w);
    }
  }
  return parts.length > 0 ? parts.join(' | ') : null;
}

function recordThinkingWarning(model: string) {
  const msg = `Thinking level not supported by ${model}; running without it`;
  thinkingWarnings.add(msg);
  currentHealthStatus = {
    ...currentHealthStatus,
    warningMessage: composeWarningMessage(),
  };
}

export let currentHealthStatus: ModelHealthStatus = {
  checkedAt: new Date().toISOString(),
  liveModel: config.liveModel,
  textModel: config.textModel,
  textModelFallback: config.textModelFallback || null,
  liveModelOk: false,
  textModelOk: false,
  textModelFallbackOk: !config.textModelFallback,
  liveAvailable: false,
  newerLiveModelSuggestion: null,
  warningMessage: composeWarningMessage(),
  thinkingLevels: getThinkingLevelsConfig(),
  availableModels: [],
};

export function getActiveApiKey(): string {
  return process.env.API_KEY || process.env.GEMINI_API_KEY || config.geminiApiKey || '';
}

export function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: getActiveApiKey(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export const ai = getAiClient();

function is429Or503(err: any): boolean {
  const status = Number(err?.status || err?.code || 0);
  const msg = String(err?.message || '');
  return (
    status === 429 ||
    status === 503 ||
    msg.includes('429') ||
    msg.includes('503') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('high demand')
  );
}

function isThinkingRejectedError(err: any): boolean {
  if (is429Or503(err)) return false;
  const msg = String(err?.message || '').toLowerCase();
  return (
    msg.includes('thinking') ||
    msg.includes('thinkinglevel') ||
    msg.includes('thinking_level') ||
    msg.includes('thinkingconfig') ||
    msg.includes('thinking_config')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calls a single model with the configured thinkingLevel.
 * If the model rejects the thinking setting, retries the same request once without thinkingConfig
 * and records "Thinking level not supported by <model>; running without it" in health status.
 */
async function callModelWithThinkingFallback(
  model: string,
  contents: any,
  baseConfig: Record<string, any>,
  thinkingLevel: ThinkingLevel
): Promise<any> {
  const configWithThinking = {
    ...baseConfig,
    thinkingConfig: { thinkingLevel },
  };

  try {
    return await getAiClient().models.generateContent({
      model,
      contents,
      config: configWithThinking,
    });
  } catch (err: any) {
    if (isThinkingRejectedError(err)) {
      recordThinkingWarning(model);
      const { thinkingConfig: _removed, ...configWithoutThinking } = configWithThinking;
      return await getAiClient().models.generateContent({
        model,
        contents,
        config: configWithoutThinking,
      });
    }
    throw err;
  }
}

/**
 * Primary text model execution:
 * - Uses TEXT_MODEL as the primary text model.
 * - On 429/503, retries TEXT_MODEL once after a 1-second backoff.
 * - If still 429/503 and TEXT_MODEL_FALLBACK is configured, tries TEXT_MODEL_FALLBACK.
 */
async function generateTextWithRetryAndFallback(params: {
  task: TextTaskType;
  contents: any;
  config?: Record<string, any>;
}): Promise<{ response: any; modelUsed: string }> {
  const primaryModel = config.textModel;
  const fallbackModel = config.textModelFallback;
  const thinkingLevel = thinkingFor(params.task);
  const baseConfig = params.config || {};

  try {
    const response = await callModelWithThinkingFallback(
      primaryModel,
      params.contents,
      baseConfig,
      thinkingLevel
    );
    return { response, modelUsed: primaryModel };
  } catch (firstErr: any) {
    if (!is429Or503(firstErr)) {
      throw firstErr;
    }

    // Retry once on primary model after 1-second backoff
    await sleep(1000);
    try {
      const response = await callModelWithThinkingFallback(
        primaryModel,
        params.contents,
        baseConfig,
        thinkingLevel
      );
      return { response, modelUsed: primaryModel };
    } catch (retryErr: any) {
      if (is429Or503(retryErr) && fallbackModel && fallbackModel !== primaryModel) {
        const response = await callModelWithThinkingFallback(
          fallbackModel,
          params.contents,
          baseConfig,
          thinkingLevel
        );
        return { response, modelUsed: fallbackModel };
      }
      throw retryErr;
    }
  }
}

/**
 * Validates configured models against the API catalog on start using exact name matches.
 * If either is missing, flags a warning for /admin and disables live mode (text-only fallback).
 * If a newer version is present, flags it as a suggestion on /admin. Never switches automatically.
 */
export async function runModelHealthCheck(): Promise<ModelHealthStatus> {
  const timestamp = new Date().toISOString();
  if (!getActiveApiKey()) {
    baseCatalogWarning =
      'GEMINI_API_KEY is missing. Add your API key in Secrets to activate AI functions.';
    currentHealthStatus = {
      checkedAt: timestamp,
      liveModel: config.liveModel,
      textModel: config.textModel,
      textModelFallback: config.textModelFallback || null,
      liveModelOk: false,
      textModelOk: false,
      textModelFallbackOk: !config.textModelFallback,
      liveAvailable: false,
      newerLiveModelSuggestion: null,
      warningMessage: composeWarningMessage(),
      thinkingLevels: getThinkingLevelsConfig(),
      availableModels: [],
    };
    return currentHealthStatus;
  }

  try {
    const listPager = await getAiClient().models.list();
    const modelNames: string[] = [];
    for await (const m of listPager) {
      if (m.name) {
        modelNames.push(m.name.replace(/^models\//, ''));
      }
    }

    // Exact name matches only (not .includes())
    const liveExists = modelNames.some(m => m === config.liveModel);
    const textExists = modelNames.some(m => m === config.textModel);
    const fallbackExists = config.textModelFallback
      ? modelNames.some(m => m === config.textModelFallback)
      : true;

    // Look for newer regular live models (exclude extended-thinking which requires non-blocking tools)
    let suggestion: string | null = null;
    const liveMatches = modelNames.filter(
      m =>
        m.includes('live') &&
        !m.includes('extended-thinking') &&
        !m.includes('legacy') &&
        !m.includes('preview-0')
    );
    for (const lm of liveMatches) {
      if (lm > config.liveModel) {
        suggestion = lm;
      }
    }

    const catalogWarnings: string[] = [];
    if (!liveExists && !textExists) {
      catalogWarnings.push(
        `Configured live model "${config.liveModel}" and text model "${config.textModel}" were not found in the Gemini model catalog. Running in text-only fallback.`
      );
    } else if (!liveExists) {
      catalogWarnings.push(
        `Live voice model "${config.liveModel}" not found in catalog. Live voice is disabled and the app is operating in text-only fallback.`
      );
    } else if (!textExists) {
      catalogWarnings.push(`Text model "${config.textModel}" was not found in the model catalog.`);
    }

    if (config.textModelFallback && !fallbackExists) {
      catalogWarnings.push(
        `Fallback text model "${config.textModelFallback}" was not found in the model catalog.`
      );
    }

    baseCatalogWarning = catalogWarnings.length > 0 ? catalogWarnings.join(' ') : null;

    currentHealthStatus = {
      checkedAt: timestamp,
      liveModel: config.liveModel,
      textModel: config.textModel,
      textModelFallback: config.textModelFallback || null,
      liveModelOk: liveExists,
      textModelOk: textExists,
      textModelFallbackOk: fallbackExists,
      liveAvailable: liveExists,
      newerLiveModelSuggestion: suggestion,
      warningMessage: composeWarningMessage(),
      thinkingLevels: getThinkingLevelsConfig(),
      availableModels: modelNames,
    };

    return currentHealthStatus;
  } catch (err: any) {
    baseCatalogWarning = `Health check error: ${err?.message || 'Unable to list models'}. Defaulting to safe fallback.`;
    currentHealthStatus = {
      checkedAt: timestamp,
      liveModel: config.liveModel,
      textModel: config.textModel,
      textModelFallback: config.textModelFallback || null,
      liveModelOk: false,
      textModelOk: false,
      textModelFallbackOk: !config.textModelFallback,
      liveAvailable: false,
      newerLiveModelSuggestion: null,
      warningMessage: composeWarningMessage(),
      thinkingLevels: getThinkingLevelsConfig(),
      availableModels: [],
    };
    return currentHealthStatus;
  }
}

/**
 * Text Chat handling using TEXT_MODEL (with thinkingFor("chat") = low).
 * Supports multimodal screen frame analysis (when user shares screen in text mode),
 * plus earlier session summary, active session notes, and current routine state.
 */
export async function handleTextChat(payload: {
  userName: string;
  userEmail: string;
  product: string;
  messages: Array<{ role: string; text: string }>;
  userTimezone?: string;
  currentScreenFrame?: string | null;
  routineState?: RoutineStatePayload | null;
  progressSummary?: ProgressSummaryPayload | string | null;
  sessionNotes?: string[];
  toolsProfile?: ToolsProfilePayload | null;
  userProjects?: UserProjectPayload[] | null;
  latestAudit?: LatestAuditPayload | null;
}): Promise<{
  reply: string;
  toolInvocations?: Array<{ name: string; args: any; result: any }>;
}> {
  const {
    userName,
    product = 'muse',
    messages,
    currentScreenFrame,
    routineState = null,
    progressSummary = null,
    sessionNotes = [],
    toolsProfile = null,
    userProjects = null,
    latestAudit = null,
  } = payload;

  const systemInstruction = buildSystemInstruction(userName, product, {
    progressSummary,
    sessionNotes,
    routineState,
    toolsProfile,
    userProjects,
    latestAudit,
  });

  // Input caps: at most the last 60 messages, each truncated to 4,000 characters
  const cappedMessages = (Array.isArray(messages) ? messages : [])
    .slice(-60)
    .map(m => ({
      role: typeof m?.role === 'string' ? m.role : 'user',
      text: typeof m?.text === 'string' ? m.text.slice(0, 4000) : '',
    }));

  const cleanedTurns: Array<{ role: 'user' | 'model'; parts: any[] }> = [];

  for (const m of cappedMessages) {
    if (!m.text || !m.text.trim()) continue;

    let turnRole: 'user' | 'model' = 'user';
    let textContent = m.text;

    if (m.role === 'guide' || m.role === 'model') {
      turnRole = 'model';
    } else if (m.role === 'system') {
      turnRole = 'user';
      textContent = `[System Notice: ${m.text}]`;
    } else {
      turnRole = 'user';
    }

    const lastTurn = cleanedTurns[cleanedTurns.length - 1];
    if (lastTurn && lastTurn.role === turnRole) {
      lastTurn.parts.push({ text: textContent });
    } else {
      cleanedTurns.push({
        role: turnRole,
        parts: [{ text: textContent }],
      });
    }
  }

  if (cleanedTurns.length > 0 && cleanedTurns[0].role === 'model') {
    cleanedTurns.shift();
  }

  if (cleanedTurns.length === 0) {
    cleanedTurns.push({
      role: 'user',
      parts: [{ text: 'Hello, please help me get started.' }],
    });
  }

  // Multimodal Screen Analysis: attach latest JPEG frame (<= 2MB base64) to the final user turn
  const MAX_SCREEN_FRAME_BASE64 = 2 * 1024 * 1024;
  if (
    currentScreenFrame &&
    typeof currentScreenFrame === 'string' &&
    currentScreenFrame.length > 100 &&
    currentScreenFrame.length <= MAX_SCREEN_FRAME_BASE64
  ) {
    const lastUserTurn = [...cleanedTurns].reverse().find(t => t.role === 'user');
    if (lastUserTurn) {
      lastUserTurn.parts.unshift({
        inlineData: {
          mimeType: 'image/jpeg',
          data: currentScreenFrame,
        },
      });
    }
  }

  const { response } = await generateTextWithRetryAndFallback({
    task: 'chat',
    contents: cleanedTurns,
    config: {
      systemInstruction,
      temperature: 0.7,
      tools: [{ functionDeclarations: toolDeclarations }],
    },
  });

  const functionCalls = response.functionCalls;
  const toolInvocations: Array<{ name: string; args: any; result: any }> = [];

  let textReply = response.text || '';

  if (functionCalls && functionCalls.length > 0) {
    for (const fc of functionCalls) {
      const toolName = fc.name || 'tool';
      const result = executeServerTool(toolName, fc.args as Record<string, any>, product);
      toolInvocations.push({
        name: toolName,
        args: fc.args,
        result,
      });
    }

    if (!textReply.trim()) {
      const candidateContent = response.candidates?.[0]?.content;
      if (candidateContent) {
        try {
          const { response: continuationResponse } = await generateTextWithRetryAndFallback({
            task: 'chat',
            contents: [
              ...cleanedTurns,
              candidateContent,
              {
                role: 'user',
                parts: toolInvocations.map(ti => ({
                  functionResponse: {
                    name: ti.name,
                    response: { result: ti.result },
                  },
                })),
              },
            ],
            config: {
              systemInstruction,
              tools: [{ functionDeclarations: toolDeclarations }],
            },
          });
          textReply = continuationResponse.text || '';
        } catch {
          // Fall through to deterministic tool reply below
        }
      }
    }
  }

  if (!textReply.trim()) {
    const updateTool = toolInvocations.find(
      t => t.name === 'confirm_step' || t.name === 'update_routine_progress'
    );
    const launchTool = toolInvocations.find(t => t.name === 'launch_app');
    const escalateTool = toolInvocations.find(t => t.name === 'escalate_to_owner');
    const contractTool = toolInvocations.find(t => t.name === 'save_task_contract');
    const auditTool = toolInvocations.find(t => t.name === 'record_audit_result');
    const mismatchTool = toolInvocations.find(t => t.name === 'report_knowledge_mismatch');
    const toolsProfileTool = toolInvocations.find(t => t.name === 'update_tools_profile');
    const noteSavedSucceeded = toolInvocations.some(
      t => t.name === 'save_session_note' && t.result?.saved === true
    );

    if (escalateTool) {
      textReply = `I've drafted a short note for Nic below. Have a look, change anything you like, and press Send if it looks right. You can also book a time directly.`;
    } else if (contractTool) {
      const { title, rung, rungName, cappedAtRung2 } = contractTool.result || {};
      textReply = cappedAtRung2
        ? `I've prepared your task contract for ${title || 'your project'} below at Rung ${rung ?? 2} (${rungName || 'Act with approval'}). Because it involves purchases, public posts, or sending to others, it stays at Rung 2 so you approve each time. You can edit any line, save it to My projects, or copy it for Muse.`
        : `I've prepared your task contract for ${title || 'your project'} below at Rung ${rung ?? 0} (${rungName || 'Watch'}). You can edit any line, save it to My projects, or copy it to paste into Muse.`;
    } else if (updateTool) {
      const { app_id, completed_step, step, next_step } = updateTool.result || {};
      const confirmedNum = step ?? completed_step ?? 1;
      const apps = getGuidedApps(product);
      const app = apps.find(a => a.id === app_id);
      if (next_step && app) {
        const nextStepObj = app.steps.find(s => s.number === next_step);
        const nextInquiry = nextStepObj?.coach || nextStepObj?.coachPrompt || nextStepObj?.detail || '';
        textReply = `Great, Step ${confirmedNum} is confirmed! Let's move to Step ${next_step}: ${nextStepObj?.title || ''}.\n\n${nextInquiry}`;
      } else if (noteSavedSucceeded) {
        textReply = `All steps in this routine are now complete! I've saved your notes for this session.`;
      } else {
        textReply = `All steps in this routine are now complete!`;
      }
    } else if (auditTool) {
      const { area, rating, reason } = auditTool.result || {};
      textReply = `I've recorded ${area || 'that area'} as ${rating || 'checked'}${reason ? `: ${reason}` : '.'}`;
    } else if (launchTool) {
      const appId = launchTool.args?.app_id;
      const apps = getGuidedApps(product);
      const app = apps.find(a => a.id === appId);
      const step1 = app?.steps[0];
      const step1Inquiry = step1?.coach || step1?.coachPrompt || step1?.detail || '';
      textReply = `I've opened the roadmap for ${app?.title || 'your routine'}. Let's take it one step at a time:\n\n${step1Inquiry}`;
    } else if (toolsProfileTool) {
      textReply = `I've updated your tools profile with that information.`;
    } else if (mismatchTool) {
      textReply = `Thanks for pointing that out—I'll follow what's on your screen rather than my notes.`;
    } else if (toolInvocations.some(t => t.name === 'get_booking_link')) {
      textReply = `Here is Nic's direct booking link below.`;
    } else if (toolInvocations.some(t => t.name === 'request_screenshare')) {
      textReply = `Whenever you're ready, sharing your screen will let me see what's on display so we can walk through it together.`;
    } else if (toolInvocations.some(t => t.name === 'stop_screenshare')) {
      textReply = `I've seen what I needed and stopped screen sharing for you.`;
    } else if (noteSavedSucceeded) {
      textReply = `I've saved that note to your session.`;
    } else if (toolInvocations.length === 0) {
      throw new Error('Model returned an empty response.');
    }
  }

  return {
    reply: textReply,
    toolInvocations,
  };
}

export interface SummarizeResponse {
  done: string[];
  inProgress: string[];
  boundariesAndPreferences: string[];
  openQuestions: string[];
  suggestedNextStep: string;
  summary: string;
}

/**
 * Generates a structured progress summary using TEXT_MODEL, thinkingFor("summary") = high,
 * and a JSON responseSchema.
 * Only includes things the user actually said or confirmed.
 * Never includes passwords, codes, card numbers, or anything seen on screen that looks sensitive.
 * Throws if the model call fails or returns invalid JSON so the route returns HTTP 503.
 */
export async function handleSummarize(payload: {
  userName: string;
  product: string;
  transcript?: Array<{ role: string; text: string }>;
  messages?: Array<{ role: string; text: string }>;
  routineState?: RoutineStatePayload | null;
  previousSummary?: ProgressSummaryPayload | string | null;
}): Promise<SummarizeResponse> {
  const {
    userName,
    product = 'muse',
    transcript,
    messages,
    routineState = null,
    previousSummary = null,
  } = payload;

  const productObj = getProductById(product);
  const productName = productObj?.name || product;

  const rawTranscript = Array.isArray(transcript)
    ? transcript
    : Array.isArray(messages)
    ? messages
    : [];

  // Last 80 messages, text only
  const formattedTranscript = rawTranscript
    .slice(-80)
    .filter(m => m && typeof m.text === 'string' && m.text.trim())
    .map(m => {
      const label =
        m.role === 'user' ? 'User' : m.role === 'guide' || m.role === 'model' ? 'Guide' : 'System';
      return `${label}: ${m.text.trim().slice(0, 4000)}`;
    })
    .join('\n');

  const prevSummaryStr =
    typeof previousSummary === 'string'
      ? previousSummary
      : previousSummary && typeof previousSummary === 'object'
      ? JSON.stringify(previousSummary)
      : 'None';

  const routineStateStr = routineState ? JSON.stringify(routineState) : 'None';

  const prompt = `You are writing a calm, plain-language progress summary for ${userName} on product "${productName}".

STRICT PRIVACY & ACCURACY RULES:
1. Only include things the user actually said or confirmed in the conversation or routine progress. Do NOT invent or assume steps they did not confirm.
2. NEVER include passwords, one-time codes, API keys, card numbers, government IDs, private URLs/tokens, or anything seen on screen that looks sensitive.
3. Write "summary" directly to the user in second person ("you"), in a warm, plain, unhurried tone, and strictly <= 1,200 characters.
4. Track only setup progress, decisions, boundaries, preferences, and open questions. Ignore small talk, greetings, and technical checks of this app (for example audio or microphone tests).

Previous Progress Summary:
${prevSummaryStr}

Current Routine State:
${routineStateStr}

Recent Conversation Transcript (last 80 messages):
${formattedTranscript || '(No new messages)'}`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      done: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Steps, checks, or tasks the user actually completed or confirmed.',
      },
      inProgress: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Routines, steps, or topics currently in progress.',
      },
      boundariesAndPreferences: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Safety boundaries, permissions, or preferences the user stated or chose.',
      },
      openQuestions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Unresolved questions or things the user wanted to check later.',
      },
      suggestedNextStep: {
        type: Type.STRING,
        description: 'One clear, calm suggested next step for their next visit.',
      },
      summary: {
        type: Type.STRING,
        description: 'Plain and warm summary (<= 1,200 characters) written directly to the user as "you".',
      },
    },
    required: [
      'done',
      'inProgress',
      'boundariesAndPreferences',
      'openQuestions',
      'suggestedNextStep',
      'summary',
    ],
  };

  const { response } = await generateTextWithRetryAndFallback({
    task: 'summary',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema,
      temperature: 0.3,
    },
  });

  const rawText = (response.text || '').trim();
  if (!rawText) {
    throw new Error('Model returned an empty summary response');
  }

  const parsed = JSON.parse(rawText);
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    typeof parsed.summary !== 'string' ||
    !parsed.summary.trim()
  ) {
    throw new Error('Model returned invalid summary JSON');
  }

  return {
    done: Array.isArray(parsed.done) ? parsed.done.map((s: any) => String(s)) : [],
    inProgress: Array.isArray(parsed.inProgress)
      ? parsed.inProgress.map((s: any) => String(s))
      : [],
    boundariesAndPreferences: Array.isArray(parsed.boundariesAndPreferences)
      ? parsed.boundariesAndPreferences.map((s: any) => String(s))
      : [],
    openQuestions: Array.isArray(parsed.openQuestions)
      ? parsed.openQuestions.map((s: any) => String(s))
      : [],
    suggestedNextStep:
      typeof parsed.suggestedNextStep === 'string' && parsed.suggestedNextStep.trim()
        ? parsed.suggestedNextStep.slice(0, 400)
        : '',
    summary: parsed.summary.trim().slice(0, 1200),
  };
}

export interface ReportDraftResponse {
  goal: string;
  tried: string;
  blocker: string;
}

/**
 * Generates a pre-fill draft for the "Report for Nic" card when the user opens it manually.
 * Uses thinkingFor("reportDraft") = high and a JSON responseSchema { goal, tried, blocker },
 * each a few plain sentences, written only from what the user said or confirmed, with nothing sensitive.
 */
export async function handleReportDraft(payload: {
  userName: string;
  product: string;
  transcript?: Array<{ role: string; text: string }>;
  progressSummary?: ProgressSummaryPayload | string | null;
  routineState?: RoutineStatePayload | null;
}): Promise<ReportDraftResponse> {
  const {
    userName,
    product = 'muse',
    transcript,
    progressSummary = null,
    routineState = null,
  } = payload;

  const productObj = getProductById(product);
  const productName = productObj?.name || product;

  const rawTranscript = Array.isArray(transcript) ? transcript : [];

  // Last 40 messages, text only
  const formattedTranscript = rawTranscript
    .slice(-40)
    .filter(m => m && typeof m.text === 'string' && m.text.trim())
    .map(m => {
      const label =
        m.role === 'user' ? 'User' : m.role === 'guide' || m.role === 'model' ? 'Guide' : 'System';
      return `${label}: ${m.text.trim().slice(0, 4000)}`;
    })
    .join('\n');

  const progressSummaryStr =
    typeof progressSummary === 'string'
      ? progressSummary
      : progressSummary && typeof progressSummary === 'object'
      ? JSON.stringify(progressSummary)
      : 'None';

  const routineStateStr = routineState ? JSON.stringify(routineState) : 'None';

  const prompt = `You are drafting a short, plain-language handoff note for Nic (the human specialist) on behalf of ${userName} regarding "${productName}".

STRICT PRIVACY & ACCURACY RULES:
1. Only include things the user actually said or confirmed in the conversation, progress summary, or routine state. Do NOT invent steps or assumptions.
2. NEVER include passwords, one-time codes, API keys, card numbers, government IDs, private URLs/tokens, or anything sensitive.
3. Write each field ("goal", "tried", "blocker") as a few plain, clear sentences that the user can easily review and edit before sending.

Progress Summary:
${progressSummaryStr}

Current Routine State:
${routineStateStr}

Recent Conversation Transcript (last 40 messages):
${formattedTranscript || '(No recent messages)'}`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      goal: {
        type: Type.STRING,
        description:
          'A few plain sentences describing what the user is trying to accomplish, based only on what they said or confirmed.',
      },
      tried: {
        type: Type.STRING,
        description:
          'A few plain sentences describing what steps, routines, or settings have already been tried or confirmed.',
      },
      blocker: {
        type: Type.STRING,
        description:
          'A few plain sentences describing what is blocking progress or what question they want Nic to review.',
      },
    },
    required: ['goal', 'tried', 'blocker'],
  };

  const { response } = await generateTextWithRetryAndFallback({
    task: 'reportDraft',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema,
      temperature: 0.3,
    },
  });

  const rawText = (response.text || '').trim();
  if (!rawText) {
    throw new Error('Empty report draft response');
  }

  const parsed = JSON.parse(rawText);
  return {
    goal: typeof parsed.goal === 'string' ? parsed.goal.trim().slice(0, 1000) : '',
    tried: typeof parsed.tried === 'string' ? parsed.tried.trim().slice(0, 1000) : '',
    blocker: typeof parsed.blocker === 'string' ? parsed.blocker.trim().slice(0, 1000) : '',
  };
}
