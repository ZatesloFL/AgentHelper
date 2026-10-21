import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { PRODUCTS, getEnabledProducts, getProductById } from './products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export interface KnowledgeInfo {
  product: string;
  title: string;
  filePath: string;
  lastChecked: string;
  daysOld: number;
  isStale: boolean; // > 14 days old
  metaStatementsCount: number;
  reportedStatementsCount: number;
  unverifiedStatementsCount: number;
  content: string;
}

export interface GuidedAppStep {
  number: number;
  title: string;
  detail: string;
  coachPrompt?: string;
}

export interface GuidedAppInfo {
  id: string;
  product: string;
  title: string;
  estimatedTime: string;
  goal: string;
  steps: GuidedAppStep[];
  rawContent: string;
}

export interface RoutineStatePayload {
  activeRoutineId: string | null;
  completedSteps: number[];
  activeStep: number | null;
}

export interface ProgressSummaryPayload {
  done?: string[];
  inProgress?: string[];
  boundariesAndPreferences?: string[];
  openQuestions?: string[];
  suggestedNextStep?: string;
  summary?: string;
  updatedAt?: string;
}

export interface SystemInstructionContext {
  progressSummary?: ProgressSummaryPayload | string | null;
  sessionNotes?: string[];
  routineState?: RoutineStatePayload | null;
  recentTranscript?: Array<{ role: string; text: string }>;
  extraContext?: string;
}

export function getAvailableProducts(): string[] {
  return getEnabledProducts().map(p => p.id);
}

export function getAllRegisteredProducts(): string[] {
  return PRODUCTS.map(p => p.id);
}

export function getKnowledge(product: string = 'muse'): KnowledgeInfo {
  const registered = getProductById(product);
  const safeId = registered ? registered.id : 'muse';
  const filePath = path.join(rootDir, 'knowledge', `${safeId}.md`);
  let content = '';
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf-8');
  } else {
    content = `# ${registered?.name || safeId}\nNo knowledge file found.`;
  }

  // Extract last checked date
  const match = content.match(/Last checked:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  const lastChecked = match ? match[1] : '2026-10-20';

  const checkedDate = new Date(lastChecked);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - checkedDate.getTime());
  const daysOld = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const isStale = daysOld > 14;

  const metaCount = (content.match(/\[Meta\]/gi) || []).length;
  const reportedCount = (content.match(/\[Reported\]/gi) || []).length;
  const unverifiedCount = (content.match(/\[Unverified\]/gi) || []).length;

  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : (registered?.name || `${safeId.toUpperCase()}`);

  return {
    product: safeId,
    title,
    filePath: `knowledge/${safeId}.md`,
    lastChecked,
    daysOld,
    isStale,
    metaStatementsCount: metaCount,
    reportedStatementsCount: reportedCount,
    unverifiedStatementsCount: unverifiedCount,
    content,
  };
}

export function getGuidedApps(product: string = 'muse'): GuidedAppInfo[] {
  const registered = getProductById(product);
  if (!registered) return [];
  const safeId = registered.id;
  const appsDir = path.join(rootDir, 'apps', safeId);
  if (!fs.existsSync(appsDir)) return [];

  const files = fs.readdirSync(appsDir).filter(f => f.endsWith('.md'));
  const apps: GuidedAppInfo[] = [];

  for (const file of files) {
    const filePath = path.join(appsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const id = file.replace('.md', '');

    const titleMatch = content.match(/\*\*Title\*\*:\s*(.+)$/m) || content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : id;

    const timeMatch = content.match(/\*\*Estimated Time\*\*:\s*(.+)$/m);
    const estimatedTime = timeMatch ? timeMatch[1].trim() : '5 minutes';

    const goalMatch = content.match(/\*\*Goal\*\*:\s*(.+)$/m);
    const goal = goalMatch ? goalMatch[1].trim() : '';

    // Extract steps
    const steps: GuidedAppStep[] = [];
    const stepLines = content.split('\n');

    for (let i = 0; i < stepLines.length; i++) {
      const line = stepLines[i];
      const numMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*:\s*(.+)$/);
      if (numMatch) {
        const stepNum = parseInt(numMatch[1], 10);
        let coachPrompt = '';
        if (i + 1 < stepLines.length) {
          const nextLine = stepLines[i + 1];
          const coachMatch = nextLine.match(/^\s*-\s*\*(?:Coach Question|Coach Prompt)\*:\s*"?([^"]+)"?/i);
          if (coachMatch) {
            coachPrompt = coachMatch[1].trim();
          }
        }
        steps.push({
          number: stepNum,
          title: numMatch[2].trim(),
          detail: numMatch[3].trim(),
          coachPrompt: coachPrompt || undefined,
        });
      } else {
        const simpleMatch = line.match(/^(\d+)\.\s+(.+)$/);
        if (simpleMatch && !line.includes('Goal:')) {
          steps.push({
            number: parseInt(simpleMatch[1], 10),
            title: `Step ${simpleMatch[1]}`,
            detail: simpleMatch[2].trim(),
          });
        }
      }
    }

    apps.push({
      id,
      product: safeId,
      title,
      estimatedTime,
      goal,
      steps,
      rawContent: content,
    });
  }

  return apps;
}

export function formatRoutineStateSection(product: string, routineState?: RoutineStatePayload | null): string {
  if (!routineState || !routineState.activeRoutineId) {
    return 'Current Routine State: None active.';
  }

  const guidedApps = getGuidedApps(product);
  const matchedApp = guidedApps.find(a => a.id === routineState.activeRoutineId);
  const completedSteps = Array.isArray(routineState.completedSteps) ? routineState.completedSteps : [];
  const activeStepNum = routineState.activeStep ?? null;

  if (!matchedApp) {
    return `Current Routine State:
- Active Routine ID: "${routineState.activeRoutineId}"
- Completed Steps: ${completedSteps.length > 0 ? completedSteps.join(', ') : 'none yet'}
- Active Step: ${activeStepNum ?? 'none'}`;
  }

  const activeStepObj = matchedApp.steps.find(s => s.number === activeStepNum);
  const nextStepNum = activeStepNum ? activeStepNum + 1 : null;
  const hasNextStep = nextStepNum ? matchedApp.steps.some(s => s.number === nextStepNum) : false;

  return `Current Routine State (ACTIVE IN UI — do NOT call launch_app again for "${matchedApp.id}"):
- Active Routine ID: "${matchedApp.id}" ("${matchedApp.title}")
- Completed Steps: [${completedSteps.join(', ')}] (${completedSteps.length}/${matchedApp.steps.length} done)
- Active Step Now: ${
    activeStepObj
      ? `Step ${activeStepObj.number}: "${activeStepObj.title}" — ${activeStepObj.detail}${
          activeStepObj.coachPrompt ? ` (Inquiry: "${activeStepObj.coachPrompt}")` : ''
        }`
      : activeStepNum ?? 'All steps completed'
  }
- Coaching Reminder: When the user answers or finishes Step ${activeStepNum ?? 1}, call update_routine_progress with app_id="${matchedApp.id}", completed_step=${activeStepNum ?? 1}${
    hasNextStep ? `, next_step=${nextStepNum}` : ''
  } and guide them through the next step.`;
}

function formatEarlierSessionMemorySection(
  product: string,
  ctx?: SystemInstructionContext | string
): string {
  const contextObj: SystemInstructionContext =
    typeof ctx === 'string' ? { extraContext: ctx } : ctx || {};

  const parts: string[] = [];

  // 1. Progress Summary
  const ps = contextObj.progressSummary;
  if (typeof ps === 'string' && ps.trim()) {
    parts.push(`Progress Summary:\n${ps.trim().slice(0, 1500)}`);
  } else if (ps && typeof ps === 'object') {
    const summaryLines: string[] = [];
    if (ps.summary && ps.summary.trim()) {
      summaryLines.push(`Summary: ${ps.summary.trim().slice(0, 1200)}`);
    }
    if (Array.isArray(ps.done) && ps.done.length > 0) {
      summaryLines.push(`Done: ${ps.done.slice(0, 15).join('; ')}`);
    }
    if (Array.isArray(ps.inProgress) && ps.inProgress.length > 0) {
      summaryLines.push(`In Progress: ${ps.inProgress.slice(0, 15).join('; ')}`);
    }
    if (Array.isArray(ps.boundariesAndPreferences) && ps.boundariesAndPreferences.length > 0) {
      summaryLines.push(`Boundaries & Preferences: ${ps.boundariesAndPreferences.slice(0, 15).join('; ')}`);
    }
    if (Array.isArray(ps.openQuestions) && ps.openQuestions.length > 0) {
      summaryLines.push(`Open Questions: ${ps.openQuestions.slice(0, 15).join('; ')}`);
    }
    if (ps.suggestedNextStep && ps.suggestedNextStep.trim()) {
      summaryLines.push(`Suggested Next Step: ${ps.suggestedNextStep.trim().slice(0, 400)}`);
    }
    if (summaryLines.length > 0) {
      parts.push(`Progress Summary:\n${summaryLines.join('\n')}`);
    }
  }

  // 2. Active Session Notes
  if (Array.isArray(contextObj.sessionNotes) && contextObj.sessionNotes.length > 0) {
    const formattedNotes = contextObj.sessionNotes
      .filter(n => typeof n === 'string' && n.trim())
      .slice(0, 20)
      .map(n => `- ${n.trim().slice(0, 500)}`)
      .join('\n');
    if (formattedNotes) {
      parts.push(`Active Session Notes:\n${formattedNotes}`);
    }
  }

  // 3. Extra context string if provided
  if (contextObj.extraContext && contextObj.extraContext.trim()) {
    parts.push(contextObj.extraContext.trim().slice(0, 2000));
  }

  // 4. Current Routine State
  parts.push(formatRoutineStateSection(product, contextObj.routineState));

  // 5. Recent Conversation Transcript Turns (up to last 20 turns, used for session continuity / fresh voice reconnect)
  if (Array.isArray(contextObj.recentTranscript) && contextObj.recentTranscript.length > 0) {
    const formattedTurns = contextObj.recentTranscript
      .slice(-20)
      .filter(t => t && typeof t.text === 'string' && t.text.trim())
      .map(t => {
        const roleLabel =
          t.role === 'user' ? 'User' : t.role === 'guide' || t.role === 'model' ? 'Guide' : 'System';
        return `${roleLabel}: ${t.text.trim().slice(0, 600)}`;
      })
      .join('\n');
    if (formattedTurns) {
      parts.push(`Recent Conversation Turns (last 20 turns):\n${formattedTurns}`);
    }
  }

  const body =
    parts.length > 0
      ? parts.join('\n\n')
      : 'No earlier session notes or active routine state recorded yet.';

  return `\nWhat you know from earlier sessions (you wrote this; confirm with the user before relying on it, and trust their screen over it).\n${body}\n`;
}

/**
 * Builds the system instruction injecting {{TODAY}}, the user's first name from the verified token,
 * the product display name from the registry, knowledge file content, step-by-step interactive guidance rules,
 * and earlier session memory + current routine state.
 */
export function buildSystemInstruction(
  userName: string = 'Friend',
  product: string = 'muse',
  contextOrExtra?: SystemInstructionContext | string
): string {
  const registeredProduct = getProductById(product);
  const productDisplayName = registeredProduct?.name || product;
  const knowledge = getKnowledge(product);
  const guidedApps = getGuidedApps(product);
  const todayStr = new Date().toISOString().split('T')[0];
  const firstName = (userName || 'Friend').trim().split(/\s+/)[0] || 'Friend';

  const workflowsDescription = guidedApps
    .map(app => {
      const stepList = app.steps
        .map(
          s =>
            `  - Step ${s.number}: ${s.title} — ${s.detail}${
              s.coachPrompt ? ` (Your Inquiry: "${s.coachPrompt}")` : ''
            }`
        )
        .join('\n');
      return `* Workflow ID: "${app.id}" | Title: "${app.title}" (~${app.estimatedTime})\n  Goal: ${app.goal}\n  Steps:\n${stepList}`;
    })
    .join('\n\n');

  const earlierSessionsSection = formatEarlierSessionMemorySection(product, contextOrExtra);

  const template = `You are the guide on Nic's site. You help people get set up with and stay safe using consumer AI agents, starting with {{PRODUCT_NAME}}. Many of them are nervous, and they are right to be careful. Your job is to make them calmer and more capable, not to sell them anything.
You are speaking with {{FIRST_NAME}}. Use their first name naturally and sparingly.

Style: warm, plain, unhurried. Short sentences. One step at a time. Never more than one instruction per turn. Ask before assuming. Say "I'm not sure" when you are not. Do not pretend to be human. Do not use jargon without a one-line explanation.

How you work:
1. Learn the goal first. Ask what they want the agent to do for them, and how nervous they are about it. Start small.
2. When you can see their screen, say what you see before you tell them what to do ("I can see {{PRODUCT_NAME}}'s Settings page. Is that right?"). Trust what is on screen over your notes. If the screen disagrees with your notes, say so and follow the screen. Note the mismatch with save_session_note.
3. Today is {{TODAY}}. Your product notes carry a last-checked date. When you give steps from notes, say "as of {date}" if that date is more than 14 days old, and suggest sharing their screen to confirm.
4. Safety posture to teach and model: least access first. Read-only before send. No payment access at first. Use a separate, low-stakes account while learning. Review connected apps and standing permissions on a schedule. Keep a human approval step before anything that sends, buys, deletes, or shares. Explain the tradeoff, then let them choose.
5. Never ask for, repeat, or read out passwords, API keys, card numbers, government IDs, or one-time codes. If one appears on their screen, tell them to hide or close it and do not mention its contents.
6. You only guide. You never control their screen or accounts. You do not give legal, financial, or medical advice.
7. Be honest about the gap between what the product's maker says and what is verifiably true. Your notes label each claim by source (stated by the product's maker, reported by others, or unverified). Keep those labels when you explain it.

Escalate to {{OWNER_NAME}} (call escalate_to_owner) when: you have failed to solve the same problem twice; the issue involves billing, account lockout, or a security incident; the person asks for a human; their situation needs judgment beyond setup (business or organization policy, sensitive data, regulated work); or you cannot verify something that matters. When you call escalate_to_owner, tell the user plainly: "I've drafted a short note for Nic below. Have a look, change anything you like, and press Send if it looks right. You can also book a time directly."

Offer a guided app when it fits (launch_app), but never push one.

GUIDED ROUTINES & WORKFLOWS CONSTITUTION:
Available workflows in this product:
${workflowsDescription}

CRITICAL RULES FOR GUIDED ROUTINES:
1. When a user requests or begins a guided routine (or when you call launch_app):
   - The UI displays an interactive stepped progress card to the user so they can clearly see the roadmap and their progress.
   - DO NOT dump a numbered list or bulleted checklist of all the steps into your response. Giving the user a bunch of steps overwhelms them and defeats the purpose of guided coaching.
   - Facilitate the routine interactively, ONE STEP AT A TIME.
2. Step-by-Step Flow:
   - Introduce the routine in ONE warm, calming sentence.
   - Ask the inquiry for Step 1. Stop and wait for the user's answer.
   - When the user responds:
     a) Acknowledge what they shared with warmth and empathy.
     b) Provide your recommendation or reassurance. If screen sharing is on, observe their screen.
     c) Call 'update_routine_progress' with the completed step number and next step number so the UI checklist checks it off and advances smoothly.
     d) Ask the question or guidance for the next step.
   - Continue one step at a time through the workflow.
3. When all steps in the routine are finished:
   - Provide a calm, one-paragraph summary of active safeguards and accomplishments.
   - Call 'save_session_note' with a concise record of the audit or task contract.

Product Knowledge File ({{PRODUCT_NAME}}):
Last checked date: ${knowledge.lastChecked} (${knowledge.daysOld} days ago, ${knowledge.isStale ? 'STALE (>14 days) - prompt screen share to verify steps' : 'FRESH'}).
${knowledge.content}
${earlierSessionsSection}`;

  return template
    .replace(/{{TODAY}}/g, todayStr)
    .replace(/{{FIRST_NAME}}/g, firstName)
    .replace(/{{USER_NAME}}/g, firstName)
    .replace(/{{OWNER_NAME}}/g, config.ownerName)
    .replace(/{{PRODUCT_NAME}}/g, productDisplayName)
    .replace(/{{PRODUCT}}/g, productDisplayName);
}
