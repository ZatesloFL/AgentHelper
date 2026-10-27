import React, { useEffect, useState } from 'react';
import { X, Clock, Calendar, Sparkles } from 'lucide-react';
import { authFetch } from '../lib/firebase.js';

interface PlanBooking {
  id: string;
  eventType: string | null;
  bucket: string;
  start: string | null;
  end: string | null;
  durationMinutes: number;
  status: string;
}

interface PlanData {
  email: string | null;
  plan: string | null;
  planName: string | null;
  status: string;
  termMonths: number | null;
  termStart: string | null;
  termEnd: string | null;
  includedMinutes: number;
  extraMinutes: number;
  packageMinutes: number;
  usedMinutes: number;
  reservedMinutes: number;
  packageUsedMinutes: number;
  packageReservedMinutes: number;
  remainingMinutes: number;
  packageRemainingMinutes: number;
  quickStartCreditExpiresAt: string | null;
  bookings: PlanBooking[];
  links: Record<string, string>;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export const PlanView: React.FC<{
  onClose: () => void;
  onOpenTools: () => void;
  onOpenNotes: () => void;
}> = ({ onClose, onOpenTools, onOpenNotes }) => {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    authFetch('/api/membership')
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Could not load your plan.');
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setPlan(data);
      })
      .catch((e: any) => {
        if (!cancelled) setError(e?.message || 'Could not load your plan.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasPlan = plan && plan.plan && plan.status === 'active';
  const renewalLink =
    plan?.plan === 'basic'
      ? plan.links.basicRenewal
      : plan?.plan === 'standard'
        ? plan.links.standardRenewal
        : plan?.plan === 'premium'
          ? plan.links.premiumRenewal
          : null;

  return (
    <div className="min-h-screen bg-[#FBF9F5] px-4 sm:px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-editorial font-medium text-[#1C1917]">My plan</h1>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-sm text-[#57534E] hover:text-[#1C1917]"
            aria-label="Close My plan"
          >
            <X className="w-4 h-4" /> Close
          </button>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 text-sm text-[#991B1B] mb-6">
            {error}
          </div>
        )}
        {!plan && !error && <p className="text-sm text-[#78716C]">Loading your plan…</p>}

        {plan && !hasPlan && (
          <div className="bg-white border border-[#E6DFD3] rounded-xl p-6 mb-6">
            <h2 className="font-medium text-[#1C1917] mb-2">No active plan found</h2>
            <p className="text-sm text-[#57534E] mb-4">
              Plans are linked to the Google account you signed in with. If you bought a plan with a
              different email, sign in with that account — or buy a plan below.
            </p>
            <div className="flex flex-wrap gap-2">
              <a href={plan.links.quickstart} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-[#1C1917] text-white text-sm">Quick Start — $59</a>
              <a href={plan.links.basic} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border border-[#E6DFD3] text-sm">Basic — $99</a>
              <a href={plan.links.standard} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border border-[#E6DFD3] text-sm">Standard — $149</a>
              <a href={plan.links.premium} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border border-[#E6DFD3] text-sm">Premium — $229</a>
            </div>
          </div>
        )}

        {plan && hasPlan && (
          <>
            <div className="bg-white border border-[#E6DFD3] rounded-xl p-6 mb-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-medium text-[#1C1917] text-lg">{plan.planName}</h2>
                <span className="text-sm text-[#78716C]">
                  Term ends {fmtDate(plan.termEnd)}
                  {plan.termMonths ? ` · ${plan.termMonths} months` : ''}
                </span>
              </div>
              <p className="text-sm text-[#57534E] mt-1">
                Renewal is never automatic — when your term ends, Nic sends you a renewal link and
                only your click starts it.
              </p>

              <div className="mt-5">
                <div className="flex items-center gap-2 text-sm font-medium text-[#1C1917]">
                  <Clock className="w-4 h-4" /> Time with Nic
                </div>
                <div className="mt-2 h-3 rounded-full bg-[#F4F0E8] overflow-hidden">
                  <div
                    className="h-full bg-[#405D1A] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ((plan.usedMinutes + plan.reservedMinutes) /
                          Math.max(1, plan.includedMinutes + plan.extraMinutes)) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-[#57534E] mt-2">
                  <strong className="text-[#1C1917]">{plan.remainingMinutes} minutes left</strong>
                  {' — '}
                  {plan.includedMinutes} included + {plan.extraMinutes} extra − {plan.usedMinutes} used
                  {plan.reservedMinutes > 0 ? ` − ${plan.reservedMinutes} booked` : ''}.
                </p>
                {plan.packageMinutes > 0 && (
                  <p className="text-sm text-[#57534E] mt-1">
                    Package time: <strong className="text-[#1C1917]">{plan.packageRemainingMinutes} of {plan.packageMinutes} minutes left</strong>
                    {plan.packageReservedMinutes > 0 ? ` (${plan.packageReservedMinutes} booked)` : ''} — package
                    time is separate and never comes out of your plan time.
                  </p>
                )}
                {plan.quickStartCreditExpiresAt && (
                  <p className="text-sm text-[#57534E] mt-1 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" /> Quick Start $59 credit — expires{' '}
                    {fmtDate(plan.quickStartCreditExpiresAt)}.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                <a href={plan.links.extraHour} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-[#1C1917] text-white text-sm">Buy an extra hour — $125</a>
                <a href={plan.links.block5} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border border-[#E6DFD3] text-sm">5-hour block — $550</a>
                <a href={plan.links.block10} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border border-[#E6DFD3] text-sm">10-hour block — $1,000</a>
                {renewalLink && (
                  <a href={renewalLink} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border border-[#E6DFD3] text-sm">Renew this plan</a>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#E6DFD3] rounded-xl p-6 mb-6">
              <h2 className="font-medium text-[#1C1917] mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Bookings
              </h2>
              {plan.bookings.length === 0 ? (
                <p className="text-sm text-[#57534E]">
                  No Membership Session bookings yet. Book time with Nic from the home screen — a
                  booking holds its minutes until it happens, and cancelling frees them back up.
                </p>
              ) : (
                <ul className="divide-y divide-[#F4F0E8]">
                  {plan.bookings.map((b) => (
                    <li key={b.id} className="py-3 flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm text-[#1C1917]">
                        {fmtDateTime(b.start)} · {b.durationMinutes} min
                        {b.bucket === 'package' ? ' (package)' : ''}
                      </span>
                      <span className="text-sm text-[#78716C]">
                        {b.status === 'reserved' ? 'Booked' : b.status === 'used' ? 'Done' : 'Released'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-[#78716C] mt-3">
                To reschedule or cancel, use the link in your cal.com confirmation email.
              </p>
            </div>
          </>
        )}

        <div className="bg-white border border-[#E6DFD3] rounded-xl p-6">
          <h2 className="font-medium text-[#1C1917] mb-3">Settings</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={onOpenTools} className="px-4 py-2 rounded-lg border border-[#E6DFD3] text-sm">Your tools profile</button>
            <button onClick={onOpenNotes} className="px-4 py-2 rounded-lg border border-[#E6DFD3] text-sm">Session notes</button>
          </div>
          <p className="text-sm text-[#57534E] mt-3">
            Your name and email come from your Google account and can't be changed here. For billing
            questions, contact Nic at nic@zateslo.com.
          </p>
        </div>
      </div>
    </div>
  );
};
