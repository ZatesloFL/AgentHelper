import React, { useState } from 'react';
import { Eye, Square, Maximize2, X } from 'lucide-react';

interface ScreenShareBannerProps {
  isSharing: boolean;
  onStop: () => void;
  currentFramePreview?: string | null;
}

export const ScreenShareBanner: React.FC<ScreenShareBannerProps> = ({
  isSharing,
  onStop,
  currentFramePreview,
}) => {
  const [showEnlarged, setShowEnlarged] = useState<boolean>(false);

  if (!isSharing) return null;

  return (
    <>
      <div className="bg-[#1C1917] text-[#FBF9F5] px-6 py-2.5 flex items-center justify-between text-xs font-medium sticky top-[65px] z-30 shadow-md border-b border-[#44403C]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#9A3412] text-white animate-pulse">
            <Eye className="w-3 h-3" />
          </div>

          {currentFramePreview && (
            <button
              onClick={() => setShowEnlarged(true)}
              title="Click to inspect frame sent to guide"
              className="relative group rounded border border-white/30 overflow-hidden hover:border-white transition-all"
            >
              <img
                src={`data:image/jpeg;base64,${currentFramePreview}`}
                alt="Live frame preview"
                className="w-12 h-7 object-cover bg-black"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-2.5 h-2.5 text-white" />
              </div>
            </button>
          )}

          <span>
            <strong>Sharing screen with Guide</strong> · 1 frame/sec analyzed for live assistance · Never stored to disk
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentFramePreview && (
            <span className="hidden md:inline-block text-[11px] text-[#A8A29E]">
              Vision model active
            </span>
          )}
          <button
            onClick={onStop}
            className="px-3 py-1 bg-[#9A3412] text-white rounded text-xs font-semibold hover:bg-[#B45309] transition-colors flex items-center gap-1.5"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop Sharing</span>
          </button>
        </div>
      </div>

      {showEnlarged && currentFramePreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#1C1917] border border-[#44403C] rounded-lg p-4 max-w-4xl w-full shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between text-white text-xs">
              <span className="font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#9A3412]" />
                Live Screen Frame Sent to Guide (1280px Downscaled JPEG)
              </span>
              <button
                onClick={() => setShowEnlarged(false)}
                className="text-[#A8A29E] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded overflow-hidden border border-[#292524] bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={`data:image/jpeg;base64,${currentFramePreview}`}
                alt="Enlarged frame preview"
                className="max-h-[70vh] object-contain w-auto"
              />
            </div>
            <p className="text-[11px] text-[#A8A29E] text-center">
              This frame is fed in real time to Gemini so it can answer "what do you see" and guide you through your settings.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
