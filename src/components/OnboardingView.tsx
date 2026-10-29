import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  Gift,
  ShieldCheck,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import {
  AuthUser,
  MemberOnboardingDoc,
  SetupLane,
  TaskContractFields,
  TemplateDoc,
  TemplateLayer,
  UserProjectDoc,
  createBlankProject,
  createNeedsSetupProject,
  getMemberOnboarding,
  getUserProjects,
  saveMemberOnboarding,
  saveUserProjectContract,
  updateUserProjectFields,
} from '../lib/firebase.js';
import { getTemplateWithFallback, listTemplatesWithFallback } from '../lib/templates.js';

// Track 3 — General Onboarding + Project Intake (four paths, three lanes).
// Paths: Template in Hand, Open Start, Brainstorm First, Gift Arrival.
// Lanes: membership (default), virtual, lunch — set from the purchase and
// carried on the onboarding record / project. Onboarding lives in the app
// only; AI Nic's job ends at the code + link. Guardrail confirmation is a
// hard gate: nothing is saved as a contract before the member confirms.

const AGENT_OPTIONS = [
  { id: 'muse', name: 'Meta Muse' },
  { id: 'grok', name: 'Grok' },
  { id: 'chatgpt', name: 'ChatGPT' },
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'unsure', name: 'Not sure yet' },
];

const COMFORT_OPTIONS = [
  'Brand new to this',
  'I have tried an AI helper a little',
  'Fairly comfortable',
  'Very comfortable',
];

const STARTER_SLUGS = ['trip-planner', 'family-scheduler', 'daily-news-podcast'];

const BLANK_GUARDRAILS = {
  do: 'Help me think through and draft things for this project, one step at a time.\nAsk me questions when something is unclear instead of guessing.',
  do_not:
    'Do not send messages, buy anything, delete anything, or share my information with anyone.',
  ask_me_before: 'Ask me before contacting anyone or changing anything outside this chat.',
  report_back: 'Check in with a short summary of where things stand and what you suggest next.',
  stop_if:
    'Stop and ask me if you are unsure what I mean, or if something looks wrong or unsafe.',
};

type Phase = 'loading' | 'general' | 'picker' | 'intake' | 'notice' | 'error';
type GeneralStep = 'welcome' | 'assistant' | 'plate' | 'lane' | 'next';
type IntakeStep = 'opening' | 'assistant' | 'layer' | 'slots' | 'guardrails' | 'closing';
const INTAKE_STEPS: IntakeStep[] = ['opening', 'assistant', 'layer', 'slots', 'guardrails'];

function agentName(id?: string): string {
  return AGENT_OPTIONS.find((a) => a.id === id)?.name || 'Meta Muse';
}

function asLines(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v.join('\n');
  return typeof v === 'string' ? v : '';
}

function layerClaimText(item: any): string {
  if (typeof item === 'string') return item;
  return typeof item?.text === 'string' ? item.text : '';
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-[#E6DFD3] text-sm bg-white focus:outline-none focus:border-[#405D1A]';
const labelCls = 'block text-sm font-medium text-[#1C1917] mb-1';
const helpCls = 'text-sm text-[#57534E] mb-2';
const primaryBtn =
  'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1C1917] text-white text-sm disabled:opacity-50';
const ghostBtn =
  'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E6DFD3] text-sm text-[#1C1917] bg-white disabled:opacity-50';

export const OnboardingView: React.FC<{
  user: AuthUser;
  projects: Record<string, UserProjectDoc>;
  bookingUrl: string;
  initialProjectId?: string | null;
  // Sidebar entries (2026-10-29): a Recommended card jumps straight into
  // starting that template; the gallery opens on the picker directly.
  initialTemplateSlug?: string | null;
  startAtPicker?: boolean;
  onClose: () => void;
  onProjectsChanged: (projects: Record<string, UserProjectDoc>) => void;
}> = ({ user, projects, bookingUrl, initialProjectId, initialTemplateSlug, startAtPicker, onClose, onProjectsChanged }) => {
  const [phase, setPhase] = useState<Phase>('loading');
  const [noticeText, setNoticeText] = useState<string>('');
  const [onboarding, setOnboarding] = useState<MemberOnboardingDoc | null>(null);
  const [projectsMap, setProjectsMap] = useState<Record<string, UserProjectDoc>>(projects);
  const [templates, setTemplates] = useState<TemplateDoc[]>([]);
  const [showAllTemplates, setShowAllTemplates] = useState(false);

  const [generalStep, setGeneralStep] = useState<GeneralStep>('welcome');
  const [assistantChoice, setAssistantChoice] = useState<string>('unsure');
  const [geminiAccountType, setGeminiAccountType] = useState<'personal' | 'work' | ''>('');
  const [comfort, setComfort] = useState<string>('');
  const [goalsText, setGoalsText] = useState<string>('');

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [template, setTemplate] = useState<TemplateDoc | null>(null);
  const [templateMissing, setTemplateMissing] = useState(false);
  const [intakeStep, setIntakeStep] = useState<IntakeStep>('opening');
  const [slots, setSlots] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const initDone = useRef(false);

  const activeProject: UserProjectDoc | null = activeProjectId
    ? projectsMap[activeProjectId] || null
    : null;

  const lane: SetupLane = (activeProject?.lane || onboarding?.lane || 'membership') as SetupLane;
  const giftContext = Boolean(activeProject?.isGift || onboarding?.isGift);
  const memberFirstName =
    (activeProject?.giftRecipientName || onboarding?.giftRecipientName || '')
      .trim()
      .split(' ')[0] || '';

  const waitingProjects = useMemo(
    () => Object.values(projectsMap).filter((p) => p.status === 'needs_setup'),
    [projectsMap],
  );

  const refreshProjects = async (): Promise<Record<string, UserProjectDoc>> => {
    const map = await getUserProjects(user.uid);
    setProjectsMap(map);
    onProjectsChanged(map);
    return map;
  };

  const beginIntake = async (project: UserProjectDoc, map: Record<string, UserProjectDoc>) => {
    setActiveProjectId(project.projectId);
    setProjectsMap(map);
    let tpl: TemplateDoc | null = null;
    setTemplateMissing(false);
    if (project.templateSlug) {
      tpl = await getTemplateWithFallback(project.templateSlug);
      if (!tpl) setTemplateMissing(true);
    }
    setTemplate(tpl);
    const saved = project.intake;
    const defaults: Record<string, string> = {
      goal:
        tpl?.contract?.goal ||
        tpl?.goalInOneSentence ||
        project.goalInOneSentence ||
        project.contract?.goal ||
        '',
      specifics: '',
      done: tpl?.whatDoneLooksLike || project.whatDoneLooksLike || '',
      rhythm: tpl?.checkInRhythm || project.checkInRhythm || '',
      g_do: asLines(tpl?.contract?.do) || BLANK_GUARDRAILS.do,
      g_do_not: asLines(tpl?.contract?.do_not) || BLANK_GUARDRAILS.do_not,
      g_ask: asLines(tpl?.contract?.ask_me_before) || BLANK_GUARDRAILS.ask_me_before,
      g_report: asLines(tpl?.contract?.report_back) || BLANK_GUARDRAILS.report_back,
      g_stop: asLines(tpl?.contract?.stop_if) || BLANK_GUARDRAILS.stop_if,
    };
    setSlots({ ...defaults, ...(saved?.slots || {}) });
    setAssistantChoice(saved?.agentChoice || onboarding?.assistantProduct || 'unsure');
    setGeminiAccountType(saved?.geminiAccountType || '');
    setConfirmed(false);
    const resumeAt = saved && !saved.completed && INTAKE_STEPS.includes(saved.step as IntakeStep)
      ? (saved.step as IntakeStep)
      : 'opening';
    setIntakeStep(project.intake?.completed ? 'opening' : resumeAt);
    setPhase('intake');
  };

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    (async () => {
      const [ob, map, tpls] = await Promise.all([
        getMemberOnboarding(user.uid),
        getUserProjects(user.uid),
        listTemplatesWithFallback(),
      ]);
      setOnboarding(ob);
      setProjectsMap(map);
      onProjectsChanged(map);
      setTemplates(tpls);
      if (ob?.assistantProduct) setAssistantChoice(ob.assistantProduct);
      if (ob?.comfortLevel) setComfort(ob.comfortLevel);
      if (ob?.goalsText) setGoalsText(ob.goalsText);

      if (initialProjectId) {
        const project = map[initialProjectId];
        if (project && project.status !== 'needs_setup') {
          setNoticeText(
            `"${project.title || 'That project'}" is already set up — there's nothing left to do here. You can open it from your projects.`,
          );
          setPhase('notice');
          return;
        }
        if (project) {
          await beginIntake(project, map);
          return;
        }
      }
      if (initialTemplateSlug) {
        const tpl = tpls.find((t) => t.slug === initialTemplateSlug);
        if (tpl) {
          const existing = map[tpl.slug];
          if (existing && existing.status === 'needs_setup') {
            await beginIntake(existing, map);
            return;
          }
          if (existing) {
            setNoticeText(
              `"${existing.title || tpl.title}" is already set up on your account. You can open it from your projects.`,
            );
            setPhase('notice');
            return;
          }
          await startTemplateProject(tpl);
          return;
        }
      }
      if (startAtPicker) {
        setPhase('picker');
        return;
      }
      if (ob && !ob.completed) {
        setPhase('general');
        return;
      }
      setPhase('picker');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistIntake = async (
    step: IntakeStep,
    nextSlots: Record<string, string>,
    agent: string,
    acct: 'personal' | 'work' | '' = geminiAccountType,
  ) => {
    if (!activeProjectId) return;
    await updateUserProjectFields(user.uid, activeProjectId, {
      intake: {
        step,
        slots: nextSlots,
        agentChoice: agent,
        ...(acct ? { geminiAccountType: acct } : {}),
        completed: false,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  const chooseGeminiAccountType = async (acct: 'personal' | 'work') => {
    setGeminiAccountType(acct);
    await persistIntake(intakeStep as IntakeStep, slots, assistantChoice, acct);
  };

  const goIntakeStep = async (step: IntakeStep) => {
    setIntakeStep(step);
    await persistIntake(step, slots, assistantChoice);
  };

  const finishGeneral = async (dest: 'picker' | 'blank' | 'later') => {
    const saved = await saveMemberOnboarding(user.uid, {
      completed: true,
      assistantProduct: assistantChoice,
      comfortLevel: comfort || undefined,
      goalsText: goalsText || undefined,
    });
    if (saved) setOnboarding(saved);
    if (dest === 'picker') {
      setPhase('picker');
    } else if (dest === 'blank') {
      const id = await createBlankProject(user.uid, {
        startedAs: giftContext ? 'gift-arrival' : 'blank',
        lane,
        isGift: giftContext,
        giftRecipientName: onboarding?.giftRecipientName,
      });
      const map = await refreshProjects();
      const project = id ? map[id] : null;
      if (project) {
        await beginIntake(project, map);
      } else {
        setNoticeText(
          'Something hiccuped starting your project. Nothing is lost — try again from Start setup, or email Nic at nic@zateslo.com.',
        );
        setPhase('notice');
      }
    } else {
      setNoticeText(
        "You're all set for now. Whenever you're ready, Start setup will walk you through your first project — it takes about five minutes.",
      );
      setPhase('notice');
    }
  };

  const startTemplateProject = async (tpl: TemplateDoc) => {
    const existing = projectsMap[tpl.slug];
    if (existing) {
      if (existing.status === 'needs_setup') {
        await beginIntake(existing, projectsMap);
      } else {
        setNoticeText(
          `"${existing.title || tpl.title}" is already set up on your account. You can open it from your projects.`,
        );
        setPhase('notice');
      }
      return;
    }
    const projectId = await createNeedsSetupProject(user.uid, tpl.slug, 'in-app-picker', {
      startedAs: giftContext ? 'gift-arrival' : 'open-start',
      lane,
      isGift: giftContext,
      giftRecipientName: onboarding?.giftRecipientName,
      templateOverride: tpl,
    });
    const map = await refreshProjects();
    const project = projectId ? map[projectId] : null;
    if (project) {
      await beginIntake(project, map);
    } else {
      setTemplateMissing(true);
      setPhase('intake');
    }
  };

  const saveContract = async () => {
    if (!activeProject || !confirmed) return;
    setSaving(true);
    setSaveError(null);
    const goalText = (slots.goal || '').trim();
    const specifics = (slots.specifics || '').trim();
    const contract: TaskContractFields = {
      // Member specifics ride inside the goal — it is the field their helper
      // actually works from, so nothing they typed is dropped.
      goal: specifics ? `${goalText}\n\nDetails from me: ${specifics}` : goalText,
      do: slots.g_do || '',
      do_not: slots.g_do_not || '',
      ask_me_before: slots.g_ask || '',
      report_back: slots.g_report || '',
      stop_if: slots.g_stop || '',
    };
    const product = assistantChoice === 'unsure' ? 'muse' : assistantChoice;
    try {
      await saveUserProjectContract(user.uid, activeProject.projectId, {
        title: activeProject.title || template?.title,
        product,
        contract,
        rung: 0,
        status: 'active',
      });
      await updateUserProjectFields(user.uid, activeProject.projectId, {
        intake: {
          step: 'closing',
          slots,
          agentChoice: assistantChoice,
          ...(geminiAccountType ? { geminiAccountType } : {}),
          completed: true,
          updatedAt: new Date().toISOString(),
        },
        ...(slots.done?.trim() ? { whatDoneLooksLike: slots.done.trim() } : {}),
        ...(slots.rhythm?.trim() ? { checkInRhythm: slots.rhythm.trim() } : {}),
      });
      if (onboarding && !onboarding.completed) {
        const saved = await saveMemberOnboarding(user.uid, {
          completed: true,
          assistantProduct: assistantChoice,
        });
        if (saved) setOnboarding(saved);
      }
      await refreshProjects();
      setIntakeStep('closing');
    } catch (e: any) {
      setSaveError(
        e?.message ||
          "I couldn't save that just now. Your answers are still here — check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------- shared bits ----------
  const header = (title: string, sub?: string) => (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-editorial font-medium text-[#1C1917]">{title}</h1>
        {sub && <p className="text-sm text-[#57534E] mt-1">{sub}</p>}
      </div>
      <button
        onClick={onClose}
        className="flex items-center gap-1 text-sm text-[#57534E] hover:text-[#1C1917]"
        aria-label="Close setup"
      >
        <X className="w-4 h-4" /> Close
      </button>
    </div>
  );

  const card = (children: React.ReactNode) => (
    <div className="bg-white border border-[#E6DFD3] rounded-xl p-6 mb-6">{children}</div>
  );

  const laneModule = (compact: boolean) => {
    if (lane === 'membership') return null;
    const isVirtual = lane === 'virtual';
    return card(
      <>
        <h2 className="font-medium text-[#1C1917] mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {isVirtual ? 'Your Virtual Setup session with Nic' : 'Your in-person setup with Nic'}
        </h2>
        <p className="text-sm text-[#57534E] mb-3">
          {isVirtual
            ? 'Your setup package is built around a working session with Nic. Book it now and it is on the calendar — then we only need a few light questions here, because Nic will do the detailed setup with you live.'
            : 'Your setup package is built around meeting Nic in person. Book it now — the booking form asks where you would like to meet and when — then we only need a few light questions here, because Nic will do the detailed setup with you in person.'}
        </p>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noreferrer"
          className={primaryBtn + ' mb-4'}
        >
          <Calendar className="w-4 h-4" /> Book my session with Nic
        </a>
        <h3 className="text-sm font-medium text-[#1C1917] mb-1">Before the session</h3>
        <ul className="text-sm text-[#57534E] list-disc pl-5 space-y-1">
          {isVirtual ? (
            <>
              <li>Have the device you want set up charged and nearby.</li>
              <li>Install your AI helper's app ahead of time if you can — no problem if not.</li>
              <li>
                Have your own logins handy to use yourself. You will never be asked to share a
                password — not by Nic, not by any guide here.
              </li>
              <li>Jot down the one thing you most want working when the session ends.</li>
            </>
          ) : (
            <>
              <li>Bring the phone or laptop you want set up.</li>
              <li>
                Have your own logins handy to use yourself. You will never be asked to share a
                password — not by Nic, not by anyone here.
              </li>
              <li>Jot down the one thing you most want working when you leave.</li>
            </>
          )}
        </ul>
        {!compact && (
          <p className="text-sm text-[#57534E] mt-3">
            Booking comes first here because it is what you bought — but nothing in the app waits
            on it. You can look around and start a project any time.
          </p>
        )}
      </>,
    );
  };

  // ---------- phases ----------
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-[#FBF9F5] px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-[#78716C]">Getting your setup ready…</p>
        </div>
      </div>
    );
  }

  if (phase === 'notice') {
    return (
      <div className="min-h-screen bg-[#FBF9F5] px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {header('Start setup')}
          {card(<p className="text-sm text-[#57534E]">{noticeText}</p>)}
          <button onClick={onClose} className={primaryBtn}>
            Back to my projects
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'general') {
    const steps: GeneralStep[] =
      lane === 'membership'
        ? ['welcome', 'assistant', 'plate', 'next']
        : ['welcome', 'assistant', 'plate', 'lane', 'next'];
    const idx = steps.indexOf(generalStep);
    const goGeneral = (s: GeneralStep) => setGeneralStep(s);
    const nextOf = (s: GeneralStep): GeneralStep => steps[Math.min(steps.length - 1, steps.indexOf(s) + 1)];
    const prevOf = (s: GeneralStep): GeneralStep => steps[Math.max(0, steps.indexOf(s) - 1)];

    return (
      <div className="min-h-screen bg-[#FBF9F5] px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {header(
            giftContext ? 'Welcome to Second Look' : 'Welcome — let’s get you set up',
            `Step ${idx + 1} of ${steps.length}`,
          )}

          {generalStep === 'welcome' &&
            card(
              giftContext ? (
                <>
                  <h2 className="font-medium text-[#1C1917] mb-2 flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    {memberFirstName ? `Hi ${memberFirstName} — ` : ''}you've been given a Second
                    Look plan
                  </h2>
                  <p className="text-sm text-[#57534E] mb-3">
                    Someone who cares about you set this up: a real person — Nic — helps you get an
                    AI helper working for you, safely and at your pace. This app is where your
                    projects live. Nothing here is a test, and you can't break anything.
                  </p>
                  <ul className="text-sm text-[#57534E] list-disc pl-5 space-y-1 mb-3">
                    <li>Your gift is already paid for. There is nothing more to buy.</li>
                    <li>No card will be asked for — not now, not later.</li>
                    <li>You'll never be asked for a password. Ever.</li>
                    <li>We go one small step at a time, and you can stop whenever you like.</li>
                  </ul>
                  <p className="text-sm text-[#57534E]">
                    Questions at any point? Email Nic at{' '}
                    <a className="underline" href="mailto:nic@zateslo.com">
                      nic@zateslo.com
                    </a>{' '}
                    — a person answers.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-medium text-[#1C1917] mb-2">A few quick things first</h2>
                  <p className="text-sm text-[#57534E] mb-3">
                    Before your first project, the guide asks a handful of general questions — which
                    AI helper you use, how comfortable you feel, what's on your plate. It takes
                    about five minutes, it happens once, and every project after this reuses it.
                  </p>
                  <p className="text-sm text-[#57534E]">
                    Your answers stay in your account, and you can change them any time.
                  </p>
                </>
              ),
            )}

          {generalStep === 'assistant' &&
            card(
              <>
                <h2 className="font-medium text-[#1C1917] mb-2">Which AI helper will you use?</h2>
                <p className={helpCls}>
                  This becomes your default — setup steps will be written for this helper. You can
                  pick a different one for any single project later.
                </p>
                <div className="space-y-2">
                  {AGENT_OPTIONS.map((a) => (
                    <label
                      key={a.id}
                      className="flex items-center gap-2 text-sm text-[#1C1917] bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg px-3 py-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="assistant"
                        checked={assistantChoice === a.id}
                        onChange={() => setAssistantChoice(a.id)}
                      />
                      {a.name}
                      {a.id === 'unsure' && (
                        <span className="text-[#78716C]">
                          — we'll start with Meta Muse guidance; nothing is blocked.
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </>,
            )}

          {generalStep === 'plate' &&
            card(
              <>
                <h2 className="font-medium text-[#1C1917] mb-2">How is this feeling so far?</h2>
                <div className="space-y-2 mb-5">
                  {COMFORT_OPTIONS.map((c) => (
                    <label
                      key={c}
                      className="flex items-center gap-2 text-sm text-[#1C1917] bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg px-3 py-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="comfort"
                        checked={comfort === c}
                        onChange={() => setComfort(c)}
                      />
                      {c}
                    </label>
                  ))}
                </div>
                <label className={labelCls} htmlFor="goalsText">
                  What's on your plate these days?
                </label>
                <p className={helpCls}>
                  Anything you'd love a helper for — trips, bills, schedules, keeping up with
                  family. A sentence or two is plenty, and it's fine to skip this.
                </p>
                <textarea
                  id="goalsText"
                  className={inputCls}
                  rows={4}
                  value={goalsText}
                  onChange={(e) => setGoalsText(e.target.value)}
                  placeholder="For example: planning a trip this fall, and my inbox is a mess."
                />
              </>,
            )}

          {generalStep === 'lane' && laneModule(false)}

          {generalStep === 'next' &&
            card(
              <>
                <h2 className="font-medium text-[#1C1917] mb-2">Where would you like to start?</h2>
                <p className={helpCls}>
                  No wrong answer — and you can start another project any time after this one.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => finishGeneral('picker')}
                    className="w-full text-left px-4 py-3 rounded-lg border border-[#E6DFD3] hover:border-[#405D1A] bg-white"
                  >
                    <span className="block text-sm font-medium text-[#1C1917]">
                      Pick a project from the gallery
                    </span>
                    <span className="block text-sm text-[#57534E]">
                      Ready-made projects with the steps already written.
                    </span>
                  </button>
                  <button
                    onClick={() => finishGeneral('blank')}
                    className="w-full text-left px-4 py-3 rounded-lg border border-[#E6DFD3] hover:border-[#405D1A] bg-white"
                  >
                    <span className="block text-sm font-medium text-[#1C1917]">
                      Start from my own idea
                    </span>
                    <span className="block text-sm text-[#57534E]">
                      Describe what you want help with, in your words.
                    </span>
                  </button>
                  <button
                    onClick={() => finishGeneral('later')}
                    className="w-full text-left px-4 py-3 rounded-lg border border-[#E6DFD3] hover:border-[#405D1A] bg-white"
                  >
                    <span className="block text-sm font-medium text-[#1C1917]">Decide later</span>
                    <span className="block text-sm text-[#57534E]">
                      Look around first. Start setup will be here when you're ready.
                    </span>
                  </button>
                </div>
              </>,
            )}

          {generalStep !== 'next' && (
            <div className="flex items-center gap-2">
              {idx > 0 && (
                <button onClick={() => goGeneral(prevOf(generalStep))} className={ghostBtn}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button
                onClick={async () => {
                  if (generalStep === 'assistant') {
                    const saved = await saveMemberOnboarding(user.uid, {
                      assistantProduct: assistantChoice,
                    });
                    if (saved) setOnboarding(saved);
                  }
                  if (generalStep === 'plate') {
                    const saved = await saveMemberOnboarding(user.uid, {
                      comfortLevel: comfort || undefined,
                      goalsText: goalsText || undefined,
                    });
                    if (saved) setOnboarding(saved);
                  }
                  goGeneral(nextOf(generalStep));
                }}
                className={primaryBtn}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'picker') {
    const visibleTemplates = giftContext && !showAllTemplates
      ? templates.filter((t) => STARTER_SLUGS.includes(t.slug))
      : templates;
    return (
      <div className="min-h-screen bg-[#FBF9F5] px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {startAtPicker
            ? header('Project gallery', 'Every ready-made project, plus your own idea. Start anything.')
            : header('Start a project', 'Pick a ready-made project, or start from your own idea.')}

          {waitingProjects.length > 0 && (
            <>
              <h2 className="text-sm font-medium text-[#1C1917] mb-2">Waiting for setup</h2>
              {waitingProjects.map((p) => (
                <div
                  key={p.projectId}
                  className="bg-white border border-[#405D1A] rounded-xl p-4 mb-3 flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1C1917]">
                      {p.title || p.templateSlug || 'Your project'}
                    </p>
                    <p className="text-sm text-[#57534E]">
                      {p.goalInOneSentence || 'Setup takes about five minutes.'}
                    </p>
                  </div>
                  <button onClick={() => beginIntake(p, projectsMap)} className={primaryBtn}>
                    Continue setup <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </>
          )}

          <h2 className="text-sm font-medium text-[#1C1917] mb-2 mt-6">
            {giftContext && !showAllTemplates ? 'Good first projects' : 'From the gallery'}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            {visibleTemplates.map((t) => (
              <div key={t.slug} className="bg-white border border-[#E6DFD3] rounded-xl p-4">
                <p className="text-sm font-medium text-[#1C1917]">{t.title}</p>
                {t.category && <p className="text-xs text-[#78716C] mb-1">{t.category}</p>}
                <p className="text-sm text-[#57534E] mb-3">
                  {t.goalInOneSentence || 'A ready-made project with the steps written for you.'}
                </p>
                <button onClick={() => startTemplateProject(t)} className={ghostBtn}>
                  Start this project
                </button>
              </div>
            ))}
            <div className="bg-white border border-dashed border-[#E6DFD3] rounded-xl p-4">
              <p className="text-sm font-medium text-[#1C1917]">Start from scratch</p>
              <p className="text-sm text-[#57534E] mb-3">
                Your own idea, in your own words. The guide shapes it into a project with you.
              </p>
              <button
                onClick={async () => {
                  const id = await createBlankProject(user.uid, {
                    startedAs: giftContext ? 'gift-arrival' : 'blank',
                    lane,
                    isGift: giftContext,
                    giftRecipientName: onboarding?.giftRecipientName,
                  });
                  const map = await refreshProjects();
                  const project = id ? map[id] : null;
                  if (project) await beginIntake(project, map);
                }}
                className={ghostBtn}
              >
                Start blank
              </button>
            </div>
          </div>
          {giftContext && !showAllTemplates && templates.length > visibleTemplates.length && (
            <button
              onClick={() => setShowAllTemplates(true)}
              className="text-sm text-[#57534E] underline"
            >
              See all projects
            </button>
          )}
        </div>
      </div>
    );
  }

  // phase === 'intake'
  if (!activeProject || templateMissing) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {header('Start setup')}
          {card(
            <>
              <h2 className="font-medium text-[#1C1917] mb-2">We hit a snag</h2>
              <p className="text-sm text-[#57534E]">
                We couldn't find the setup content for this project. Nothing you bought is lost —
                email Nic at{' '}
                <a className="underline" href="mailto:nic@zateslo.com">
                  nic@zateslo.com
                </a>{' '}
                and he will sort it out personally.
              </p>
            </>,
          )}
          <button onClick={onClose} className={primaryBtn}>
            Back to my projects
          </button>
        </div>
      </div>
    );
  }

  const product = assistantChoice === 'unsure' ? 'muse' : assistantChoice;
  const rawLayer: TemplateLayer | string | undefined = template?.platformLayers?.[product];
  const layer: TemplateLayer | null =
    rawLayer && typeof rawLayer === 'object' ? rawLayer : null;
  const layerText = typeof rawLayer === 'string' && rawLayer.trim() ? rawLayer : null;
  const stepIdx = INTAKE_STEPS.indexOf(intakeStep as IntakeStep);
  const intakeBack = () => {
    if (stepIdx > 0) goIntakeStep(INTAKE_STEPS[stepIdx - 1]);
  };
  const intakeNext = () => {
    if (stepIdx >= 0 && stepIdx < INTAKE_STEPS.length - 1) goIntakeStep(INTAKE_STEPS[stepIdx + 1]);
  };
  const setSlot = (k: string, v: string) => setSlots((s) => ({ ...s, [k]: v }));

  const openingCard = () => {
    if (activeProject.startedAs === 'brainstorm-first' && activeProject.brainstormNotes) {
      return card(
        <>
          <h2 className="font-medium text-[#1C1917] mb-2">Here's what you told us</h2>
          <p className={helpCls}>
            When you brainstormed this project, you worked out the shape of it. Read it over — the
            next steps check it with you, and your edits win.
          </p>
          <div className="bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg p-4 text-sm text-[#1C1917] whitespace-pre-wrap">
            {activeProject.brainstormNotes}
          </div>
        </>,
      );
    }
    if (template) {
      return card(
        <>
          <h2 className="font-medium text-[#1C1917] mb-2">{template.title}</h2>
          {activeProject.startedAs === 'gift-arrival' && (
            <p className="text-sm text-[#57534E] mb-3">
              This project was picked with your gift. Here's what it does — setup takes about five
              minutes, one step at a time.
            </p>
          )}
          <dl className="text-sm space-y-2">
            {template.goalInOneSentence && (
              <div>
                <dt className="font-medium text-[#1C1917]">The goal</dt>
                <dd className="text-[#57534E]">{template.goalInOneSentence}</dd>
              </div>
            )}
            {template.whatDoneLooksLike && (
              <div>
                <dt className="font-medium text-[#1C1917]">What "done" looks like</dt>
                <dd className="text-[#57534E]">{template.whatDoneLooksLike}</dd>
              </div>
            )}
            {template.checkInRhythm && (
              <div>
                <dt className="font-medium text-[#1C1917]">Check-ins</dt>
                <dd className="text-[#57534E]">{template.checkInRhythm}</dd>
              </div>
            )}
            {template.experienceLevel && (
              <div>
                <dt className="font-medium text-[#1C1917]">Experience level</dt>
                <dd className="text-[#57534E]">{template.experienceLevel}</dd>
              </div>
            )}
          </dl>
          <p className="text-sm text-[#57534E] mt-3">
            Still right? You'll be able to adjust every part of it in the next steps — your words
            win over the template's.
          </p>
        </>,
      );
    }
    return card(
      <>
        <h2 className="font-medium text-[#1C1917] mb-2">Your own project, your own words</h2>
        <p className="text-sm text-[#57534E]">
          No template here — the next steps shape your idea into a project: what you want, what
          "done" looks like, and the guardrails your helper works within.
        </p>
      </>,
    );
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] px-4 sm:px-6 py-8">
      <div className="max-w-3xl mx-auto">
        {header(
          'Set up your project',
          intakeStep === 'closing'
            ? undefined
            : `Step ${stepIdx + 1} of ${INTAKE_STEPS.length} — your progress saves as you go`,
        )}

        {activeProject.sessionFirst && intakeStep === 'opening' && laneModule(true)}

        {intakeStep === 'opening' && openingCard()}

        {intakeStep === 'assistant' &&
          card(
            <>
              <h2 className="font-medium text-[#1C1917] mb-2">
                Which helper takes this project?
              </h2>
              <p className={helpCls}>
                {onboarding?.assistantProduct
                  ? `Your default is ${agentName(onboarding.assistantProduct)}. Keep it, or give this project a different helper.`
                  : 'Pick the AI helper for this project. Not sure is a fine answer — setup starts with Meta Muse guidance and nothing is blocked.'}
              </p>
              <div className="space-y-2">
                {AGENT_OPTIONS.map((a) => (
                  <label
                    key={a.id}
                    className="flex items-center gap-2 text-sm text-[#1C1917] bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg px-3 py-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="intake-assistant"
                      checked={assistantChoice === a.id}
                      onChange={() => setAssistantChoice(a.id)}
                    />
                    {a.name}
                  </label>
                ))}
              </div>
            </>,
          )}

        {intakeStep === 'layer' &&
          card(
            <>
              <h2 className="font-medium text-[#1C1917] mb-2">
                Setting up with {agentName(product)}
              </h2>
              {product === 'gemini' && (
                <div className="mb-3 rounded-lg border border-[#E6DFD3] bg-[#FBF9F5] px-3 py-2.5">
                  <p className="text-sm font-medium text-[#1C1917] mb-1">
                    One quick thing that changes this setup
                  </p>
                  <p className={helpCls}>
                    Is the Google account you'll use here a personal one, or a work or school
                    one? They don't offer the same things.
                  </p>
                  <div className="space-y-2 mt-2">
                    {(
                      [
                        { id: 'personal', label: 'Personal — my own Google account' },
                        { id: 'work', label: 'Work or school — an account an organization manages' },
                      ] as const
                    ).map((o) => (
                      <label
                        key={o.id}
                        className="flex items-center gap-2 text-sm text-[#1C1917] bg-white border border-[#E6DFD3] rounded-lg px-3 py-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="gemini-account-type"
                          checked={geminiAccountType === o.id}
                          onChange={() => void chooseGeminiAccountType(o.id)}
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                  {geminiAccountType === 'personal' && (
                    <p className="text-sm text-[#57534E] mt-2">
                      Personal account: your helper lives in a <strong>skill</strong> (Google is
                      retiring Gems on personal accounts this December), and skills need "Keep
                      Activity" turned on in your Google settings. Anything your helper does on a
                      schedule needs Google AI Plus — the steps below assume the free plan unless
                      they say otherwise.
                    </p>
                  )}
                  {geminiAccountType === 'work' && (
                    <p className="text-sm text-[#57534E] mt-2">
                      Work or school account: your organization's admin decides what's allowed.
                      Connecting Gmail or Calendar may need their approval, Gemini's automatic
                      Task mode isn't offered on work accounts, and Gems stay available there
                      until at least March 2027. If a step below doesn't appear for you, it's
                      usually an admin setting — not something you did wrong.
                    </p>
                  )}
                </div>
              )}
              {layer ? (
                <>
                  {layer.setupFeature && (
                    <p className="text-sm text-[#57534E] mb-2">
                      <span className="font-medium text-[#1C1917]">The feature: </span>
                      {layer.setupFeature}
                      {layer.minimumPlan ? ` · Works on: ${layer.minimumPlan}` : ''}
                    </p>
                  )}
                  {layer.setupPath && (
                    <p className="text-sm text-[#57534E] mb-3 whitespace-pre-wrap">
                      {layer.setupPath}
                    </p>
                  )}
                  {layer.memberSteps && layer.memberSteps.length > 0 && (
                    <>
                      <h3 className="text-sm font-medium text-[#1C1917] mb-1">Your steps</h3>
                      <ol className="text-sm text-[#57534E] list-decimal pl-5 space-y-1 mb-3">
                        {layer.memberSteps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                    </>
                  )}
                  {layer.willDo && layer.willDo.length > 0 && (
                    <>
                      <h3 className="text-sm font-medium text-[#1C1917] mb-1">
                        {agentName(product)} will
                      </h3>
                      <ul className="text-sm text-[#57534E] list-disc pl-5 space-y-1 mb-3">
                        {layer.willDo.map((w, i) => (
                          <li key={i}>{layerClaimText(w)}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {layer.wontDo && layer.wontDo.length > 0 && (
                    <>
                      <h3 className="text-sm font-medium text-[#1C1917] mb-1">
                        {agentName(product)} won't
                      </h3>
                      <ul className="text-sm text-[#57534E] list-disc pl-5 space-y-1 mb-3">
                        {layer.wontDo.map((w, i) => (
                          <li key={i}>{layerClaimText(w)}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {layer.fallback && (
                    <p className="text-sm text-[#57534E]">
                      <span className="font-medium text-[#1C1917]">If it forgets: </span>
                      {layer.fallback}
                    </p>
                  )}
                  {layer.basis && (
                    <p className="text-xs text-[#78716C] mt-3">{layer.basis}</p>
                  )}
                </>
              ) : layerText ? (
                <p className="text-sm text-[#57534E] whitespace-pre-wrap">{layerText}</p>
              ) : (
                <p className="text-sm text-[#57534E]">
                  The step-by-step setup for {agentName(product)} is still being written, so here's
                  the plain version that works everywhere: when you start a session with your
                  helper, paste your project's rules (you'll confirm them in the last step) at the
                  top, then tell it today's task. Your project here keeps the rules saved either
                  way.
                </p>
              )}
            </>,
          )}

        {intakeStep === 'slots' &&
          card(
            <>
              <h2 className="font-medium text-[#1C1917] mb-2">Make it yours</h2>
              <p className={helpCls}>
                These started from the template — change any of it. Your words are what your helper
                will actually work from.
              </p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls} htmlFor="slot-goal">
                    The goal, in your words
                  </label>
                  <textarea
                    id="slot-goal"
                    className={inputCls}
                    rows={3}
                    value={slots.goal || ''}
                    onChange={(e) => setSlot('goal', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="slot-specifics">
                    Anything specific your helper should know?
                  </label>
                  <p className={helpCls}>
                    Places, people, dates, preferences — whatever makes this yours. Fine to leave
                    blank.
                  </p>
                  <textarea
                    id="slot-specifics"
                    className={inputCls}
                    rows={3}
                    value={slots.specifics || ''}
                    onChange={(e) => setSlot('specifics', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="slot-done">
                    What does "done" look like?
                  </label>
                  <textarea
                    id="slot-done"
                    className={inputCls}
                    rows={2}
                    value={slots.done || ''}
                    onChange={(e) => setSlot('done', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="slot-rhythm">
                    How should your helper check in with you?
                  </label>
                  <textarea
                    id="slot-rhythm"
                    className={inputCls}
                    rows={2}
                    value={slots.rhythm || ''}
                    onChange={(e) => setSlot('rhythm', e.target.value)}
                  />
                </div>
              </div>
            </>,
          )}

        {intakeStep === 'guardrails' &&
          card(
            <>
              <h2 className="font-medium text-[#1C1917] mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Your guardrails
              </h2>
              <p className={helpCls}>
                This is the agreement your helper works under. Read each line — edit anything.
                Nothing is saved as your project until you confirm these are right.
              </p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls} htmlFor="g-do">
                    Your helper will
                  </label>
                  <textarea
                    id="g-do"
                    className={inputCls}
                    rows={3}
                    value={slots.g_do || ''}
                    onChange={(e) => setSlot('g_do', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="g-do-not">
                    Your helper will not
                  </label>
                  <textarea
                    id="g-do-not"
                    className={inputCls}
                    rows={3}
                    value={slots.g_do_not || ''}
                    onChange={(e) => setSlot('g_do_not', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="g-ask">
                    Ask me before
                  </label>
                  <textarea
                    id="g-ask"
                    className={inputCls}
                    rows={2}
                    value={slots.g_ask || ''}
                    onChange={(e) => setSlot('g_ask', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="g-report">
                    Report back
                  </label>
                  <textarea
                    id="g-report"
                    className={inputCls}
                    rows={2}
                    value={slots.g_report || ''}
                    onChange={(e) => setSlot('g_report', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="g-stop">
                    Stop and ask me if
                  </label>
                  <textarea
                    id="g-stop"
                    className={inputCls}
                    rows={2}
                    value={slots.g_stop || ''}
                    onChange={(e) => setSlot('g_stop', e.target.value)}
                  />
                </div>
                <label className="flex items-start gap-2 text-sm text-[#1C1917] cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  These guardrails are right. Save my project and start at rung 0 — my helper
                  suggests, I approve, nothing happens without me.
                </label>
                {saveError && <p className="text-sm text-[#991B1B]">{saveError}</p>}
              </div>
            </>,
          )}

        {intakeStep === 'closing' &&
          card(
            <>
              <h2 className="font-medium text-[#1C1917] mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Your project is set up
              </h2>
              <p className="text-sm text-[#57534E] mb-3">
                <span className="font-medium text-[#1C1917]">
                  {activeProject.title || template?.title || 'Your project'}
                </span>{' '}
                is active at rung 0 with {agentName(product)}: your helper suggests and drafts,
                you approve everything.
              </p>
              <h3 className="text-sm font-medium text-[#1C1917] mb-1">Your first step (10 minutes)</h3>
              <p className="text-sm text-[#57534E] mb-3">
                {template?.steps && template.steps.length > 0
                  ? template.steps[0]
                  : `Open ${agentName(product)}, paste your project rules from the project page, and tell it the goal in your own words.`}
              </p>
              <h3 className="text-sm font-medium text-[#1C1917] mb-1">How this works</h3>
              <ul className="text-sm text-[#57534E] list-disc pl-5 space-y-1 mb-3">
                <li>Your project page keeps the goal and guardrails — your helper works from them.</li>
                <li>
                  Check-ins follow the rhythm you set
                  {slots.rhythm ? `: ${slots.rhythm}` : '.'}
                </li>
                <li>As trust builds, you can raise the rung — only you can, only here in the app.</li>
                <li>Questions any time: ask the guide here, or message Nic from your plan page.</li>
              </ul>
              {template?.audience === 'business' && (
                <div className="bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg p-4 mb-3">
                  <p className="text-sm text-[#57534E]">
                    One offer, not a requirement: Nic likes to do a quick intro session with
                    business members, so everything is thought through and questions get answered
                    early. You can start building right now — book Nic whenever it suits you, or
                    not at all.
                  </p>
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={ghostBtn + ' mt-2'}
                  >
                    <Calendar className="w-4 h-4" /> Book a quick intro with Nic
                  </a>
                </div>
              )}
              {activeProject.sessionFirst && (
                <p className="text-sm text-[#57534E] mb-3">
                  And your session with Nic: if you haven't booked it yet, it's the centerpiece of
                  your package —{' '}
                  <a className="underline" href={bookingUrl} target="_blank" rel="noreferrer">
                    book it here
                  </a>
                  . Your project is ready either way.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button onClick={onClose} className={primaryBtn}>
                  <Check className="w-4 h-4" /> Back to my projects
                </button>
                <button
                  onClick={() => setPhase('picker')}
                  className={ghostBtn}
                >
                  Start another project
                </button>
              </div>
            </>,
          )}

        {intakeStep !== 'closing' && (
          <div className="flex items-center gap-2">
            {stepIdx > 0 && (
              <button onClick={intakeBack} className={ghostBtn}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {intakeStep !== 'guardrails' ? (
              <button onClick={intakeNext} className={primaryBtn}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={saveContract}
                disabled={!confirmed || !(slots.goal || '').trim() || saving}
                className={primaryBtn}
              >
                {saving ? 'Saving…' : 'Save my project'} <Check className="w-4 h-4" />
              </button>
            )}
            {intakeStep === 'guardrails' && !(slots.goal || '').trim() && (
              <span className="text-sm text-[#78716C]">Add a goal (previous step) to save.</span>
            )}
          </div>
        )}

        <p className="text-xs text-[#78716C] mt-6 flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" /> Stuck, or something looks wrong? Email Nic at
          nic@zateslo.com — a person answers.
        </p>
      </div>
    </div>
  );
};
