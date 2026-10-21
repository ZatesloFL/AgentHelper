import crypto from 'crypto';
import { config } from './config.js';
import { UserToolProfileItem } from './knowledge.js';

export type SheetWebhookType = 'report' | 'tools' | 'correction';

export interface HandoffReportInput {
  userName: string;
  userEmail: string;
  product: string;
  goal: string;
  tried: string;
  blocker: string;
  includeTranscript?: boolean;
  transcript?: Array<{ role: string; text: string }> | string;
  routineProgress?: string;
  progressSummary?: string;
}

export interface HandoffReportRecord {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  product: string;
  goal: string;
  tried: string;
  blocker: string;
  routineProgress: string;
  progressSummary: string;
  transcript: string;
}

export interface ToolsShareInput {
  uid: string;
  devices?: string[] | string;
  tools?: Array<Partial<UserToolProfileItem>>;
  other?: string;
}

export interface ToolsShareRecord {
  anonId: string;
  device: string;
  tools: string;
  other: string;
}

export function computeAnonId(uid: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${uid}${config.sheetWebhookSecret || ''}`)
    .digest('hex');
  return hash.slice(0, 16);
}

function formatTextTranscript(
  includeTranscript: boolean | undefined,
  rawTranscript: Array<{ role: string; text: string }> | string | undefined
): string {
  if (includeTranscript === false || !rawTranscript) {
    return '';
  }

  if (typeof rawTranscript === 'string') {
    return rawTranscript
      .split('\n')
      .slice(-20)
      .join('\n')
      .slice(0, 12000);
  }

  if (!Array.isArray(rawTranscript)) {
    return '';
  }

  return rawTranscript
    .slice(-20)
    .map(entry => {
      const rawRole = typeof entry?.role === 'string' ? entry.role.trim() : 'user';
      const roleLabel =
        rawRole === 'guide' || rawRole === 'model'
          ? 'Guide'
          : rawRole === 'system'
          ? 'System'
          : 'User';
      const cleanText =
        typeof entry?.text === 'string'
          ? entry.text.replace(/\s+/g, ' ').trim().slice(0, 1000)
          : '';
      return cleanText ? `${roleLabel}: ${cleanText}` : '';
    })
    .filter(Boolean)
    .join('\n');
}

async function postToSheetOnce(type: SheetWebhookType, record: Record<string, any>): Promise<boolean> {
  if (!config.sheetWebhookUrl) {
    return false;
  }

  try {
    const bodyPayload: Record<string, any> = {
      secret: config.sheetWebhookSecret,
      type,
      record,
    };
    // Keep backward compatibility with v1 Apps Script that reads body.report
    if (type === 'report') {
      bodyPayload.report = record;
    }

    const response = await fetch(config.sheetWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      body: JSON.stringify(bodyPayload),
    });

    const text = await response.text();
    const parsed = JSON.parse(text);
    return Boolean(parsed && parsed.ok === true);
  } catch (err) {
    console.warn(`Sheet webhook (${type}) attempt failed:`, err);
    return false;
  }
}

/**
 * Shared helper for sending reports ("report"), anonymous tool profiles ("tools"),
 * and knowledge mismatch corrections ("correction") to SHEET_WEBHOOK_URL.
 * Retries once after 2 seconds and requires { ok: true } from the Sheet.
 */
export async function postToSheet(
  type: SheetWebhookType,
  record: Record<string, any>
): Promise<boolean> {
  if (!config.sheetWebhookUrl) {
    return false;
  }

  const firstAttemptOk = await postToSheetOnce(type, record);
  if (firstAttemptOk) {
    return true;
  }

  await new Promise(resolve => setTimeout(resolve, 2000));
  return postToSheetOnce(type, record);
}

export async function dispatchHandoffReport(input: HandoffReportInput): Promise<{
  ok: boolean;
  id: string;
}> {
  const id = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  const report: HandoffReportRecord = {
    id,
    timestamp,
    userName: input.userName || 'Friend',
    userEmail: input.userEmail || '',
    product: input.product || 'muse',
    goal: (input.goal || '').trim().slice(0, 2000),
    tried: (input.tried || '').trim().slice(0, 2000),
    blocker: (input.blocker || '').trim().slice(0, 2000),
    routineProgress: (input.routineProgress || '').trim().slice(0, 1000),
    progressSummary: (input.progressSummary || '').trim().slice(0, 2000),
    transcript: formatTextTranscript(input.includeTranscript, input.transcript),
  };

  const ok = await postToSheet('report', report);
  return { ok, id };
}

export async function dispatchToolsShare(input: ToolsShareInput): Promise<{
  ok: boolean;
  anonId: string;
}> {
  const anonId = computeAnonId(input.uid);
  const deviceStr = Array.isArray(input.devices)
    ? input.devices
        .map(d => String(d || '').trim())
        .filter(Boolean)
        .join(', ')
    : typeof input.devices === 'string'
    ? input.devices.trim()
    : '';

  const toolsStr = Array.isArray(input.tools)
    ? input.tools
        .filter(t => t && typeof t.id === 'string' && t.id.trim())
        .map(t => {
          const id = t.id!.trim();
          const account = t.account === 'work' ? 'work' : 'personal';
          const sensitive = Boolean(t.sensitive);
          return `${id}:${account}:${sensitive}`;
        })
        .join(', ')
    : '';

  const otherStr = typeof input.other === 'string' ? input.other.trim().slice(0, 300) : '';

  const record: ToolsShareRecord = {
    anonId,
    device: deviceStr.slice(0, 200),
    tools: toolsStr.slice(0, 2000),
    other: otherStr,
  };

  const ok = await postToSheet('tools', record);
  return { ok, anonId };
}

