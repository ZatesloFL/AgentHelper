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
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isGuest?: boolean;
}

export interface SessionNote {
  id: string;
  userId: string;
  product: string;
  text: string;
  createdAt: string;
}

/**
 * Modular authentication abstraction interface allowing easy swapping of auth providers.
 */
export const authService = {
  getCurrentUser(): AuthUser | null {
    const u = auth.currentUser;
    if (!u) {
      // Check local guest storage
      const guestRaw = localStorage.getItem('calm_guide_guest_user');
      if (guestRaw) {
        try {
          return JSON.parse(guestRaw);
        } catch {
          return null;
        }
      }
      return null;
    }
    return {
      uid: u.uid,
      displayName: u.displayName || u.email?.split('@')[0] || 'Visitor',
      email: u.email,
      photoURL: u.photoURL,
      isGuest: false,
    };
  },

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    const unsubscribe = firebaseOnAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        callback({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Visitor',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          isGuest: false,
        });
      } else {
        const guestRaw = localStorage.getItem('calm_guide_guest_user');
        if (guestRaw) {
          try {
            callback(JSON.parse(guestRaw));
            return;
          } catch {
            // ignore
          }
        }
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
    localStorage.removeItem('calm_guide_guest_user');
    return {
      uid: u.uid,
      displayName: u.displayName || u.email?.split('@')[0] || 'Visitor',
      email: u.email,
      photoURL: u.photoURL,
      isGuest: false,
    };
  },

  signInAsGuest(name: string = 'Guest'): AuthUser {
    const guestUser: AuthUser = {
      uid: `guest-${Date.now()}`,
      displayName: name,
      email: 'guest@local.test',
      photoURL: null,
      isGuest: true,
    };
    localStorage.setItem('calm_guide_guest_user', JSON.stringify(guestUser));
    return guestUser;
  },

  async signOut(): Promise<void> {
    localStorage.removeItem('calm_guide_guest_user');
    await firebaseSignOut(auth);
  },
};

/**
 * Consent persistence
 */
export async function getUserConsent(uid: string): Promise<boolean> {
  if (uid.startsWith('guest-')) {
    return localStorage.getItem(`consent_${uid}`) === 'true';
  }
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data()?.consentAccepted === true;
    }
  } catch (err) {
    console.warn('Could not read user consent from Firestore, checking local storage:', err);
  }
  return localStorage.getItem(`consent_${uid}`) === 'true';
}

export async function saveUserConsent(uid: string): Promise<void> {
  localStorage.setItem(`consent_${uid}`, 'true');
  if (uid.startsWith('guest-')) return;

  try {
    await setDoc(doc(db, 'users', uid), {
      consentAccepted: true,
      consentAcceptedAt: serverTimestamp(),
    }, { merge: true });
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

  if (uid.startsWith('guest-')) {
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
    return newNote;
  }

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
    return newNote;
  }
}

export async function getUserSessionNotes(uid: string, product: string): Promise<SessionNote[]> {
  if (uid.startsWith('guest-')) {
    const key = `notes_${uid}_${product}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  try {
    const notesRef = collection(db, 'users', uid, 'notes');
    const q = query(notesRef, where('product', '==', product));
    const snapshot = await getDocs(q);
    const notes: SessionNote[] = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const ts = data.createdAt as Timestamp | undefined;
      notes.push({
        id: docSnap.id,
        userId: data.userId || uid,
        product: data.product || product,
        text: data.text || '',
        createdAt: ts?.toDate() ? ts.toDate().toISOString() : new Date().toISOString(),
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
  if (uid.startsWith('guest-')) {
    // Remove from local storage
    const keys = Object.keys(localStorage).filter(k => k.startsWith(`notes_${uid}_`));
    for (const k of keys) {
      const notes: SessionNote[] = JSON.parse(localStorage.getItem(k) || '[]');
      const filtered = notes.filter(n => n.id !== noteId);
      localStorage.setItem(k, JSON.stringify(filtered));
    }
    return;
  }

  try {
    await deleteDoc(doc(db, 'users', uid, 'notes', noteId));
  } catch (err) {
    console.warn('Error deleting note from Firestore:', err);
  }
}
