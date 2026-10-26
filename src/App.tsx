import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  authService,
  authFetch,
  AuthUser,
  getUserConsent,
  saveUserConsent,
  getUserCorrectionsOptIn,
  saveUserCorrectionsOptIn,
  getUserSessionNotes,
  saveUserSessionNote,
  deleteUserSessionNote,
  SessionNote,
  saveConversation,
  getRecentProductConversation,
  listUserConversations,
  getUserConversation,
  deleteUserConversation,
  getUserProgressSummary,
  saveUserProgressSummary,
  deleteUserProgressSummary,
  getUserRoutinesProgress,
  saveUserRoutineProgress,
  RoutineProgressDoc,
  getUserToolsProfile,
  saveUserToolsProfile,
  ToolsProfileDoc,
  UserToolEntry,
  getUserProjects,
  saveUserProjectContract,
  updateUserProjectStatus,
  deleteUserProject,
  UserProjectDoc,
  TaskContractFields,
  StoredContractCard,
  AUDIT_AREAS,
  AuditArea,
  AuditRating,
  AuditAreaResult,
  AuditRunDoc,
  StoredScorecardCard,
  getUserAudits,
  saveUserAuditDoc,
  deleteAllUserHistory,
  clearUserLocalStorage,
  ProgressSummaryDoc,
  StoredConversation,
} from './lib/firebase.js';
import {
  CalmGuideLiveClient,
  ChatMessage,
} from './lib/live-client.js';
import { isScreenShareSupported, processUploadedImage } from './lib/screen-share.js';
import { TopNav } from './components/TopNav.js';
import { ConsentModal } from './components/ConsentModal.js';
import { ScreenShareBanner } from './components/ScreenShareBanner.js';
import { ScreenShareConsentModal } from './components/ScreenShareConsentModal.js';
import { GuidedAppCard } from './components/GuidedAppCard.js';
import { ReportForNicCard } from './components/ReportForNicCard.js';
import { TaskContractCard } from './components/TaskContractCard.js';
import { ScorecardCard } from './components/ScorecardCard.js';
import { CalendarReminderModal } from './components/CalendarReminderModal.js';
import { CalendarEscalationModal } from './components/CalendarEscalationModal.js';
import { NotesDrawer } from './components/NotesDrawer.js';
import { KnowledgeModal } from './components/KnowledgeModal.js';
import { ToolsProfileModal, ToolsCatalogData } from './components/ToolsProfileModal.js';
import { AdminView } from './components/AdminView.js';
import { LoginModal } from './components/LoginModal.js';
import {
  Mic,
  MicOff,
  Monitor,
  Upload,
  Send,
  ArrowRight,
  AlertCircle,
  LogOut,
  RotateCcw,
  Wrench,
  MoreHorizontal,
  FileText,
  ArrowUp,
  ArrowDown,
  Pause,
  Play,
  Trash2,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

function isCheckupAppId(appId?: string | null): boolean {
  return appId === 'safety-audit' || appId === 'weekly-review';
}

function createConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function buildGreetingMessage(progress: ProgressSummaryDoc | null, productName: string): string {
  if (progress) {
    const summaryText = progress.summary ? progress.summary.trim() : '';
    const nextStepText = progress.suggestedNextStep ? progress.suggestedNextStep.trim() : '';

    if (summaryText && nextStepText) {
      return `Welcome back. ${summaryText}\n\nSuggested next step: ${nextStepText} Want to pick up there, or start somewhere else?`;
    }
    if (summaryText) {
      return `Welcome back. ${summaryText} Want to pick up there, or start somewhere else?`;
    }
    if (nextStepText) {
      return `Welcome back. Suggested next step: ${nextStepText} Want to pick up there, or start somewhere else?`;
    }
  }

  return `Hello. I'm here to help you get comfortable with ${productName} at your own pace. What would you like to explore today?`;
}

export default function App() {
  // Navigation / View State
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);

  // User & Consent State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [hasAcceptedConsent, setHasAcceptedConsent] = useState<boolean>(true);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);

  // Products & Knowledge State
  const [currentProduct, setCurrentProduct] = useState<string>('muse');
  const [availableProducts, setAvailableProducts] = useState<Array<{ id: string; name: string; title: string }>>([
    { id: 'muse', name: 'Meta Muse', title: 'Meta Muse' },
  ]);
  const [knowledgeData, setKnowledgeData] = useState<any>(null);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState<boolean>(false);
  const [guidedApps, setGuidedApps] = useState<any[]>([]);
  const [showAppsSidebar, setShowAppsSidebar] = useState<boolean>(true);

  // Tools Profile & Catalog State
  const [toolsCatalog, setToolsCatalog] = useState<ToolsCatalogData | null>(null);
  const [toolsProfile, setToolsProfile] = useState<ToolsProfileDoc | null>(null);
  const [showToolsModal, setShowToolsModal] = useState<boolean>(false);

  // Health, Handoff & Booking Config from Server
  const [liveAvailable, setLiveAvailable] = useState<boolean>(true);
  const [bookingUrl, setBookingUrl] = useState<string>('https://cal.com/zateslo/second-look-checkup');
  const [sheetWebhookConfigured, setSheetWebhookConfigured] = useState<boolean>(false);

  const currentProductObj = availableProducts.find(p => p.id === currentProduct);
  const currentProductName = currentProductObj?.name || currentProductObj?.title || 'Meta Muse';

  // Live Audio & Screen Share State
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isConnectingLive, setIsConnectingLive] = useState<boolean>(false);
  const [isGuideSpeaking, setIsGuideSpeaking] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [screenShareSupported, setScreenShareSupported] = useState<boolean>(true);
  const [currentScreenFrame, setCurrentScreenFrame] = useState<string | null>(null);

  // Screen Share Consent Modal (Requested by agent)
  const [screensharePrompt, setScreensharePrompt] = useState<{
    isOpen: boolean;
    reason: string;
    onApprove: () => void;
    onDeny: () => void;
  }>({
    isOpen: false,
    reason: '',
    onApprove: () => {},
    onDeny: () => {},
  });

  // Session Notes, Progress Summary, Routine Progress, User Projects, Audits, Corrections Opt-In & Escalation
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [progressSummary, setProgressSummary] = useState<ProgressSummaryDoc | null>(null);
  const [routineProgressMap, setRoutineProgressMap] = useState<Record<string, RoutineProgressDoc>>({});
  const [userProjectsMap, setUserProjectsMap] = useState<Record<string, UserProjectDoc>>({});
  const [userAudits, setUserAudits] = useState<AuditRunDoc[]>([]);
  const [shareCorrectionsWithNic, setShareCorrectionsWithNic] = useState<boolean>(false);
  const [showCalendarReminderModal, setShowCalendarReminderModal] = useState<boolean>(false);
  const [openProjectMenuId, setOpenProjectMenuId] = useState<string | null>(null);
  const [pastConversations, setPastConversations] = useState<StoredConversation[]>([]);
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(false);
  const [showEscalationModal, setShowEscalationModal] = useState<boolean>(false);
  const [isEndingSession, setIsEndingSession] = useState<boolean>(false);

  // Chat Transcript State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for one-time Live Client & conversation persistence
  const clientRef = useRef<CalmGuideLiveClient | null>(null);
  const userRef = useRef<AuthUser | null>(null);
  const lastSignedInUidRef = useRef<string | null>(null);
  const currentProductRef = useRef<string>('muse');
  const currentProductNameRef = useRef<string>('Meta Muse');
  const progressSummaryRef = useRef<ProgressSummaryDoc | null>(null);
  const routineProgressMapRef = useRef<Record<string, RoutineProgressDoc>>({});
  const userProjectsMapRef = useRef<Record<string, UserProjectDoc>>({});
  const userAuditsRef = useRef<AuditRunDoc[]>([]);
  const activeAuditRunRef = useRef<{
    id: string;
    appId: string;
    startedAt: string;
    completedAt: string | null;
    results: Partial<Record<AuditArea, AuditAreaResult>>;
    previousAudit: AuditRunDoc | null;
    scorecardEmitted?: boolean;
  } | null>(null);
  const shareCorrectionsWithNicRef = useRef<boolean>(false);
  const guidedAppsRef = useRef<any[]>([]);
  const toolsProfileRef = useRef<ToolsProfileDoc | null>(null);
  const sessionNotesRef = useRef<SessionNote[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  const conversationIdRef = useRef<string>(createConversationId());
  const conversationStartedAtRef = useRef<string>(new Date().toISOString());
  const conversationReadyRef = useRef<boolean>(false);
  const saveDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userTurnCountRef = useRef<number>(0);
  const lastSummarizedTurnCountRef = useRef<number>(0);
  const lastSummarizedAtRef = useRef<number>(0);
  const isSummarizingRef = useRef<boolean>(false);

  userRef.current = user;
  if (user?.uid) {
    lastSignedInUidRef.current = user.uid;
  }
  currentProductRef.current = currentProduct;
  currentProductNameRef.current = currentProductName;
  progressSummaryRef.current = progressSummary;
  routineProgressMapRef.current = routineProgressMap;
  userProjectsMapRef.current = userProjectsMap;
  userAuditsRef.current = userAudits;
  shareCorrectionsWithNicRef.current = shareCorrectionsWithNic;
  guidedAppsRef.current = guidedApps;
  toolsProfileRef.current = toolsProfile;
  sessionNotesRef.current = sessionNotes;
  messagesRef.current = messages;

  // Flush current conversation to Firestore immediately (without calling listUserConversations)
  const flushSaveConversation = useCallback(
    async (overrideProduct?: string, overrideConvId?: string, overrideStartedAt?: string, overrideMsgs?: ChatMessage[]) => {
      if (saveDebounceTimerRef.current) {
        clearTimeout(saveDebounceTimerRef.current);
        saveDebounceTimerRef.current = null;
      }
      const u = userRef.current;
      if (!u || !conversationReadyRef.current) return;

      const prod = overrideProduct || currentProductRef.current;
      const convId = overrideConvId || conversationIdRef.current;
      const startedAt = overrideStartedAt || conversationStartedAtRef.current;
      const msgs = overrideMsgs || messagesRef.current;
      if (!msgs || msgs.length === 0) return;

      try {
        await saveConversation(u.uid, convId, {
          product: prod,
          startedAt,
          messages: msgs,
          summary: progressSummaryRef.current?.product === prod ? progressSummaryRef.current?.summary : undefined,
        });
      } catch (err: any) {
        setLiveError(
          err?.message ||
            "I couldn't save your latest conversation to your account just now. Your chat is still kept in this browser — check your connection."
        );
      }
    },
    []
  );

  // Run POST /api/summarize and save to users/{uid}/progress/{product}
  // Never summarize more than once every 5 minutes except when force === true (End session, routine completion, report send).
  // Never show summary rate-limit or summary failure errors in the amber banner — log them only.
  const runProgressSummarize = useCallback(
    async (options?: { force?: boolean }): Promise<string | void> => {
      const u = userRef.current;
      const prod = currentProductRef.current;
      const msgs = messagesRef.current;
      if (!u || !msgs || msgs.length === 0) return progressSummaryRef.current?.summary;

      const hasUserMessages = msgs.some(m => m.role === 'user');
      if (!hasUserMessages && !options?.force) {
        return progressSummaryRef.current?.summary;
      }

      if (
        !options?.force &&
        userTurnCountRef.current <= lastSummarizedTurnCountRef.current
      ) {
        return progressSummaryRef.current?.summary;
      }

      const now = Date.now();
      if (!options?.force && now - lastSummarizedAtRef.current < FIVE_MINUTES_MS) {
        return progressSummaryRef.current?.summary;
      }

      if (isSummarizingRef.current) {
        return progressSummaryRef.current?.summary;
      }
      isSummarizingRef.current = true;
      lastSummarizedTurnCountRef.current = userTurnCountRef.current;
      lastSummarizedAtRef.current = now;

      try {
        const routineState = clientRef.current?.getRoutineState() || null;
        const previousSummary = progressSummaryRef.current;

        const res = await authFetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product: prod,
            transcript: msgs.slice(-80).map(m => ({ role: m.role, text: m.text })),
            routineState,
            previousSummary,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.warn(
            `Summarize failed or rate-limited (HTTP ${res.status}):`,
            errData?.message || errData?.error || res.statusText
          );
          // Keep existing summary when /api/summarize fails
          return progressSummaryRef.current?.summary;
        }

        const data = await res.json();
        if (data && typeof data.summary === 'string' && data.summary.trim()) {
          const savedDoc = await saveUserProgressSummary(u.uid, prod, {
            done: data.done,
            inProgress: data.inProgress,
            boundariesAndPreferences: data.boundariesAndPreferences,
            openQuestions: data.openQuestions,
            suggestedNextStep: data.suggestedNextStep,
            summary: data.summary,
          });
          setProgressSummary(savedDoc);
          progressSummaryRef.current = savedDoc;
          clientRef.current?.updateConfig({ progressSummary: savedDoc });

          // Also attach the summary to the current conversation document
          await saveConversation(u.uid, conversationIdRef.current, {
            product: prod,
            startedAt: conversationStartedAtRef.current,
            messages: msgs,
            summary: savedDoc.summary,
          });

          return savedDoc.summary;
        }
      } catch (err: any) {
        console.warn('Summarize failed:', err);
      } finally {
        isSummarizingRef.current = false;
      }
      return progressSummaryRef.current?.summary;
    },
    []
  );

  // Initialize a fresh audit run when a check-up routine (safety-audit or weekly-review) starts
  const beginCheckupAuditRun = useCallback((appId: string) => {
    const u = userRef.current;
    const previousCompleted =
      userAuditsRef.current.find(
        a => a.results && Object.keys(a.results).length > 0
      ) || null;

    const runId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startedAt = new Date().toISOString();
    activeAuditRunRef.current = {
      id: runId,
      appId,
      startedAt,
      completedAt: null,
      results: {},
      previousAudit: previousCompleted,
      scorecardEmitted: false,
    };

    // Inject the previous audit's results into the system prompt so the guide can say what changed
    clientRef.current?.updateConfig({ latestAudit: previousCompleted });
    clientRef.current?.pushLiveContextRefresh(false, false, false, true);

    if (u) {
      saveUserAuditDoc(u.uid, runId, {
        appId,
        startedAt,
        completedAt: null,
        results: {},
      }).catch(err => console.warn('Failed to initialize audit doc:', err));
    }
  }, []);

  // Finalize a check-up routine run and emit the ScorecardCard
  const finalizeCheckupAndShowScorecard = useCallback(async (appId: string) => {
    if (!isCheckupAppId(appId)) return;
    const u = userRef.current;

    let run = activeAuditRunRef.current;
    if (!run || run.appId !== appId || run.scorecardEmitted) {
      if (run?.scorecardEmitted) return;
      const previousCompleted =
        userAuditsRef.current.find(
          a => a.results && Object.keys(a.results).length > 0
        ) || null;
      run = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        appId,
        startedAt: new Date().toISOString(),
        completedAt: null,
        results: {},
        previousAudit: previousCompleted,
        scorecardEmitted: false,
      };
      activeAuditRunRef.current = run;
    }

    run.scorecardEmitted = true;
    const completedAt = new Date().toISOString();
    run.completedAt = completedAt;

    // Ensure any completed check-up steps with an area have an entry in results even if the user checked steps manually
    const latestCardMsg = [...messagesRef.current]
      .reverse()
      .find(m => m.appCard && m.appCard.appId === appId);
    const routineSteps = latestCardMsg?.appCard?.steps || [];
    const results: Partial<Record<AuditArea, AuditAreaResult>> = { ...run.results };

    for (const step of routineSteps) {
      const areaKey = (step.area || '').trim().toLowerCase() as AuditArea;
      if (
        step.completed &&
        areaKey &&
        AUDIT_AREAS.includes(areaKey) &&
        !results[areaKey]
      ) {
        results[areaKey] = {
          rating: 'green',
          reason: step.note?.trim() || `${step.title} reviewed and confirmed.`,
        };
      }
    }

    run.results = results;

    // Build Fix list (at most 3 items) from red/amber areas and guide summary
    const fixList: string[] = [];
    for (const area of AUDIT_AREAS) {
      const entry = results[area];
      if (entry && (entry.rating === 'red' || entry.rating === 'amber')) {
        fixList.push(`${area.charAt(0).toUpperCase() + area.slice(1)}: ${entry.reason}`);
        if (fixList.length >= 3) break;
      }
    }
    if (fixList.length < 3 && progressSummaryRef.current?.suggestedNextStep) {
      const nextStep = progressSummaryRef.current.suggestedNextStep.trim();
      if (nextStep && !fixList.includes(nextStep)) {
        fixList.push(nextStep);
      }
    }

    const matchedApp = guidedAppsRef.current.find(a => a.id === appId);
    const title = matchedApp?.title
      ? `${matchedApp.title} Scorecard`
      : appId === 'weekly-review'
      ? '10-Minute Weekly Review Scorecard'
      : 'Safety & Privacy Check-up Scorecard';

    const scorecardCard: StoredScorecardCard = {
      auditId: run.id,
      appId,
      title,
      startedAt: run.startedAt,
      completedAt,
      results,
      previousResults: run.previousAudit?.results || null,
      fixList: fixList.slice(0, 3),
    };

    if (u) {
      try {
        const savedAudit = await saveUserAuditDoc(u.uid, run.id, {
          appId,
          startedAt: run.startedAt,
          completedAt,
          results,
        });
        const nextAudits = [
          savedAudit,
          ...userAuditsRef.current.filter(a => a.id !== savedAudit.id),
        ];
        setUserAudits(nextAudits);
        userAuditsRef.current = nextAudits;
        clientRef.current?.updateConfig({ latestAudit: savedAudit });
        clientRef.current?.pushLiveContextRefresh(false, false, false, true);
      } catch (err) {
        console.warn('Failed to save completed audit doc:', err);
      }
    }

    clientRef.current?.addMessage(
      'guide',
      `Here is your check-up scorecard for ${matchedApp?.title || 'this check-up'}.`,
      {
        source: 'typed',
        scorecardCard,
      }
    );
  }, []);

  // Create CalmGuideLiveClient ONCE on mount
  useEffect(() => {
    const client = new CalmGuideLiveClient({
      product: currentProductRef.current,
      productName: currentProductNameRef.current,
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
      // Voice WS goes to the standalone Cloud Run service, not App Hosting (its edge 403s WS upgrades)
      liveWsHost: 'secondlook-live-voice-1004814265359.us-east4.run.app',
      onTranscriptUpdate: (newMessages) => {
        setMessages(newMessages);
      },
      onLiveStateChange: (state) => {
        setIsLive(state.isLive);
        setIsConnectingLive(state.isConnecting);
        setIsGuideSpeaking(state.isSpeaking);
        setLiveError(state.error);
      },
      onRequestScreenshareConsent: (reason, onApprove, onDeny) => {
        setScreensharePrompt({
          isOpen: true,
          reason,
          onApprove: async () => {
            setScreensharePrompt(prev => ({ ...prev, isOpen: false }));
            const started = await onApprove();
            setIsScreenSharing(started);
            if (!started) {
              setLiveError(
                "Screen sharing wasn't started. You can share your screen anytime, or keep chatting without it."
              );
            }
          },
          onDeny: () => {
            setScreensharePrompt(prev => ({ ...prev, isOpen: false }));
            onDeny();
          },
        });
      },
      onStopScreenshareRequested: () => {
        setIsScreenSharing(false);
        setCurrentScreenFrame(null);
      },
      onScreenFrameUpdate: (frame) => {
        setCurrentScreenFrame(frame);
      },
      onAppLaunched: (appId) => {
        if (isCheckupAppId(appId)) {
          beginCheckupAuditRun(appId);
        }
        const prod = currentProductRef.current;
        authFetch(`/api/apps/${prod}`)
          .then(res => (res.ok ? res.json() : []))
          .then(apps => {
            if (!Array.isArray(apps)) return;
            const found = apps.find((a: any) => a.id === appId);
            if (found && clientRef.current) {
              const existingProg = routineProgressMapRef.current[found.id];
              const { appCard, isResumingInProgress, restoredStepNumber } =
                clientRef.current.buildAppCardWithRestoredProgress(found, existingProg);

              const introText = isResumingInProgress
                ? `You were on step ${restoredStepNumber} last time. Pick up there?`
                : `I've opened the "${found.title}" guide for you below:`;

              clientRef.current.addMessage('guide', introText, {
                source: 'typed',
                appCard,
              });

              const u = userRef.current;
              if (u) {
                const completedSteps = appCard.steps
                  .filter(s => Boolean(s.completed))
                  .map(s => ({
                    step: Number(s.number),
                    evidence: s.evidence || ('self' as const),
                    note: s.note,
                    at: s.at || new Date().toISOString(),
                  }));
                const status =
                  appCard.steps.length > 0 && completedSteps.length === appCard.steps.length
                    ? ('done' as const)
                    : ('in-progress' as const);
                saveUserRoutineProgress(u.uid, found.id, {
                  status,
                  completedSteps,
                  activeStep: appCard.activeStep || 1,
                })
                  .then(saved => {
                    setRoutineProgressMap(prev => ({ ...prev, [found.id]: saved }));
                  })
                  .catch(console.error);
              }
            }
          })
          .catch(console.error);
      },
      onNoteSaved: async (text) => {
        const u = userRef.current;
        const prod = currentProductRef.current;
        if (!u) return false;
        try {
          await saveUserSessionNote(u.uid, prod, text);
          const updatedNotes = await getUserSessionNotes(u.uid, prod);
          setSessionNotes(updatedNotes);
          return true;
        } catch (err: any) {
          setLiveError(
            err?.message ||
              "I couldn't save that note to your account just now. Check your connection and try again."
          );
          return false;
        }
      },
      onUserMessageTurn: () => {
        userTurnCountRef.current += 1;
        if (userTurnCountRef.current > 0 && userTurnCountRef.current % 8 === 0) {
          runProgressSummarize();
        }
      },
      onRoutineCompleted: (appId) => {
        runProgressSummarize({ force: true });
        if (isCheckupAppId(appId)) {
          finalizeCheckupAndShowScorecard(appId);
        }
        if (appId === 'getting-started') {
          setTimeout(() => {
            clientRef.current?.addMessage(
              'guide',
              "Now that you've finished Getting Started, would you like to pick the everyday tools you use (like Calendar or Email) so I can suggest projects that fit your setup?",
              {
                source: 'typed',
                openToolsAction: true,
              }
            );
          }, 300);
        }
      },
      onRoutineProgressUpdated: (appId, progress) => {
        const u = userRef.current;
        if (!u || !appId) return;
        saveUserRoutineProgress(u.uid, appId, progress)
          .then(saved => {
            setRoutineProgressMap(prev => ({ ...prev, [appId]: saved }));
          })
          .catch(console.error);
      },
      onToolsProfileUpdated: async (patch) => {
        const u = userRef.current;
        if (!u) return null;

        const current = toolsProfileRef.current || {
          devices: [],
          tools: [],
          other: '',
          updatedAt: new Date().toISOString(),
        };

        const undoSnapshot: ToolsProfileDoc = {
          devices: [...(current.devices || [])],
          tools: (current.tools || []).map(t => ({ ...t })),
          other: current.other || '',
          updatedAt: current.updatedAt || new Date().toISOString(),
        };

        const nextDevices = [...(current.devices || [])];
        const addedDevices: string[] = [];
        for (const dev of patch.devices || []) {
          const trimmed = String(dev || '').trim();
          if (trimmed && !nextDevices.includes(trimmed)) {
            nextDevices.push(trimmed);
            addedDevices.push(trimmed);
          }
        }

        const removeIds = new Set((patch.remove || []).map(r => String(r).toLowerCase().trim()));
        const removedNames: string[] = [];
        let nextTools: UserToolEntry[] = (current.tools || []).filter(t => {
          if (removeIds.has(t.id.toLowerCase())) {
            removedNames.push(t.name || t.id);
            return false;
          }
          return true;
        });

        const addedToolLabels: string[] = [];
        for (const item of patch.add || []) {
          if (!item || !item.id) continue;
          const existingIdx = nextTools.findIndex(t => t.id === item.id);
          const entry: UserToolEntry = {
            id: item.id,
            name: item.name || item.id,
            category: item.category || 'other',
            account: item.account === 'work' ? 'work' : 'personal',
            sensitive: Boolean(item.sensitive),
          };
          if (existingIdx !== -1) {
            nextTools[existingIdx] = entry;
          } else {
            nextTools.push(entry);
          }
          const shortName = entry.name.split('/')[0].trim();
          const detailParts: string[] = [entry.account];
          if (entry.sensitive) detailParts.push('sensitive');
          addedToolLabels.push(`${shortName} (${detailParts.join(', ')})`);
        }

        let nextOther = current.other || '';
        const otherAddedLabels: string[] = [];
        for (const rawOther of patch.otherAdded || []) {
          const clean = String(rawOther || '').trim();
          if (!clean) continue;
          const existingList = nextOther
            .split(',')
            .map(s => s.trim().toLowerCase())
            .filter(Boolean);
          if (!existingList.includes(clean.toLowerCase())) {
            nextOther = nextOther ? `${nextOther}, ${clean}` : clean;
            otherAddedLabels.push(clean);
          }
        }

        const summaryParts: string[] = [];
        if (addedToolLabels.length > 0) {
          summaryParts.push(`Added ${addedToolLabels.join(', ')} to your tools`);
        }
        if (otherAddedLabels.length > 0) {
          summaryParts.push(`Added ${otherAddedLabels.join(', ')} to your other tools`);
        }
        if (removedNames.length > 0) {
          summaryParts.push(`Removed ${removedNames.join(', ')} from your tools`);
        }
        if (addedDevices.length > 0) {
          summaryParts.push(`Saved ${addedDevices.join(', ')} to your devices`);
        }

        if (summaryParts.length === 0) {
          return null;
        }

        try {
          const saved = await saveUserToolsProfile(u.uid, {
            devices: nextDevices,
            tools: nextTools,
            other: nextOther,
          });
          setToolsProfile(saved);
          toolsProfileRef.current = saved;
          return {
            summaryLine: summaryParts.join(' · '),
            undoSnapshot,
          };
        } catch (err) {
          console.error('Failed to apply tools profile patch:', err);
          return null;
        }
      },
      onContractSaved: async (card) => {
        const u = userRef.current;
        if (!u) return null;
        try {
          const existing = userProjectsMapRef.current[card.projectId] || null;
          const saved = await saveUserProjectContract(u.uid, card.projectId, {
            title: card.title,
            product: currentProductRef.current,
            contract: card.contract,
            rung: card.rung,
            status: existing?.status || 'active',
          });
          setUserProjectsMap(prev => ({ ...prev, [saved.projectId]: saved }));
          userProjectsMapRef.current = {
            ...userProjectsMapRef.current,
            [saved.projectId]: saved,
          };
          return saved;
        } catch (err: any) {
          setLiveError(
            err?.message ||
              "I couldn't save your project contract to your account just now. Check your connection and try again."
          );
          return null;
        }
      },
      onAuditResultRecorded: async ({ appId, area, rating, reason }) => {
        const u = userRef.current;
        const targetAppId = isCheckupAppId(appId) ? appId : 'safety-audit';
        if (!activeAuditRunRef.current || activeAuditRunRef.current.appId !== targetAppId) {
          beginCheckupAuditRun(targetAppId);
        }
        const run = activeAuditRunRef.current!;
        run.results = {
          ...run.results,
          [area]: { rating, reason },
        };

        if (u) {
          try {
            const savedAudit = await saveUserAuditDoc(u.uid, run.id, {
              appId: run.appId,
              startedAt: run.startedAt,
              completedAt: run.completedAt,
              results: run.results,
            });
            const nextAudits = [
              savedAudit,
              ...userAuditsRef.current.filter(a => a.id !== savedAudit.id),
            ];
            setUserAudits(nextAudits);
            userAuditsRef.current = nextAudits;
          } catch (err) {
            console.warn('Failed to persist audit step result:', err);
          }
        }
      },
      onKnowledgeMismatchReported: async ({
        topic,
        notesSay,
        screenShows,
        device,
        alsoSavedSessionNote,
      }) => {
        const u = userRef.current;
        const prod = currentProductRef.current;

        // Always ensure a session note is saved if the model didn't already call save_session_note in the same turn
        if (u && !alsoSavedSessionNote) {
          const noteText = `Screen mismatch (${topic} on ${device}): notes said "${notesSay}", screen showed "${screenShows}".`.slice(
            0,
            500
          );
          try {
            await saveUserSessionNote(u.uid, prod, noteText);
            const updatedNotes = await getUserSessionNotes(u.uid, prod);
            setSessionNotes(updatedNotes);
          } catch (err) {
            console.warn('Failed to save mismatch session note:', err);
          }
        }

        let sentToSheetOk = false;
        if (shareCorrectionsWithNicRef.current) {
          try {
            const res = await authFetch('/api/corrections', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product: prod,
                device,
                topic,
                notesSay,
                screenShows,
              }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data?.ok === true) {
              sentToSheetOk = true;
            }
          } catch (err) {
            console.warn('Failed to send correction to Sheet:', err);
          }
        }

        const systemLine = sentToSheetOk
          ? `Noted: your screen differs from my notes about ${topic}. Sent to Nic so he can update the guide.`
          : `Noted: your screen differs from my notes about ${topic}.`;

        clientRef.current?.addMessage('system', systemLine);
      },
    });

    clientRef.current = client;

    return () => {
      client.stopLiveSession();
    };
  }, [runProgressSummarize, beginCheckupAuditRun, finalizeCheckupAndShowScorecard]);

  // Keep client config updated via client.updateConfig(partial) without recreating the client
  useEffect(() => {
    const latestCompletedAudit =
      userAudits.find(a => a.results && Object.keys(a.results).length > 0) || null;
    clientRef.current?.updateConfig({
      user,
      product: currentProduct,
      productName: currentProductName,
      progressSummary,
      sessionNotes: sessionNotes.map(n => n.text),
      toolsProfile,
      userProjects: userProjectsMap,
      latestAudit: activeAuditRunRef.current
        ? activeAuditRunRef.current.previousAudit
        : latestCompletedAudit,
    });
  }, [
    user,
    currentProduct,
    currentProductName,
    progressSummary,
    sessionNotes,
    toolsProfile,
    userProjectsMap,
    userAudits,
  ]);

  // Check URL path on load (/admin) and fetch public /api/products & /api/health
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setIsAdminView(true);
    }
    setScreenShareSupported(isScreenShareSupported());

    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (typeof data?.liveAvailable === 'boolean') {
          setLiveAvailable(data.liveAvailable);
        }
        if (data?.bookingUrl) setBookingUrl(data.bookingUrl);
        if (typeof data?.sheetWebhookConfigured === 'boolean') {
          setSheetWebhookConfigured(data.sheetWebhookConfigured);
        }
      })
      .catch(console.error);

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableProducts(
            data.map((p: any) => ({
              id: p.id,
              name: p.name || p.title || p.id,
              title: p.name || p.title || p.id,
            }))
          );
        }
      })
      .catch(console.error);
  }, []);

  // Load or restore conversation, progress summary, routine progress, tools profile, projects, audits, and notes for a given user & product
  const loadProductSessionAndMemory = useCallback(
    async (uid: string, product: string, productName: string) => {
      conversationReadyRef.current = false;
      try {
        const [
          notes,
          progressDoc,
          recentConv,
          routinesProg,
          loadedToolsProfile,
          loadedProjects,
          loadedAudits,
          correctionsOptIn,
        ] = await Promise.all([
          getUserSessionNotes(uid, product),
          getUserProgressSummary(uid, product),
          getRecentProductConversation(uid, product),
          getUserRoutinesProgress(uid),
          getUserToolsProfile(uid),
          getUserProjects(uid),
          getUserAudits(uid),
          getUserCorrectionsOptIn(uid),
        ]);

        setSessionNotes(notes);
        setProgressSummary(progressDoc);
        setRoutineProgressMap(routinesProg);
        setToolsProfile(loadedToolsProfile);
        toolsProfileRef.current = loadedToolsProfile;
        setUserProjectsMap(loadedProjects);
        userProjectsMapRef.current = loadedProjects;
        setUserAudits(loadedAudits);
        userAuditsRef.current = loadedAudits;
        setShareCorrectionsWithNic(correctionsOptIn);
        shareCorrectionsWithNicRef.current = correctionsOptIn;

        const latestCompletedAudit =
          loadedAudits.find(a => a.results && Object.keys(a.results).length > 0) || null;

        clientRef.current?.updateConfig({
          product,
          productName,
          progressSummary: progressDoc,
          sessionNotes: notes.map(n => n.text),
          toolsProfile: loadedToolsProfile,
          userProjects: loadedProjects,
          latestAudit: latestCompletedAudit,
        });

        const isRecent =
          recentConv &&
          Array.isArray(recentConv.messages) &&
          recentConv.messages.length > 0 &&
          Date.now() - new Date(recentConv.updatedAt).getTime() < TWENTY_FOUR_HOURS_MS;

        if (isRecent && recentConv) {
          conversationIdRef.current = recentConv.id;
          conversationStartedAtRef.current = recentConv.startedAt;
          userTurnCountRef.current = 0;
          lastSummarizedTurnCountRef.current = 0;
          clientRef.current?.setMessages(recentConv.messages);
        } else {
          const newId = createConversationId();
          const nowIso = new Date().toISOString();
          conversationIdRef.current = newId;
          conversationStartedAtRef.current = nowIso;
          userTurnCountRef.current = 0;
          lastSummarizedTurnCountRef.current = 0;
          const greeting = buildGreetingMessage(progressDoc, productName);
          clientRef.current?.setMessages([
            {
              id: `msg-${Date.now()}-greeting`,
              role: 'guide',
              text: greeting,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              source: 'typed',
            },
          ]);
        }
      } catch (err) {
        console.warn('Error loading product memory:', err);
      } finally {
        conversationReadyRef.current = true;
      }
    },
    []
  );

  // Load the conversation list when the Notes drawer opens
  useEffect(() => {
    if (showNotesDrawer && user) {
      listUserConversations(user.uid)
        .then(convs => setPastConversations(convs))
        .catch(console.error);
    }
  }, [showNotesDrawer, user]);

  // Auth observer (Google sign-in required; does NOT depend on currentProduct)
  useEffect(() => {
    const unsub = authService.onAuthStateChanged(async (u) => {
      if (u) {
        lastSignedInUidRef.current = u.uid;
        setUser(u);
        setAuthReady(true);

        authFetch('/api/me')
          .then(res => (res.ok ? res.json() : null))
          .then(data => setIsAdminUser(Boolean(data?.isAdmin)))
          .catch(() => setIsAdminUser(false));

        authFetch('/api/tools-catalog')
          .then(res => (res.ok ? res.json() : null))
          .then(data => {
            if (data && Array.isArray(data.categories)) {
              setToolsCatalog(data);
            }
          })
          .catch(console.error);

        const consent = await getUserConsent(u.uid);
        setHasAcceptedConsent(consent);
        setShowConsentModal(!consent);
        await loadProductSessionAndMemory(
          u.uid,
          currentProductRef.current,
          currentProductNameRef.current
        );
      } else {
        // Stop live session and screen share BEFORE rendering the login screen, and clear user localStorage keys
        const prevUid = lastSignedInUidRef.current || userRef.current?.uid;
        clientRef.current?.stopLiveSession();
        clientRef.current?.stopScreenShare();
        setIsScreenSharing(false);
        setCurrentScreenFrame(null);
        if (prevUid) {
          clearUserLocalStorage(prevUid);
        }
        lastSignedInUidRef.current = null;
        conversationReadyRef.current = false;
        setShowConsentModal(false);
        setShowToolsModal(false);
        setShowCalendarReminderModal(false);
        setSessionNotes([]);
        setProgressSummary(null);
        setRoutineProgressMap({});
        setUserProjectsMap({});
        userProjectsMapRef.current = {};
        setUserAudits([]);
        userAuditsRef.current = [];
        activeAuditRunRef.current = null;
        setShareCorrectionsWithNic(false);
        shareCorrectionsWithNicRef.current = false;
        setToolsProfile(null);
        setPastConversations([]);
        setIsAdminUser(false);
        setUser(null);
        setAuthReady(true);
      }
    });
    return unsub;
  }, [loadProductSessionAndMemory]);

  // Load authenticated knowledge and guided apps when signed in or product changes
  useEffect(() => {
    if (!user) return;

    authFetch(`/api/knowledge/${currentProduct}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) setKnowledgeData(data);
      })
      .catch(console.error);

    authFetch(`/api/apps/${currentProduct}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (Array.isArray(data)) setGuidedApps(data);
      })
      .catch(console.error);
  }, [user, currentProduct]);

  // 2-second debounced conversation save after messages change (without calling listUserConversations)
  useEffect(() => {
    if (!user || !conversationReadyRef.current || messages.length === 0) return;

    if (saveDebounceTimerRef.current) {
      clearTimeout(saveDebounceTimerRef.current);
    }

    const uid = user.uid;
    const convId = conversationIdRef.current;
    const prod = currentProduct;
    const startedAt = conversationStartedAtRef.current;
    const snapshotMessages = [...messages];

    saveDebounceTimerRef.current = setTimeout(() => {
      saveConversation(uid, convId, {
        product: prod,
        startedAt,
        messages: snapshotMessages,
        summary: progressSummaryRef.current?.product === prod ? progressSummaryRef.current?.summary : undefined,
      }).catch((err: any) => {
        setLiveError(
          err?.message ||
            "I couldn't save your latest progress to your account just now. Your chat is still kept in this browser — check your connection."
        );
      });
    }, 2000);

    return () => {
      if (saveDebounceTimerRef.current) {
        clearTimeout(saveDebounceTimerRef.current);
      }
    };
  }, [messages, user, currentProduct]);

  // On visibilitychange: ONLY flush-save the conversation. On pagehide: flush-save and best-effort summarize.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushSaveConversation();
      }
    };

    const handlePageHide = () => {
      flushSaveConversation();
      if (userTurnCountRef.current > 0) {
        runProgressSummarize();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [flushSaveConversation, runProgressSummarize]);

  // Auto-scroll transcript
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Switching product saves the previous conversation first, then loads or starts a conversation for the new product
  const handleSelectProduct = async (nextProduct: string) => {
    if (nextProduct === currentProduct) return;

    if (user && conversationReadyRef.current) {
      await flushSaveConversation(
        currentProduct,
        conversationIdRef.current,
        conversationStartedAtRef.current,
        messagesRef.current
      );
      if (userTurnCountRef.current > 0) {
        await runProgressSummarize();
      }
    }

    const nextProdObj = availableProducts.find(p => p.id === nextProduct);
    const nextProdName = nextProdObj?.name || nextProdObj?.title || nextProduct;

    setCurrentProduct(nextProduct);
    if (user) {
      await loadProductSessionAndMemory(user.uid, nextProduct, nextProdName);
    }
  };

  // "End session" button handler
  const handleEndSession = async () => {
    if (!user || !clientRef.current || isEndingSession) return;
    setIsEndingSession(true);
    try {
      if (isLive || isConnectingLive) {
        clientRef.current.stopLiveSession();
      }
      if (isScreenSharing) {
        clientRef.current.stopScreenShare();
        setIsScreenSharing(false);
        setCurrentScreenFrame(null);
      }

      await flushSaveConversation();
      await runProgressSummarize({ force: true });

      clientRef.current.addMessage(
        'system',
        'Session ended. Your conversation and progress summary have been saved for next time.'
      );
      await flushSaveConversation();
    } finally {
      setIsEndingSession(false);
    }
  };

  const handleConsentAccepted = async () => {
    setShowConsentModal(false);
    setHasAcceptedConsent(true);
    if (user) {
      await saveUserConsent(user.uid);
    }
  };

  const handleToggleMic = async () => {
    if (!clientRef.current) return;

    if (isLive || isConnectingLive) {
      clientRef.current.stopLiveSession();
    } else {
      if (!liveAvailable) {
        setLiveError('Voice is temporarily unavailable — typing works.');
        return;
      }
      setLiveError(null);
      await clientRef.current.startLiveSession();
    }
  };

  const handleToggleScreenShare = async () => {
    if (!clientRef.current) return;

    if (isScreenSharing) {
      clientRef.current.stopScreenShare();
      setIsScreenSharing(false);
      setCurrentScreenFrame(null);
    } else {
      const ok = await clientRef.current.startScreenShare();
      // Only set isScreenSharing to true if capture actually started
      setIsScreenSharing(ok);
      if (!ok) {
        setLiveError(
          "Screen sharing wasn't started. You can share your screen anytime, or keep chatting without it."
        );
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clientRef.current) return;

    try {
      const jpegBase64 = await processUploadedImage(file);
      clientRef.current.sendImageFrame(jpegBase64);
    } catch (err: any) {
      console.error('File upload failed:', err);
      setLiveError("Couldn't read that screenshot image. Please try another file.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !clientRef.current) return;
    const text = inputText;
    setInputText('');
    await clientRef.current.sendTextMessage(text);
  };

  const handleLaunchApp = async (app: any) => {
    if (!clientRef.current || !app) return;
    if (isCheckupAppId(app.id)) {
      beginCheckupAuditRun(app.id);
    }
    const existingProg = routineProgressMapRef.current[app.id] || null;
    await clientRef.current.startGuidedRoutine(app, existingProg);
  };

  const handleStartIncidentHelpNow = async () => {
    if (!clientRef.current) return;
    const found = guidedApps.find(a => a.id === 'something-went-wrong');
    if (found) {
      await handleLaunchApp(found);
      return;
    }
    try {
      const res = await authFetch(`/api/apps/${currentProduct}`);
      if (res.ok) {
        const apps = await res.json();
        if (Array.isArray(apps)) {
          setGuidedApps(apps);
          const incidentApp = apps.find((a: any) => a.id === 'something-went-wrong');
          if (incidentApp) {
            await handleLaunchApp(incidentApp);
          }
        }
      }
    } catch (err) {
      console.error('Failed to start something-went-wrong routine:', err);
    }
  };

  const handleSendScorecardReportToNic = (scorecard: StoredScorecardCard) => {
    if (!clientRef.current) return;
    const redLines: string[] = [];
    const checkedLines: string[] = [];
    for (const area of AUDIT_AREAS) {
      const entry = scorecard.results?.[area];
      if (!entry) continue;
      checkedLines.push(`${area}: ${entry.rating} (${entry.reason})`);
      if (entry.rating === 'red') {
        redLines.push(`${area}: ${entry.reason}`);
      }
    }
    const reportCard = {
      goal: `Review my ${scorecard.title || 'Check-up Scorecard'} and help resolve red safety areas.`,
      tried: checkedLines.join('; ').slice(0, 1000) || `Completed ${scorecard.title}.`,
      blocker:
        redLines.join('; ').slice(0, 1000) ||
        'One or more check-up areas were rated red and need a human review.',
    };
    clientRef.current.addMessage(
      'guide',
      "I've drafted a short note for Nic below with the red items from your scorecard. Have a look, change anything you like, and press Send if it looks right.",
      {
        source: 'typed',
        reportCard,
      }
    );
  };

  const handleToggleShareCorrections = async (enabled: boolean) => {
    setShareCorrectionsWithNic(enabled);
    shareCorrectionsWithNicRef.current = enabled;
    if (!user) return;
    try {
      await saveUserCorrectionsOptIn(user.uid, enabled);
    } catch (err: any) {
      setLiveError(
        err?.message || "I couldn't save that setting right now. Check your connection and try again."
      );
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    await deleteUserSessionNote(user.uid, noteId);
    const updated = await getUserSessionNotes(user.uid, currentProduct);
    setSessionNotes(updated);
  };

  const handleSaveManualProgressSummary = async (newSummaryText: string) => {
    if (!user) return;
    try {
      const updated = await saveUserProgressSummary(user.uid, currentProduct, {
        done: progressSummary?.done || [],
        inProgress: progressSummary?.inProgress || [],
        boundariesAndPreferences: progressSummary?.boundariesAndPreferences || [],
        openQuestions: progressSummary?.openQuestions || [],
        suggestedNextStep: progressSummary?.suggestedNextStep || '',
        summary: newSummaryText,
      });
      setProgressSummary(updated);
    } catch (err: any) {
      setLiveError(
        err?.message ||
          "I couldn't save your edited summary to your account just now. Check your connection and try again."
      );
    }
  };

  const handleDeleteProgressSummary = async () => {
    if (!user) return;
    await deleteUserProgressSummary(user.uid, currentProduct);
    setProgressSummary(null);
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!user) return;
    await deleteUserConversation(user.uid, convId);
    const allConvs = await listUserConversations(user.uid);
    setPastConversations(allConvs);
  };

  const handleDeleteAllHistory = async () => {
    if (!user) return;
    if (saveDebounceTimerRef.current) {
      clearTimeout(saveDebounceTimerRef.current);
      saveDebounceTimerRef.current = null;
    }
    await deleteAllUserHistory(user.uid);
    setSessionNotes([]);
    setProgressSummary(null);
    setRoutineProgressMap({});
    setUserProjectsMap({});
    userProjectsMapRef.current = {};
    setUserAudits([]);
    userAuditsRef.current = [];
    activeAuditRunRef.current = null;
    setToolsProfile(null);
    toolsProfileRef.current = null;
    setPastConversations([]);
    const newId = createConversationId();
    conversationIdRef.current = newId;
    conversationStartedAtRef.current = new Date().toISOString();
    userTurnCountRef.current = 0;
    const greeting = buildGreetingMessage(null, currentProductName);
    clientRef.current?.setMessages([
      {
        id: `msg-${Date.now()}-greeting`,
        role: 'guide',
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'typed',
      },
    ]);
  };

  const handleSaveToolsProfile = async (
    nextProfile: { devices: string[]; tools: UserToolEntry[]; other: string },
    shareAnonymously: boolean
  ) => {
    if (!user) return;
    const saved = await saveUserToolsProfile(user.uid, nextProfile);
    setToolsProfile(saved);
    toolsProfileRef.current = saved;
    clientRef.current?.updateConfig({ toolsProfile: saved });
    clientRef.current?.pushLiveContextRefresh(false, true);

    if (shareAnonymously) {
      const res = await authFetch('/api/tools-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devices: saved.devices,
          tools: saved.tools,
          other: saved.other,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok !== true) {
        throw new Error(
          data?.message ||
            "Your tools profile was saved to your account, but anonymous sharing with Nic couldn't be completed right now."
        );
      }
    }
  };

  const handleUndoToolsProfile = async (messageId: string, snapshot: ToolsProfileDoc) => {
    if (!user) return;
    try {
      const restored = await saveUserToolsProfile(user.uid, {
        devices: snapshot.devices || [],
        tools: snapshot.tools || [],
        other: snapshot.other || '',
      });
      setToolsProfile(restored);
      toolsProfileRef.current = restored;
      clientRef.current?.updateConfig({ toolsProfile: restored });
      clientRef.current?.markToolsUndoApplied(messageId);
    } catch (err: any) {
      setLiveError(
        err?.message || "I couldn't undo that change right now. You can edit your tools anytime from 'Your tools'."
      );
    }
  };

  const getProjectRungMeta = (projectId: string, rung: 0 | 1 | 2 | 3) => {
    const matchedApp = guidedApps.find(a => a.id === projectId);
    const title =
      userProjectsMap[projectId]?.title || matchedApp?.title || projectId;
    const rawLadder: Record<string, string> =
      matchedApp?.ladder && typeof matchedApp.ladder === 'object'
        ? matchedApp.ladder
        : {
            '0': 'Watch & learn — you do it; Muse helps you think.',
            '1': 'Draft only — prepares it; you review and send.',
            '2': 'Act inside boundaries — acts on routine items; asks before edge cases.',
            '3': 'Scheduled with digest — runs on a schedule and sends a summary.',
          };
    const fallbackNames: Record<number, string> = {
      0: 'Watch & learn',
      1: 'Draft only',
      2: 'Act inside boundaries',
      3: 'Scheduled with digest',
    };
    const ladder: Array<{ rung: number; name: string; text: string }> = [0, 1, 2, 3].map(r => {
      const raw = String(rawLadder[String(r)] || '');
      const match = raw.match(/^([^—–-]+)[—–-]\s*(.+)$/);
      return {
        rung: r,
        name: match ? match[1].trim() : fallbackNames[r] || `Rung ${r}`,
        text: match ? match[2].trim() : raw,
      };
    });
    const currentItem = ladder.find(l => l.rung === rung) || ladder[1];
    return {
      title,
      ladder,
      rungName: currentItem.name,
      rungText: currentItem.text,
    };
  };

  const handleViewProjectContract = (project: UserProjectDoc) => {
    setOpenProjectMenuId(null);
    if (!clientRef.current) return;
    const { title, ladder, rungName, rungText } = getProjectRungMeta(
      project.projectId,
      project.rung
    );
    const card: StoredContractCard = {
      projectId: project.projectId,
      title,
      contract: { ...project.contract },
      rung: project.rung,
      rungName,
      rungText,
      ladder,
      saved: true,
    };
    clientRef.current.addMessage(
      'guide',
      `Here is your task contract for ${title} (currently at Rung ${project.rung}: ${rungName}):`,
      {
        source: 'typed',
        contractCard: card,
      }
    );
  };

  const handleMoveProjectRung = async (project: UserProjectDoc, direction: 'up' | 'down') => {
    setOpenProjectMenuId(null);
    if (!clientRef.current) return;
    const { title } = getProjectRungMeta(project.projectId, project.rung);
    const targetRung =
      direction === 'up'
        ? Math.min(3, project.rung + 1)
        : Math.max(0, project.rung - 1);
    const prompt =
      direction === 'up'
        ? `I'd like to move ${title} up to rung ${targetRung}`
        : `I'd like to move ${title} down to rung ${targetRung}`;
    await clientRef.current.sendTextMessage(prompt);
  };

  const handleTogglePauseProject = async (project: UserProjectDoc) => {
    setOpenProjectMenuId(null);
    if (!user) return;
    const nextStatus = project.status === 'paused' ? 'active' : 'paused';
    try {
      const updated = await updateUserProjectStatus(
        user.uid,
        project.projectId,
        nextStatus
      );
      if (updated) {
        const nextMap = { ...userProjectsMapRef.current, [project.projectId]: updated };
        setUserProjectsMap(nextMap);
        userProjectsMapRef.current = nextMap;
        clientRef.current?.updateConfig({ userProjects: nextMap });
        clientRef.current?.pushLiveContextRefresh(false, false, true);
      }
    } catch (err: any) {
      setLiveError(
        err?.message || "I couldn't update that project right now. Check your connection and try again."
      );
    }
  };

  const handleDeleteProject = async (project: UserProjectDoc) => {
    setOpenProjectMenuId(null);
    if (!user) return;
    try {
      await deleteUserProject(user.uid, project.projectId);
      const nextMap = { ...userProjectsMapRef.current };
      delete nextMap[project.projectId];
      setUserProjectsMap(nextMap);
      userProjectsMapRef.current = nextMap;
      clientRef.current?.updateConfig({ userProjects: nextMap });
      clientRef.current?.pushLiveContextRefresh(false, false, true);
    } catch (err: any) {
      setLiveError(
        err?.message || "I couldn't delete that project right now. Check your connection and try again."
      );
    }
  };

  // Compute current routine progress & progress summary for ReportForNicCard
  const latestAppCardMsg = [...messages].reverse().find(m => m.appCard);
  const currentRoutineProgress = latestAppCardMsg?.appCard
    ? `${latestAppCardMsg.appCard.title}: ${
        latestAppCardMsg.appCard.steps.filter(s => s.completed).length
      }/${latestAppCardMsg.appCard.steps.length} steps completed`
    : '';
  const currentProgressSummary =
    progressSummary?.summary || (sessionNotes.length > 0 ? sessionNotes[0].text : '');

  // Require Google sign-in to use the app or /admin
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] flex items-center justify-center font-sans">
        <span className="text-xs text-[#78716C] font-mono">Loading Calm Guide...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] flex flex-col font-sans">
        <LoginModal
          isOpen={true}
          canClose={false}
          onSuccess={(u) => {
            setUser(u);
          }}
        />
      </div>
    );
  }

  // If viewing /admin (user is signed in)
  if (isAdminView) {
    return (
      <AdminView
        user={user}
        onBack={() => {
          setIsAdminView(false);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  const latestRetryMessage = [...messages].reverse().find(m => m.role === 'system' && m.retryText);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] flex flex-col font-sans selection:bg-[#EAE4D7]">
      {/* Top Bar Contract */}
      <TopNav
        user={user}
        isAdmin={isAdminUser}
        currentProduct={currentProduct}
        onSelectProduct={handleSelectProduct}
        availableProducts={availableProducts}
        onOpenKnowledge={() => setShowKnowledgeModal(true)}
        onOpenTools={() => setShowToolsModal(true)}
        onOpenApps={() => setShowAppsSidebar(prev => !prev)}
        onOpenNotes={() => setShowNotesDrawer(true)}
        onOpenEscalation={() => setShowEscalationModal(true)}
        onOpenAdmin={() => {
          setIsAdminView(true);
          window.history.pushState({}, '', '/admin');
        }}
        onSignOut={async () => {
          const uidToClear = user?.uid || lastSignedInUidRef.current;
          clientRef.current?.stopLiveSession();
          clientRef.current?.stopScreenShare();
          setIsScreenSharing(false);
          setCurrentScreenFrame(null);
          await flushSaveConversation();
          if (uidToClear) {
            clearUserLocalStorage(uidToClear);
          }
          await authService.signOut();
        }}
        onSignIn={() => {}}
      />

      {/* Screen Share Persistent Banner */}
      <ScreenShareBanner
        isSharing={isScreenSharing}
        currentFramePreview={currentScreenFrame}
        onStop={() => {
          clientRef.current?.stopScreenShare();
          setIsScreenSharing(false);
          setCurrentScreenFrame(null);
        }}
      />

      {/* Persistent Human Escalation & Incident Help Strip */}
      <div className="bg-[#F4F0E8] border-b border-[#E6DFD3] px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#57534E]">
          <span className="font-semibold text-[#1C1917]">Least access first:</span>
          <span className="hidden sm:inline">
            You are in control. No passwords or API keys are ever stored.
          </span>
          {knowledgeData?.isStale && (
            <span className="text-[#9A3412] font-mono text-[11px] ml-2">
              · Notes {knowledgeData.daysOld}d old (share screen to confirm UI changes)
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleStartIncidentHelpNow}
            className="text-[#57534E] hover:text-[#9A3412] font-medium underline transition-colors"
          >
            Something unexpected? Get help now
          </button>

          <button
            type="button"
            onClick={() => setShowEscalationModal(true)}
            className="text-[#1C1917] hover:text-[#9A3412] font-medium flex items-center gap-1 underline transition-colors"
          >
            <span>Need a human review? Talk to Nic</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row overflow-hidden">
        {/* Chat / Conversation Panel */}
        <div className="flex-1 flex flex-col h-[calc(100vh-140px)] border-r border-[#E6DFD3] bg-[#FBF9F5]">
          {/* Transcript Scroll Area */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-5"
          >
            {messages.map((m) => {
              const isGuide = m.role === 'guide';
              const isSystem = m.role === 'system';

              if (isSystem) {
                return (
                  <div key={m.id} className="text-center my-3">
                    <span className="text-[11px] font-mono text-[#78716C] bg-[#F4F0E8] border border-[#E6DFD3] px-3 py-1 rounded-full inline-flex items-center gap-2">
                      <span>{m.text}</span>
                      {m.undoToolsProfileSnapshot && (
                        m.undoApplied ? (
                          <span className="text-[10px] text-[#78716C] italic">Undone</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleUndoToolsProfile(m.id, m.undoToolsProfileSnapshot!)
                            }
                            className="underline text-[#9A3412] hover:text-[#1C1917] font-sans font-medium transition-colors"
                          >
                            Undo
                          </button>
                        )
                      )}
                      {m.retryText && (
                        <button
                          type="button"
                          onClick={() => clientRef.current?.retryTextMessage(m.id, m.retryText!)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1C1917] text-white hover:bg-[#292524] text-[10px] font-sans font-medium transition-colors"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Try again</span>
                        </button>
                      )}
                    </span>

                    {m.bookingUrl && (
                      <div className="mt-2 text-center">
                        <a
                          href={m.bookingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1C1917] bg-white border border-[#E6DFD3] px-3 py-1.5 rounded-lg hover:bg-stone-50"
                        >
                          <span>Open Nic's booking page</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isGuide ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] text-[#78716C]">
                    <span className="font-medium text-[#1C1917]">
                      {isGuide ? 'Calm Guide' : user?.displayName || 'You'}
                    </span>
                    {m.source === 'spoken' && (
                      <span
                        className="inline-flex items-center text-[#9A3412]"
                        title="Spoken via live voice"
                      >
                        <Mic className="w-3 h-3" />
                      </span>
                    )}
                    <span>·</span>
                    <span className="font-mono text-[10px]">{m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-2xl rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                      isGuide
                        ? 'bg-white border border-[#E6DFD3] text-[#1C1917] shadow-2xs'
                        : 'bg-[#1C1917] text-[#FBF9F5]'
                    }`}
                  >
                    {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}

                    {m.openToolsAction && (
                      <div className="mt-3 pt-2.5 border-t border-[#E6DFD3]">
                        <button
                          type="button"
                          onClick={() => setShowToolsModal(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-medium transition-colors"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Open Your tools</span>
                        </button>
                      </div>
                    )}

                    {/* Stepped Guided App Card if attached */}
                    {m.appCard && (
                      <GuidedAppCard
                        appId={m.appCard.appId}
                        title={m.appCard.title}
                        goal={m.appCard.goal}
                        activeStep={m.appCard.activeStep || 1}
                        steps={m.appCard.steps}
                        onStepToggle={(stepNumber, isDone) => {
                          clientRef.current?.toggleRoutineStep(m.appCard!.appId, stepNumber, isDone);
                        }}
                        onSelectStep={(stepNumber) => {
                          clientRef.current?.setRoutineActiveStep(m.appCard!.appId, stepNumber);
                        }}
                        onAskAboutStep={(stepNumber, stepTitle) => {
                          clientRef.current?.sendTextMessage(
                            `Can we focus on Step ${stepNumber}: "${stepTitle}"? What should I check or do here?`
                          );
                        }}
                        onOpenCalendarReminder={() => setShowCalendarReminderModal(true)}
                        onComplete={() => {
                          const appId = m.appCard?.appId || '';
                          const isGettingStarted = appId === 'getting-started';
                          const savedNote = clientRef.current?.hasSavedNoteInRoutine();
                          const completionText = savedNote
                            ? `Great job completing the ${m.appCard?.title} routine! I have recorded your session notes.`
                            : isGettingStarted
                            ? `Great job completing the ${m.appCard?.title} routine! Would you like to pick the everyday tools you use so I can suggest projects that fit your setup?`
                            : `Great job completing the ${m.appCard?.title} routine!`;
                          clientRef.current?.addMessage('guide', completionText, {
                            source: 'typed',
                            openToolsAction: isGettingStarted,
                          });
                          if (isCheckupAppId(appId)) {
                            finalizeCheckupAndShowScorecard(appId);
                          }
                          runProgressSummarize({ force: true });
                        }}
                      />
                    )}

                    {/* Scorecard Card if shown when a check-up finishes */}
                    {m.scorecardCard && (
                      <ScorecardCard
                        scorecard={m.scorecardCard}
                        onOpenCalendarReminder={() => setShowCalendarReminderModal(true)}
                        onSendReportToNic={handleSendScorecardReportToNic}
                      />
                    )}

                    {/* Report for Nic Card if drafted by escalate_to_owner */}
                    {m.reportCard && (
                      <ReportForNicCard
                        initialGoal={m.reportCard.goal}
                        initialTried={m.reportCard.tried}
                        initialBlocker={m.reportCard.blocker}
                        initialSentRefId={m.reportCard.sentRefId}
                        product={currentProduct}
                        productName={currentProductName}
                        transcript={messages.map(msg => ({ role: msg.role, text: msg.text }))}
                        routineProgress={currentRoutineProgress}
                        progressSummary={currentProgressSummary}
                        bookingUrl={bookingUrl}
                        sheetWebhookConfigured={sheetWebhookConfigured}
                        onBeforeSendReport={() => runProgressSummarize({ force: true })}
                        onSent={(refId) => {
                          clientRef.current?.markReportCardSent(m.id, refId);
                          clientRef.current?.addMessage(
                            'system',
                            `Sent to Nic. Reference: ${refId}`
                          );
                        }}
                      />
                    )}

                    {/* Task Contract Card if created by save_task_contract or View contract */}
                    {m.contractCard && (
                      <TaskContractCard
                        card={m.contractCard}
                        productName={currentProductName}
                        onSave={async (updatedContract, effectiveRung) => {
                          if (!user) return;
                          const existing =
                            userProjectsMapRef.current[m.contractCard!.projectId] || null;
                          const savedDoc = await saveUserProjectContract(
                            user.uid,
                            m.contractCard!.projectId,
                            {
                              title: m.contractCard!.title,
                              product: currentProduct,
                              contract: updatedContract,
                              rung: effectiveRung,
                              status: existing?.status || 'active',
                            }
                          );
                          const nextMap = {
                            ...userProjectsMapRef.current,
                            [savedDoc.projectId]: savedDoc,
                          };
                          setUserProjectsMap(nextMap);
                          userProjectsMapRef.current = nextMap;
                          clientRef.current?.updateConfig({ userProjects: nextMap });
                          const nextCard: StoredContractCard = {
                            ...m.contractCard!,
                            contract: savedDoc.contract,
                            rung: savedDoc.rung,
                            saved: true,
                          };
                          clientRef.current?.updateContractCardInMessage(m.id, nextCard);
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Speaking / Transcribing Indicator */}
            {isGuideSpeaking && (
              <div className="flex items-center gap-2 text-xs text-[#9A3412] italic py-1">
                <span className="w-2 h-2 rounded-full bg-[#9A3412] animate-ping" />
                <span>Guide is speaking...</span>
              </div>
            )}
          </div>

          {/* Amber Notice / Error Banner */}
          {liveError && (
            <div className="mx-6 mb-2 p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{liveError}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {latestRetryMessage && latestRetryMessage.retryText && (
                  <button
                    type="button"
                    onClick={() =>
                      clientRef.current?.retryTextMessage(
                        latestRetryMessage.id,
                        latestRetryMessage.retryText!
                      )
                    }
                    className="px-2.5 py-1 bg-amber-900 text-white hover:bg-amber-800 rounded text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Try again</span>
                  </button>
                )}
                <button
                  onClick={() => setLiveError(null)}
                  className="text-amber-800 underline text-[11px]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Controls & Input Strip */}
          <div className="border-t border-[#E6DFD3] bg-white p-4 space-y-3">
            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Voice Mic Toggle */}
                <button
                  type="button"
                  onClick={handleToggleMic}
                  disabled={isConnectingLive || (!isLive && !liveAvailable)}
                  title={
                    !liveAvailable
                      ? 'Voice is temporarily unavailable — typing works.'
                      : undefined
                  }
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isLive
                      ? 'bg-[#9A3412] text-white hover:bg-[#832B0F]'
                      : isConnectingLive
                      ? 'bg-[#EAE4D7] text-[#78716C] cursor-wait'
                      : !liveAvailable
                      ? 'bg-[#F4F0E8] text-[#A8A29E] border border-[#E6DFD3] cursor-not-allowed opacity-70'
                      : 'bg-[#F4F0E8] hover:bg-[#EAE4D7] text-[#1C1917] border border-[#E6DFD3]'
                  }`}
                >
                  {isLive ? (
                    <>
                      <Mic className="w-4 h-4 animate-pulse" />
                      <span>Live Voice Active</span>
                    </>
                  ) : (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>
                        {isConnectingLive
                          ? 'Connecting Voice...'
                          : !liveAvailable
                          ? 'Voice Unavailable'
                          : 'Start Voice Chat'}
                      </span>
                    </>
                  )}
                </button>

                {/* Screen Share Button */}
                {screenShareSupported ? (
                  <button
                    type="button"
                    onClick={handleToggleScreenShare}
                    className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      isScreenSharing
                        ? 'bg-[#1C1917] text-white hover:bg-[#292524]'
                        : 'bg-[#F4F0E8] hover:bg-[#EAE4D7] text-[#1C1917] border border-[#E6DFD3]'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>{isScreenSharing ? 'Stop Screen Share' : 'Share My Screen'}</span>
                  </button>
                ) : (
                  <label className="px-3.5 py-1.5 rounded-lg font-medium bg-[#F4F0E8] hover:bg-[#EAE4D7] text-[#1C1917] border border-[#E6DFD3] cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Screenshot</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* End Session Button */}
                <button
                  type="button"
                  onClick={handleEndSession}
                  disabled={isEndingSession}
                  className="px-3 py-1.5 rounded-lg font-medium bg-white hover:bg-[#F4F0E8] text-[#57534E] hover:text-[#1C1917] border border-[#E6DFD3] transition-colors flex items-center gap-1.5"
                  title="Save a progress summary of this session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isEndingSession ? 'Saving summary...' : 'End session'}</span>
                </button>
              </div>

              {isScreenSharing && (
                <div className="flex items-center gap-2 text-[11px] text-[#78716C]">
                  <span className="flex items-center gap-1.5 text-[#9A3412] font-medium bg-[#9A3412]/10 px-2 py-0.5 rounded-full border border-[#9A3412]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9A3412] animate-ping" />
                    <span>Screen visible to guide</span>
                  </span>
                </div>
              )}
            </div>

            {/* Text Input Form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Ask anything, or describe what you want to achieve with ${currentProductName}...`}
                className="flex-1 px-4 py-2.5 text-sm bg-[#FBF9F5] border border-[#E6DFD3] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9A3412] text-[#1C1917] placeholder:text-[#A8A29E]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 bg-[#1C1917] hover:bg-[#292524] disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Guided Apps Sidebar */}
        {showAppsSidebar && (
          <div className="w-full lg:w-88 p-5 bg-[#F4F0E8] border-l border-[#E6DFD3] flex flex-col space-y-5 overflow-y-auto h-[calc(100vh-140px)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#78716C]">
                  Guided Workflows
                </span>
                <h3 className="text-xl font-editorial font-medium text-[#1C1917] mt-0.5">
                  Safe Step Routines
                </h3>
                <p className="text-xs text-[#78716C] mt-1">
                  One step at a time for {currentProductName}.
                </p>
              </div>
            </div>

            {/* Your tools profile shortcut in sidebar */}
            <button
              type="button"
              onClick={() => setShowToolsModal(true)}
              className="w-full p-3 bg-white hover:bg-[#FBF9F5] border border-[#E6DFD3] hover:border-[#D6CEBE] rounded-xl text-left transition-all flex items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#F4F0E8] border border-[#E6DFD3] flex items-center justify-center shrink-0">
                  <Wrench className="w-3.5 h-3.5 text-[#9A3412]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#1C1917]">Your tools</div>
                  <div className="text-[11px] text-[#78716C] truncate">
                    {toolsProfile && (toolsProfile.tools.length > 0 || toolsProfile.devices.length > 0)
                      ? `${toolsProfile.tools.length} tool${toolsProfile.tools.length === 1 ? '' : 's'}${
                          toolsProfile.devices.length > 0
                            ? ` · ${toolsProfile.devices.join(', ')}`
                            : ''
                        }`
                      : 'Tell me what you use'}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
            </button>

            {/* Your safety at a glance in the sidebar */}
            {(() => {
              const latestAudit =
                userAudits.find(a => a.results && Object.keys(a.results).length > 0) || null;
              if (!latestAudit) {
                return (
                  <div className="p-3.5 bg-white border border-[#E6DFD3] rounded-xl text-xs space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-semibold text-[#1C1917]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#14532D]" />
                        <span>Your safety at a glance</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCalendarReminderModal(true)}
                        className="text-[11px] text-[#9A3412] hover:underline inline-flex items-center gap-1"
                        title="Add weekly check to calendar"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Reminder</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-[#78716C] leading-relaxed">
                      Run a Safety &amp; Privacy Check-up or 10-Minute Weekly Review to see your scorecard here.
                    </p>
                  </div>
                );
              }

              const auditTime = new Date(
                latestAudit.completedAt || latestAudit.startedAt
              ).getTime();
              const nowMs = Date.now();
              const ageMs = Math.max(0, nowMs - auditTime);
              const isOverdue = ageMs > TEN_DAYS_MS;
              const nextDueDate = new Date(auditTime + SEVEN_DAYS_MS);
              const coveredAreas = AUDIT_AREAS.filter(
                area => Boolean(latestAudit.results?.[area])
              );

              return (
                <div className="p-3.5 bg-white border border-[#E6DFD3] rounded-xl text-xs space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-[#1C1917]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#14532D]" />
                      <span>Your safety at a glance</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#78716C]">
                      {new Date(auditTime).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Row of colored dots */}
                  <div className="flex items-center gap-2 py-0.5">
                    {coveredAreas.map(area => {
                      const entry = latestAudit.results[area]!;
                      const dotClass =
                        entry.rating === 'green'
                          ? 'bg-[#14532D]'
                          : entry.rating === 'red'
                          ? 'bg-[#991B1B]'
                          : 'bg-[#B45309]';
                      return (
                        <span
                          key={area}
                          title={`${area}: ${entry.rating} — ${entry.reason}`}
                          className={`w-3 h-3 rounded-full ${dotClass}`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F4F0E8] text-[11px]">
                    {isOverdue ? (
                      <span className="font-medium text-[#B45309] bg-[#B45309]/10 border border-[#B45309]/25 px-2 py-0.5 rounded">
                        Weekly check overdue
                      </span>
                    ) : (
                      <span className="text-[#57534E]">
                        Next check due:{' '}
                        <strong className="font-medium text-[#1C1917]">
                          {nextDueDate.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </strong>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowCalendarReminderModal(true)}
                      className="text-[#9A3412] hover:underline inline-flex items-center gap-1 shrink-0"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Calendar</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* My projects section at the top of the sidebar (only if the user has projects) */}
            {Object.keys(userProjectsMap).length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#E6DFD3] pb-1">
                  <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#57534E]">
                    My projects
                  </h4>
                  <span className="text-[10px] font-mono text-[#78716C]">
                    {Object.keys(userProjectsMap).length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(Object.values(userProjectsMap) as UserProjectDoc[])
                    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
                    .map((proj) => {
                      const { title, rungName } = getProjectRungMeta(
                        proj.projectId,
                        proj.rung
                      );
                      const isMenuOpen = openProjectMenuId === proj.projectId;
                      const isPaused = proj.status === 'paused';

                      return (
                        <div
                          key={proj.projectId}
                          className={`p-3.5 bg-white border rounded-xl text-xs space-y-2 transition-all shadow-2xs relative ${
                            isPaused
                              ? 'border-[#E6DFD3] opacity-75'
                              : 'border-[#E6DFD3] hover:border-[#D6CEBE]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h5 className="font-semibold text-sm text-[#1C1917] leading-snug truncate">
                                  {title}
                                </h5>
                                {isPaused && (
                                  <span className="px-1.5 py-0.5 rounded bg-[#F4F0E8] border border-[#E6DFD3] text-[9px] font-mono uppercase text-[#78716C]">
                                    Paused
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Small Project Menu */}
                            <div className="relative shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenProjectMenuId(isMenuOpen ? null : proj.projectId)
                                }
                                className="p-1 rounded-lg hover:bg-[#F4F0E8] text-[#57534E] hover:text-[#1C1917] transition-colors"
                                title="Project options"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {isMenuOpen && (
                                <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E6DFD3] rounded-xl shadow-lg py-1 z-30 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleViewProjectContract(proj)}
                                    className="w-full px-3 py-1.5 text-left hover:bg-[#F4F0E8] text-[#1C1917] flex items-center gap-2"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-[#78716C]" />
                                    <span>View contract</span>
                                  </button>

                                  <button
                                    type="button"
                                    disabled={proj.rung >= 3}
                                    onClick={() => handleMoveProjectRung(proj, 'up')}
                                    className="w-full px-3 py-1.5 text-left hover:bg-[#F4F0E8] disabled:opacity-40 disabled:hover:bg-white text-[#1C1917] flex items-center gap-2"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5 text-[#14532D]" />
                                    <span>Move up a rung</span>
                                  </button>

                                  <button
                                    type="button"
                                    disabled={proj.rung <= 0}
                                    onClick={() => handleMoveProjectRung(proj, 'down')}
                                    className="w-full px-3 py-1.5 text-left hover:bg-[#F4F0E8] disabled:opacity-40 disabled:hover:bg-white text-[#1C1917] flex items-center gap-2"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5 text-[#9A3412]" />
                                    <span>Move down a rung</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleTogglePauseProject(proj)}
                                    className="w-full px-3 py-1.5 text-left hover:bg-[#F4F0E8] text-[#1C1917] flex items-center gap-2"
                                  >
                                    {isPaused ? (
                                      <>
                                        <Play className="w-3.5 h-3.5 text-[#14532D]" />
                                        <span>Resume</span>
                                      </>
                                    ) : (
                                      <>
                                        <Pause className="w-3.5 h-3.5 text-[#78716C]" />
                                        <span>Pause</span>
                                      </>
                                    )}
                                  </button>

                                  <div className="my-1 border-t border-[#F4F0E8]" />

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProject(proj)}
                                    className="w-full px-3 py-1.5 text-left hover:bg-red-50 text-[#9A3412] flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Four-dot rung indicator + rung name */}
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="flex items-center gap-1"
                                title={`Rung ${proj.rung} of 3: ${rungName}`}
                              >
                                {([0, 1, 2, 3] as const).map((r) => {
                                  const filled = r <= proj.rung;
                                  return (
                                    <span
                                      key={r}
                                      className={`w-2 h-2 rounded-full transition-colors ${
                                        filled
                                          ? 'bg-[#14532D]'
                                          : 'bg-[#E6DFD3] border border-[#D6CEBE]'
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                              <span className="text-[11px] font-medium text-[#1C1917]">
                                {rungName}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[#78716C]">
                              Rung {proj.rung}
                            </span>
                          </div>

                          {proj.contract?.goal && (
                            <p className="text-[11px] text-[#57534E] line-clamp-2 leading-relaxed pt-1 border-t border-[#F4F0E8]">
                              {proj.contract.goal}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {(
              [
                { type: 'setup', label: 'Start here' },
                { type: 'project', label: 'Projects' },
                { type: 'checkup', label: 'Check-ups' },
                { type: 'support', label: 'Help' },
              ] as const
            ).map(group => {
              const groupApps = guidedApps
                .filter(a => (a.type || 'setup') === group.type)
                .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

              if (groupApps.length === 0) return null;

              return (
                <div key={group.type} className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#E6DFD3] pb-1">
                    <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#57534E]">
                      {group.label}
                    </h4>
                  </div>

                  <div className="space-y-2.5">
                    {groupApps.map(app => {
                      const prog = routineProgressMap[app.id];
                      const totalSteps = app.steps?.length || 0;
                      const statusLabel =
                        prog?.status === 'done'
                          ? 'Done ✓'
                          : prog?.status === 'in-progress'
                          ? `Step ${Math.min(Math.max(prog.activeStep || 1, 1), totalSteps || 1)} of ${totalSteps}`
                          : 'Not started';

                      const recAfterIds: string[] = Array.isArray(app.recommended_after)
                        ? app.recommended_after
                        : [];
                      const unfinishedRecTitles = recAfterIds
                        .filter(reqId => routineProgressMap[reqId]?.status !== 'done')
                        .map(reqId => {
                          const matched = guidedApps.find(g => g.id === reqId);
                          return matched?.title || reqId;
                        });

                      const requiresList: string[] = Array.isArray(app.requires)
                        ? app.requires
                        : [];
                      const fitsYourTools =
                        requiresList.length > 0 &&
                        Boolean(toolsProfile?.tools?.length) &&
                        requiresList.every(req => {
                          const r = String(req || '').toLowerCase().trim();
                          return toolsProfile!.tools.some(
                            t =>
                              t.category.toLowerCase() === r ||
                              t.id.toLowerCase() === r
                          );
                        });

                      const riskVal = String(app.risk || '').toLowerCase();
                      const riskBadgeClass =
                        riskVal === 'low'
                          ? 'bg-[#14532D]/10 text-[#14532D] border-[#14532D]/20'
                          : riskVal === 'medium'
                          ? 'bg-amber-100/80 text-amber-900 border-amber-300'
                          : riskVal === 'high'
                          ? 'bg-[#9A3412]/10 text-[#9A3412] border-[#9A3412]/25'
                          : 'bg-[#F4F0E8] text-[#57534E] border-[#E6DFD3]';

                      return (
                        <div
                          key={app.id}
                          className="p-3.5 bg-white border border-[#E6DFD3] rounded-xl text-xs space-y-2 hover:border-[#D6CEBE] transition-all shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-semibold text-sm text-[#1C1917] leading-snug">
                              {app.title}
                            </h5>
                            <span className="text-[10px] text-[#78716C] font-mono shrink-0">
                              {app.estimated_time || app.estimatedTime}
                            </span>
                          </div>

                          {( (group.type === 'project' && app.risk) || fitsYourTools ) && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {group.type === 'project' && app.risk && (
                                <span
                                  className={`px-1.5 py-0.5 rounded border text-[10px] font-mono uppercase ${riskBadgeClass}`}
                                >
                                  Risk: {app.risk}
                                </span>
                              )}
                              {fitsYourTools && (
                                <span className="px-1.5 py-0.5 rounded border text-[10px] font-mono bg-[#14532D]/10 text-[#14532D] border-[#14532D]/25">
                                  Fits your tools
                                </span>
                              )}
                            </div>
                          )}

                          <p className="text-[#57534E] text-[11px] leading-relaxed">
                            {app.summary || app.goal}
                          </p>

                          {group.type === 'project' && unfinishedRecTitles.length > 0 && (
                            <p className="text-[10px] text-[#78716C] italic">
                              Best after {unfinishedRecTitles.join(' & ')}
                            </p>
                          )}

                          <div className="pt-2 flex items-center justify-between border-t border-[#F4F0E8]">
                            <span
                              className={`text-[10px] font-mono ${
                                prog?.status === 'done'
                                  ? 'text-[#14532D] font-semibold'
                                  : prog?.status === 'in-progress'
                                  ? 'text-[#9A3412] font-medium'
                                  : 'text-[#78716C]'
                              }`}
                            >
                              {statusLabel}
                            </span>
                            <button
                              onClick={() => handleLaunchApp(app)}
                              className="px-2.5 py-1 bg-[#1C1917] text-white rounded text-[11px] hover:bg-[#292524] transition-colors"
                            >
                              {prog?.status === 'in-progress' ? 'Continue' : 'Start Routine'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Quick Progress & Session Notes Preview */}
            <div className="border-t border-[#E6DFD3] pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1C1917]">Where you left off</span>
                <button
                  onClick={() => setShowNotesDrawer(true)}
                  className="text-[11px] text-[#9A3412] hover:underline"
                >
                  Notes & History
                </button>
              </div>

              {progressSummary?.summary ? (
                <div className="p-2.5 bg-white border border-[#E6DFD3] rounded-lg text-xs space-y-1">
                  <p className="text-[11px] text-[#292524] line-clamp-3">
                    {progressSummary.summary}
                  </p>
                  <span className="text-[9px] text-[#78716C] font-mono block text-right">
                    {new Date(progressSummary.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ) : sessionNotes.length === 0 ? (
                <p className="text-[11px] text-[#78716C] italic">
                  No progress summary or notes saved yet. The guide writes summaries as you chat or complete routines.
                </p>
              ) : (
                <div className="p-2.5 bg-white border border-[#E6DFD3] rounded-lg text-xs space-y-1">
                  <p className="text-[11px] text-[#292524] line-clamp-3">
                    "{sessionNotes[0].text}"
                  </p>
                  <span className="text-[9px] text-[#78716C] font-mono block text-right">
                    {new Date(sessionNotes[0].createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals & Overlays */}
      <ConsentModal
        isOpen={showConsentModal && !hasAcceptedConsent}
        onAccept={handleConsentAccepted}
      />

      <ScreenShareConsentModal
        isOpen={screensharePrompt.isOpen}
        reason={screensharePrompt.reason}
        onApprove={screensharePrompt.onApprove}
        onDeny={screensharePrompt.onDeny}
      />

      <CalendarReminderModal
        isOpen={showCalendarReminderModal}
        onClose={() => setShowCalendarReminderModal(false)}
      />

      <CalendarEscalationModal
        isOpen={showEscalationModal}
        onClose={() => setShowEscalationModal(false)}
        product={currentProduct}
        productName={currentProductName}
        transcript={messages.map(m => ({ role: m.role, text: m.text }))}
        routineProgress={currentRoutineProgress}
        routineState={clientRef.current?.getRoutineState() || null}
        progressSummary={currentProgressSummary}
        progressSummaryPayload={progressSummary}
        bookingUrl={bookingUrl}
        sheetWebhookConfigured={sheetWebhookConfigured}
        onBeforeSendReport={() => runProgressSummarize({ force: true })}
        onReportSent={(refId) => {
          clientRef.current?.addMessage('system', `Sent to Nic. Reference: ${refId}`);
        }}
      />

      <NotesDrawer
        isOpen={showNotesDrawer}
        onClose={() => setShowNotesDrawer(false)}
        notes={sessionNotes}
        onDeleteNote={handleDeleteNote}
        product={currentProduct}
        productName={currentProductName}
        availableProducts={availableProducts}
        progressSummary={progressSummary}
        onSaveProgressSummary={handleSaveManualProgressSummary}
        onDeleteProgressSummary={handleDeleteProgressSummary}
        pastConversations={pastConversations}
        onLoadConversation={(convId) =>
          user ? getUserConversation(user.uid, convId) : Promise.resolve(null)
        }
        onDeleteConversation={handleDeleteConversation}
        onDeleteAllHistory={handleDeleteAllHistory}
        shareCorrectionsWithNic={shareCorrectionsWithNic}
        onToggleShareCorrections={handleToggleShareCorrections}
      />

      <KnowledgeModal
        isOpen={showKnowledgeModal}
        onClose={() => setShowKnowledgeModal(false)}
        productName={currentProductName}
        knowledge={knowledgeData}
      />

      <ToolsProfileModal
        isOpen={showToolsModal}
        onClose={() => setShowToolsModal(false)}
        catalog={toolsCatalog}
        initialProfile={toolsProfile}
        onSave={handleSaveToolsProfile}
      />
    </div>
  );
}
