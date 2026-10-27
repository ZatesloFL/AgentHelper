import React from 'react';
import { Check } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-xs">
      <div className="bg-[#FBF9F5] border border-[#E6DFD3] rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-xl text-[#1C1917] space-y-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#78716C] block mb-1">
            Privacy & Guardrails
          </span>
          <h2 className="text-3xl font-editorial font-medium text-[#1C1917]">
            What I can and can't see
          </h2>
          <p className="text-sm text-[#78716C] mt-1.5">
            Before we talk, let's be completely transparent about boundaries.
          </p>
        </div>

        <div className="space-y-4 text-sm leading-relaxed border-t border-b border-[#E6DFD3] py-5">
          <div className="flex items-start gap-3">
            <span className="text-base text-[#14532D] font-bold">·</span>
            <p>
              <strong className="font-semibold text-[#1C1917]">I can hear you and read what you type.</strong> Voice conversation is processed in real time to assist you.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-base text-[#14532D] font-bold">·</span>
            <p>
              <strong className="font-semibold text-[#1C1917]">I can see your screen only when you say yes</strong>, and only the window or tab you pick. A banner shows the whole time and you can stop at any time.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-base text-[#14532D] font-bold">·</span>
            <p>
              Your voice, messages, and any screen you share are processed by Google's Gemini AI to answer you. Under our paid plan, Google does not use them to train its models.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-base text-[#9A3412] font-bold">·</span>
            <p>
              <strong className="font-semibold text-[#1C1917]">I never need your passwords, API keys, or card numbers.</strong> If you see one on screen, do not read it out loud. Close that tab before sharing.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-base text-[#14532D] font-bold">·</span>
            <p>
              <strong className="font-semibold text-[#1C1917]">I only guide.</strong> I do not click or type for you, and I never control your accounts.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-base text-[#14532D] font-bold">·</span>
            <p>
              <strong className="font-semibold text-[#1C1917]">I do not save video or audio.</strong> I save text notes, a short summary of your progress, and our chat history to your account so I can pick up where we left off. You can view or delete them anytime.
            </p>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between">
          <p className="text-xs text-[#78716C]">
            Accepted once per account (Version 2).
          </p>
          <button
            onClick={onAccept}
            className="px-5 py-2.5 bg-[#1C1917] text-white text-sm font-medium rounded-lg hover:bg-[#292524] transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>I Understand and Agree</span>
          </button>
        </div>
      </div>
    </div>
  );
};

