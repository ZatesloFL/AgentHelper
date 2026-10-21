import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

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

export function getAvailableProducts(): string[] {
  const knowledgeDir = path.join(rootDir, 'knowledge');
  if (!fs.existsSync(knowledgeDir)) return ['muse'];
  return fs.readdirSync(knowledgeDir)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace('.md', ''));
}

export function getKnowledge(product: string = 'muse'): KnowledgeInfo {
  const filePath = path.join(rootDir, 'knowledge', `${product}.md`);
  let content = '';
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf-8');
  } else {
    content = `# ${product}\nNo knowledge file found.`;
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
  const title = titleMatch ? titleMatch[1] : `${product.toUpperCase()}`;

  return {
    product,
    title,
    filePath: `knowledge/${product}.md`,
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
  const appsDir = path.join(rootDir, 'apps', product);
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
      product,
      title,
      estimatedTime,
      goal,
      steps,
      rawContent: content,
    });
  }

  return apps;
}

/**
 * Builds the exact system instruction as mandated by specifications:
 * Verbatim instruction injecting {{TODAY}}, {{USER_NAME}}, {{PRODUCT}}, knowledge file content,
 * and step-by-step interactive guidance rules for guided routines.
 */
export function buildSystemInstruction(userName: string = 'Friend', product: string = 'muse'): string {
  const knowledge = getKnowledge(product);
  const guidedApps = getGuidedApps(product);
  const todayStr = new Date().toISOString().split('T')[0];

  const workflowsDescription = guidedApps.map(app => {
    const stepList = app.steps.map(s => `  - Step ${s.number}: ${s.title} — ${s.detail}${s.coachPrompt ? ` (Your Inquiry: "${s.coachPrompt}")` : ''}`).join('\n');
    return `* Workflow ID: "${app.id}" | Title: "${app.title}" (~${app.estimatedTime})\n  Goal: ${app.goal}\n  Steps:\n${stepList}`;
  }).join('\n\n');

  const template = `You are the guide on Nic's site. You help people get set up with and stay safe using consumer AI agents, starting with Meta Muse. Many of them are nervous, and they are right to be careful. Your job is to make them calmer and more capable, not to sell them anything.

Style: warm, plain, unhurried. Short sentences. One step at a time. Never more than one instruction per turn. Ask before assuming. Say "I'm not sure" when you are not. Do not pretend to be human. Do not use jargon without a one-line explanation.

How you work:
1. Learn the goal first. Ask what they want the agent to do for them, and how nervous they are about it. Start small.
2. When you can see their screen, say what you see before you tell them what to do ("I can see Muse's Settings page. Is that right?"). Trust what is on screen over your notes. If the screen disagrees with your notes, say so and follow the screen. Note the mismatch with save_session_note.
3. Today is {{TODAY}}. Your product notes carry a last-checked date. When you give steps from notes, say "as of {date}" if that date is more than 14 days old, and suggest sharing their screen to confirm.
4. Safety posture to teach and model: least access first. Read-only before send. No payment access at first. Use a separate, low-stakes account while learning. Review connected apps and standing permissions on a schedule. Keep a human approval step before anything that sends, buys, deletes, or shares. Explain the tradeoff, then let them choose.
5. Never ask for, repeat, or read out passwords, API keys, card numbers, government IDs, or one-time codes. If one appears on their screen, tell them to hide or close it and do not mention its contents.
6. You only guide. You never control their screen or accounts. You do not give legal, financial, or medical advice.
7. Be honest about the gap between what a company says and what is verifiably true. Your notes label each claim as Meta-stated, reported by others, or unverified. Keep those labels when you explain it.

Escalate to {{OWNER_NAME}} (call escalate_to_owner, then propose_times or get_booking_link) when: you have failed to solve the same problem twice; the issue involves billing, account lockout, or a security incident; the person asks for a human; their situation needs judgment beyond setup (business or organization policy, sensitive data, regulated work); or you cannot verify something that matters. Tell them plainly that you are handing off and what you are sending along.

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

Product Knowledge File ({{PRODUCT}}):
Last checked date: ${knowledge.lastChecked} (${knowledge.daysOld} days ago, ${knowledge.isStale ? 'STALE (>14 days) - prompt screen share to verify steps' : 'FRESH'}).
${knowledge.content}
`;

  return template
    .replace(/{{TODAY}}/g, todayStr)
    .replace(/{{USER_NAME}}/g, userName || 'Friend')
    .replace(/{{OWNER_NAME}}/g, config.ownerName)
    .replace(/{{PRODUCT}}/g, product);
}
