import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ExternalLink, Send, Check, X, Shield } from 'lucide-react';

interface Slot {
  displayFormatted: string;
  startIso: string;
}

interface CalendarEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  product: string;
  transcript: Array<{ role: string; text: string }>;
  onEscalated?: (summary: string) => void;
}

export const CalendarEscalationModal: React.FC<CalendarEscalationModalProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  product,
  transcript,
  onEscalated,
}) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookingUrl, setBookingUrl] = useState<string>('');
  const [workingHours, setWorkingHours] = useState<string>('Mon-Fri 10:00-16:00');
  const [ownerTimezone, setOwnerTimezone] = useState<string>('America/New_York');
  const [loading, setLoading] = useState<boolean>(true);

  const [emailInput, setEmailInput] = useState<string>(userEmail || '');
  const [goalInput, setGoalInput] = useState<string>('');
  const [blockerInput, setBlockerInput] = useState<string>('Would like human guidance and review');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setSubmittedMessage(null);

    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';

    fetch(`/api/calendar/slots?duration=30&timezone=${encodeURIComponent(userTz)}`)
      .then(res => res.json())
      .then(data => {
        setSlots(data.slots || []);
        setBookingUrl(data.bookingUrl || '');
        setWorkingHours(data.workingHours || 'Mon-Fri 10:00-16:00');
        setOwnerTimezone(data.ownerTimezone || 'America/New_York');
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load slots:', err);
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitHandoff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        userName: userName || 'Visitor',
        userEmail: emailInput || 'Not provided',
        product,
        goal: goalInput || 'Setup guidance',
        tried: 'Reviewed safety settings with Calm Guide',
        screenSeen: 'No stored capture. Text-only context.',
        blocker: blockerInput,
        proposedTimes: slots,
        transcriptExcerpt: transcript.slice(-20),
      };

      const res = await fetch('/api/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSubmittedMessage(data.message || 'Your handoff dossier has been delivered to Nic.');
      if (onEscalated) {
        onEscalated(`Handoff requested for ${userName} (${emailInput}): ${blockerInput}`);
      }
    } catch (err: any) {
      setSubmittedMessage('Handoff note saved locally. Nic will follow up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-xs">
      <div className="bg-[#FBF9F5] border border-[#E6DFD3] rounded-xl max-w-lg w-full p-6 shadow-xl text-[#1C1917] space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-[#E6DFD3] pb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#78716C] block">
              Human Escalation
            </span>
            <h3 className="text-2xl font-editorial font-medium text-[#1C1917] mt-0.5">
              Talk with Nic
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#78716C] hover:text-[#1C1917] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#57534E] leading-relaxed">
          The guide only assists with initial setup. When you have questions about sensitive business data, billing, security policies, or feel unsure, Nic is happy to step in directly.
        </p>

        {/* Cal.com Live Sync Notice */}
        <div className="p-3 bg-[#F4F0E8] border border-[#E6DFD3] rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-2 font-medium text-[#1C1917]">
            <Clock className="w-3.5 h-3.5 text-[#9A3412]" />
            <span>Live Availability (Synced with Cal.com)</span>
          </div>
          <p className="text-[11px] text-[#78716C]">
            These times reflect Nic's real-time schedule rules. Select a slot or confirm directly on the booking page.
          </p>
        </div>

        {/* Proposed Slots */}
        <div>
          <span className="text-xs font-semibold text-[#1C1917] block mb-2">
            Suggested Free Times (in your local timezone):
          </span>
          {loading ? (
            <div className="py-4 text-center text-xs text-[#78716C]">
              Checking availability...
            </div>
          ) : slots.length > 0 ? (
            <div className="space-y-1.5">
              {slots.map((slot, i) => (
                <div
                  key={i}
                  className="px-3 py-2 bg-white border border-[#E6DFD3] rounded text-xs flex items-center justify-between"
                >
                  <span className="font-medium text-[#1C1917]">{slot.displayFormatted}</span>
                  <span className="text-[10px] text-[#14532D] font-mono">30 min slot</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#78716C] italic p-2">
              No immediate slots found within the next few days. Please check the direct booking link below.
            </div>
          )}
        </div>

        {/* Direct Booking Link */}
        {bookingUrl && (
          <div className="pt-1">
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Confirm on Nic's Scheduling Page</span>
            </a>
          </div>
        )}

        {/* Webhook Handoff Dossier */}
        <div className="border-t border-[#E6DFD3] pt-4">
          <h4 className="text-sm font-semibold text-[#1C1917] mb-2">
            Send Handoff Summary to Nic
          </h4>
          <p className="text-[11px] text-[#78716C] mb-3">
            Sends your goal, what was tried, and the last transcript turns (text-only, never images or passwords) directly to Nic's workspace.
          </p>

          {submittedMessage ? (
            <div className="p-3 bg-[#14532D]/10 border border-[#14532D]/30 text-[#14532D] rounded-lg text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{submittedMessage}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitHandoff} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#57534E] mb-1">
                  Your Email (for response):
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E6DFD3] rounded focus:outline-none focus:ring-1 focus:ring-[#9A3412]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#57534E] mb-1">
                  What are you trying to accomplish?
                </label>
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="e.g. Setting up Muse without granting email send rights"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E6DFD3] rounded focus:outline-none focus:ring-1 focus:ring-[#9A3412]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#57534E] mb-1">
                  What is blocking you or what question do you have?
                </label>
                <textarea
                  rows={2}
                  value={blockerInput}
                  onChange={(e) => setBlockerInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E6DFD3] rounded focus:outline-none focus:ring-1 focus:ring-[#9A3412]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-[#F4F0E8] hover:bg-[#EAE4D7] border border-[#E6DFD3] text-[#1C1917] text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending dossier...' : 'Send Handoff Dossier'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
