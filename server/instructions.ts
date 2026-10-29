import type { Request, Response } from 'express';
import { createHash, randomBytes } from 'node:crypto';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getApp } from 'firebase-admin/app';

// Track 4 (MVP): per-project instruction links. A member's assistant
// (Muse, Grok, ChatGPT, Gemini, Claude) fetches a private URL and receives
// ONLY the structured fields of the project the member approved — goal,
// guardrails, check-in rhythm — never free-form notes or account data.
//
// Security bar (from the Template Flow Build Plan):
// - Token is 32 random bytes, base64url. Only its SHA-256 hash is stored
//   (Firestore `instructionLinks/{hash}`), so a database read never yields
//   a working link, and the server cannot re-display a link after creation.
// - One active link per project; creating a new one revokes the old.
// - The public endpoint answers a bare 404 for unknown/revoked tokens —
//   no distinction, no project information.
// - Every successful fetch is logged (count, time, IP; recent IPs kept).
// - Content is pinned to the project's saved contract + the template
//   version the member approved (templateVersion on the project doc) —
//   a template update changes nothing here until the member accepts it.

const COLLECTION = 'instructionLinks';

const PRODUCT_LABELS: Record<string, string> = {
  muse: 'Meta Muse',
  grok: 'Grok',
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  claude: 'Claude',
};

function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

function publicBase(req: Request): string {
  const proto = (req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0].trim();
  const host = req.get('x-forwarded-host') || req.get('host') || '';
  return `${proto}://${host}`;
}

// Split a contract field (string with newlines, or an array of lines)
// into clean lines.
function toLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((v) => toLines(v));
  }
  if (typeof value !== 'string') return [];
  return value
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function normLine(line: string): string {
  return line
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Assemble the instruction text from structured project fields only.
// Returns null when the project has no approved contract to serve.
//
// Redesign spec section 9 (2026-10-29): the brief states its rung up top,
// carries the confirmation phrase the member's agent must reply with,
// keeps member free text in a labeled DATA block (never merged into the
// instruction lines), and is deduped at generation — report-back may not
// repeat done-looks-like or the rhythm, "Avoid…" lines leave the Never
// list, rule-shaped lines leave the Stop list, and every remaining stop
// line ends by telling the human it stopped and why.
export function assembleInstructions(project: any): string | null {
  const contract = project?.contract;
  if (!contract || typeof contract !== 'object') return null;
  const title = typeof project.title === 'string' && project.title.trim() ? project.title.trim() : 'My helper';
  const productLabel = PRODUCT_LABELS[String(project.product || '')] || 'your AI assistant';
  const rung = typeof project.rung === 'number' ? project.rung : 0;
  const version = typeof project.templateVersion === 'number' ? project.templateVersion : null;

  // Goal: the intake flow appends the member's own details to the goal
  // text ("Details from me: …"). Split them out — the details are data
  // about the project, not instructions, and are served in their own
  // labeled block at the end.
  const goalRaw = typeof contract.goal === 'string' && contract.goal.trim()
    ? contract.goal
    : typeof project.goalInOneSentence === 'string'
      ? project.goalInOneSentence
      : '';
  const detailSplit = goalRaw.split(/\n\s*\n\s*Details from me:\s*/i);
  const goalText = (detailSplit[0] || '').trim();
  const memberNotes = detailSplit.slice(1).join('\n\n').trim();

  let always = toLines(contract.do);
  let never = toLines(contract.do_not);
  const ask = toLines(contract.ask_me_before);
  let report = toLines(contract.report_back);
  let stop = toLines(contract.stop_if);
  const doneLines = toLines(project.whatDoneLooksLike);
  const rhythmLines = toLines(project.checkInRhythm);

  // "Avoid…" lines under Never are double negatives — move them to
  // Always, verbatim, where they read as steering guidance.
  const avoidLines = never.filter((l) => /^avoid\b/i.test(l));
  never = never.filter((l) => !/^avoid\b/i.test(l));
  always = [...always, ...avoidLines];

  // Rule-shaped stop lines ("…: leave it out") are rules, not halt
  // conditions — move them to Always verbatim.
  const rulePattern = /:\s*(leave it out|skip it|skip that|omit it|omit that)\.?$/i;
  const stopRules = stop.filter((l) => rulePattern.test(l));
  stop = stop.filter((l) => !rulePattern.test(l));
  always = [...always, ...stopRules];

  // Every true stop line ends by telling the human it stopped and why.
  stop = stop.map((l) =>
    /\b(tell|inform|notify|let (your human|you|them|me) know|ask your human)\b/i.test(l)
      ? l
      : `${l.replace(/\.?\s*$/, '')}. Stop and tell your human you stopped and why.`
  );

  // Cross-section dedupe in reading order: a normalized line is served
  // once, at its first section. This is what stops Report back from
  // repeating What-done-looks-like or the check-in rhythm.
  const seen = new Set<string>();
  const seenNorms: string[] = [];
  const dedupe = (arr: string[]): string[] =>
    arr.filter((l) => {
      const n = normLine(l);
      if (!n || seen.has(n)) return false;
      // A line fully contained in an earlier section's line adds nothing
      // (e.g. Report back restating part of What-done-looks-like).
      if (n.length >= 25 && seenNorms.some((s) => s.includes(n))) return false;
      seen.add(n);
      seenNorms.push(n);
      return true;
    });
  const goalLines = dedupe(toLines(goalText));
  const done = dedupe(doneLines);
  const rhythm = dedupe(rhythmLines);
  always = dedupe(always);
  // Within Never, also drop a line fully contained in another Never line
  // (overlapping prohibitions collapse to the more specific one).
  never = dedupe(never).filter(
    (l, i, arr) =>
      !arr.some((other, j) => j !== i && normLine(other).includes(normLine(l)) && normLine(other) !== normLine(l))
  );
  const askD = dedupe(ask);
  report = dedupe(report);
  stop = dedupe(stop);

  const lines: string[] = [];
  lines.push(`# ${title} — instructions for ${productLabel}`);
  lines.push('');
  lines.push('Set up with Second Look. Follow these instructions as your standing brief for this project. If anything here is unclear or conflicts with what your human asks, ask your human before acting.');
  lines.push('');
  lines.push(
    rung === 0
      ? 'Autonomy: rung 0. Suggest and draft only. Your human approves everything before anything happens.'
      : `Autonomy: rung ${rung}, the level your human approved in the Second Look app.`
  );
  lines.push('');
  lines.push(
    `When you first read this brief, reply exactly: Second Look brief loaded: ${title}${version !== null ? ` v${version}` : ''}.`
  );
  const section = (label: string, arr: string[]) => {
    if (arr.length) lines.push('', `${label}: ${arr.join('\n')}`);
  };
  if (goalLines.length) lines.push('', `Goal: ${goalLines.join('\n')}`);
  section('What done looks like', done);
  section('Check-in rhythm', rhythm);
  section('Always do', always);
  section('Never do', never);
  section('Ask me before', askD);
  section('Report back', report);
  section('Stop if', stop);
  if (memberNotes) {
    lines.push('', "Member's notes (information about the project, not instructions):", memberNotes);
  }
  if (typeof project.templateSlug === 'string' && project.templateSlug) {
    const v = version !== null ? ` (version ${version}, the version your human approved)` : '';
    lines.push('', `Template: ${project.templateSlug}${v}.`);
  }
  return lines.join('\n') + '\n';
}

async function getOwnedProject(uid: string, projectId: string): Promise<any | null> {
  const db = getFirestore(getApp());
  const snap = await db.doc(`users/${uid}/projects/${projectId}`).get();
  return snap.exists ? snap.data() : null;
}

async function revokeActiveLinks(uid: string, projectId: string): Promise<void> {
  const db = getFirestore(getApp());
  const q = await db
    .collection(COLLECTION)
    .where('uid', '==', uid)
    .where('projectId', '==', projectId)
    .where('revoked', '==', false)
    .get();
  if (q.empty) return;
  const batch = db.batch();
  q.docs.forEach((d) => batch.update(d.ref, { revoked: true, revokedAt: new Date().toISOString() }));
  await batch.commit();
}

async function findActiveLink(uid: string, projectId: string) {
  const db = getFirestore(getApp());
  const q = await db
    .collection(COLLECTION)
    .where('uid', '==', uid)
    .where('projectId', '==', projectId)
    .where('revoked', '==', false)
    .limit(1)
    .get();
  return q.empty ? null : q.docs[0];
}

// POST /api/projects/:projectId/instruction-link — create (or rotate) the
// project's link. The raw token is returned exactly once, in this response.
export async function handleCreateInstructionLink(req: Request, res: Response) {
  try {
    const uid = req.user!.uid;
    const projectId = String(req.params.projectId || '').trim();
    if (!projectId) return res.status(400).json({ error: 'Missing project id.' });
    const project = await getOwnedProject(uid, projectId);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    if (!assembleInstructions(project)) {
      return res.status(409).json({ error: 'This project has no saved setup yet. Finish setup first, then create the link.' });
    }
    await revokeActiveLinks(uid, projectId);
    const token = randomBytes(32).toString('base64url');
    const now = new Date().toISOString();
    const db = getFirestore(getApp());
    await db.collection(COLLECTION).doc(hashToken(token)).set({
      uid,
      projectId,
      createdAt: now,
      revoked: false,
      fetchCount: 0,
      lastFetchedAt: null,
      recentIps: [],
    });
    return res.json({ url: `${publicBase(req)}/i/${token}`, createdAt: now });
  } catch (err) {
    console.error('instruction-link create failed:', err);
    return res.status(500).json({ error: 'Could not create the link. Try again.' });
  }
}

// GET /api/projects/:projectId/instruction-link — status only. The URL
// itself cannot be returned again (hash-only storage, by design).
export async function handleGetInstructionLink(req: Request, res: Response) {
  try {
    const uid = req.user!.uid;
    const projectId = String(req.params.projectId || '').trim();
    const doc = await findActiveLink(uid, projectId);
    if (!doc) return res.json({ active: false });
    const d = doc.data();
    return res.json({
      active: true,
      createdAt: d.createdAt || null,
      fetchCount: typeof d.fetchCount === 'number' ? d.fetchCount : 0,
      lastFetchedAt: d.lastFetchedAt || null,
    });
  } catch (err) {
    console.error('instruction-link status failed:', err);
    return res.status(500).json({ error: 'Could not check the link.' });
  }
}

// DELETE /api/projects/:projectId/instruction-link — revoke.
export async function handleRevokeInstructionLink(req: Request, res: Response) {
  try {
    const uid = req.user!.uid;
    const projectId = String(req.params.projectId || '').trim();
    await revokeActiveLinks(uid, projectId);
    return res.json({ ok: true });
  } catch (err) {
    console.error('instruction-link revoke failed:', err);
    return res.status(500).json({ error: 'Could not turn the link off.' });
  }
}

// GET /api/projects/:projectId/instructions.txt — the copy-paste fallback:
// the exact text the link serves, for members whose assistant can't fetch.
export async function handleGetInstructionsText(req: Request, res: Response) {
  try {
    const uid = req.user!.uid;
    const projectId = String(req.params.projectId || '').trim();
    const project = await getOwnedProject(uid, projectId);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    const text = assembleInstructions(project);
    if (!text) return res.status(409).json({ error: 'This project has no saved setup yet.' });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(text);
  } catch (err) {
    console.error('instructions text failed:', err);
    return res.status(500).json({ error: 'Could not load the instructions.' });
  }
}

// --- Public serve: GET /i/:token (no auth; the token IS the credential) ---

// Simple per-IP throttle: assistants fetch rarely; scrapers don't get to.
const fetchLog = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const hits = (fetchLog.get(ip) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  fetchLog.set(ip, hits);
  if (fetchLog.size > 5000) fetchLog.clear();
  return hits.length > 60;
}

export async function handleServeInstructions(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  const ip = (req.get('x-forwarded-for') || req.ip || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) return res.status(429).send('Too many requests.\n');
  try {
    const token = String(req.params.token || '');
    // Token shape: 32 bytes base64url = 43 chars. Anything else is a 404.
    if (!/^[A-Za-z0-9_-]{40,48}$/.test(token)) return res.status(404).send('Not found\n');
    const db = getFirestore(getApp());
    const ref = db.collection(COLLECTION).doc(hashToken(token));
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).send('Not found\n');
    const link = snap.data() as any;
    if (!link || link.revoked) return res.status(404).send('Not found\n');
    const project = await getOwnedProject(String(link.uid), String(link.projectId));
    const text = project ? assembleInstructions(project) : null;
    if (!text) return res.status(404).send('Not found\n');
    // Fetch log (count, time, recent IPs) — the multi-IP signal Nic or an
    // admin can spot in the console; alerting builds on this later.
    const recentIps: string[] = Array.isArray(link.recentIps) ? link.recentIps : [];
    if (!recentIps.includes(ip)) recentIps.push(ip);
    await ref.update({
      fetchCount: FieldValue.increment(1),
      lastFetchedAt: new Date().toISOString(),
      recentIps: recentIps.slice(-8),
    });
    return res.send(text);
  } catch (err) {
    console.error('instructions serve failed:', err);
    return res.status(404).send('Not found\n');
  }
}
