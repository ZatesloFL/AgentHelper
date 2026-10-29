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

// Assemble the instruction text from structured project fields only.
// Returns null when the project has no approved contract to serve.
export function assembleInstructions(project: any): string | null {
  const contract = project?.contract;
  if (!contract || typeof contract !== 'object') return null;
  const lines: string[] = [];
  const title = typeof project.title === 'string' && project.title.trim() ? project.title.trim() : 'My helper';
  const productLabel = PRODUCT_LABELS[String(project.product || '')] || 'your AI assistant';
  lines.push(`# ${title} — instructions for ${productLabel}`);
  lines.push('');
  lines.push('Set up with Second Look. Follow these instructions as your standing brief for this project. If anything here is unclear or conflicts with what your human asks, ask your human before acting.');
  const push = (label: string, value: unknown) => {
    if (typeof value === 'string' && value.trim()) {
      lines.push('', `${label}: ${value.trim()}`);
    }
  };
  push('Goal', contract.goal || project.goalInOneSentence);
  push('What done looks like', project.whatDoneLooksLike);
  push('Check-in rhythm', project.checkInRhythm);
  push('Always do', contract.do);
  push('Never do', contract.do_not);
  push('Ask me before', contract.ask_me_before);
  push('Report back', contract.report_back);
  push('Stop if', contract.stop_if);
  if (typeof project.templateSlug === 'string' && project.templateSlug) {
    const v = typeof project.templateVersion === 'number' ? ` (version ${project.templateVersion}, the version your human approved)` : '';
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
