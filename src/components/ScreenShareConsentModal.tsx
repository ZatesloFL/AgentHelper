import React from 'react';
import { Monitor, Check, X } from 'lucide-react';

interface ScreenShareConsentModalProps {
  isOpen: boolean;
  reason: string;
  onApprove: () => void;
  onDeny: () => void;
}

export const ScreenShareConsentModal: React.FC<ScreenShareConsentModalProps> = ({
  isOpen,
  reason,
  onApprove,
  onDeny,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-xs">
      <div className="bg-[#FBF9F5] border border-[#E6DFD3] rounded-xl max-w-md w-full p-6 shadow-xl text-[#1C1917] space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#F4F0E8] border border-[#E6DFD3] flex items-center justify-center text-[#9A3412] shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-editorial font-medium text-[#1C1917]">
              Permission to view screen
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              The guide would like to inspect your screen to help you navigate:
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-[#F4F0E8] border border-[#E6DFD3] rounded-lg text-sm text-[#292524] italic">
          "{reason}"
        </div>

        <p className="text-xs text-[#78716C] leading-normal">
          You will choose exactly which window or tab to share in the browser picker. Please ensure private credentials, cards, or personal messages are closed before selecting.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onDeny}
            className="px-4 py-2 text-xs font-medium text-[#78716C] hover:text-[#1C1917] border border-[#E6DFD3] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Not now</span>
          </button>
          <button
            onClick={onApprove}
            className="px-4 py-2 text-xs font-medium text-white bg-[#1C1917] hover:bg-[#292524] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Choose Window to Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
