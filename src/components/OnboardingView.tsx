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
// Redesign spec (2026-10-29): setup is four steps — Overview, Agent & plan,
// Make it yours (guided questions), Review. The old platform-instructions
// step is gone: its warnings live in the Overview and its setup steps in
// the Begin chat. Saving produces a READY project (no token minted);
// Begin mints the token and confirms the helper loaded the brief.
type IntakeStep = 'overview' | 'agent' | 'questions' | 'review';
const INTAKE_STEPS: IntakeStep[] = ['overview', 'agent', 'questions', 'review'];
const LEGACY_STEP_MAP: Record<string, IntakeStep> = {
  opening: 'overview',
  assistant: 'agent',
  layer: 'agent',
  slots: 'questions',
  guardrails: 'review',
  closing: 'overview',
};

const PLAN_OPTIONS = [
  { id: 'free', name: 'Free' },
  { id: 'paid', name: 'Paid' },
  { id: 'notsure', name: "Not sure" },
];

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

// ---------- setup questions + deterministic contract composition ----------
// Spec sections 5-6: chip/choice answers are bounded vocabulary and may be
// woven into the contract as labeled lines; free text from the member is
// DATA (memberNotes / the served brief's "Member's notes" block), never
// concatenated into instruction fields — except on blank projects, where
// the member's own words are the contract's source, as the old flow did.
import type { TemplateQuestion } from '../lib/firebase.js';

const GENERIC_TEMPLATE_QUESTIONS: TemplateQuestion[] = [
  {
    id: 'specifics',
    label: 'Anything specific',
    prompt: 'Anything specific your helper should know about this project — places, people, dates, preferences?',
    type: 'text',
    required: false,
    mapsTo: 'memberNotes',
  },
  {
    id: 'when',
    label: 'When',
    prompt: 'When should this run, or when will you start it?',
    type: 'text',
    required: false,
    mapsTo: 'schedule',
  },
];

const BLANK_QUESTIONS: TemplateQuestion[] = [
  {
    id: 'your-idea',
    label: 'Your idea',
    prompt: 'What do you want help with? Say it the way you\'d say it to a person.',
    type: 'text',
    required: true,
    mapsTo: 'goal',
  },
  {
    id: 'how-often',
    label: 'How often',
    prompt: 'How often should this happen?',
    type: 'choice',
    options: ['Every day', 'Every week', 'When I ask', 'Once, to try it'],
    required: true,
    default: 'When I ask',
    mapsTo: 'schedule',
  },
  {
    id: 'never-do',
    label: 'Never do',
    prompt: 'Anything your helper should never do on this project?',
    type: 'text',
    required: false,
    mapsTo: 'do_not',
  },
  {
    id: 'check-in-style',
    label: 'Check-ins',
    prompt: 'How should your helper report back?',
    type: 'choice',
    options: ['A short summary', 'A detailed rundown', 'Only when something needs me'],
    required: false,
    default: 'A short summary',
    mapsTo: 'report_back',
  },
];

function effectiveQuestions(
  template: TemplateDoc | null,
  project: UserProjectDoc | null,
): TemplateQuestion[] {
  if (template?.questions && template.questions.length > 0) return template.questions;
  if (template || project?.templateSlug) return GENERIC_TEMPLATE_QUESTIONS;
  return BLANK_QUESTIONS;
}

function serializeAnswer(q: TemplateQuestion, raw: any): string {
  if (raw === undefined || raw === null) return '';
  if (Array.isArray(raw)) return raw.map((x) => String(x)).join(', ');
  if (typeof raw === 'object') return '';
  return String(raw);
}

function defaultAnswer(q: TemplateQuestion): string {
  if (q.default === undefined) return '';
  return serializeAnswer(q, q.default);
}

interface ComposedContract {
  contract: TaskContractFields;
  checkInRhythm: string;
  whatDoneLooksLike: string;
  memberNotes: string;
  whenText: string;
  goalAdditions: string[];
  sectionAdditions: Record<string, string[]>;
}

/** Deterministic fill (spec section 5): template lines are the base;
 * answers modify them by fixed rules only. No rephrasing, no model. */
function composeContract(
  template: TemplateDoc | null,
  project: UserProjectDoc | null,
  questions: TemplateQuestion[],
  answers: Record<string, string>,
): ComposedContract {
  const isBlank = !template;
  const base = (key: 'do' | 'do_not' | 'ask_me_before' | 'report_back' | 'stop_if'): string[] => {
    const fromTpl = template?.contract?.[key];
    const lines = asLines(fromTpl as any)
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length) return lines;
    if (isBlank) {
      return asLines((BLANK_GUARDRAILS as any)[key])
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };
  const sections: Record<string, string[]> = {
    do: base('do'),
    do_not: base('do_not'),
    ask_me_before: base('ask_me_before'),
    report_back: base('report_back'),
    stop_if: base('stop_if'),
  };
  const goalAdditions: string[] = [];
  const notes: string[] = [];
  if (project?.brainstormNotes?.trim()) notes.push(project.brainstormNotes.trim());
  let goalText = isBlank
    ? ''
    : template?.contract?.goal || template?.goalInOneSentence || project?.goalInOneSentence || '';
  let doneText = template?.whatDoneLooksLike || project?.whatDoneLooksLike || '';
  const scheduleParts: string[] = [];
  let daysPart = '';
  let timePart = '';

  for (const q of questions) {
    const ans = (answers[q.id] || '').trim();
    if (!ans) continue;
    const follow = (answers[`${q.id}__followup`] || '').trim();
    const isTextLike = q.type === 'text' || q.type === 'number';
    if (q.mapsTo === 'schedule') {
      if (q.type === 'days') daysPart = ans;
      else if (q.type === 'time') timePart = ans;
      else scheduleParts.push(ans);
      continue;
    }
    if (q.mapsTo === 'doneLooksLike') {
      doneText = ans;
      continue;
    }
    if (isTextLike) {
      if (isBlank && q.mapsTo === 'goal') {
        goalText = ans;
      } else if (q.mapsTo === 'goal') {
        goalAdditions.push(`${q.label}: ${ans}.`);
      } else if (isBlank && q.mapsTo !== 'memberNotes') {
        sections[q.mapsTo] = [
          ...sections[q.mapsTo],
          ...ans.split('\n').map((s) => s.trim()).filter(Boolean),
        ];
      } else {
        notes.push(`${q.label}: ${ans}${follow ? ` (${follow})` : ''}`);
      }
      continue;
    }
    // bounded-vocabulary answers become labeled lines in their section
    const line = `${q.label}: ${ans}.`;
    if (q.mapsTo === 'goal') goalAdditions.push(line);
    else if (q.mapsTo === 'memberNotes') notes.push(line);
    else sections[q.mapsTo] = [...sections[q.mapsTo], line];
    if (follow) notes.push(`${q.label} — more: ${follow}`);
  }

  let rhythm = '';
  if (daysPart && timePart) rhythm = `${daysPart} at ${timePart}`;
  else if (daysPart || timePart) rhythm = daysPart || timePart;
  if (scheduleParts.length) rhythm = [rhythm, ...scheduleParts].filter(Boolean).join(' · ');
  if (!rhythm) rhythm = template?.checkInRhythm || project?.checkInRhythm || '';

  const goalFull = [goalText, ...goalAdditions].filter(Boolean).join(' ');
  const memberNotes = notes.join('\n');
  return {
    contract: {
      goal: memberNotes ? `${goalFull}\n\nDetails from me: ${memberNotes}` : goalFull,
      do: sections.do.join('\n'),
      do_not: sections.do_not.join('\n'),
      ask_me_before: sections.ask_me_before.join('\n'),
      report_back: sections.report_back.join('\n'),
      stop_if: sections.stop_if.join('\n'),
    },
    checkInRhythm: rhythm,
    whatDoneLooksLike: doneText,
    memberNotes,
    whenText: rhythm,
    goalAdditions,
    sectionAdditions: sections,
  };
}

const TIER_RANK: Record<string, number> = { free: 0, paid: 1, premium: 2 };

/** Plan-fit lines for one layer under the member's stated plan (spec
 * section 4). Conflict-basis cells stay silent — nothing is claimed. */
function planFitLines(layer: TemplateLayer | null, planChoice: string): string[] {
  const lines: string[] = [];
  const modes = (layer as any)?.requirements?.runModes;
  if (!layer) return lines;
  if (!modes) {
    if (layer.minimumPlan) lines.push(`Works on: ${layer.minimumPlan}.`);
    return lines;
  }
  const planRank = planChoice === 'free' ? 0 : planChoice === 'paid' ? 1 : -1;
  const modeLine = (mode: any, label: string): string | null => {
    if (!mode) return null;
    if (mode.possible === false) return `${label}: can't run this way here.`;
    const mp = mode.minPlan;
    if (!mp) return `${label}: works.`;
    if (mp.basis === 'conflict') return null;
    const need = `${label}: needs ${mp.planName}${mp.priceMonthlyUSD ? ` ($${mp.priceMonthlyUSD}/month)` : ''}`;
    if (planRank < 0) return need + '.';
    const have = TIER_RANK[String(mp.tier || 'free').toLowerCase()] ?? 0;
    return have <= planRank ? `${label}: works on your plan.` : `${need} — your plan doesn't cover this yet.`;
  };
  const a = modeLine(modes.onDemand, 'When you start it yourself');
  const b = modeLine(modes.scheduled, 'On a schedule');
  if (a) lines.push(a);
  if (b) lines.push(b);
  if (modes.scheduled?.possible === false && (layer as any)?.requirements?.runFallback) {
    lines.push(`Instead: ${(layer as any).requirements.runFallback}`);
  }
  if (modes.onDemand?.degrades || modes.scheduled?.degrades) {
    lines.push('Some quality trade-offs apply on this helper — the steps will call them out.');
  }
  return lines;
}

/** Overview capability block: for a known agent, surface wontDo lines that
 * contradict what the project needs (spec section 3). */
function capabilityWarnings(template: TemplateDoc | null, layer: TemplateLayer | null): string[] {
  const req = (layer as any)?.requirements;
  if (!template || !layer || !req?.needs) return [];
  const wont = (layer.wontDo || []).map(layerClaimText).filter(Boolean);
  const checks: Array<[boolean, string[]]> = [
    [Boolean(req.needs.voiceReadAloud), ['voice', 'read aloud', 'audio', 'speak']],
    [Boolean(req.needs.fileUploads), ['file', 'upload', 'document', 'pdf']],
    [Boolean(req.needs.webBrowsing), ['web', 'brows', 'search the internet']],
    [Boolean(req.needs.calendarWrite || req.needs.calendarRead), ['calendar']],
    [Boolean(req.needs.emailSend || req.needs.emailRead), ['email', 'gmail']],
  ];
  const out: string[] = [];
  for (const [needed, words] of checks) {
    if (!needed) continue;
    for (const line of wont) {
      const low = line.toLowerCase();
      if (words.some((w) => low.includes(w))) out.push(line);
    }
  }
  return out;
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
  /** Called instead of onClose after a successful save: the redesign sends
   * the member back to the main UI, where a toast confirms the save. */
  onSaved?: (message: string) => void;
  onProjectsChanged: (projects: Record<string, UserProjectDoc>) => void;
}> = ({ user, projects, bookingUrl, initialProjectId, initialTemplateSlug, startAtPicker, onClose, onSaved, onProjectsChanged }) => {
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
  const [intakeStep, setIntakeStep] = useState<IntakeStep>('overview');
  const [slots, setSlots] = useState<Record<string, string>>({});
  const [planChoice, setPlanChoice] = useState<string>('notsure');
  const [qIndex, setQIndex] = useState(0);
  const [returnToReview, setReturnToReview] = useState(false);
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
    // Slots ARE the question answers now (plus __plan). Saved answers from
    // an interrupted intake pre-answer their questions (spec section 5).
    const seedAnswers: Record<string, string> = { ...(saved?.slots || {}) };
    setSlots(seedAnswers);
    setPlanChoice(seedAnswers.__plan || 'notsure');
    setAssistantChoice(saved?.agentChoice || onboarding?.assistantProduct || 'unsure');
    setGeminiAccountType(saved?.geminiAccountType || '');
    setConfirmed(false);
    setReturnToReview(false);
    const qs = effectiveQuestions(tpl, project);
    const firstUnanswered = qs.findIndex((q) => !(seedAnswers[q.id] || '').trim());
    setQIndex(firstUnanswered === -1 ? Math.max(0, qs.length - 1) : firstUnanswered);
    const mapped = LEGACY_STEP_MAP[saved?.step || ''];
    const resumeAt: IntakeStep =
      saved && !saved.completed && mapped ? mapped : 'overview';
    setIntakeStep(project.intake?.completed ? 'overview' : resumeAt);
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
            project.status === 'ready'
              ? `"${project.title || 'That project'}" is saved and ready. When you want to start it, choose "Begin this project" on its card in your projects.`
              : `"${project.title || 'That project'}" is already set up — there's nothing left to do here. You can open it from your projects.`,
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
    const questions = effectiveQuestions(template, activeProject);
    const composed = composeContract(template, activeProject, questions, slots);
    const product = assistantChoice === 'unsure' ? 'muse' : assistantChoice;
    // Redesign rule: saving makes the project READY, never active — the
    // helper only starts when the member begins it (Begin chat mints the
    // token and confirms the load). An already-live project keeps its state.
    const keepStatus =
      activeProject.status === 'active' || activeProject.status === 'paused'
        ? activeProject.status
        : 'ready';
    try {
      await saveUserProjectContract(user.uid, activeProject.projectId, {
        title: activeProject.title || template?.title,
        product,
        contract: composed.contract,
        rung: 0,
        status: keepStatus,
      });
      await updateUserProjectFields(user.uid, activeProject.projectId, {
        intake: {
          step: 'review',
          slots,
          agentChoice: assistantChoice,
          ...(geminiAccountType ? { geminiAccountType } : {}),
          completed: true,
          updatedAt: new Date().toISOString(),
        },
        ...(composed.whatDoneLooksLike.trim()
          ? { whatDoneLooksLike: composed.whatDoneLooksLike.trim() }
          : {}),
        ...(composed.checkInRhythm.trim()
          ? { checkInRhythm: composed.checkInRhythm.trim() }
          : {}),
      });
      if (onboarding && !onboarding.completed) {
        const saved = await saveMemberOnboarding(user.uid, {
          completed: true,
          assistantProduct: assistantChoice,
        });
        if (saved) setOnboarding(saved);
      }
      await refreshProjects();
      const title = activeProject.title || template?.title || 'Your project';
      if (onSaved) {
        onSaved(`${title} saved. Begin it when you're ready.`);
      } else {
        onClose();
      }
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
                  {t.shortDescription ||
                    t.goalInOneSentence ||
                    'A ready-made project with the steps written for you.'}
                </p>
                <button onClick={() => startTemplateProject(t)} className={ghostBtn}>
                  Explore this project
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
  const questions = effectiveQuestions(template, activeProject);
  const composed = composeContract(template, activeProject, questions, slots);
  const stepIdx = INTAKE_STEPS.indexOf(intakeStep as IntakeStep);
  const setSlot = (k: string, v: string) => setSlots((s) => ({ ...s, [k]: v }));

  const answerQuestion = async (q: TemplateQuestion, value: string) => {
    const next = { ...slots, [q.id]: value };
    setSlots(next);
    await persistIntake(intakeStep as IntakeStep, next, assistantChoice);
  };

  const followUpApplies = (q: TemplateQuestion): boolean => {
    if (!q.followUp) return false;
    const w = q.followUp.when;
    if (w === 'any' || w === 'always') return true;
    return (slots[q.id] || '').toLowerCase().includes(w.toLowerCase());
  };

  const advanceQuestion = () => {
    // Fold a multiChips "Other" free entry into the current answer.
    const cur = questions[qIndex];
    if (cur && (slots[`${cur.id}__other`] || '').trim()) {
      const merged = [slots[cur.id] || '', slots[`${cur.id}__other`].trim()]
        .filter(Boolean)
        .join(', ');
      const next = { ...slots, [cur.id]: merged, [`${cur.id}__other`]: '' };
      setSlots(next);
      void persistIntake(intakeStep as IntakeStep, next, assistantChoice);
    }
    if (returnToReview) {
      setReturnToReview(false);
      setIntakeStep('review');
      void persistIntake('review', slots, assistantChoice);
      return;
    }
    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      setIntakeStep('review');
      void persistIntake('review', slots, assistantChoice);
    }
  };

  const editQuestion = (qid: string) => {
    const idx = questions.findIndex((q) => q.id === qid);
    if (idx === -1) return;
    setQIndex(idx);
    setReturnToReview(true);
    setIntakeStep('questions');
  };

  const fitAgents = ['muse', 'grok', 'chatgpt', 'gemini'];
  const warnings = capabilityWarnings(template, layer);
  const fitLines = planFitLines(layer, planChoice);

  const chipBtn = (active: boolean) =>
    `px-3 py-1.5 rounded-full border text-sm transition-colors ${
      active
        ? 'bg-[#405D1A] text-white border-[#405D1A]'
        : 'bg-white text-[#1C1917] border-[#E6DFD3] hover:border-[#405D1A]'
    }`;

  const renderQuestionControls = (q: TemplateQuestion) => {
    const current = slots[q.id] || '';
    if (q.type === 'chips' || q.type === 'choice') {
      return (
        <div className="flex flex-wrap gap-2">
          {(q.options || []).map((opt) => (
            <button
              key={opt}
              type="button"
              className={chipBtn(current === opt)}
              onClick={() => void answerQuestion(q, opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }
    if (q.type === 'multiChips') {
      const selected = current ? current.split(', ').filter(Boolean) : [];
      const toggle = (opt: string) => {
        const next = selected.includes(opt)
          ? selected.filter((s) => s !== opt)
          : [...selected, opt];
        void answerQuestion(q, next.join(', '));
      };
      return (
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {(q.options || []).map((opt) => (
              <button
                key={opt}
                type="button"
                className={chipBtn(selected.includes(opt))}
                onClick={() => toggle(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          {q.allowOther && (
            <input
              className={inputCls}
              placeholder="Something else? Type it here — it joins your picks when you continue"
              value={slots[`${q.id}__other`] || ''}
              onChange={(e) => setSlot(`${q.id}__other`, e.target.value)}
            />
          )}
          <p className="text-xs text-[#78716C] mt-1">Pick any that fit, then Continue.</p>
        </div>
      );
    }
    if (q.type === 'days') {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const selected = current ? current.split(', ').filter(Boolean) : [];
      const presets: Record<string, string[]> = {
        'Every day': days,
        Weekdays: days.slice(0, 5),
        Weekends: days.slice(5),
      };
      return (
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.keys(presets).map((p) => (
              <button
                key={p}
                type="button"
                className={chipBtn(current === presets[p].join(', '))}
                onClick={() => void answerQuestion(q, presets[p].join(', '))}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {days.map((d) => (
              <button
                key={d}
                type="button"
                className={chipBtn(selected.includes(d))}
                onClick={() => {
                  const next = selected.includes(d)
                    ? selected.filter((s) => s !== d)
                    : [...selected, d];
                  void answerQuestion(q, next.join(', '));
                }}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (q.type === 'time') {
      return (
        <input
          type="time"
          className={inputCls + ' max-w-[200px]'}
          value={current}
          onChange={(e) => void answerQuestion(q, e.target.value)}
        />
      );
    }
    if (q.type === 'number') {
      return (
        <input
          type="number"
          min={0}
          className={inputCls + ' max-w-[200px]'}
          value={current}
          onChange={(e) => void answerQuestion(q, e.target.value)}
          placeholder="Type a number"
        />
      );
    }
    return (
      <textarea
        className={inputCls}
        rows={3}
        value={current}
        onChange={(e) => setSlot(q.id, e.target.value)}
        onBlur={() => void answerQuestion(q, slots[q.id] || '')}
        placeholder="Type your answer"
      />
    );
  };

  const reviewRow = (
    title: string,
    body: string,
    editQid?: string,
  ) => (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-[#F4F0E8] last:border-0">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-[#78716C]">{title}</p>
        <p className="text-sm text-[#1C1917] whitespace-pre-wrap">{body || '—'}</p>
      </div>
      {editQid && (
        <button
          type="button"
          onClick={() => editQuestion(editQid)}
          className="shrink-0 text-xs text-[#405D1A] underline"
        >
          Edit
        </button>
      )}
    </div>
  );

  const firstQidFor = (mapsTo: string) => questions.find((q) => q.mapsTo === mapsTo)?.id;

  const currentQ = questions[qIndex];
  const answeredCount = questions.filter((q) => (slots[q.id] || '').trim()).length;
  const currentAnswered = currentQ ? Boolean((slots[currentQ.id] || '').trim()) : false;
  const canAdvance =
    !currentQ || !currentQ.required || currentAnswered || Boolean(defaultAnswer(currentQ));

  return (
    <div className="min-h-screen bg-[#FBF9F5] px-4 sm:px-6 py-8">
      <div className="max-w-3xl mx-auto">
        {header(
          'Set up your project',
          `Step ${stepIdx + 1} of ${INTAKE_STEPS.length} — your progress saves as you go`,
        )}

        {activeProject.sessionFirst && intakeStep === 'overview' && laneModule(true)}

        {intakeStep === 'overview' &&
          card(
            <>
              {activeProject.startedAs === 'brainstorm-first' && activeProject.brainstormNotes ? (
                <>
                  <h2 className="font-medium text-[#1C1917] mb-2">Here's what you told us</h2>
                  <p className={helpCls}>
                    When you brainstormed this project, you worked out its shape. The next steps
                    check it with you — your edits win.
                  </p>
                  <div className="bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg p-4 text-sm text-[#1C1917] whitespace-pre-wrap mb-4">
                    {activeProject.brainstormNotes}
                  </div>
                </>
              ) : template ? (
                <>
                  <h2 className="font-medium text-[#1C1917] mb-2">{template.title}</h2>
                  {activeProject.startedAs === 'gift-arrival' && (
                    <p className="text-sm text-[#57534E] mb-3">
                      This project came with your gift. Here's what it does — setup takes about
                      five minutes, one step at a time.
                    </p>
                  )}
                  <p className="text-sm text-[#57534E] mb-4">
                    {template.narrative ||
                      template.goalInOneSentence ||
                      'A ready-made project with the steps written for you.'}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-medium text-[#1C1917] mb-2">Your own project, your own words</h2>
                  <p className="text-sm text-[#57534E] mb-4">
                    No template here — a few questions shape your idea into a project: what you
                    want, how often, and the guardrails your helper works within.
                  </p>
                </>
              )}

              {template && questions.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-[#1C1917] mb-1">You'll choose</h3>
                  <ul className="text-sm text-[#57534E] list-disc pl-5 space-y-0.5">
                    {questions.map((q) => (
                      <li key={q.id}>{q.label}</li>
                    ))}
                  </ul>
                </div>
              )}

              {template && assistantChoice !== 'unsure' && layer && (
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-[#1C1917] mb-1">
                    What {agentName(product)} can do for this project
                  </h3>
                  {layer.willDo && layer.willDo.length > 0 && (
                    <ul className="text-sm text-[#57534E] list-disc pl-5 space-y-0.5 mb-2">
                      {layer.willDo.slice(0, 4).map((w, i) => (
                        <li key={i}>{layerClaimText(w)}</li>
                      ))}
                    </ul>
                  )}
                  {warnings.length > 0 && (
                    <div className="rounded-lg border border-[#D9C98A] bg-[#FBF6E3] px-3 py-2">
                      <p className="text-sm font-medium text-[#1C1917] mb-1">Worth knowing</p>
                      <ul className="text-sm text-[#57534E] list-disc pl-5 space-y-0.5">
                        {warnings.map((w, i) => (
                          <li key={i}>
                            {agentName(product)} won't: {w}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-[#57534E] mt-1">
                        The Begin steps will show the workaround, if there is one.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {template && assistantChoice === 'unsure' && (
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-[#1C1917] mb-1">
                    How this project runs on each helper
                  </h3>
                  <div className="space-y-1.5">
                    {fitAgents.map((aid) => {
                      const l: any = template.platformLayers?.[aid];
                      const modes = l?.requirements?.runModes;
                      const sched = modes?.scheduled;
                      const schedText =
                        sched?.possible === false
                          ? 'No schedule'
                          : sched?.minPlan && sched.minPlan.basis !== 'conflict'
                            ? `Schedule needs ${sched.minPlan.planName}`
                            : sched
                              ? 'Can run on a schedule'
                              : 'Details in step 2';
                      return (
                        <p key={aid} className="text-sm text-[#57534E]">
                          <span className="font-medium text-[#1C1917]">{agentName(aid)}:</span>{' '}
                          {schedText}
                        </p>
                      );
                    })}
                  </div>
                  <p className="text-sm text-[#57534E] mt-2">
                    Next step helps you pick — "not sure" is a fine answer there too.
                  </p>
                </div>
              )}
            </>,
          )}

        {intakeStep === 'agent' &&
          card(
            <>
              <h2 className="font-medium text-[#1C1917] mb-2">Which helper takes this project?</h2>
              <p className={helpCls}>
                {onboarding?.assistantProduct
                  ? `Your default is ${agentName(onboarding.assistantProduct)}. Keep it, or give this project a different helper.`
                  : 'Pick the AI helper for this project. Not sure is a fine answer — setup starts with Meta Muse guidance and nothing is blocked.'}
              </p>
              <div className="space-y-2 mb-5">
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

              <h2 className="font-medium text-[#1C1917] mb-2">And your plan with them?</h2>
              <div className="space-y-2 mb-4">
                {PLAN_OPTIONS.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 text-sm text-[#1C1917] bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg px-3 py-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="intake-plan"
                      checked={planChoice === p.id}
                      onChange={() => {
                        setPlanChoice(p.id);
                        setSlot('__plan', p.id);
                      }}
                    />
                    {p.name}
                  </label>
                ))}
              </div>

              {layer && fitLines.length > 0 && (
                <div className="rounded-lg bg-[#FBF9F5] border border-[#E6DFD3] px-3 py-2.5 mb-4">
                  <p className="text-sm font-medium text-[#1C1917] mb-1">
                    What that means for this project
                  </p>
                  <ul className="text-sm text-[#57534E] list-disc pl-5 space-y-0.5">
                    {fitLines.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>
              )}

              {product === 'gemini' && (
                <div className="rounded-lg border border-[#E6DFD3] bg-[#FBF9F5] px-3 py-2.5">
                  <p className="text-sm font-medium text-[#1C1917] mb-1">
                    One quick thing that changes this setup
                  </p>
                  <p className={helpCls}>
                    Is the Google account you'll use here a personal one, or a work or school one?
                    They don't offer the same things.
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
                      schedule needs Google AI Plus — your steps will assume the free plan unless
                      they say otherwise.
                    </p>
                  )}
                  {geminiAccountType === 'work' && (
                    <p className="text-sm text-[#57534E] mt-2">
                      Work or school account: your organization's admin decides what's allowed.
                      Connecting Gmail or Calendar may need their approval, Gemini's automatic Task
                      mode isn't offered on work accounts, and Gems stay available there until at
                      least March 2027. If a step later doesn't appear for you, it's usually an
                      admin setting — not something you did wrong.
                    </p>
                  )}
                </div>
              )}
            </>,
          )}

        {intakeStep === 'questions' &&
          card(
            <>
              <h2 className="font-medium text-[#1C1917] mb-1">Make it yours</h2>
              <p className={helpCls}>
                A few quick questions — {answeredCount} of {questions.length} answered. Short
                answers are perfect; "not sure" always works.
              </p>

              <div className="space-y-4 mb-4">
                {questions.slice(0, qIndex).map((q) =>
                  (slots[q.id] || '').trim() ? (
                    <div key={q.id}>
                      <div className="bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg px-3 py-2 text-sm text-[#57534E] mb-1.5">
                        {q.prompt}
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-[#405D1A] text-white rounded-lg px-3 py-2 text-sm max-w-[85%]">
                          {slots[q.id]}
                          {(slots[`${q.id}__followup`] || '').trim() &&
                            ` — ${slots[`${q.id}__followup`]}`}
                        </div>
                      </div>
                    </div>
                  ) : null,
                )}
              </div>

              {currentQ && (
                <div>
                  <div className="bg-[#FBF9F5] border border-[#E6DFD3] rounded-lg px-3 py-2.5 text-sm text-[#1C1917] mb-3">
                    {currentQ.prompt}
                  </div>
                  {renderQuestionControls(currentQ)}
                  {followUpApplies(currentQ) && currentAnswered && (
                    <div className="mt-3">
                      <p className="text-sm text-[#57534E] mb-1">{currentQ.followUp!.prompt}</p>
                      <input
                        className={inputCls}
                        value={slots[`${currentQ.id}__followup`] || ''}
                        onChange={(e) => setSlot(`${currentQ.id}__followup`, e.target.value)}
                        onBlur={() =>
                          void persistIntake(intakeStep as IntakeStep, slots, assistantChoice)
                        }
                        placeholder="Optional — a sentence is plenty"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {qIndex > 0 && (
                      <button
                        type="button"
                        className={ghostBtn}
                        onClick={() => setQIndex(qIndex - 1)}
                      >
                        <ArrowLeft className="w-4 h-4" /> Previous question
                      </button>
                    )}
                    {!currentAnswered && defaultAnswer(currentQ) && (
                      <button
                        type="button"
                        className={ghostBtn}
                        onClick={() => void answerQuestion(currentQ, defaultAnswer(currentQ))}
                      >
                        Not sure — pick for me
                      </button>
                    )}
                    {!currentAnswered && !currentQ.required && (
                      <button type="button" className={ghostBtn} onClick={advanceQuestion}>
                        Skip
                      </button>
                    )}
                    <button
                      type="button"
                      className={primaryBtn}
                      disabled={!canAdvance}
                      onClick={advanceQuestion}
                    >
                      {returnToReview
                        ? 'Back to review'
                        : qIndex >= questions.length - 1
                          ? 'Review my project'
                          : 'Continue'}{' '}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    {!canAdvance && (
                      <span className="text-sm text-[#78716C]">
                        Answer this one to continue — or use "Not sure".
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-lg border border-[#E6DFD3] bg-white px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-[#78716C] mb-1">
                  Your project so far
                </p>
                <p className="text-sm text-[#1C1917] mb-1">
                  {composed.contract.goal.split('\n\nDetails from me:')[0] || 'Your goal will appear here.'}
                </p>
                {composed.checkInRhythm && (
                  <p className="text-sm text-[#57534E]">When: {composed.checkInRhythm}</p>
                )}
                {composed.memberNotes && (
                  <p className="text-sm text-[#57534E] whitespace-pre-wrap">
                    Your notes: {composed.memberNotes}
                  </p>
                )}
              </div>
            </>,
          )}

        {intakeStep === 'review' &&
          card(
            <>
              <h2 className="font-medium text-[#1C1917] mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Here's your project
              </h2>
              <p className={helpCls}>
                This card is the whole agreement — it's exactly what your helper will work from.
                Tap Edit on any row to change that answer.
              </p>
              <div className="mb-4">
                {reviewRow('When', composed.whenText || 'When you start it', firstQidFor('schedule'))}
                {reviewRow(
                  'Covers',
                  composed.goalAdditions.length
                    ? composed.goalAdditions.join(' ')
                    : composed.contract.goal.split('\n\nDetails from me:')[0],
                  firstQidFor('goal'),
                )}
                {reviewRow(
                  'Skips',
                  composed.sectionAdditions.do_not.join('\n') || 'Nothing skipped',
                  firstQidFor('do_not'),
                )}
                {reviewRow('Always', composed.contract.do, firstQidFor('do'))}
                {reviewRow('Never', composed.contract.do_not, firstQidFor('do_not'))}
                {reviewRow('Asks you first', composed.contract.ask_me_before, firstQidFor('ask_me_before'))}
                {reviewRow('Stops if', composed.contract.stop_if, firstQidFor('stop_if'))}
                {reviewRow('Check-ins', composed.checkInRhythm, firstQidFor('schedule'))}
                {composed.memberNotes &&
                  reviewRow('Your notes (shared as information, not instructions)', composed.memberNotes)}
              </div>

              <div className="rounded-lg bg-[#FBF9F5] border border-[#E6DFD3] px-3 py-2.5 mb-4">
                <p className="text-sm font-medium text-[#1C1917] mb-1">How much freedom?</p>
                <div className="flex items-center gap-1.5 mb-1.5" aria-hidden>
                  {[0, 1, 2, 3].map((r) => (
                    <span
                      key={r}
                      className={`w-2.5 h-2.5 rounded-full ${r === 0 ? 'bg-[#14532D]' : 'bg-[#E6DFD3] border border-[#D6CEBE]'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-[#57534E]">
                  You start at rung 0: your helper suggests and drafts, you approve everything,
                  nothing happens without you. Only you can raise the rung, later, here in the app.
                </p>
              </div>

              <label className="flex items-start gap-2 text-sm text-[#1C1917] cursor-pointer mb-3">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                This looks right. Save my project at rung 0 — my helper suggests, I approve,
                nothing happens without me.
              </label>
              {saveError && <p className="text-sm text-[#991B1B]">{saveError}</p>}
              {template?.audience === 'business' && (
                <p className="text-sm text-[#57534E] mt-2">
                  One note for business plans: Nic likes to do a quick intro session with business
                  members — encouraged, never required. You can start building the moment this is
                  saved, and book him whenever it suits you from your plan page.
                </p>
              )}
              {activeProject.sessionFirst && (
                <p className="text-sm text-[#57534E] mt-2">
                  Your session with Nic is the centerpiece of your package — book it any time from
                  the first setup step. This project saves either way; booking is never a gate.
                </p>
              )}
            </>,
          )}

        <div className="flex items-center gap-2">
          {stepIdx > 0 && intakeStep !== 'questions' && (
            <button
              onClick={() => void goIntakeStep(INTAKE_STEPS[stepIdx - 1])}
              className={ghostBtn}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {stepIdx > 0 && intakeStep === 'questions' && qIndex === 0 && (
            <button onClick={() => void goIntakeStep('agent')} className={ghostBtn}>
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {intakeStep === 'overview' && (
            <button onClick={() => void goIntakeStep('agent')} className={primaryBtn}>
              Begin customizing <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {intakeStep === 'agent' && (
            <button onClick={() => void goIntakeStep('questions')} className={primaryBtn}>
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {intakeStep === 'review' && (
            <button
              onClick={saveContract}
              disabled={!confirmed || saving}
              className={primaryBtn}
            >
              {saving ? 'Saving…' : 'Save my project'} <Check className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-[#78716C] mt-6 flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" /> Stuck, or something looks wrong? Email Nic at
          nic@zateslo.com — a person answers.
        </p>
      </div>
    </div>
  );
};
