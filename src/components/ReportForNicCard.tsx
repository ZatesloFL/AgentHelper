import React, { useState, useEffect, useRef } from 'react';
import { authFetch } from '../lib/firebase.js';
import { Send, ExternalLink, Check, AlertCircle, RefreshCw } from 'lucide-react';

export interface ReportForNicCardProps {
  initialGoal?: string;
  initialTried?: string;
  initialBlocker?: string;
  autoDraft?: boolean;
  product: string;
  productName?: string;
  transcript: Array<{ role: string; text: string }>;
  routineProgress?: string;
  routineState?: any;
  progressSummary?: string;
  progressSummaryPayload?: any;
  bookingUrl: string;
  sheetWebhookConfigured: boolean;
  onBeforeSendReport?: () => Promise<string | void>;
  onSent?: (referenceId: string) => void;
}

export const ReportForNicCard: React.FC<ReportForNicCardProps> = ({
  initialGoal = '',
  initialTried = '',
  initialBlocker = '',
  autoDraft = false,
  product,
  productName = 'Meta Muse',
  transcript,
  routineProgress = '',
  routineState = null,
  progressSummary = '',
  progressSummaryPayload = null,
  bookingUrl,
  sheetWebhookConfigured,
  onBeforeSendReport,
  onSent,
}) => {
  const [goal, setGoal] = useState<string>(autoDraft ? '' : initialGoal);
  const [tried, setTried] = useState<string>(autoDraft ? '' : initialTried);
  const [blocker, setBlocker] = useState<string>(autoDraft ? '' : initialBlocker);
  const [includeTranscript, setIncludeTranscript] = useState<boolean>(true);
  const [isDrafting, setIsDrafting] = useState<boolean>(Boolean(autoDraft));

  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentRefId, setSentRefId] = useState<string | null>(null);
  const [sendFailed, setSendFailed] = useState<boolean>(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);

  const userEditedGoalRef = useRef<boolean>(false);
  const userEditedTriedRef = useRef<boolean>(false);
  const userEditedBlockerRef = useRef<boolean>(false);

  useEffect(() => {
    if (!autoDraft) {
      setGoal(initialGoal);
    }
  }, [initialGoal, autoDraft]);

  useEffect(() => {
    if (!autoDraft) {
      setTried(initialTried);
    }
  }, [initialTried, autoDraft]);

  useEffect(() => {
    if (!autoDraft) {
      setBlocker(initialBlocker);
    }
  }, [initialBlocker, autoDraft]);

  // When opened by the user (autoDraft = true), call POST /api/report/draft
  useEffect(() => {
    if (!autoDraft) return;

    let cancelled = false;
    setIsDrafting(true);

    authFetch('/api/report/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product,
        transcript: Array.isArray(transcript) ? transcript.slice(-40) : [],
        progressSummary: progressSummaryPayload || progressSummary || null,
        routineState: routineState || null,
      }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json().catch(() => null);
      })
      .then((data) => {
        if (cancelled || !data) return;
        if (typeof data.goal === 'string' && !userEditedGoalRef.current) {
          setGoal(data.goal);
        }
        if (typeof data.tried === 'string' && !userEditedTriedRef.current) {
          setTried(data.tried);
        }
        if (typeof data.blocker === 'string' && !userEditedBlockerRef.current) {
          setBlocker(data.blocker);
        }
      })
      .catch(() => {
        // Leave fields empty and editable, with no error banner
      })
      .finally(() => {
        if (!cancelled) {
          setIsDrafting(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [autoDraft, product]);

  const handleSendReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sheetWebhookConfigured || isSending) return;

    setIsSending(true);
    setSendFailed(false);
    setRateLimitMessage(null);

    try {
      let latestSummary = progressSummary;
      if (onBeforeSendReport) {
        try {
          const updated = await onBeforeSendReport();
          if (typeof updated === 'string' && updated.trim()) {
            latestSummary = updated;
          }
        } catch (_) {}
      }

      const res = await authFetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          goal,
          tried,
          blocker,
          includeTranscript,
          transcript: includeTranscript ? transcript.slice(-20) : [],
          routineProgress,
          progressSummary: latestSummary,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        setRateLimitMessage(
          data?.message ||
            data?.error ||
            "You've reached the daily limit of 5 handoff reports to Nic. You can still use Nic's direct booking link."
        );
        setSendFailed(true);
        return;
      }

      if (res.ok && data && data.ok === true && typeof data.id === 'string') {
        setSentRefId(data.id);
        setSendFailed(false);
        if (onSent) {
          onSent(data.id);
        }
      } else {
        setSendFailed(true);
      }
    } catch {
      setSendFailed(true);
    } finally {
      setIsSending(false);
    }
  };

  const effectiveBookingUrl =
    bookingUrl || 'https://cal.com/zateslo/grab-some-human-time-with-nic';

  return (
    <div className="my-3 border border-[#E6DFD3] bg-[#F7F4EE] rounded-xl p-4 sm:p-5 text-[#1C1917] max-w-xl shadow-xs space-y-4">
      <div className="border-b border-[#E6DFD3] pb-2.5 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#78716C] block">
            Human Handoff
          </span>
          <h4 className="text-lg font-editorial font-medium text-[#1C1917] mt-0.5">
            Report for Nic
          </h4>
        </div>
        {isDrafting && (
          <span className="text-[11px] text-[#78716C] italic flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 animate-spin text-[#9A3412]" />
            <span>Drafting a summary for you…</span>
          </span>
        )}
      </div>

      {sentRefId ? (
        <div className="space-y-3">
          <div className="p-3.5 bg-[#14532D]/10 border border-[#14532D]/30 text-[#14532D] rounded-lg text-xs flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 shrink-0" />
            <span>Sent to Nic. Reference: {sentRefId}</span>
          </div>
          <div>
            <a
              href={effectiveBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 border border-[#E6DFD3] text-[#1C1917] text-xs font-medium rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Nic's booking page</span>
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSendReport} className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-[#57534E] mb-1">
              Goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => {
                userEditedGoalRef.current = true;
                setGoal(e.target.value);
              }}
              placeholder={
                isDrafting ? 'Drafting a summary for you…' : `e.g. Setting up ${productName} safely`
              }
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#E6DFD3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9A3412] text-[#1C1917]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#57534E] mb-1">
              What we tried
            </label>
            <textarea
              rows={2}
              value={tried}
              onChange={(e) => {
                userEditedTriedRef.current = true;
                setTried(e.target.value);
              }}
              placeholder={
                isDrafting ? 'Drafting a summary for you…' : 'Steps or settings reviewed so far...'
              }
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#E6DFD3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9A3412] text-[#1C1917]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#57534E] mb-1">
              Blocker or question for Nic
            </label>
            <textarea
              rows={2}
              value={blocker}
              onChange={(e) => {
                userEditedBlockerRef.current = true;
                setBlocker(e.target.value);
              }}
              placeholder={
                isDrafting
                  ? 'Drafting a summary for you…'
                  : 'What is blocking progress or needs human judgment...'
              }
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#E6DFD3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9A3412] text-[#1C1917]"
            />
          </div>

          {sheetWebhookConfigured && (
            <label className="flex items-center gap-2 text-xs text-[#57534E] pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeTranscript}
                onChange={(e) => setIncludeTranscript(e.target.checked)}
                className="rounded text-[#9A3412] focus:ring-0"
              />
              <span>Include the last 20 messages of our conversation</span>
            </label>
          )}

          {sendFailed && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <span>
                  {rateLimitMessage ||
                    "I couldn't send that just now. Nothing was lost — you can try again, or open Nic's booking page."}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {sheetWebhookConfigured && !rateLimitMessage && (
                  <button
                    type="button"
                    onClick={() => handleSendReport()}
                    disabled={isSending}
                    className="px-3 py-1.5 bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                    <span>Try again</span>
                  </button>
                )}
                <a
                  href={effectiveBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-[#D6CEBE] text-[#1C1917] text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open booking page</span>
                </a>
              </div>
            </div>
          )}

          {!sendFailed && (
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {sheetWebhookConfigured && (
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-4 py-2 bg-[#1C1917] hover:bg-[#292524] disabled:opacity-50 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Sending...' : 'Send report to Nic'}</span>
                </button>
              )}

              <a
                href={effectiveBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#D6CEBE] text-[#1C1917] text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Nic's booking page</span>
              </a>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
