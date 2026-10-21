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
  getDocFromServer,
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

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

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

export interface StoredRoutineStep {
  number: number;
  title: string;
  detail: string;
  completed?: boolean;
  coachPrompt?: string;
}

export interface StoredAppCard {
  appId: string;
  title: string;
  goal: string;
  activeStep?: number;
  steps: StoredRoutineStep[];
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
  };
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
              detail: String(s?.detail || ''),
              completed: Boolean(s?.completed),
            };
            if (typeof s?.coachPrompt === 'string' && s.coachPrompt) {
              stepObj.coachPrompt = s.coachPrompt;
            }
            return stepObj;
          })
        : [],
    };
  }

  if (m?.reportCard && typeof m.reportCard === 'object') {
    clean.reportCard = {
      goal: String(m.reportCard.goal || ''),
      tried: String(m.reportCard.tried || ''),
      blocker: String(m.reportCard.blocker || ''),
    };
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

export async function listUserConversations(uid: string): Promise<StoredConversation[]> {
  if (!uid) return [];
  try {
    const convRef = collection(db, 'users', uid, 'conversations');
    const snapshot = await getDocs(convRef);
    const list: StoredConversation[] = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const msgs = Array.isArray(data.messages)
        ? data.messages.slice(-400).map(sanitizeMessageForFirestore)
        : [];
      list.push({
        id: docSnap.id,
        product: data.product || 'muse',
        startedAt: toIsoString(data.startedAt),
        updatedAt: toIsoString(data.updatedAt),
        summary: typeof data.summary === 'string' ? data.summary : undefined,
        messages: msgs,
      });
    });

    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return list;
  } catch (err) {
    console.warn('Error listing conversations from Firestore:', err);
    return [];
  }
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
 * Deletes all history for a user: conversations, progress summaries, and session notes.
 */
export async function deleteAllUserHistory(uid: string): Promise<void> {
  if (!uid) return;

  // Clear local storage keys for this uid
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith(`conv_${uid}_`) ||
          k.startsWith(`latest_conv_${uid}_`) ||
          k.startsWith(`progress_${uid}_`) ||
          k.startsWith(`notes_${uid}_`))
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (_) {}

  try {
    const subcollections = ['conversations', 'progress', 'notes'];
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
