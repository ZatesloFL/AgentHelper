import { config } from './config.js';

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
      const cleanText = typeof entry?.text === 'string' ? entry.text.replace(/\s+/g, ' ').trim().slice(0, 1000) : '';
      return cleanText ? `${roleLabel}: ${cleanText}` : '';
    })
    .filter(Boolean)
    .join('\n');
}

async function postToSheetWebhookOnce(report: HandoffReportRecord): Promise<boolean> {
  if (!config.sheetWebhookUrl) {
    return false;
  }

  try {
    const response = await fetch(config.sheetWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      body: JSON.stringify({
        secret: config.sheetWebhookSecret,
        report,
      }),
    });

    const text = await response.text();
    const parsed = JSON.parse(text);
    return parsed && parsed.ok === true;
  } catch (err) {
    console.warn('Sheet webhook attempt failed:', err);
    return false;
  }
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

  if (!config.sheetWebhookUrl) {
    return { ok: false, id };
  }

  // Attempt 1
  const firstAttemptOk = await postToSheetWebhookOnce(report);
  if (firstAttemptOk) {
    return { ok: true, id };
  }

  // Retry once after 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  const secondAttemptOk = await postToSheetWebhookOnce(report);
  return { ok: secondAttemptOk, id };
}

