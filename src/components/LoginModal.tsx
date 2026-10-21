import React, { useState } from 'react';
import { authService, AuthUser } from '../lib/firebase.js';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose?: boolean;
  onSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  canClose = false,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(err.message || 'Unable to complete Google sign-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-xs">
      <div className="bg-[#FBF9F5] border border-[#E6DFD3] rounded-xl max-w-sm w-full p-6 shadow-xl text-[#1C1917] space-y-4">
        <div className="flex items-start justify-between border-b border-[#E6DFD3] pb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#78716C] block">
              Welcome
            </span>
            <h3 className="text-2xl font-editorial font-medium text-[#1C1917] mt-0.5">
              Sign In to Calm Guide
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
          Please sign in with Google so your notes and progress are saved to you, and so Nic can reply to you.
        </p>

        {error && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded text-xs">
            {error}
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 border border-[#D6CEBE] text-[#1C1917] rounded-lg text-xs font-medium flex items-center justify-center gap-2.5 shadow-2xs transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>
        </div>

        <p className="text-[10px] text-[#78716C] text-center pt-2">
          Your credentials remain completely private. We never request passwords.
        </p>
      </div>
    </div>
  );
};

