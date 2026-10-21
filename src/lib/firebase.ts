import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const CURRENT_CONSENT_VERSION = 2;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface SessionNote {
  id: string;
  userId: string;
  product: string;
  text: string;
  createdAt: string;
}

export type StepEvidence = 'screen' | 'user' | 'self';

export interface CompletedStepRecord {
  step: number;
  evidence: StepEvidence;
  note?: string;
  at: string;
}

export interface RoutineProgressDoc {
  appId: string;
  status: 'not-started' | 'in-progress' | 'done';
  completedSteps: CompletedStepRecord[];
  activeStep: number;
  updatedAt: string;
}

export interface StoredRoutineStep {
  number: number;
  title: string;
  detail: string;
  completed?: boolean;
  coachPrompt?: string;
  coach?: string;
  why?: string;
  where?: string;
  done_when?: string;
  verify?: 'user' | 'screen' | 'either';
  if_stuck?: string;
  safety?: string;
  area?: string;
  rating?: string;
  evidence?: StepEvidence;
  note?: string;
  at?: string;
}

export interface StoredAppCard {
  appId: string;
  title: string;
  goal: string;
  activeStep?: number;
  steps: StoredRoutineStep[];
}

export interface TaskContractFields {
  goal: string;
  do: string;
  do_not: string;
  ask_me_before: string;
  report_back: string;
  stop_if: string;
}

export interface ProjectRungHistoryItem {
  rung: number;
  at: string;
}

export interface UserProjectDoc {
  projectId: string;
  title?: string;
  product?: string;
  contract: TaskContractFields;
  rung: 0 | 1 | 2 | 3;
  status: 'active' | 'paused';
  history: ProjectRungHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredContractCard {
  projectId: string;
  title: string;
  contract: TaskContractFields;
  rung: 0 | 1 | 2 | 3;
  rungName: string;
  rungText?: string;
  ladder?: Array<{ rung: number; name: string; text: string }>;
  saved?: boolean;
}

export interface StoredMessage {
  id: string;
  role: 'user' | 'guide' | 'system';
  text: string;
  timestamp: string;
  source: 'typed' | 'spoken' | 'system';
  appCard?: StoredAppCard;
  reportCard?: {
    goal: string;
    tried: string;
    blocker: string;
    sentRefId?: string;
  };
  contractCard?: StoredContractCard;
  bookingUrl?: string;
}

export interface StoredConversation {
  id: string;
  product: string;
  startedAt: string;
  updatedAt: string;
  summary?: string;
  messages: StoredMessage[];
}

export interface ProgressSummaryDoc {
  product: string;
  done: string[];
  inProgress: string[];
  boundariesAndPreferences: string[];
  openQuestions: string[];
  suggestedNextStep: string;
  summary: string;
  updatedAt: string;
}

function toIsoString(val: any): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (val instanceof Timestamp || typeof val?.toDate === 'function') {
    return val.toDate().toISOString();
  }
  return new Date().toISOString();
}

export function clampRung(val: any): 0 | 1 | 2 | 3 {
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) return 0;
  if (num >= 3) return 3;
  return Math.round(num) as 0 | 1 | 2 | 3;
}

export function doesContractDoRestrictPastRung2(doText: string): boolean {
  const lower = String(doText || '').toLowerCase();
  if (!lower) return false;
  return (
    /\b(purchase|purchases|buy|buying|pay|payment|payments|order|checkout)\b/.test(lower) ||
    /\b(public post|public posts|post publicly|publish publicly|social media post)\b/.test(lower) ||
    /\b(send to others|email others|message others|reply to others|forward to others|invite others)\b/.test(lower)
  );
}

function sanitizeContractFields(raw: any): TaskContractFields {
  return {
    goal: typeof raw?.goal === 'string' ? raw.goal.trim().slice(0, 1000) : '',
    do: typeof raw?.do === 'string' ? raw.do.trim().slice(0, 1500) : '',
    do_not: typeof raw?.do_not === 'string' ? raw.do_not.trim().slice(0, 1500) : '',
    ask_me_before:
      typeof raw?.ask_me_before === 'string' ? raw.ask_me_before.trim().slice(0, 1000) : '',
    report_back:
      typeof raw?.report_back === 'string' ? raw.report_back.trim().slice(0, 1000) : '',
    stop_if: typeof raw?.stop_if === 'string' ? raw.stop_if.trim().slice(0, 1000) : '',
  };
}

function sanitizeMessageForFirestore(m: any): StoredMessage {
  const source: 'typed' | 'spoken' | 'system' =
    m?.source === 'spoken'
      ? 'spoken'
      : m?.source === 'system' || m?.role === 'system'
      ? 'system'
      : 'typed';

  const clean: StoredMessage = {
    id: typeof m?.id === 'string' && m.id ? m.id : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    role: m?.role === 'guide' || m?.role === 'system' ? m.role : 'user',
    text: typeof m?.text === 'string' ? m.text.slice(0, 4000) : '',
    timestamp: typeof m?.timestamp === 'string' ? m.timestamp : '',
    source,
  };

  if (m?.appCard && typeof m.appCard === 'object') {
    clean.appCard = {
      appId: String(m.appCard.appId || ''),
      title: String(m.appCard.title || ''),
      goal: String(m.appCard.goal || ''),
      activeStep: typeof m.appCard.activeStep === 'number' ? m.appCard.activeStep : 1,
      steps: Array.isArray(m.appCard.steps)
        ? m.appCard.steps.map((s: any) => {
            const stepObj: StoredRoutineStep = {
              number: Number(s?.number || 1),
              title: String(s?.title || ''),
              detail: String(s?.detail || s?.why || ''),
              completed: Boolean(s?.completed),
            };
            if (typeof s?.coachPrompt === 'string' && s.coachPrompt) {
              stepObj.coachPrompt = s.coachPrompt;
            }
            if (typeof s?.coach === 'string' && s.coach) {
              stepObj.coach = s.coach;
            }
            if (typeof s?.why === 'string' && s.why) {
              stepObj.why = s.why;
            }
            if (typeof s?.where === 'string' && s.where) {
              stepObj.where = s.where;
            }
            if (typeof s?.done_when === 'string' && s.done_when) {
              stepObj.done_when = s.done_when;
            }
            if (s?.verify === 'user' || s?.verify === 'screen' || s?.verify === 'either') {
              stepObj.verify = s.verify;
            }
            if (typeof s?.if_stuck === 'string' && s.if_stuck) {
              stepObj.if_stuck = s.if_stuck;
            }
            if (typeof s?.safety === 'string' && s.safety) {
              stepObj.safety = s.safety;
            }
            if (typeof s?.area === 'string' && s.area) {
              stepObj.area = s.area;
            }
            if (typeof s?.rating === 'string' && s.rating) {
              stepObj.rating = s.rating;
            }
            if (s?.evidence === 'screen' || s?.evidence === 'user' || s?.evidence === 'self') {
              stepObj.evidence = s.evidence;
            }
            if (typeof s?.note === 'string' && s.note) {
              stepObj.note = s.note;
            }
            if (typeof s?.at === 'string' && s.at) {
              stepObj.at = s.at;
            }
            return stepObj;
          })
        : [],
    };
  }

  if (m?.reportCard && typeof m.reportCard === 'object') {
    const cardObj: NonNullable<StoredMessage['reportCard']> = {
      goal: String(m.reportCard.goal || ''),
      tried: String(m.reportCard.tried || ''),
      blocker: String(m.reportCard.blocker || ''),
    };
    if (typeof m.reportCard.sentRefId === 'string' && m.reportCard.sentRefId.trim()) {
      cardObj.sentRefId = m.reportCard.sentRefId.trim();
    }
    clean.reportCard = cardObj;
  }

  if (m?.contractCard && typeof m.contractCard === 'object') {
    const cc: StoredContractCard = {
      projectId: String(m.contractCard.projectId || '').trim(),
      title: String(m.contractCard.title || m.contractCard.projectId || '').trim(),
      contract: sanitizeContractFields(m.contractCard.contract),
      rung: clampRung(m.contractCard.rung),
      rungName: String(m.contractCard.rungName || 'Watch').trim(),
      saved: Boolean(m.contractCard.saved),
    };
    if (typeof m.contractCard.rungText === 'string' && m.contractCard.rungText.trim()) {
      cc.rungText = m.contractCard.rungText.trim().slice(0, 400);
    }
    if (Array.isArray(m.contractCard.ladder)) {
      cc.ladder = m.contractCard.ladder.map((l: any) => ({
        rung: clampRung(l?.rung),
        name: String(l?.name || '').trim(),
        text: String(l?.text || '').trim(),
      }));
    }
    clean.contractCard = cc;
  }

  if (typeof m?.bookingUrl === 'string' && m.bookingUrl) {
    clean.bookingUrl = m.bookingUrl;
  }

  return clean;
}

/**
 * Retrieves a fresh Firebase ID token for the currently signed-in Google user.
 */
export async function getIdToken(): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Please sign in with Google to continue.');
  }
  return currentUser.getIdToken();
}

/**
 * Wrapper around fetch that attaches Authorization: Bearer <Firebase ID token> on every request.
 */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = await getIdToken();
  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, {
    ...init,
    headers,
  });
}

/**
 * Google Sign-In authentication service (guest mode removed).
 */
export const authService = {
  getCurrentUser(): AuthUser | null {
    const u = auth.currentUser;
    if (!u) return null;
    return {
      uid: u.uid,
      displayName: u.displayName || u.email?.split('@')[0] || 'Friend',
      email: u.email,
      photoURL: u.photoURL,
    };
  },

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    const unsubscribe = firebaseOnAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        callback({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Friend',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  },

  async signInWithGoogle(): Promise<AuthUser> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const u = result.user;
    return {
      uid: u.uid,
      displayName: u.displayName || u.email?.split('@')[0] || 'Friend',
      email: u.email,
      photoURL: u.photoURL,
    };
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  },
};

/**
 * Consent persistence with version check (consentVersion = 2)
 */
export async function getUserConsent(uid: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data?.consentAccepted === true && data?.consentVersion === CURRENT_CONSENT_VERSION;
    }
  } catch (err) {
    console.warn('Could not read user consent from Firestore, checking local storage:', err);
  }
  return localStorage.getItem(`consent_${uid}_v${CURRENT_CONSENT_VERSION}`) === 'true';
}

export async function saveUserConsent(uid: string): Promise<void> {
  localStorage.setItem(`consent_${uid}_v${CURRENT_CONSENT_VERSION}`, 'true');

  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        consentAccepted: true,
        consentVersion: CURRENT_CONSENT_VERSION,
        consentAcceptedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not save consent to Firestore:', err);
  }
}

/**
 * Per-user session notes in Firestore
 */
export async function saveUserSessionNote(uid: string, product: string, text: string): Promise<SessionNote> {
  const truncated = text.slice(0, 500);
  const nowIso = new Date().toISOString();

  try {
    const notesRef = collection(db, 'users', uid, 'notes');
    const docRef = await addDoc(notesRef, {
      userId: uid,
      product,
      text: truncated,
      createdAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      userId: uid,
      product,
      text: truncated,
      createdAt: nowIso,
    };
  } catch (err) {
    console.warn('Firestore note save error, using local fallback:', err);
    const noteId = `note-${Date.now()}`;
    const newNote: SessionNote = {
      id: noteId,
      userId: uid,
      product,
      text: truncated,
      createdAt: nowIso,
    };
    const key = `notes_${uid}_${product}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift(newNote);
    localStorage.setItem(key, JSON.stringify(existing));
    throw new Error("I couldn't save that note to your cloud account just now. It is kept in this browser for now — check your connection and try again.");
  }
}

export async function getUserSessionNotes(uid: string, product: string): Promise<SessionNote[]> {
  try {
    const notesRef = collection(db, 'users', uid, 'notes');
    const q = query(notesRef, where('product', '==', product));
    const snapshot = await getDocs(q);
    const notes: SessionNote[] = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      notes.push({
        id: docSnap.id,
        userId: data.userId || uid,
        product: data.product || product,
        text: data.text || '',
        createdAt: toIsoString(data.createdAt),
      });
    });

    notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return notes;
  } catch (err) {
    console.warn('Firestore notes fetch error, reading local fallback:', err);
    const key = `notes_${uid}_${product}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
}

export async function deleteUserSessionNote(uid: string, noteId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid, 'notes', noteId));
  } catch (err) {
    console.warn('Error deleting note from Firestore:', err);
  }
}

/**
 * Conversations persistence at users/{uid}/conversations/{conversationId}
 * Text only, never screen frames or audio. Keep at most the last 400 messages.
 */
export async function saveConversation(
  uid: string,
  conversationId: string,
  payload: {
    product: string;
    startedAt: string;
    messages: any[];
    summary?: string;
  }
): Promise<void> {
  if (!uid || !conversationId) return;

  const sanitizedMessages = (Array.isArray(payload.messages) ? payload.messages : [])
    .slice(-400)
    .map(sanitizeMessageForFirestore);

  const nowIso = new Date().toISOString();
  const docData: Record<string, any> = {
    product: payload.product,
    startedAt: payload.startedAt || nowIso,
    updatedAt: nowIso,
    messages: sanitizedMessages,
  };
  if (typeof payload.summary === 'string' && payload.summary.trim()) {
    docData.summary = payload.summary.trim().slice(0, 1200);
  }

  // Save to localStorage immediately as synchronous backup (e.g. for pagehide)
  try {
    const localKey = `conv_${uid}_${conversationId}`;
    localStorage.setItem(localKey, JSON.stringify({ id: conversationId, ...docData }));
    localStorage.setItem(`latest_conv_${uid}_${payload.product}`, conversationId);
  } catch (_) {}

  try {
    await setDoc(doc(db, 'users', uid, 'conversations', conversationId), docData, { merge: true });
  } catch (err) {
    console.warn('Could not save conversation to Firestore:', err);
    throw new Error("I couldn't save your latest progress to your account just now. Your chat is still kept in this browser — check your connection.");
  }
}

/**
 * Returns lightweight conversation list (id, product, startedAt, updatedAt, summary only).
 * Full messages are fetched on-demand via getUserConversation when a past conversation is opened.
 */
export async function listUserConversations(uid: string): Promise<StoredConversation[]> {
  if (!uid) return [];
  try {
    const convRef = collection(db, 'users', uid, 'conversations');
    const snapshot = await getDocs(convRef);
    const list: StoredConversation[] = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        product: data.product || 'muse',
        startedAt: toIsoString(data.startedAt),
        updatedAt: toIsoString(data.updatedAt),
        summary: typeof data.summary === 'string' ? data.summary : undefined,
        messages: [],
      });
    });

    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return list;
  } catch (err) {
    console.warn('Error listing conversations from Firestore:', err);
    return [];
  }
}

export async function getUserConversation(
  uid: string,
  conversationId: string
): Promise<StoredConversation | null> {
  if (!uid || !conversationId) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'conversations', conversationId));
    if (snap.exists()) {
      const data = snap.data();
      const msgs = Array.isArray(data.messages)
        ? data.messages.slice(-400).map(sanitizeMessageForFirestore)
        : [];
      return {
        id: snap.id,
        product: data.product || 'muse',
        startedAt: toIsoString(data.startedAt),
        updatedAt: toIsoString(data.updatedAt),
        summary: typeof data.summary === 'string' ? data.summary : undefined,
        messages: msgs,
      };
    }
  } catch (err) {
    console.warn('Error fetching conversation from Firestore:', err);
  }
  try {
    const raw = localStorage.getItem(`conv_${uid}_${conversationId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        id: parsed.id || conversationId,
        product: parsed.product || 'muse',
        startedAt: toIsoString(parsed.startedAt),
        updatedAt: toIsoString(parsed.updatedAt),
        summary: typeof parsed.summary === 'string' ? parsed.summary : undefined,
        messages: Array.isArray(parsed.messages)
          ? parsed.messages.slice(-400).map(sanitizeMessageForFirestore)
          : [],
      };
    }
  } catch (_) {}
  return null;
}

export async function getRecentProductConversation(
  uid: string,
  product: string
): Promise<StoredConversation | null> {
  if (!uid) return null;
  try {
    const convRef = collection(db, 'users', uid, 'conversations');
    const q = query(convRef, where('product', '==', product));
    const snapshot = await getDocs(q);
    const list: StoredConversation[] = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const msgs = Array.isArray(data.messages)
        ? data.messages.slice(-400).map(sanitizeMessageForFirestore)
        : [];
      list.push({
        id: docSnap.id,
        product: data.product || product,
        startedAt: toIsoString(data.startedAt),
        updatedAt: toIsoString(data.updatedAt),
        summary: typeof data.summary === 'string' ? data.summary : undefined,
        messages: msgs,
      });
    });

    if (list.length === 0) return null;
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return list[0];
  } catch (err) {
    console.warn('Error fetching recent product conversation from Firestore:', err);
    try {
      const latestId = localStorage.getItem(`latest_conv_${uid}_${product}`);
      if (latestId) {
        const raw = localStorage.getItem(`conv_${uid}_${latestId}`);
        if (raw) return JSON.parse(raw);
      }
    } catch (_) {}
    return null;
  }
}

export async function deleteUserConversation(uid: string, conversationId: string): Promise<void> {
  if (!uid || !conversationId) return;
  try {
    localStorage.removeItem(`conv_${uid}_${conversationId}`);
  } catch (_) {}
  try {
    await deleteDoc(doc(db, 'users', uid, 'conversations', conversationId));
  } catch (err) {
    console.warn('Error deleting conversation from Firestore:', err);
  }
}

/**
 * Progress Summary persistence at users/{uid}/progress/{product}
 */
export async function getUserProgressSummary(
  uid: string,
  product: string
): Promise<ProgressSummaryDoc | null> {
  if (!uid || !product) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'progress', product));
    if (snap.exists()) {
      const data = snap.data();
      return {
        product: data.product || product,
        done: Array.isArray(data.done) ? data.done.map(String) : [],
        inProgress: Array.isArray(data.inProgress) ? data.inProgress.map(String) : [],
        boundariesAndPreferences: Array.isArray(data.boundariesAndPreferences)
          ? data.boundariesAndPreferences.map(String)
          : [],
        openQuestions: Array.isArray(data.openQuestions) ? data.openQuestions.map(String) : [],
        suggestedNextStep: typeof data.suggestedNextStep === 'string' ? data.suggestedNextStep : '',
        summary: typeof data.summary === 'string' ? data.summary : '',
        updatedAt: toIsoString(data.updatedAt),
      };
    }
  } catch (err) {
    console.warn('Error reading progress summary from Firestore:', err);
  }
  try {
    const localRaw = localStorage.getItem(`progress_${uid}_${product}`);
    if (localRaw) return JSON.parse(localRaw);
  } catch (_) {}
  return null;
}

export async function saveUserProgressSummary(
  uid: string,
  product: string,
  summaryData: {
    done?: string[];
    inProgress?: string[];
    boundariesAndPreferences?: string[];
    openQuestions?: string[];
    suggestedNextStep?: string;
    summary: string;
  }
): Promise<ProgressSummaryDoc> {
  const nowIso = new Date().toISOString();
  const docObj: ProgressSummaryDoc = {
    product,
    done: Array.isArray(summaryData.done) ? summaryData.done.map(String) : [],
    inProgress: Array.isArray(summaryData.inProgress) ? summaryData.inProgress.map(String) : [],
    boundariesAndPreferences: Array.isArray(summaryData.boundariesAndPreferences)
      ? summaryData.boundariesAndPreferences.map(String)
      : [],
    openQuestions: Array.isArray(summaryData.openQuestions)
      ? summaryData.openQuestions.map(String)
      : [],
    suggestedNextStep:
      typeof summaryData.suggestedNextStep === 'string'
        ? summaryData.suggestedNextStep.slice(0, 400)
        : '',
    summary: (summaryData.summary || '').trim().slice(0, 1200),
    updatedAt: nowIso,
  };

  try {
    localStorage.setItem(`progress_${uid}_${product}`, JSON.stringify(docObj));
  } catch (_) {}

  try {
    await setDoc(doc(db, 'users', uid, 'progress', product), docObj, { merge: true });
  } catch (err) {
    console.warn('Error saving progress summary to Firestore:', err);
    throw new Error("I couldn't save your progress summary to your account just now. It is still kept in this browser — check your connection.");
  }

  return docObj;
}

export async function deleteUserProgressSummary(uid: string, product: string): Promise<void> {
  if (!uid || !product) return;
  try {
    localStorage.removeItem(`progress_${uid}_${product}`);
  } catch (_) {}
  try {
    await deleteDoc(doc(db, 'users', uid, 'progress', product));
  } catch (err) {
    console.warn('Error deleting progress summary from Firestore:', err);
  }
}

/**
 * Routine progress persistence at users/{uid}/routines/{appId}
 * { status: "not-started" | "in-progress" | "done", completedSteps: [{ step, evidence, note, at }], activeStep, updatedAt }
 */
function sanitizeCompletedStep(item: any): CompletedStepRecord {
  const evidence: StepEvidence =
    item?.evidence === 'screen' || item?.evidence === 'user' || item?.evidence === 'self'
      ? item.evidence
      : 'self';
  const rec: CompletedStepRecord = {
    step: Number(item?.step || 1),
    evidence,
    at: typeof item?.at === 'string' && item.at ? item.at : new Date().toISOString(),
  };
  if (typeof item?.note === 'string' && item.note.trim()) {
    rec.note = item.note.trim().slice(0, 300);
  }
  return rec;
}

export async function getUserRoutinesProgress(
  uid: string
): Promise<Record<string, RoutineProgressDoc>> {
  if (!uid) return {};
  const map: Record<string, RoutineProgressDoc> = {};

  // Read local fallback first so we have immediate defaults
  try {
    const raw = localStorage.getItem(`routines_${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        Object.assign(map, parsed);
      }
    }
  } catch (_) {}

  try {
    const colRef = collection(db, 'users', uid, 'routines');
    const snap = await getDocs(colRef);
    snap.forEach(docSnap => {
      const d = docSnap.data();
      const status =
        d.status === 'done' || d.status === 'in-progress' ? d.status : 'not-started';
      const completedSteps = Array.isArray(d.completedSteps)
        ? d.completedSteps.map(sanitizeCompletedStep)
        : [];
      map[docSnap.id] = {
        appId: docSnap.id,
        status,
        completedSteps,
        activeStep: typeof d.activeStep === 'number' && d.activeStep > 0 ? d.activeStep : 1,
        updatedAt: toIsoString(d.updatedAt),
      };
    });

    try {
      localStorage.setItem(`routines_${uid}`, JSON.stringify(map));
    } catch (_) {}
  } catch (err) {
    console.warn('Error fetching user routine progress from Firestore:', err);
  }

  return map;
}

export async function getUserRoutineProgress(
  uid: string,
  appId: string
): Promise<RoutineProgressDoc | null> {
  if (!uid || !appId) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'routines', appId));
    if (snap.exists()) {
      const d = snap.data();
      const status =
        d.status === 'done' || d.status === 'in-progress' ? d.status : 'not-started';
      return {
        appId: snap.id,
        status,
        completedSteps: Array.isArray(d.completedSteps)
          ? d.completedSteps.map(sanitizeCompletedStep)
          : [],
        activeStep: typeof d.activeStep === 'number' && d.activeStep > 0 ? d.activeStep : 1,
        updatedAt: toIsoString(d.updatedAt),
      };
    }
  } catch (err) {
    console.warn(`Error fetching routine progress for ${appId}:`, err);
  }

  try {
    const raw = localStorage.getItem(`routines_${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed[appId]) return parsed[appId];
    }
  } catch (_) {}
  return null;
}

export async function saveUserRoutineProgress(
  uid: string,
  appId: string,
  data: {
    status: 'not-started' | 'in-progress' | 'done';
    completedSteps: CompletedStepRecord[];
    activeStep: number;
  }
): Promise<RoutineProgressDoc> {
  const nowIso = new Date().toISOString();
  const cleanSteps = (Array.isArray(data.completedSteps) ? data.completedSteps : []).map(
    sanitizeCompletedStep
  );
  const docObj: RoutineProgressDoc = {
    appId,
    status: data.status,
    completedSteps: cleanSteps,
    activeStep: typeof data.activeStep === 'number' && data.activeStep > 0 ? data.activeStep : 1,
    updatedAt: nowIso,
  };

  try {
    const raw = localStorage.getItem(`routines_${uid}`);
    const existing = raw ? JSON.parse(raw) : {};
    existing[appId] = docObj;
    localStorage.setItem(`routines_${uid}`, JSON.stringify(existing));
  } catch (_) {}

  if (uid && appId) {
    try {
      await setDoc(
        doc(db, 'users', uid, 'routines', appId),
        {
          status: docObj.status,
          completedSteps: docObj.completedSteps,
          activeStep: docObj.activeStep,
          updatedAt: docObj.updatedAt,
        },
        { merge: true }
      );
    } catch (err) {
      console.warn(`Error saving routine progress for ${appId} to Firestore:`, err);
    }
  }

  return docObj;
}

export interface UserToolEntry {
  id: string;
  name: string;
  category: string;
  account: 'personal' | 'work';
  sensitive: boolean;
}

export interface ToolsProfileDoc {
  devices: string[];
  tools: UserToolEntry[];
  other: string;
  updatedAt: string;
}

function sanitizeUserToolEntry(item: any): UserToolEntry | null {
  if (!item || typeof item !== 'object') return null;
  const id = typeof item.id === 'string' ? item.id.trim() : '';
  if (!id) return null;
  return {
    id,
    name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : id,
    category: typeof item.category === 'string' && item.category.trim() ? item.category.trim() : 'other',
    account: item.account === 'work' ? 'work' : 'personal',
    sensitive: Boolean(item.sensitive),
  };
}

/**
 * User's "Your tools" profile at users/{uid}/profile/tools
 * { devices: [], tools: [{ id, name, category, account: "personal" | "work", sensitive: boolean }], other: string, updatedAt }
 */
export async function getUserToolsProfile(uid: string): Promise<ToolsProfileDoc | null> {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'profile', 'tools'));
    if (snap.exists()) {
      const data = snap.data();
      const devices = Array.isArray(data.devices)
        ? data.devices.map((d: any) => String(d).trim()).filter(Boolean)
        : [];
      const tools = Array.isArray(data.tools)
        ? (data.tools.map(sanitizeUserToolEntry).filter(Boolean) as UserToolEntry[])
        : [];
      const other = typeof data.other === 'string' ? data.other.slice(0, 300) : '';
      const docObj: ToolsProfileDoc = {
        devices,
        tools,
        other,
        updatedAt: toIsoString(data.updatedAt),
      };
      try {
        localStorage.setItem(`tools_profile_${uid}`, JSON.stringify(docObj));
      } catch (_) {}
      return docObj;
    }
  } catch (err) {
    console.warn('Error reading tools profile from Firestore:', err);
  }

  try {
    const raw = localStorage.getItem(`tools_profile_${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          devices: Array.isArray(parsed.devices) ? parsed.devices.map(String) : [],
          tools: Array.isArray(parsed.tools)
            ? (parsed.tools.map(sanitizeUserToolEntry).filter(Boolean) as UserToolEntry[])
            : [],
          other: typeof parsed.other === 'string' ? parsed.other.slice(0, 300) : '',
          updatedAt: toIsoString(parsed.updatedAt),
        };
      }
    }
  } catch (_) {}

  return null;
}

export async function saveUserToolsProfile(
  uid: string,
  profileData: {
    devices: string[];
    tools: UserToolEntry[];
    other: string;
  }
): Promise<ToolsProfileDoc> {
  const nowIso = new Date().toISOString();
  const cleanDevices = Array.from(
    new Set(
      (Array.isArray(profileData.devices) ? profileData.devices : [])
        .map(d => String(d || '').trim())
        .filter(Boolean)
    )
  );
  const cleanTools = (Array.isArray(profileData.tools) ? profileData.tools : [])
    .map(sanitizeUserToolEntry)
    .filter(Boolean) as UserToolEntry[];
  const cleanOther = typeof profileData.other === 'string' ? profileData.other.trim().slice(0, 300) : '';

  const docObj: ToolsProfileDoc = {
    devices: cleanDevices,
    tools: cleanTools,
    other: cleanOther,
    updatedAt: nowIso,
  };

  if (uid) {
    try {
      localStorage.setItem(`tools_profile_${uid}`, JSON.stringify(docObj));
    } catch (_) {}

    try {
      await setDoc(doc(db, 'users', uid, 'profile', 'tools'), docObj, { merge: true });
    } catch (err) {
      console.warn('Error saving tools profile to Firestore:', err);
      throw new Error(
        "I couldn't save your tools profile to your account just now. It is kept in this browser — check your connection."
      );
    }
  }

  return docObj;
}

/**
 * User's saved project contracts at users/{uid}/projects/{project_id}:
 * { contract, rung (0-3), status: "active" | "paused", history: [{ rung, at }], createdAt, updatedAt }
 */
function sanitizeProjectDoc(projectId: string, d: any): UserProjectDoc {
  const nowIso = new Date().toISOString();
  const contract = sanitizeContractFields(d?.contract);
  let rung = clampRung(d?.rung);
  if (doesContractDoRestrictPastRung2(contract.do) && rung > 2) {
    rung = 2;
  }
  const status: 'active' | 'paused' = d?.status === 'paused' ? 'paused' : 'active';
  const createdAt = toIsoString(d?.createdAt || d?.updatedAt || nowIso);
  const updatedAt = toIsoString(d?.updatedAt || nowIso);
  const rawHistory = Array.isArray(d?.history) ? d.history : [];
  const history: ProjectRungHistoryItem[] =
    rawHistory.length > 0
      ? rawHistory.map((h: any) => ({
          rung: clampRung(h?.rung),
          at: toIsoString(h?.at || updatedAt),
        }))
      : [{ rung, at: createdAt }];

  const docObj: UserProjectDoc = {
    projectId,
    contract,
    rung,
    status,
    history,
    createdAt,
    updatedAt,
  };
  if (typeof d?.title === 'string' && d.title.trim()) {
    docObj.title = d.title.trim().slice(0, 200);
  }
  if (typeof d?.product === 'string' && d.product.trim()) {
    docObj.product = d.product.trim().slice(0, 100);
  }
  return docObj;
}

export async function getUserProjects(uid: string): Promise<Record<string, UserProjectDoc>> {
  if (!uid) return {};
  const map: Record<string, UserProjectDoc> = {};

  try {
    const raw = localStorage.getItem(`projects_${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        for (const [k, v] of Object.entries(parsed)) {
          map[k] = sanitizeProjectDoc(k, v);
        }
      }
    }
  } catch (_) {}

  try {
    const colRef = collection(db, 'users', uid, 'projects');
    const snap = await getDocs(colRef);
    const freshMap: Record<string, UserProjectDoc> = {};
    snap.forEach(docSnap => {
      freshMap[docSnap.id] = sanitizeProjectDoc(docSnap.id, docSnap.data());
    });
    try {
      localStorage.setItem(`projects_${uid}`, JSON.stringify(freshMap));
    } catch (_) {}
    return freshMap;
  } catch (err) {
    console.warn('Error fetching user projects from Firestore:', err);
  }

  return map;
}

export async function saveUserProjectContract(
  uid: string,
  projectId: string,
  data: {
    title?: string;
    product?: string;
    contract: TaskContractFields;
    rung: number;
    status?: 'active' | 'paused';
  }
): Promise<UserProjectDoc> {
  const cleanId = String(projectId || '').trim() || 'first-task';
  const nowIso = new Date().toISOString();
  const cleanContract = sanitizeContractFields(data.contract);
  let targetRung = clampRung(data.rung);
  if (doesContractDoRestrictPastRung2(cleanContract.do) && targetRung > 2) {
    targetRung = 2;
  }

  let existing: UserProjectDoc | null = null;
  try {
    const raw = localStorage.getItem(`projects_${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed[cleanId]) {
        existing = sanitizeProjectDoc(cleanId, parsed[cleanId]);
      }
    }
  } catch (_) {}

  if (!existing && uid) {
    try {
      const snap = await getDoc(doc(db, 'users', uid, 'projects', cleanId));
      if (snap.exists()) {
        existing = sanitizeProjectDoc(cleanId, snap.data());
      }
    } catch (_) {}
  }

  const createdAt = existing?.createdAt || nowIso;
  const status: 'active' | 'paused' = data.status || existing?.status || 'active';
  const prevHistory = existing?.history ? [...existing.history] : [];
  const lastHistoryRung =
    prevHistory.length > 0 ? prevHistory[prevHistory.length - 1].rung : null;
  if (prevHistory.length === 0 || lastHistoryRung !== targetRung) {
    prevHistory.push({ rung: targetRung, at: nowIso });
  }

  const docObj: UserProjectDoc = {
    projectId: cleanId,
    title: data.title?.trim() || existing?.title,
    product: data.product?.trim() || existing?.product,
    contract: cleanContract,
    rung: targetRung,
    status,
    history: prevHistory,
    createdAt,
    updatedAt: nowIso,
  };

  if (uid) {
    try {
      const raw = localStorage.getItem(`projects_${uid}`);
      const all = raw ? JSON.parse(raw) : {};
      all[cleanId] = docObj;
      localStorage.setItem(`projects_${uid}`, JSON.stringify(all));
    } catch (_) {}

    const firestorePayload: Record<string, any> = {
      contract: docObj.contract,
      rung: docObj.rung,
      status: docObj.status,
      history: docObj.history,
      createdAt: docObj.createdAt,
      updatedAt: docObj.updatedAt,
    };
    if (docObj.title) firestorePayload.title = docObj.title;
    if (docObj.product) firestorePayload.product = docObj.product;

    try {
      await setDoc(doc(db, 'users', uid, 'projects', cleanId), firestorePayload, { merge: true });
    } catch (err) {
      console.warn(`Error saving project contract ${cleanId} to Firestore:`, err);
      throw new Error(
        "I couldn't save your project contract to your account just now. It is kept in this browser — check your connection."
      );
    }
  }

  return docObj;
}

export async function updateUserProjectStatus(
  uid: string,
  projectId: string,
  status: 'active' | 'paused'
): Promise<UserProjectDoc | null> {
  if (!uid || !projectId) return null;
  const nowIso = new Date().toISOString();

  let updatedDoc: UserProjectDoc | null = null;
  try {
    const raw = localStorage.getItem(`projects_${uid}`);
    const all = raw ? JSON.parse(raw) : {};
    if (all[projectId]) {
      all[projectId] = {
        ...all[projectId],
        status,
        updatedAt: nowIso,
      };
      updatedDoc = sanitizeProjectDoc(projectId, all[projectId]);
      localStorage.setItem(`projects_${uid}`, JSON.stringify(all));
    }
  } catch (_) {}

  try {
    await setDoc(
      doc(db, 'users', uid, 'projects', projectId),
      { status, updatedAt: nowIso },
      { merge: true }
    );
    if (!updatedDoc) {
      const snap = await getDoc(doc(db, 'users', uid, 'projects', projectId));
      if (snap.exists()) {
        updatedDoc = sanitizeProjectDoc(projectId, snap.data());
      }
    }
  } catch (err) {
    console.warn(`Error updating project status for ${projectId}:`, err);
  }

  return updatedDoc;
}

export async function deleteUserProject(uid: string, projectId: string): Promise<void> {
  if (!uid || !projectId) return;
  try {
    const raw = localStorage.getItem(`projects_${uid}`);
    if (raw) {
      const all = JSON.parse(raw);
      delete all[projectId];
      localStorage.setItem(`projects_${uid}`, JSON.stringify(all));
    }
  } catch (_) {}

  try {
    await deleteDoc(doc(db, 'users', uid, 'projects', projectId));
  } catch (err) {
    console.warn(`Error deleting project ${projectId} from Firestore:`, err);
  }
}

/**
 * Removes all localStorage keys starting with conv_, latest_conv_, progress_, notes_, routines_, tools_profile_, projects_ for a given uid.
 */
export function clearUserLocalStorage(uid: string): void {
  if (!uid) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith(`conv_${uid}_`) ||
          k.startsWith(`latest_conv_${uid}_`) ||
          k.startsWith(`progress_${uid}_`) ||
          k.startsWith(`notes_${uid}_`) ||
          k === `routines_${uid}` ||
          k.startsWith(`routines_${uid}_`) ||
          k === `tools_profile_${uid}` ||
          k === `projects_${uid}`)
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (_) {}
}

/**
 * Deletes all history for a user: conversations, progress summaries, session notes, routine progress, tools profile, and projects.
 */
export async function deleteAllUserHistory(uid: string): Promise<void> {
  if (!uid) return;

  clearUserLocalStorage(uid);

  try {
    const subcollections = ['conversations', 'progress', 'notes', 'routines', 'profile', 'projects'];
    for (const sub of subcollections) {
      const colRef = collection(db, 'users', uid, sub);
      const snap = await getDocs(colRef);
      const deletions: Promise<void>[] = [];
      snap.forEach(d => {
        deletions.push(deleteDoc(doc(db, 'users', uid, sub, d.id)));
      });
      await Promise.all(deletions);
    }
  } catch (err) {
    console.warn('Error deleting all user history from Firestore:', err);
  }
}
