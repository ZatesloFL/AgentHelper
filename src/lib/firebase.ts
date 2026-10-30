import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
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

export type ProjectStartedAs =
  | 'template-in-hand'
  | 'open-start'
  | 'brainstorm-first'
  | 'gift-arrival'
  | 'blank';

export type SetupLane = 'membership' | 'virtual' | 'lunch';

/** Track 3 intake progress: slots filled so far + where the member stopped.
 * Saved as progress only — never as a contract before guardrail confirmation. */
export interface ProjectIntakeState {
  step: string;
  slots: Record<string, string>;
  agentChoice?: string;
  // Gemini only: personal vs work Google account decides skills, Task
  // mode and admin approvals (Google ecosystem research, 2026-10-29).
  geminiAccountType?: 'personal' | 'work';
  completed?: boolean;
  updatedAt: string;
}

export interface UserProjectDoc {
  projectId: string;
  title?: string;
  product?: string;
  contract: TaskContractFields;
  rung: 0 | 1 | 2 | 3;
  status: 'active' | 'paused' | 'needs_setup' | 'ready';
  // Track 3 (four paths / three lanes): how this project started, what the
  // member bought (lane), gift + brainstorm context, and intake progress.
  startedAs?: ProjectStartedAs;
  lane?: SetupLane;
  isGift?: boolean;
  giftRecipientName?: string;
  brainstormNotes?: string;
  sessionFirst?: boolean;
  intake?: ProjectIntakeState;
  // Track 2: a project created from a purchased template, before the
  // Second Look intake (Track 3) turns it into a rung-0 contract. The
  // template doc is copied in, not linked, so the member's project keeps
  // working even if the template is later versioned.
  templateSlug?: string;
  templateVersion?: number;
  // Track 4 MVP: the template version whose update notice the member
  // dismissed ("Not now"). The notice returns for any newer version.
  dismissedTemplateVersion?: number;
  goalInOneSentence?: string;
  experienceLevel?: string;
  whatDoneLooksLike?: string;
  checkInRhythm?: string;
  source?: string;
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

export const AUDIT_AREAS = [
  'connections',
  'approvals',
  'scheduled',
  'memory',
  'activity',
  'privacy',
  'money',
] as const;

export type AuditArea = (typeof AUDIT_AREAS)[number];
export type AuditRating = 'green' | 'amber' | 'red';

export interface AuditAreaResult {
  rating: AuditRating;
  reason: string;
}

export interface AuditRunDoc {
  id: string;
  appId: string;
  startedAt: string;
  completedAt: string | null;
  results: Partial<Record<AuditArea, AuditAreaResult>>;
  fixList?: string[];
}

export interface StoredScorecardCard {
  auditId: string;
  appId: string;
  title: string;
  startedAt?: string;
  completedAt: string;
  results: Partial<Record<AuditArea, AuditAreaResult>>;
  previousResults?: Partial<Record<AuditArea, AuditAreaResult>> | null;
  fixList: string[];
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
  scorecardCard?: StoredScorecardCard;
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

  if (m?.scorecardCard && typeof m.scorecardCard === 'object') {
    const cleanResults: Partial<Record<AuditArea, AuditAreaResult>> = {};
    const rawRes = m.scorecardCard.results || {};
    for (const area of AUDIT_AREAS) {
      const entry = rawRes[area];
      if (entry && (entry.rating === 'green' || entry.rating === 'amber' || entry.rating === 'red')) {
        cleanResults[area] = {
          rating: entry.rating,
          reason: String(entry.reason || '').slice(0, 500),
        };
      }
    }

    let cleanPrev: Partial<Record<AuditArea, AuditAreaResult>> | undefined = undefined;
    if (m.scorecardCard.previousResults && typeof m.scorecardCard.previousResults === 'object') {
      cleanPrev = {};
      for (const area of AUDIT_AREAS) {
        const entry = m.scorecardCard.previousResults[area];
        if (entry && (entry.rating === 'green' || entry.rating === 'amber' || entry.rating === 'red')) {
          cleanPrev[area] = {
            rating: entry.rating,
            reason: String(entry.reason || '').slice(0, 500),
          };
        }
      }
    }

    const sc: StoredScorecardCard = {
      auditId: String(m.scorecardCard.auditId || '').trim(),
      appId: String(m.scorecardCard.appId || 'safety-audit').trim(),
      title: String(m.scorecardCard.title || 'Check-up Scorecard').trim(),
      completedAt: toIsoString(m.scorecardCard.completedAt),
      results: cleanResults,
      fixList: Array.isArray(m.scorecardCard.fixList)
        ? m.scorecardCard.fixList.map((f: any) => String(f || '').trim()).filter(Boolean).slice(0, 3)
        : [],
    };
    if (m.scorecardCard.startedAt) {
      sc.startedAt = toIsoString(m.scorecardCard.startedAt);
    }
    if (cleanPrev) {
      sc.previousResults = cleanPrev;
    }
    clean.scorecardCard = sc;
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

  // --- Email sign-in (spec: files/sign-in-expansion-spec.md; built 2026-10-29
  // on Nic's go). Requires the Email/Password provider + email link enabled in
  // the Firebase console; until then these reject with operation-not-allowed,
  // which the sign-in screen translates into plain language. ---

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    const u = result.user;
    return {
      uid: u.uid,
      displayName: u.displayName || u.email?.split('@')[0] || 'Friend',
      email: u.email,
      photoURL: u.photoURL,
    };
  },

  async createWithEmail(email: string, password: string): Promise<AuthUser> {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const u = result.user;
    return {
      uid: u.uid,
      displayName: u.displayName || u.email?.split('@')[0] || 'Friend',
      email: u.email,
      photoURL: u.photoURL,
    };
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim());
  },

  async sendMagicLink(email: string): Promise<void> {
    const clean = email.trim();
    await sendSignInLinkToEmail(auth, clean, {
      url: window.location.origin + '/',
      handleCodeInApp: true,
    });
    try {
      window.localStorage.setItem('sl-signin-email', clean);
    } catch {}
  },

  isMagicLinkUrl(url: string): boolean {
    try {
      return isSignInWithEmailLink(auth, url);
    } catch {
      return false;
    }
  },

  storedSignInEmail(): string | null {
    try {
      return window.localStorage.getItem('sl-signin-email');
    } catch {
      return null;
    }
  },

  async completeMagicLink(email: string, url: string): Promise<AuthUser> {
    const result = await signInWithEmailLink(auth, email.trim(), url);
    try {
      window.localStorage.removeItem('sl-signin-email');
    } catch {}
    const u = result.user;
    return {
      uid: u.uid,
      displayName: u.displayName || u.email?.split('@')[0] || 'Friend',
      email: u.email,
      photoURL: u.photoURL,
    };
  },
};

/** Plain-language messages for Firebase Auth error codes (sign-in screen). */
export function friendlyAuthError(err: any): string {
  const code = String(err?.code || '');
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address does not look complete — check it and try again.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'No match for that email and password. If you are new, create an account — or use the email link instead.';
    case 'auth/email-already-in-use':
      return 'That email already has an account. Try signing in, or use the email link — with account linking on, it lands in the same account.';
    case 'auth/weak-password':
      return 'That password is too short — use at least 6 characters; longer is better.';
    case 'auth/operation-not-allowed':
      return 'Email sign-in is not switched on for Second Look yet. Google sign-in works — and Nic can enable email sign-in in a couple of clicks.';
    case 'auth/too-many-requests':
      return 'Too many tries in a row — wait a few minutes and try again.';
    case 'auth/expired-action-code':
    case 'auth/invalid-action-code':
      return 'That sign-in link has expired or was already used. Request a fresh one below.';
    case 'auth/unauthorized-domain':
      return 'This address is not authorized for sign-in. Open app.getasecondlook.co directly.';
    default:
      return err?.message || 'Something did not work. Please try again.';
  }
}

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
 * Corrections loop opt-in setting (off by default):
 * "Help improve the guide: when my screen doesn't match the guide's notes, send a text-only note to Nic (no name, email, or images)."
 */
export async function getUserCorrectionsOptIn(uid: string): Promise<boolean> {
  if (!uid) return false;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data();
      if (typeof data?.shareCorrectionsWithNic === 'boolean') {
        try {
          localStorage.setItem(`corrections_opt_in_${uid}`, String(data.shareCorrectionsWithNic));
        } catch (_) {}
        return data.shareCorrectionsWithNic;
      }
    }
  } catch (err) {
    console.warn('Could not read corrections opt-in from Firestore:', err);
  }
  return localStorage.getItem(`corrections_opt_in_${uid}`) === 'true';
}

export async function saveUserCorrectionsOptIn(uid: string, enabled: boolean): Promise<boolean> {
  if (!uid) return false;
  const val = Boolean(enabled);
  try {
    localStorage.setItem(`corrections_opt_in_${uid}`, String(val));
  } catch (_) {}

  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        shareCorrectionsWithNic: val,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not save corrections opt-in to Firestore:', err);
  }
  return val;
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
  const status: 'active' | 'paused' | 'needs_setup' | 'ready' =
    d?.status === 'paused'
      ? 'paused'
      : d?.status === 'needs_setup'
        ? 'needs_setup'
        : d?.status === 'ready'
          ? 'ready'
          : 'active';
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
  if (typeof d?.templateSlug === 'string' && d.templateSlug.trim()) {
    docObj.templateSlug = d.templateSlug.trim().slice(0, 200);
  }
  if (typeof d?.templateVersion === 'number') {
    docObj.templateVersion = d.templateVersion;
  }
  if (typeof d?.dismissedTemplateVersion === 'number') {
    docObj.dismissedTemplateVersion = d.dismissedTemplateVersion;
  }
  if (typeof d?.goalInOneSentence === 'string' && d.goalInOneSentence.trim()) {
    docObj.goalInOneSentence = d.goalInOneSentence.trim().slice(0, 500);
  }
  if (typeof d?.experienceLevel === 'string' && d.experienceLevel.trim()) {
    docObj.experienceLevel = d.experienceLevel.trim().slice(0, 200);
  }
  if (typeof d?.whatDoneLooksLike === 'string' && d.whatDoneLooksLike.trim()) {
    docObj.whatDoneLooksLike = d.whatDoneLooksLike.trim().slice(0, 1000);
  }
  if (typeof d?.checkInRhythm === 'string' && d.checkInRhythm.trim()) {
    docObj.checkInRhythm = d.checkInRhythm.trim().slice(0, 200);
  }
  if (typeof d?.source === 'string' && d.source.trim()) {
    docObj.source = d.source.trim().slice(0, 100);
  }
  if (
    d?.startedAs === 'template-in-hand' ||
    d?.startedAs === 'open-start' ||
    d?.startedAs === 'brainstorm-first' ||
    d?.startedAs === 'gift-arrival' ||
    d?.startedAs === 'blank'
  ) {
    docObj.startedAs = d.startedAs;
  }
  if (d?.lane === 'membership' || d?.lane === 'virtual' || d?.lane === 'lunch') {
    docObj.lane = d.lane;
  }
  if (typeof d?.isGift === 'boolean') {
    docObj.isGift = d.isGift;
  }
  if (typeof d?.giftRecipientName === 'string' && d.giftRecipientName.trim()) {
    docObj.giftRecipientName = d.giftRecipientName.trim().slice(0, 200);
  }
  if (typeof d?.brainstormNotes === 'string' && d.brainstormNotes.trim()) {
    docObj.brainstormNotes = d.brainstormNotes.trim().slice(0, 8000);
  }
  if (typeof d?.sessionFirst === 'boolean') {
    docObj.sessionFirst = d.sessionFirst;
  }
  if (d?.intake && typeof d.intake === 'object') {
    const rawSlots =
      d.intake.slots && typeof d.intake.slots === 'object' ? d.intake.slots : {};
    const slots: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawSlots)) {
      if (typeof v === 'string') slots[k] = v.slice(0, 4000);
    }
    const intakeObj: ProjectIntakeState = {
      step: typeof d.intake.step === 'string' ? d.intake.step.slice(0, 60) : 'opening',
      slots,
      completed: d.intake.completed === true,
      updatedAt: toIsoString(d.intake.updatedAt || updatedAt),
    };
    // Optional keys are only SET when they hold a real value. An explicit
    // `key: undefined` survives sanitizing and makes Firestore reject the
    // whole setDoc ("Unsupported field value: undefined") — that bug froze
    // intake progress saves and contract saves on 2026-10-29.
    if (typeof d.intake.agentChoice === 'string' && d.intake.agentChoice) {
      intakeObj.agentChoice = d.intake.agentChoice.slice(0, 60);
    }
    if (d.intake.geminiAccountType === 'personal' || d.intake.geminiAccountType === 'work') {
      intakeObj.geminiAccountType = d.intake.geminiAccountType;
    }
    docObj.intake = intakeObj;
  }
  return docObj;
}

/**
 * Recursively drop `undefined` values from a Firestore-bound payload.
 * Firestore rejects an entire write over one undefined field, including
 * inside nested maps; sanitizers build optional keys conditionally, and
 * this is the last-line guarantee at the write sites themselves.
 */
export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => stripUndefinedDeep(item)) as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v !== undefined) out[k] = stripUndefinedDeep(v);
    }
    return out as T;
  }
  return value;
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

/** One claim inside a platform layer, tagged by how well it is sourced. */
export interface TemplateLayerClaim {
  text: string;
  tag?: string;
  sources?: string[];
}

/** Per-agent setup layer (Track 3). Claude's template records carry these as
 * structured objects; the original trip-planner v1 seed used empty strings,
 * so readers must tolerate both shapes. */
export interface TemplateLayer {
  assistant?: string;
  setupFeature?: string;
  setupPath?: string;
  minimumPlan?: string;
  setupClaims?: TemplateLayerClaim[];
  fallback?: string;
  pasteText?: string;
  memberSteps?: string[];
  willDo?: Array<TemplateLayerClaim | string>;
  wontDo?: Array<TemplateLayerClaim | string>;
  memberDoesByHand?: string[];
  basis?: string;
  lastVerified?: string;
}

/** The template's draft contract: goal is a string, the guardrail fields are
 * line arrays in the records (joined with newlines when edited as text). */
export interface TemplateContractDraft {
  goal?: string;
  do?: string | string[];
  do_not?: string | string[];
  ask_me_before?: string | string[];
  report_back?: string | string[];
  stop_if?: string | string[];
}

/** One guided-intake question from a template's `questions` block
 * (Project Setup Flow Redesign Spec section 5). Answers fill the contract
 * deterministically: chip/choice answers append a labeled line to the
 * section they map to; text answers are member data (memberNotes). */
export interface TemplateQuestion {
  id: string;
  label: string;
  prompt: string;
  type: 'chips' | 'multiChips' | 'text' | 'time' | 'days' | 'number' | 'choice';
  options?: string[];
  allowOther?: boolean;
  required: boolean;
  default?: any;
  followUp?: { when: string; prompt: string };
  mapsTo: 'goal' | 'do' | 'do_not' | 'ask_me_before' | 'report_back' | 'stop_if' | 'schedule' | 'memberNotes' | 'doneLooksLike';
}

export interface TemplateDoc {
  slug: string;
  title: string;
  audience?: string;
  category?: string;
  version: number;
  goalInOneSentence?: string;
  experienceLevel?: string;
  whatDoneLooksLike?: string;
  checkInRhythm?: string;
  steps?: string[];
  contract?: TemplateContractDraft;
  platformLayers?: Record<string, TemplateLayer | string>;
  knownIssues?: Record<string, TemplateLayerClaim[]>;
  lastVerified?: string;
  shortDescription?: string;
  narrative?: string;
  questions?: TemplateQuestion[];
}

/** Map raw Firestore/record data onto a TemplateDoc (shared by the Firestore
 * reader and the bundled-record fallback in lib/templates). */
export function templateDocFromData(slug: string, d: any): TemplateDoc {
  const clean = String(slug || '').trim();
  const strList = (v: any): string[] | undefined =>
    Array.isArray(v) ? v.filter((x: any) => typeof x === 'string') : undefined;
  return {
    slug: clean,
    title: typeof d?.title === 'string' && d.title.trim() ? d.title : clean,
    audience: typeof d?.audience === 'string' ? d.audience : undefined,
    category: typeof d?.category === 'string' ? d.category : undefined,
    version: typeof d?.version === 'number' ? d.version : 1,
    goalInOneSentence: typeof d?.goalInOneSentence === 'string' ? d.goalInOneSentence : undefined,
    experienceLevel: typeof d?.experienceLevel === 'string' ? d.experienceLevel : undefined,
    whatDoneLooksLike: typeof d?.whatDoneLooksLike === 'string' ? d.whatDoneLooksLike : undefined,
    checkInRhythm: typeof d?.checkInRhythm === 'string' ? d.checkInRhythm : undefined,
    steps: strList(d?.steps),
    contract: d?.contract && typeof d.contract === 'object' ? d.contract : undefined,
    platformLayers:
      d?.platformLayers && typeof d.platformLayers === 'object' ? d.platformLayers : undefined,
    knownIssues: d?.knownIssues && typeof d.knownIssues === 'object' ? d.knownIssues : undefined,
    lastVerified: typeof d?.lastVerified === 'string' ? d.lastVerified : undefined,
    shortDescription: typeof d?.shortDescription === 'string' ? d.shortDescription : undefined,
    narrative: typeof d?.narrative === 'string' ? d.narrative : undefined,
    questions: Array.isArray(d?.questions)
      ? (d.questions.filter(
          (q: any) =>
            q && typeof q === 'object' && typeof q.id === 'string' && typeof q.prompt === 'string'
        ) as TemplateQuestion[])
      : undefined,
  };
}

/** Read a shared template from Firestore templates/{slug} (signed-in read). */
export async function getTemplate(slug: string): Promise<TemplateDoc | null> {
  const clean = String(slug || '').trim();
  if (!clean) return null;
  try {
    const snap = await getDoc(doc(db, 'templates', clean));
    if (!snap.exists()) return null;
    return templateDocFromData(clean, snap.data());
  } catch (err) {
    console.warn('Error reading template from Firestore:', err);
    return null;
  }
}

/** List every shared template in Firestore (signed-in read). */
export async function listTemplates(): Promise<TemplateDoc[]> {
  try {
    const snap = await getDocs(collection(db, 'templates'));
    const out: TemplateDoc[] = [];
    snap.forEach((docSnap) => out.push(templateDocFromData(docSnap.id, docSnap.data())));
    return out;
  } catch (err) {
    console.warn('Error listing templates from Firestore:', err);
    return [];
  }
}

/**
 * Track 2: create the needs_setup project for a template a member just
 * redeemed (validate-code returned its slug). Doc id is the template slug,
 * so redeeming the same template twice is idempotent, and a project that
 * already completed intake (active/paused) is never overwritten back to
 * needs_setup. The contract stays empty until the Track 3 intake fills it
 * at rung 0; the member's agent is not chosen yet, so product stays unset.
 * Returns the project id, or null when the template does not exist.
 */
export interface NeedsSetupOptions {
  startedAs?: ProjectStartedAs;
  lane?: SetupLane;
  isGift?: boolean;
  giftRecipientName?: string;
  brainstormNotes?: string;
  /** Pre-loaded template (e.g. from the bundled-record fallback) — used
   * instead of a Firestore read when Firestore has no doc for the slug. */
  templateOverride?: TemplateDoc;
}

export async function createNeedsSetupProject(
  uid: string,
  templateSlug: string,
  source = 'redemption',
  opts: NeedsSetupOptions = {},
): Promise<string | null> {
  if (!uid || !templateSlug) return null;
  const template = opts.templateOverride || (await getTemplate(templateSlug));
  if (!template) return null;
  const projectId = template.slug;
  const ref = doc(db, 'users', uid, 'projects', projectId);
  const nowIso = new Date().toISOString();
  const meta: Record<string, any> = {};
  if (opts.startedAs) meta.startedAs = opts.startedAs;
  if (opts.lane) {
    meta.lane = opts.lane;
    if (opts.lane === 'virtual' || opts.lane === 'lunch') meta.sessionFirst = true;
  }
  if (typeof opts.isGift === 'boolean') meta.isGift = opts.isGift;
  if (opts.giftRecipientName) meta.giftRecipientName = opts.giftRecipientName;
  if (opts.brainstormNotes) meta.brainstormNotes = opts.brainstormNotes;
  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      const d = existing.data() as any;
      if (d?.status === 'active' || d?.status === 'paused') return projectId;
      await setDoc(ref, {
        status: 'needs_setup',
        templateSlug: template.slug,
        templateVersion: template.version,
        title: template.title,
        goalInOneSentence: template.goalInOneSentence || null,
        experienceLevel: template.experienceLevel || null,
        whatDoneLooksLike: template.whatDoneLooksLike || null,
        checkInRhythm: template.checkInRhythm || null,
        source,
        ...meta,
        updatedAt: nowIso,
      }, { merge: true });
      return projectId;
    }
    await setDoc(ref, {
      contract: { goal: '', do: '', do_not: '', ask_me_before: '', report_back: '', stop_if: '' },
      rung: 0,
      status: 'needs_setup',
      templateSlug: template.slug,
      templateVersion: template.version,
      title: template.title,
      goalInOneSentence: template.goalInOneSentence || null,
      experienceLevel: template.experienceLevel || null,
      whatDoneLooksLike: template.whatDoneLooksLike || null,
      checkInRhythm: template.checkInRhythm || null,
      source,
      ...meta,
      history: [{ rung: 0, at: nowIso }],
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    return projectId;
  } catch (err) {
    console.warn('Error creating needs_setup project:', err);
    return null;
  }
}

export async function saveUserProjectContract(
  uid: string,
  projectId: string,
  data: {
    title?: string;
    product?: string;
    contract: TaskContractFields;
    rung: number;
    status?: 'active' | 'paused' | 'needs_setup' | 'ready';
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
  const status: 'active' | 'paused' | 'needs_setup' | 'ready' =
    data.status || existing?.status || 'active';
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
    // Track 2/3 metadata survives a contract save (template link, path,
    // lane, gift/brainstorm context, intake state) — dropping it here
    // would detach the project from its template after intake.
    templateSlug: existing?.templateSlug,
    templateVersion: existing?.templateVersion,
    dismissedTemplateVersion: existing?.dismissedTemplateVersion,
    goalInOneSentence: existing?.goalInOneSentence,
    experienceLevel: existing?.experienceLevel,
    whatDoneLooksLike: existing?.whatDoneLooksLike,
    checkInRhythm: existing?.checkInRhythm,
    source: existing?.source,
    startedAs: existing?.startedAs,
    lane: existing?.lane,
    isGift: existing?.isGift,
    giftRecipientName: existing?.giftRecipientName,
    brainstormNotes: existing?.brainstormNotes,
    sessionFirst: existing?.sessionFirst,
    intake: existing?.intake,
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
    if (docObj.templateSlug) firestorePayload.templateSlug = docObj.templateSlug;
    if (typeof docObj.templateVersion === 'number')
      firestorePayload.templateVersion = docObj.templateVersion;
    if (typeof docObj.dismissedTemplateVersion === 'number')
      firestorePayload.dismissedTemplateVersion = docObj.dismissedTemplateVersion;
    if (docObj.goalInOneSentence) firestorePayload.goalInOneSentence = docObj.goalInOneSentence;
    if (docObj.experienceLevel) firestorePayload.experienceLevel = docObj.experienceLevel;
    if (docObj.whatDoneLooksLike) firestorePayload.whatDoneLooksLike = docObj.whatDoneLooksLike;
    if (docObj.checkInRhythm) firestorePayload.checkInRhythm = docObj.checkInRhythm;
    if (docObj.source) firestorePayload.source = docObj.source;
    if (docObj.startedAs) firestorePayload.startedAs = docObj.startedAs;
    if (docObj.lane) firestorePayload.lane = docObj.lane;
    if (typeof docObj.isGift === 'boolean') firestorePayload.isGift = docObj.isGift;
    if (docObj.giftRecipientName) firestorePayload.giftRecipientName = docObj.giftRecipientName;
    if (docObj.brainstormNotes) firestorePayload.brainstormNotes = docObj.brainstormNotes;
    if (typeof docObj.sessionFirst === 'boolean')
      firestorePayload.sessionFirst = docObj.sessionFirst;
    if (docObj.intake) firestorePayload.intake = docObj.intake;

    try {
      await setDoc(
        doc(db, 'users', uid, 'projects', cleanId),
        stripUndefinedDeep(firestorePayload),
        { merge: true }
      );
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

/** Track 3: merge arbitrary fields into a project doc (intake progress,
 * path/lane metadata) without touching its contract. Keeps the localStorage
 * cache and Firestore in step, like the other project helpers. */
export async function updateUserProjectFields(
  uid: string,
  projectId: string,
  fields: Record<string, any>,
): Promise<UserProjectDoc | null> {
  if (!uid || !projectId) return null;
  const nowIso = new Date().toISOString();
  const payload = { ...fields, updatedAt: nowIso };
  let updatedDoc: UserProjectDoc | null = null;
  try {
    const raw = localStorage.getItem(`projects_${uid}`);
    const all = raw ? JSON.parse(raw) : {};
    if (all[projectId]) {
      all[projectId] = { ...all[projectId], ...payload };
      updatedDoc = sanitizeProjectDoc(projectId, all[projectId]);
      localStorage.setItem(`projects_${uid}`, JSON.stringify(all));
    }
  } catch (_) {}
  try {
    await setDoc(
      doc(db, 'users', uid, 'projects', projectId),
      stripUndefinedDeep(payload),
      { merge: true }
    );
    const snap = await getDoc(doc(db, 'users', uid, 'projects', projectId));
    if (snap.exists()) updatedDoc = sanitizeProjectDoc(projectId, snap.data());
  } catch (err) {
    console.warn(`Error updating project fields for ${projectId}:`, err);
  }
  return updatedDoc;
}

/** Track 3: a blank (design-your-own) project shell in needs_setup, filled
 * by the same intake engine as template projects. */
export async function createBlankProject(
  uid: string,
  opts: {
    startedAs?: ProjectStartedAs;
    lane?: SetupLane;
    isGift?: boolean;
    giftRecipientName?: string;
  } = {},
): Promise<string | null> {
  if (!uid) return null;
  const projectId = `blank-${Date.now().toString(36)}`;
  const nowIso = new Date().toISOString();
  const payload: Record<string, any> = {
    contract: { goal: '', do: '', do_not: '', ask_me_before: '', report_back: '', stop_if: '' },
    rung: 0,
    status: 'needs_setup',
    title: 'My own project',
    source: 'in-app-blank',
    startedAs: opts.startedAs || 'blank',
    history: [{ rung: 0, at: nowIso }],
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  if (opts.lane) {
    payload.lane = opts.lane;
    if (opts.lane === 'virtual' || opts.lane === 'lunch') payload.sessionFirst = true;
  }
  if (typeof opts.isGift === 'boolean') payload.isGift = opts.isGift;
  if (opts.giftRecipientName) payload.giftRecipientName = opts.giftRecipientName;
  try {
    await setDoc(doc(db, 'users', uid, 'projects', projectId), stripUndefinedDeep(payload));
    try {
      const raw = localStorage.getItem(`projects_${uid}`);
      const all = raw ? JSON.parse(raw) : {};
      all[projectId] = payload;
      localStorage.setItem(`projects_${uid}`, JSON.stringify(all));
    } catch (_) {}
    return projectId;
  } catch (err) {
    console.warn('Error creating blank project:', err);
    return null;
  }
}

/** Track 3: the member-level General Onboarding record (once per member),
 * at users/{uid}/onboarding/current. Client-writable under firestore.rules
 * (only membership + nic_time_ledger are server-only). */
export interface MemberOnboardingDoc {
  completed: boolean;
  assistantProduct?: string;
  comfortLevel?: string;
  goalsText?: string;
  lane?: SetupLane;
  startedAs?: ProjectStartedAs;
  isGift?: boolean;
  giftRecipientName?: string;
  packageKind?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getMemberOnboarding(uid: string): Promise<MemberOnboardingDoc | null> {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'onboarding', 'current'));
    if (!snap.exists()) return null;
    const d = snap.data() as any;
    return {
      completed: d?.completed === true,
      assistantProduct: typeof d?.assistantProduct === 'string' ? d.assistantProduct : undefined,
      comfortLevel: typeof d?.comfortLevel === 'string' ? d.comfortLevel : undefined,
      goalsText: typeof d?.goalsText === 'string' ? d.goalsText : undefined,
      lane:
        d?.lane === 'virtual' || d?.lane === 'lunch' || d?.lane === 'membership'
          ? d.lane
          : undefined,
      startedAs: typeof d?.startedAs === 'string' ? d.startedAs : undefined,
      isGift: typeof d?.isGift === 'boolean' ? d.isGift : undefined,
      giftRecipientName:
        typeof d?.giftRecipientName === 'string' ? d.giftRecipientName : undefined,
      packageKind: typeof d?.packageKind === 'string' ? d.packageKind : undefined,
      createdAt: toIsoString(d?.createdAt || d?.updatedAt || new Date().toISOString()),
      updatedAt: toIsoString(d?.updatedAt || new Date().toISOString()),
    };
  } catch (err) {
    console.warn('Error reading member onboarding:', err);
    return null;
  }
}

export async function saveMemberOnboarding(
  uid: string,
  partial: Partial<MemberOnboardingDoc>,
): Promise<MemberOnboardingDoc | null> {
  if (!uid) return null;
  const nowIso = new Date().toISOString();
  const payload: Record<string, any> = { updatedAt: nowIso };
  for (const [k, v] of Object.entries(partial)) {
    if (v !== undefined && k !== 'createdAt' && k !== 'updatedAt') payload[k] = v;
  }
  try {
    const ref = doc(db, 'users', uid, 'onboarding', 'current');
    const existing = await getDoc(ref);
    if (!existing.exists()) payload.createdAt = nowIso;
    await setDoc(ref, payload, { merge: true });
    return await getMemberOnboarding(uid);
  } catch (err) {
    console.warn('Error saving member onboarding:', err);
    return null;
  }
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
 * Check-up audits persistence at users/{uid}/audits/{auditId}:
 * { appId, startedAt, completedAt, results: { [area]: { rating, reason } }, fixList? }
 */
function sanitizeAuditDoc(auditId: string, d: any): AuditRunDoc {
  const appId = typeof d?.appId === 'string' && d.appId.trim() ? d.appId.trim() : 'safety-audit';
  const startedAt = toIsoString(d?.startedAt || d?.completedAt);
  const completedAt = d?.completedAt ? toIsoString(d.completedAt) : null;
  const results: Partial<Record<AuditArea, AuditAreaResult>> = {};
  if (d?.results && typeof d.results === 'object') {
    for (const area of AUDIT_AREAS) {
      const entry = d.results[area];
      if (entry && (entry.rating === 'green' || entry.rating === 'amber' || entry.rating === 'red')) {
        results[area] = {
          rating: entry.rating,
          reason: typeof entry.reason === 'string' ? entry.reason.trim().slice(0, 500) : '',
        };
      }
    }
  }
  const fixList = Array.isArray(d?.fixList)
    ? d.fixList.map((f: any) => String(f || '').trim()).filter(Boolean).slice(0, 3)
    : undefined;

  return {
    id: auditId,
    appId,
    startedAt,
    completedAt,
    results,
    fixList,
  };
}

export async function getUserAudits(uid: string): Promise<AuditRunDoc[]> {
  if (!uid) return [];
  let list: AuditRunDoc[] = [];

  try {
    const raw = localStorage.getItem(`audits_${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed.map((a: any) => sanitizeAuditDoc(String(a?.id || `audit-${Date.now()}`), a));
      }
    }
  } catch (_) {}

  try {
    const colRef = collection(db, 'users', uid, 'audits');
    const snap = await getDocs(colRef);
    const fresh: AuditRunDoc[] = [];
    snap.forEach(docSnap => {
      fresh.push(sanitizeAuditDoc(docSnap.id, docSnap.data()));
    });
    fresh.sort((a, b) => {
      const tA = new Date(a.completedAt || a.startedAt).getTime();
      const tB = new Date(b.completedAt || b.startedAt).getTime();
      return tB - tA;
    });
    try {
      localStorage.setItem(`audits_${uid}`, JSON.stringify(fresh));
    } catch (_) {}
    return fresh;
  } catch (err) {
    console.warn('Error fetching user audits from Firestore:', err);
  }

  list.sort((a, b) => {
    const tA = new Date(a.completedAt || a.startedAt).getTime();
    const tB = new Date(b.completedAt || b.startedAt).getTime();
    return tB - tA;
  });
  return list;
}

export async function saveUserAuditDoc(
  uid: string,
  auditIdOrDoc: string | AuditRunDoc,
  maybeData?: Omit<AuditRunDoc, 'id'>
): Promise<AuditRunDoc> {
  const rawObj =
    typeof auditIdOrDoc === 'string'
      ? { id: auditIdOrDoc, ...(maybeData || {}) }
      : auditIdOrDoc;
  const cleanId = String(rawObj.id || '').trim() || `audit-${Date.now()}`;
  const cleanDoc = sanitizeAuditDoc(cleanId, rawObj);

  if (uid) {
    try {
      const raw = localStorage.getItem(`audits_${uid}`);
      const existing: AuditRunDoc[] = raw ? JSON.parse(raw) : [];
      const filtered = existing.filter(a => a.id !== cleanId);
      filtered.unshift(cleanDoc);
      localStorage.setItem(`audits_${uid}`, JSON.stringify(filtered.slice(0, 50)));
    } catch (_) {}

    const payload: Record<string, any> = {
      appId: cleanDoc.appId,
      startedAt: cleanDoc.startedAt,
      completedAt: cleanDoc.completedAt,
      results: cleanDoc.results,
    };
    if (cleanDoc.fixList && cleanDoc.fixList.length > 0) {
      payload.fixList = cleanDoc.fixList;
    }

    try {
      await setDoc(doc(db, 'users', uid, 'audits', cleanId), payload, { merge: true });
    } catch (err) {
      console.warn(`Error saving audit ${cleanId} to Firestore:`, err);
    }
  }

  return cleanDoc;
}

/**
 * Removes all localStorage keys starting with conv_, latest_conv_, progress_, notes_, routines_, tools_profile_, projects_, audits_, corrections_opt_in_ for a given uid.
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
          k === `projects_${uid}` ||
          k === `audits_${uid}` ||
          k === `corrections_opt_in_${uid}`)
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (_) {}
}

/**
 * Deletes all history for a user: conversations, progress summaries, session notes, routine progress, tools profile, projects, and audits.
 */
export async function deleteAllUserHistory(uid: string): Promise<void> {
  if (!uid) return;

  clearUserLocalStorage(uid);

  try {
    const subcollections = [
      'conversations',
      'progress',
      'notes',
      'routines',
      'profile',
      'projects',
      'audits',
    ];
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
