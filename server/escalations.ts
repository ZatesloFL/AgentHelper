import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const escalationsFilePath = path.join(rootDir, 'data', 'escalations.jsonl');

export interface EscalationPayload {
  id?: string;
  timestamp?: string;
  userName: string;
  userEmail: string;
  product: string;
  goal: string;
  tried: string;
  screenSeen: string; // Text description only, never images
  blocker: string;
  proposedTimes: Array<{ displayFormatted?: string; startIso?: string }>;
  transcriptExcerpt: Array<{ role: string; text: string }>; // Last 20 turns
}

export async function logAndDispatchEscalation(payload: EscalationPayload): Promise<{ success: boolean; id: string; webhookSent: boolean; message: string }> {
  const id = `esc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  const record = {
    id,
    timestamp,
    userName: payload.userName || 'Anonymous Visitor',
    userEmail: payload.userEmail || 'Not provided',
    product: payload.product || 'muse',
    goal: payload.goal || 'General assistance',
    tried: payload.tried || 'Walked through initial guidance',
    screenSeen: payload.screenSeen || 'No active screen shared',
    blocker: payload.blocker || 'Human review requested',
    proposedTimes: payload.proposedTimes || [],
    transcriptExcerpt: (payload.transcriptExcerpt || []).slice(-20),
  };

  // Ensure data dir exists
  const dataDir = path.join(rootDir, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Append JSON line
  fs.appendFileSync(escalationsFilePath, JSON.stringify(record) + '\n', 'utf-8');

  let webhookSent = false;
  if (config.escalationWebhookUrl) {
    try {
      const response = await fetch(config.escalationWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      webhookSent = response.ok;
    } catch (err) {
      console.error('Failed to dispatch escalation webhook:', err);
    }
  }

  return {
    success: true,
    id,
    webhookSent,
    message: `Handoff summary successfully prepared for ${config.ownerName}.`,
  };
}

export function getEscalations(): EscalationPayload[] {
  if (!fs.existsSync(escalationsFilePath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(escalationsFilePath, 'utf-8');
    const lines = raw.split('\n').filter(l => l.trim().length > 0);
    const records = lines.map(l => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    }).filter(Boolean);

    // Return newest first
    return records.reverse();
  } catch (err) {
    console.error('Error reading escalations.jsonl:', err);
    return [];
  }
}
