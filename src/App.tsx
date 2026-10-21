import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  authService,
  authFetch,
  AuthUser,
  getUserConsent,
  saveUserConsent,
  getUserSessionNotes,
  saveUserSessionNote,
  deleteUserSessionNote,
  SessionNote,
  saveConversation,
  getRecentProductConversation,
  listUserConversations,
  deleteUserConversation,
  getUserProgressSummary,
  saveUserProgressSummary,
  deleteUserProgressSummary,
  deleteAllUserHistory,
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
import { CalendarEscalationModal } from './components/CalendarEscalationModal.js';
import { NotesDrawer } from './components/NotesDrawer.js';
import { KnowledgeModal } from './components/KnowledgeModal.js';
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
} from 'lucide-react';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function createConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function buildGreetingMessage(progress: ProgressSummaryDoc | null, productName: string): string {
  if (progress) {
    const doneList = Array.isArray(progress.done) ? progress.done.filter(Boolean) : [];
    const inProgList = Array.isArray(progress.inProgress) ? progress.inProgress.filter(Boolean) : [];
    const lastDone = doneList.length > 0 ? doneList[doneList.length - 1] : '';
    const firstInProg = inProgList.length > 0 ? inProgList[0] : '';

    if (lastDone && firstInProg) {
      return `Welcome back. Last time you finished ${lastDone} and were working on ${firstInProg}. Want to pick up there, or start somewhere else?`;
    }
    if (lastDone) {
      return `Welcome back. Last time you finished ${lastDone}. Want to pick up from there, or start somewhere else?`;
    }
    if (firstInProg) {
      return `Welcome back. Last time you were working on ${firstInProg}. Want to pick up there, or start somewhere else?`;
    }
    if (progress.summary && progress.summary.trim()) {
      const firstSentenceMatch = progress.summary.trim().match(/^[^.!?]+[.!?]/);
      const firstSentence = firstSentenceMatch
        ? firstSentenceMatch[0].trim()
        : progress.summary.trim().split(/\r?\n/)[0].slice(0, 140).trim();
      return `Welcome back — ${firstSentence} Want to pick up there, or start somewhere else?`;
    }
  }

  return `Hello. I'm here to help you get comfortable with ${productName} at your own pace. What would you like to explore today?`;
}

export default function App() {
  // Navigation / View State
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

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

  // Health, Handoff & Booking Config from Server
  const [liveAvailable, setLiveAvailable] = useState<boolean>(true);
  const [bookingUrl, setBookingUrl] = useState<string>('https://cal.com/zateslo/grab-some-human-time-with-nic');
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

  // Session Notes, Progress Summary, Past Conversations & Escalation
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [progressSummary, setProgressSummary] = useState<ProgressSummaryDoc | null>(null);
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
  const currentProductRef = useRef<string>('muse');
  const currentProductNameRef = useRef<string>('Meta Muse');
  const progressSummaryRef = useRef<ProgressSummaryDoc | null>(null);
  const sessionNotesRef = useRef<SessionNote[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  const conversationIdRef = useRef<string>(createConversationId());
  const conversationStartedAtRef = useRef<string>(new Date().toISOString());
  const conversationReadyRef = useRef<boolean>(false);
  const saveDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userTurnCountRef = useRef<number>(0);
  const lastSummarizedTurnCountRef = useRef<number>(0);
  const isSummarizingRef = useRef<boolean>(false);

  userRef.current = user;
  currentProductRef.current = currentProduct;
  currentProductNameRef.current = currentProductName;
  progressSummaryRef.current = progressSummary;
  sessionNotesRef.current = sessionNotes;
  messagesRef.current = messages;

  // Flush current conversation to Firestore immediately
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

        const allConvs = await listUserConversations(u.uid);
        setPastConversations(allConvs);
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

      if (isSummarizingRef.current) {
        return progressSummaryRef.current?.summary;
      }
      isSummarizingRef.current = true;
      lastSummarizedTurnCountRef.current = userTurnCountRef.current;

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
          if (res.status === 429) {
            setLiveError(
              errData?.message ||
                errData?.error ||
                'Progress summary rate limit reached. Your conversation is still saved, and you can try again later.'
            );
          } else {
            setLiveError(
              errData?.message ||
                errData?.error ||
                "I couldn't update your progress summary just now. Your conversation is still saved."
            );
          }
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
          const allConvs = await listUserConversations(u.uid);
          setPastConversations(allConvs);

          return savedDoc.summary;
        }
      } catch (err: any) {
        console.warn('Summarize failed:', err);
        setLiveError(
          err?.message ||
            "I couldn't save your progress summary just now. Your conversation is still kept in this browser — check your connection."
        );
      } finally {
        isSummarizingRef.current = false;
      }
      return progressSummaryRef.current?.summary;
    },
    []
  );

  // Create CalmGuideLiveClient ONCE on mount
  useEffect(() => {
    const client = new CalmGuideLiveClient({
      product: currentProductRef.current,
      productName: currentProductNameRef.current,
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
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
        const prod = currentProductRef.current;
        authFetch(`/api/apps/${prod}`)
          .then(res => (res.ok ? res.json() : []))
          .then(apps => {
            if (!Array.isArray(apps)) return;
            const found = apps.find((a: any) => a.id === appId);
            if (found && clientRef.current) {
              clientRef.current.addMessage(
                'guide',
                `I've opened the "${found.title}" guide for you below:`,
                {
                  source: 'typed',
                  appCard: {
                    appId: found.id,
                    title: found.title,
                    goal: found.goal,
                    activeStep: 1,
                    steps: found.steps.map((s: any) => ({ ...s, completed: false })),
                  },
                }
              );
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
      onRoutineCompleted: () => {
        runProgressSummarize({ force: true });
      },
    });

    clientRef.current = client;

    return () => {
      client.stopLiveSession();
    };
  }, [runProgressSummarize]);

  // Keep client config updated via client.updateConfig(partial) without recreating the client
  useEffect(() => {
    clientRef.current?.updateConfig({
      user,
      product: currentProduct,
      productName: currentProductName,
      progressSummary,
      sessionNotes: sessionNotes.map(n => n.text),
    });
  }, [user, currentProduct, currentProductName, progressSummary, sessionNotes]);

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

  // Load or restore conversation, progress summary, and notes for a given user & product
  const loadProductSessionAndMemory = useCallback(
    async (uid: string, product: string, productName: string) => {
      conversationReadyRef.current = false;
      try {
        const [notes, progressDoc, recentConv, allConvs] = await Promise.all([
          getUserSessionNotes(uid, product),
          getUserProgressSummary(uid, product),
          getRecentProductConversation(uid, product),
          listUserConversations(uid),
        ]);

        setSessionNotes(notes);
        setProgressSummary(progressDoc);
        setPastConversations(allConvs);

        clientRef.current?.updateConfig({
          product,
          productName,
          progressSummary: progressDoc,
          sessionNotes: notes.map(n => n.text),
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

  // Auth observer (Google sign-in required; does NOT depend on currentProduct)
  useEffect(() => {
    const unsub = authService.onAuthStateChanged(async (u) => {
      setUser(u);
      setAuthReady(true);
      if (u) {
        const consent = await getUserConsent(u.uid);
        setHasAcceptedConsent(consent);
        setShowConsentModal(!consent);
        await loadProductSessionAndMemory(
          u.uid,
          currentProductRef.current,
          currentProductNameRef.current
        );
      } else {
        conversationReadyRef.current = false;
        setShowConsentModal(false);
        setSessionNotes([]);
        setProgressSummary(null);
        setPastConversations([]);
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

  // 2-second debounced conversation save after messages change
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
      })
        .then(() => listUserConversations(uid))
        .then(convs => setPastConversations(convs))
        .catch((err: any) => {
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

  // Save conversation once more + best-effort summarize on page hide
  useEffect(() => {
    const handleVisibilityOrHide = () => {
      if (document.visibilityState === 'hidden') {
        flushSaveConversation();
        if (userTurnCountRef.current > 0) {
          runProgressSummarize();
        }
      }
    };

    const handlePageHide = () => {
      flushSaveConversation();
      if (userTurnCountRef.current > 0) {
        runProgressSummarize();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrHide);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrHide);
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
    if (!clientRef.current) return;
    await clientRef.current.startGuidedRoutine(app);
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
        currentProduct={currentProduct}
        onSelectProduct={handleSelectProduct}
        availableProducts={availableProducts}
        onOpenKnowledge={() => setShowKnowledgeModal(true)}
        onOpenApps={() => setShowAppsSidebar(prev => !prev)}
        onOpenNotes={() => setShowNotesDrawer(true)}
        onOpenEscalation={() => setShowEscalationModal(true)}
        onOpenAdmin={() => {
          setIsAdminView(true);
          window.history.pushState({}, '', '/admin');
        }}
        onSignOut={async () => {
          await flushSaveConversation();
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

      {/* Persistent Human Escalation Strip */}
      <div className="bg-[#F4F0E8] border-b border-[#E6DFD3] px-6 py-2 text-xs flex items-center justify-between">
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

        <button
          onClick={() => setShowEscalationModal(true)}
          className="text-[#1C1917] hover:text-[#9A3412] font-medium flex items-center gap-1 underline transition-colors"
        >
          <span>Need a human review? Talk to Nic</span>
          <ArrowRight className="w-3 h-3" />
        </button>
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
                    <p className="whitespace-pre-wrap">{m.text}</p>

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
                        onComplete={() => {
                          const savedNote = clientRef.current?.hasSavedNoteInRoutine();
                          const completionText = savedNote
                            ? `Great job completing the ${m.appCard?.title} routine! I have recorded your session notes.`
                            : `Great job completing the ${m.appCard?.title} routine!`;
                          clientRef.current?.addMessage('guide', completionText, {
                            source: 'typed',
                          });
                          runProgressSummarize({ force: true });
                        }}
                      />
                    )}

                    {/* Report for Nic Card if drafted by escalate_to_owner */}
                    {m.reportCard && (
                      <ReportForNicCard
                        initialGoal={m.reportCard.goal}
                        initialTried={m.reportCard.tried}
                        initialBlocker={m.reportCard.blocker}
                        product={currentProduct}
                        productName={currentProductName}
                        transcript={messages.map(msg => ({ role: msg.role, text: msg.text }))}
                        routineProgress={currentRoutineProgress}
                        progressSummary={currentProgressSummary}
                        bookingUrl={bookingUrl}
                        sheetWebhookConfigured={sheetWebhookConfigured}
                        onBeforeSendReport={() => runProgressSummarize({ force: true })}
                        onSent={(refId) => {
                          clientRef.current?.addMessage(
                            'system',
                            `Sent to Nic. Reference: ${refId}`
                          );
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
          <div className="w-full lg:w-80 p-6 bg-[#F4F0E8] border-l border-[#E6DFD3] flex flex-col space-y-5 overflow-y-auto">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#78716C]">
                Guided Workflows
              </span>
              <h3 className="text-xl font-editorial font-medium text-[#1C1917] mt-0.5">
                Safe Step Routines
              </h3>
              <p className="text-xs text-[#78716C] mt-1">
                Short guided prompt flows with step-by-step guardrails for {currentProductName}.
              </p>
            </div>

            <div className="space-y-3">
              {guidedApps.map((app) => (
                <div
                  key={app.id}
                  className="p-4 bg-white border border-[#E6DFD3] rounded-xl text-xs space-y-2 hover:border-[#D6CEBE] transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-sm text-[#1C1917]">
                      {app.title}
                    </h4>
                    <span className="text-[10px] text-[#78716C] font-mono">
                      {app.estimatedTime}
                    </span>
                  </div>

                  <p className="text-[#57534E] text-[11px] leading-relaxed">
                    {app.goal}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-[#F4F0E8]">
                    <span className="text-[10px] text-[#78716C]">
                      {app.steps?.length || 0} guided steps
                    </span>
                    <button
                      onClick={() => handleLaunchApp(app)}
                      className="px-2.5 py-1 bg-[#1C1917] text-white rounded text-[11px] hover:bg-[#292524] transition-colors"
                    >
                      Start Routine
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Progress & Session Notes Preview */}
            <div className="border-t border-[#E6DFD3] pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1C1917]">Where you left off</span>
                <button
                  onClick={() => setShowNotesDrawer(true)}
                  className="text-[11px] text-[#9A3412] hover:underline"
                >
                  Notes & History ({pastConversations.length})
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
        onDeleteConversation={handleDeleteConversation}
        onDeleteAllHistory={handleDeleteAllHistory}
      />

      <KnowledgeModal
        isOpen={showKnowledgeModal}
        onClose={() => setShowKnowledgeModal(false)}
        productName={currentProductName}
        knowledge={knowledgeData}
      />
    </div>
  );
}
