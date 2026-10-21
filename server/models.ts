import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { config } from './config.js';
import { buildSystemInstruction, getGuidedApps } from './knowledge.js';
import { proposeTimes } from './calendar.js';
import { logAndDispatchEscalation } from './escalations.js';

export interface ModelHealthStatus {
  checkedAt: string;
  liveModel: string;
  textModel: string;
  liveModelOk: boolean;
  textModelOk: boolean;
  liveAvailable: boolean;
  newerLiveModelSuggestion: string | null;
  warningMessage: string | null;
  availableModels: string[];
}

export let currentHealthStatus: ModelHealthStatus = {
  checkedAt: new Date().toISOString(),
  liveModel: config.liveModel,
  textModel: config.textModel,
  liveModelOk: false,
  textModelOk: false,
  liveAvailable: false,
  newerLiveModelSuggestion: null,
  warningMessage: 'Model health check in progress...',
  availableModels: [],
};

export const ai = new GoogleGenAI({
  apiKey: config.geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Validates configured models against the API catalog on start.
 * If either is missing, flags a warning for /admin and disables live mode (text-only fallback).
 * If a newer version is present, flags it as a suggestion on /admin. Never switches automatically.
 */
export async function runModelHealthCheck(): Promise<ModelHealthStatus> {
  const timestamp = new Date().toISOString();
  if (!config.geminiApiKey) {
    currentHealthStatus = {
      checkedAt: timestamp,
      liveModel: config.liveModel,
      textModel: config.textModel,
      liveModelOk: false,
      textModelOk: false,
      liveAvailable: false,
      newerLiveModelSuggestion: null,
      warningMessage: 'GEMINI_API_KEY is missing. Add your API key in Secrets to activate AI functions.',
      availableModels: [],
    };
    return currentHealthStatus;
  }

  try {
    const listPager = await ai.models.list();
    const modelNames: string[] = [];
    for await (const m of listPager) {
      if (m.name) {
        modelNames.push(m.name.replace(/^models\//, ''));
      }
    }

    const liveExists = modelNames.some(m => m === config.liveModel || m.includes(config.liveModel));
    const textExists = modelNames.some(m => m === config.textModel || m.includes(config.textModel));

    // Look for newer live models (e.g. gemini-3.8-live-extended-thinking or higher)
    let suggestion: string | null = null;
    const liveMatches = modelNames.filter(m => m.includes('live') && !m.includes('legacy') && !m.includes('preview-0'));
    for (const lm of liveMatches) {
      if (lm > config.liveModel) {
        suggestion = lm;
      }
    }

    let warning: string | null = null;
    if (!liveExists && !textExists) {
      warning = `Configured live model "${config.liveModel}" and text model "${config.textModel}" were not found in the Gemini model catalog. Running in text-only fallback.`;
    } else if (!liveExists) {
      warning = `Live voice model "${config.liveModel}" not found in catalog. Live voice is disabled and the app is operating in text-only fallback.`;
    } else if (!textExists) {
      warning = `Text model "${config.textModel}" was not verified in model catalog.`;
    }

    currentHealthStatus = {
      checkedAt: timestamp,
      liveModel: config.liveModel,
      textModel: config.textModel,
      liveModelOk: liveExists,
      textModelOk: textExists,
      liveAvailable: liveExists,
      newerLiveModelSuggestion: suggestion,
      warningMessage: warning,
      availableModels: modelNames,
    };

    return currentHealthStatus;
  } catch (err: any) {
    console.error('Failed to run Gemini model health check:', err);
    currentHealthStatus = {
      checkedAt: timestamp,
      liveModel: config.liveModel,
      textModel: config.textModel,
      liveModelOk: false,
      textModelOk: false,
      liveAvailable: false,
      newerLiveModelSuggestion: null,
      warningMessage: `Health check error: ${err.message || 'Unable to list models'}. Defaulting to safe fallback.`,
      availableModels: [],
    };
    return currentHealthStatus;
  }
}

/**
 * Function Declarations for Gemini Live and Text Fallback
 */
export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'request_screenshare',
    description: 'Asks the user for permission to view their screen with a specific, plain one-line reason.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: {
          type: Type.STRING,
          description: 'A brief, friendly one-line reason why seeing the screen is helpful right now.',
        },
      },
      required: ['reason'],
    },
  },
  {
    name: 'stop_screenshare',
    description: 'Signals that the agent has seen what it needed and screen sharing can now end.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'launch_app',
    description: 'Launches a step-by-step guided app workflow for the user (e.g. safety-first-pass, first-task, weekly-review).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_id: {
          type: Type.STRING,
          description: 'The identifier of the app to start: safety-first-pass, first-task, or weekly-review.',
        },
      },
      required: ['app_id'],
    },
  },
  {
    name: 'update_routine_progress',
    description: 'Updates the progress of an active guided routine checklist card in the UI as the user completes steps.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_id: {
          type: Type.STRING,
          description: 'The routine identifier (e.g. safety-first-pass, first-task, weekly-review).',
        },
        completed_step: {
          type: Type.INTEGER,
          description: 'The step number that was just completed (e.g. 1, 2, 3...).',
        },
        next_step: {
          type: Type.INTEGER,
          description: 'The next step number to focus on (e.g. 2, 3...), or null if the routine is fully completed.',
        },
      },
      required: ['app_id', 'completed_step'],
    },
  },
  {
    name: 'propose_times',
    description: 'Queries the owner calendar to return up to 3 available consultation slots within working hours.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        duration_minutes: {
          type: Type.INTEGER,
          description: 'Length of the meeting in minutes (default 30).',
        },
        user_timezone: {
          type: Type.STRING,
          description: 'The user timezone (e.g. America/New_York, Europe/London, America/Los_Angeles).',
        },
      },
    },
  },
  {
    name: 'get_booking_link',
    description: 'Returns the direct scheduling link for confirmed bookings with Nic.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'escalate_to_owner',
    description: 'Initiates a human handoff to Nic with a structured dossier of what was tried and what is blocking progress.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        summary: {
          type: Type.STRING,
          description: 'Clear, concise summary of the user goal, blocker, and reason for handoff.',
        },
      },
      required: ['summary'],
    },
  },
  {
    name: 'save_session_note',
    description: 'Saves a brief text note (max 500 characters) attached to the current user and product for subsequent continuity.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        text: {
          type: Type.STRING,
          description: 'Short factual note about preferences, decisions, or screen mismatches (max 500 characters).',
        },
      },
      required: ['text'],
    },
  },
];

/**
 * Mints an ephemeral token for direct browser WebSocket connections
 */
export async function mintEphemeralToken(): Promise<{
  tokenName: string | null;
  error?: string;
  proxyAvailable: boolean;
}> {
  return { tokenName: null, proxyAvailable: true };
}

/**
 * Text Chat Fallback handling for gemini-3.8-flash
 * Supports multimodal screen frame analysis (when user shares screen in text mode).
 */
export async function handleTextChat(payload: {
  userName: string;
  userEmail: string;
  product: string;
  messages: Array<{ role: string; text: string }>;
  userTimezone?: string;
  currentScreenFrame?: string | null;
}): Promise<{
  reply: string;
  toolInvocations?: Array<{ name: string; args: any; result: any }>;
}> {
  const { userName, userEmail, product = 'muse', messages, userTimezone = 'America/New_York', currentScreenFrame } = payload;
  const systemInstruction = buildSystemInstruction(userName, product);

  // Clean and prepare message turns:
  // 1. Group consecutive messages of same role or collapse system notices into friendly context
  // 2. Ensure alternating user/model sequence and that conversation starts with a user turn
  const cleanedTurns: Array<{ role: 'user' | 'model'; parts: any[] }> = [];

  for (const m of messages) {
    if (!m.text || !m.text.trim()) continue;

    // Convert system notices to conversational annotations on user side
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

  // Gemini API requires first content turn to be role 'user'
  if (cleanedTurns.length > 0 && cleanedTurns[0].role === 'model') {
    cleanedTurns.shift(); // Remove leading model turn (such as initial greeting)
  }

  // If empty after cleaning, provide a default starting user turn
  if (cleanedTurns.length === 0) {
    cleanedTurns.push({
      role: 'user',
      parts: [{ text: 'Hello, please help me get started.' }],
    });
  }

  // Multimodal Screen Analysis:
  // If the user is currently sharing their screen, attach the latest JPEG frame to the final user turn
  if (currentScreenFrame && currentScreenFrame.length > 100) {
    const lastUserTurn = [...cleanedTurns].reverse().find(t => t.role === 'user');
    if (lastUserTurn) {
      // Prepend or add the inlineData image part
      lastUserTurn.parts.unshift({
        inlineData: {
          mimeType: 'image/jpeg',
          data: currentScreenFrame,
        },
      });
    }
  }

  let response: any;
  let activeTextModel = config.textModel;
  const candidateModels = Array.from(new Set(['gemini-3-flash-preview', config.textModel, 'gemini-3.5-flash', 'gemini-3.8-flash']));

  try {
    let lastError: any = null;
    for (const modelToTry of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelToTry,
          contents: cleanedTurns,
          config: {
            systemInstruction,
            temperature: 0.7,
            tools: [{ functionDeclarations: toolDeclarations }],
          },
        });
        activeTextModel = modelToTry;
        lastError = null;
        break;
      } catch (err: any) {
        lastError = err;
        if (
          err?.status === 429 ||
          err?.status === 503 ||
          err?.message?.includes('quota') ||
          err?.message?.includes('RESOURCE_EXHAUSTED') ||
          err?.message?.includes('high demand')
        ) {
          console.warn(`Model ${modelToTry} experienced rate limits or high demand, trying next candidate...`);
          continue;
        }
        throw err;
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    const functionCalls = response.functionCalls;
    const toolInvocations: Array<{ name: string; args: any; result: any }> = [];

    let textReply = response.text || '';

    // If model made function calls, execute them and provide a clean conversational followup
    if (functionCalls && functionCalls.length > 0) {
      for (const fc of functionCalls) {
        let result: any = null;
        if (fc.name === 'propose_times') {
          const duration = (fc.args?.duration_minutes as number) || 30;
          const tz = (fc.args?.user_timezone as string) || userTimezone;
          result = await proposeTimes(duration, tz);
        } else if (fc.name === 'get_booking_link') {
          result = { bookingUrl: config.bookingUrl };
        } else if (fc.name === 'escalate_to_owner') {
          const summary = (fc.args?.summary as string) || 'User requested human assistance';
          result = await logAndDispatchEscalation({
            userName,
            userEmail,
            product,
            goal: summary,
            tried: 'Assisted via conversational guide',
            screenSeen: currentScreenFrame ? 'Screen frame attached in session' : 'No screen capture recorded',
            blocker: summary,
            proposedTimes: [],
            transcriptExcerpt: messages.slice(-20),
          });
        } else if (fc.name === 'launch_app') {
          const appId = fc.args?.app_id as string;
          const apps = getGuidedApps(product);
          const matched = apps.find(a => a.id === appId);
          result = matched || { id: appId, status: 'launched' };
        } else if (fc.name === 'update_routine_progress') {
          const appId = fc.args?.app_id as string;
          const completedStep = Number(fc.args?.completed_step);
          const nextStep = fc.args?.next_step !== undefined ? Number(fc.args?.next_step) : null;
          result = { updated: true, app_id: appId, completed_step: completedStep, next_step: nextStep };
        } else if (fc.name === 'save_session_note') {
          result = { saved: true, text: fc.args?.text };
        } else if (fc.name === 'request_screenshare') {
          result = { requested: true, reason: fc.args?.reason };
        } else if (fc.name === 'stop_screenshare') {
          result = { stopped: true };
        }

        toolInvocations.push({
          name: fc.name || 'tool',
          args: fc.args,
          result,
        });
      }

      // If text response was empty because it only returned tool calls, generate a natural continuation
      if (!textReply.trim()) {
        const candidateContent = response.candidates?.[0]?.content;
        if (candidateContent) {
          try {
            const continuationResponse = await ai.models.generateContent({
              model: activeTextModel,
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
              },
            });
            textReply = continuationResponse.text || '';
          } catch (contErr) {
            console.warn('Continuation generation after tool calls:', contErr);
          }
        }
      }
    }

    if (!textReply.trim()) {
      const updateTool = toolInvocations.find(t => t.name === 'update_routine_progress');
      const launchTool = toolInvocations.find(t => t.name === 'launch_app');

      if (updateTool) {
        const { app_id, completed_step, next_step } = updateTool.result || {};
        const apps = getGuidedApps(product);
        const app = apps.find(a => a.id === app_id);
        if (next_step && app) {
          const nextStepObj = app.steps.find(s => s.number === next_step);
          const nextInquiry = nextStepObj?.coachPrompt || nextStepObj?.detail || '';
          textReply = `Great, Step ${completed_step} is confirmed! Let's move to Step ${next_step}: ${nextStepObj?.title || ''}.\n\n${nextInquiry}`;
        } else {
          textReply = `All steps in this routine are now complete! I've noted down your safeguards so you are all set.`;
        }
      } else if (launchTool) {
        const appId = launchTool.args?.app_id;
        const apps = getGuidedApps(product);
        const app = apps.find(a => a.id === appId);
        const step1 = app?.steps[0];
        const step1Inquiry = step1?.coachPrompt || step1?.detail || '';
        textReply = `I've opened the roadmap for ${app?.title || 'your routine'}. Let's take it one step at a time:\n\n${step1Inquiry}`;
      } else if (toolInvocations.some(t => t.name === 'propose_times' || t.name === 'get_booking_link')) {
        textReply = `I've checked Nic's live calendar. You can select one of the suggested times below or use his direct booking link.`;
      } else if (toolInvocations.some(t => t.name === 'request_screenshare')) {
        textReply = `Whenever you're ready, sharing your screen will let me see what's on display so we can walk through it together.`;
      } else {
        textReply = `I'm right here with you. What would you like to explore next?`;
      }
    }

    return {
      reply: textReply,
      toolInvocations,
    };
  } catch (err: any) {
    console.error('Error in handleTextChat:', err);
    return {
      reply: `I'm right here with you. Could you describe what you're seeing or what you'd like to do first?`,
    };
  }
}
