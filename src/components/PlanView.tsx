import React, { useEffect, useState } from 'react';
import { X, Clock, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import {
  auth,
  authFetch,
  createNeedsSetupProject,
  getUserProjects,
  saveMemberOnboarding,
  updateUserProjectFields,
  type SetupLane,
} from '../lib/firebase.js';
import { getTemplateWithFallback } from '../lib/templates.js';

const REDEEM_URL = 'https://ixfacparwrbkzxhbsuad.supabase.co/functions/v1/redeem-code';
const BRAINSTORM_GET_URL =
  'https://ixfacparwrbkzxhbsuad.supabase.co/functions/v1/brainstorm-get';

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
  onOpenSetup?: () => void;
}> = ({ onClose, onOpenTools, onOpenNotes, onOpenSetup }) => {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redeemCode, setRedeemCode] = useState(
    () => new URLSearchParams(window.location.search).get('code') || '',
  );
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<string | null>(null);
  const [redeemOk, setRedeemOk] = useState(false);
  const [bsEmail, setBsEmail] = useState('');
  const [bsCode, setBsCode] = useState('');
  const [bsBusy, setBsBusy] = useState(false);
  const [bsMessage, setBsMessage] = useState<string | null>(null);

  const handleRedeem = async () => {
    const code = redeemCode.trim().toUpperCase();
    if (!code) { setRedeemMessage('Enter your access code first.'); return; }
    const user = auth.currentUser;
    if (!user) { setRedeemMessage('Sign in first, then redeem your code.'); return; }
    setRedeeming(true);
    setRedeemMessage(null);
    setRedeemOk(false);
    try {
      const token = await user.getIdToken();
      const res = await fetch(REDEEM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.valid) {
        setRedeemMessage(data.redeemed_by_other
          ? 'That code was already claimed by another account.'
          : 'That code is not valid for an active plan.');
        return;
      }
      // Track 3: the purchase's lane + gift context ride into onboarding and
      // the project. redeem-code returns package/is_gift/gift_recipient_name
      // once its update deploys; until then these default calmly (membership
      // lane, not a gift) and nothing breaks.
      const lane: SetupLane =
        data.package === 'virtual' ? 'virtual' : data.package ? 'lunch' : 'membership';
      const isGift = Boolean(data.is_gift);
      const giftRecipientName =
        typeof data.gift_recipient_name === 'string' ? data.gift_recipient_name : undefined;
      await saveMemberOnboarding(user.uid, {
        lane,
        isGift,
        giftRecipientName,
        packageKind: typeof data.package === 'string' ? data.package : undefined,
        startedAs: isGift
          ? 'gift-arrival'
          : data.template_slug
            ? 'template-in-hand'
            : 'open-start',
      });
      setRedeemOk(true);
      if (!data.template_slug) {
        setRedeemMessage(
          lane !== 'membership'
            ? 'Code accepted — your setup package is active. Open Start setup to book your session with Nic and pick a first project whenever you’re ready.'
            : 'Code accepted — your plan is active. Open Start setup to pick your first project whenever you’re ready.',
        );
        return;
      }
      const template = await getTemplateWithFallback(data.template_slug);
      const projectId = await createNeedsSetupProject(user.uid, data.template_slug, 'redemption', {
        startedAs: isGift ? 'gift-arrival' : 'template-in-hand',
        lane,
        isGift,
        giftRecipientName,
        brainstormNotes:
          typeof data.brainstorm_notes === 'string' && data.brainstorm_notes.trim()
            ? data.brainstorm_notes
            : undefined,
        templateOverride: template || undefined,
      });
      setRedeemMessage(projectId
        ? `Template ready: ${data.template_slug}. Start setup will walk you through it — about five minutes.`
        : 'Code accepted, but the template could not be found. Contact Nic.');
    } catch {
      setRedeemMessage('Redemption is not available right now. Try again in a moment.');
    } finally {
      setRedeeming(false);
    }
  };

  const handleBrainstormAttach = async () => {
    const user = auth.currentUser;
    if (!user) { setBsMessage('Sign in first, then attach your brainstorm.'); return; }
    const email = bsEmail.trim().toLowerCase();
    const code = bsCode.trim().toUpperCase();
    if (!email || !code) { setBsMessage('Enter the email and the resume code from your brainstorm.'); return; }
    setBsBusy(true);
    setBsMessage(null);
    try {
      const res = await fetch(BRAINSTORM_GET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resumeCode: code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.found) {
        setBsMessage('We could not find a brainstorm under that email and code — check both and try again.');
        return;
      }
      const notes: string = data.brainstorm?.notes || '';
      const slug: string = data.brainstorm?.template_slug || '';
      const map = await getUserProjects(user.uid);
      const candidates = Object.values(map).filter(
        (p) => p.status === 'needs_setup' || p.status === 'ready',
      );
      const target =
        candidates.find((p) => slug && p.templateSlug === slug) || candidates[0] || null;
      if (!target) {
        setBsMessage(
          'Found your brainstorm — but redeem your plan code above first, so there is a project to attach it to. Then run this again.',
        );
        return;
      }
      await updateUserProjectFields(user.uid, target.projectId, { brainstormNotes: notes });
      setBsMessage(
        `Attached — your brainstorm notes are now on "${target.title || 'your project'}". Start setup and you'll see them first.`,
      );
    } catch {
      setBsMessage('Attaching hiccuped — try again in a moment.');
    } finally {
      setBsBusy(false);
    }
  };

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

        <div className="bg-white border border-[#E6DFD3] rounded-xl p-6 mb-6">
          <h2 className="font-medium text-[#1C1917] mb-2">Redeem a purchase code</h2>
          <p className="text-sm text-[#57534E] mb-3">
            Bought a plan with a template picked? Enter your access code here and that template
            will be set up as your next project.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              placeholder="SL-XXXXXXXX"
              className="px-3 py-2 rounded-lg border border-[#E6DFD3] text-sm flex-1 min-w-[180px]"
            />
            <button onClick={handleRedeem} disabled={redeeming} className="px-4 py-2 rounded-lg bg-[#1C1917] text-white text-sm disabled:opacity-50">
              {redeeming ? 'Redeeming…' : 'Redeem'}
            </button>
          </div>
          {redeemMessage && <p className="text-sm text-[#57534E] mt-3">{redeemMessage}</p>}
          {redeemOk && onOpenSetup && (
            <button
              onClick={onOpenSetup}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#405D1A] text-white text-sm"
            >
              Start setup <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <details className="mt-4">
            <summary className="text-sm text-[#405D1A] cursor-pointer">
              Brainstormed earlier with a different email?
            </summary>
            <p className="text-sm text-[#57534E] mt-2 mb-2">
              If you brainstormed on the website under a different email than the one used at
              checkout, attach those notes here with the resume code from your brainstorm page.
            </p>
            <div className="flex flex-wrap gap-2">
              <input
                value={bsEmail}
                onChange={(e) => setBsEmail(e.target.value)}
                placeholder="Brainstorm email"
                className="px-3 py-2 rounded-lg border border-[#E6DFD3] text-sm flex-1 min-w-[180px]"
              />
              <input
                value={bsCode}
                onChange={(e) => setBsCode(e.target.value)}
                placeholder="BS-XXXXXXXXXX"
                className="px-3 py-2 rounded-lg border border-[#E6DFD3] text-sm flex-1 min-w-[140px]"
              />
              <button onClick={handleBrainstormAttach} disabled={bsBusy} className="px-4 py-2 rounded-lg border border-[#E6DFD3] text-sm disabled:opacity-50">
                {bsBusy ? 'Attaching…' : 'Attach my brainstorm'}
              </button>
            </div>
            {bsMessage && <p className="text-sm text-[#57534E] mt-2">{bsMessage}</p>}
          </details>
        </div>

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
