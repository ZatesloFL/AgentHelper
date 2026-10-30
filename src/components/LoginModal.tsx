import React, { useEffect, useState } from 'react';
import { authService, friendlyAuthError, AuthUser } from '../lib/firebase.js';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose?: boolean;
  onSuccess: (user: AuthUser) => void;
}

type Mode = 'link' | 'password';

/**
 * Sign-in screen (expanded 2026-10-29 on Nic's go, per
 * files/sign-in-expansion-spec.md): Google primary, then email — a
 * sign-in LINK first (nothing to remember), or a password. If the page
 * was opened from a magic link, this screen finishes that sign-in,
 * asking for the email again only when it isn't stored on this device.
 */
export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  canClose = false,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('link');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);
  // Magic-link completion state: 'no' | 'auto' (stored email) | 'ask' (re-enter email)
  const [finishState, setFinishState] = useState<'no' | 'auto' | 'ask'>('no');
  const [finishEmail, setFinishEmail] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    const url = window.location.href;
    if (!authService.isMagicLinkUrl(url)) return;
    const stored = authService.storedSignInEmail();
    if (stored) {
      setFinishState('auto');
      setLoading(true);
      authService
        .completeMagicLink(stored, url)
        .then((u) => {
          window.history.replaceState({}, '', window.location.pathname);
          onSuccess(u);
          if (onClose) onClose();
        })
        .catch((err) => {
          console.warn('Magic link completion failed:', err);
          setError(friendlyAuthError(err));
          setFinishState('ask');
        })
        .finally(() => setLoading(false));
    } else {
      setFinishState('ask');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await authService.signInWithGoogle();
      onSuccess(u);
      if (onClose) onClose();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSendLink = async () => {
    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      await authService.sendMagicLink(email);
      setNotice(
        'Check your email — your sign-in link is on its way. Open it on this device if you can; if it opens somewhere else, we will just ask you to type your email once more.'
      );
    } catch (err: any) {
      console.warn('Magic link send failed:', err);
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFinishLink = async () => {
    if (!finishEmail.trim()) {
      setError('Enter the email the link was sent to.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const u = await authService.completeMagicLink(finishEmail, window.location.href);
      window.history.replaceState({}, '', window.location.pathname);
      onSuccess(u);
      if (onClose) onClose();
    } catch (err: any) {
      console.warn('Magic link finish failed:', err);
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and a password.');
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const u = creating
        ? await authService.createWithEmail(email, password)
        : await authService.signInWithEmail(email, password);
      onSuccess(u);
      if (onClose) onClose();
    } catch (err: any) {
      console.warn('Email sign-in error:', err);
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Enter your email above first, then tap Forgot password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email);
      setNotice('Password reset email sent — check your inbox and follow its link.');
    } catch (err: any) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full py-2.5 px-3 bg-white border border-[#D6CEBE] rounded-lg text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9A3412]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FBF9F5] border border-[#E6DFD3] rounded-xl max-w-sm w-full p-6 shadow-xl text-[#1C1917] space-y-4 my-auto">
        <div className="flex items-start justify-between border-b border-[#E6DFD3] pb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#78716C] block">
              Welcome
            </span>
            <h3 className="text-2xl font-editorial font-medium text-[#1C1917] mt-0.5">
              Sign In to Second Look
            </h3>
          </div>
          {canClose && onClose && (
            <button
              onClick={onClose}
              className="p-1 text-[#78716C] hover:text-[#1C1917] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <p className="text-xs text-[#57534E] leading-relaxed">
          Sign in so your projects and progress are saved to you. Bought or
          received Second Look? Sign in with any method, then enter your code
          in My Plan — use the email you bought with, if you can.
        </p>

        {error && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded text-xs">
            {error}
          </div>
        )}
        {notice && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded text-xs">
            {notice}
          </div>
        )}

        {finishState === 'auto' ? (
          <p className="text-sm text-[#57534E]">Finishing your sign-in from the email link…</p>
        ) : finishState === 'ask' ? (
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-[#1C1917]">One quick step to finish</p>
            <p className="text-xs text-[#57534E] leading-relaxed">
              You opened a sign-in link on a different device or browser than
              you requested it on. Type the email the link was sent to, and
              you are in — this is a safety step, not a password.
            </p>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={finishEmail}
              onChange={(e) => setFinishEmail(e.target.value)}
              className={inputCls}
            />
            <button
              onClick={handleFinishLink}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#1A3C2E] hover:bg-[#132C21] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Finish signing in'}
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2.5">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 border border-[#D6CEBE] text-[#1C1917] rounded-lg text-sm font-medium flex items-center justify-center gap-2.5 shadow-2xs transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#78716C]">
              <span className="flex-1 border-t border-[#E6DFD3]" />
              or use your email
              <span className="flex-1 border-t border-[#E6DFD3]" />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setMode('link'); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${mode === 'link' ? 'bg-[#1A3C2E] text-white border-[#1A3C2E]' : 'bg-white text-[#57534E] border-[#D6CEBE] hover:bg-stone-50'}`}
              >
                Email me a sign-in link
              </button>
              <button
                type="button"
                onClick={() => { setMode('password'); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${mode === 'password' ? 'bg-[#1A3C2E] text-white border-[#1A3C2E]' : 'bg-white text-[#57534E] border-[#D6CEBE] hover:bg-stone-50'}`}
              >
                Use a password instead
              </button>
            </div>

            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />

            {mode === 'link' ? (
              <div className="space-y-2">
                <button
                  onClick={handleSendLink}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {loading ? 'Sending…' : 'Email me a sign-in link'}
                </button>
                <p className="text-[11px] text-[#78716C] leading-relaxed">
                  Nothing to remember — the link in the email signs you in.
                  Links are single-use; a stale one just means requesting a
                  fresh one.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="password"
                  autoComplete={creating ? 'new-password' : 'current-password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                />
                <button
                  onClick={handlePassword}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {loading ? 'Working…' : creating ? 'Create account' : 'Sign in'}
                </button>
                <div className="flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => { setCreating(!creating); setError(null); }}
                    className="underline text-[#57534E] hover:text-[#1C1917]"
                  >
                    {creating ? 'Already have an account? Sign in' : 'New here? Create an account'}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="underline text-[#57534E] hover:text-[#1C1917]"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-[10px] text-[#78716C] text-center pt-1">
          Sign-in is handled securely by Firebase. Second Look never sees or
          stores your password.
        </p>
      </div>
    </div>
  );
};
