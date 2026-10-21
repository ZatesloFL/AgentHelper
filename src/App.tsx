import React, { useState, useEffect, useRef } from 'react';
import {
  authService,
  AuthUser,
  getUserConsent,
  saveUserConsent,
  getUserSessionNotes,
  saveUserSessionNote,
  deleteUserSessionNote,
  SessionNote,
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
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  // Navigation / View State
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  // User & Consent State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasAcceptedConsent, setHasAcceptedConsent] = useState<boolean>(true); // default true until checked
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Products & Knowledge State
  const [currentProduct, setCurrentProduct] = useState<string>('muse');
  const [availableProducts, setAvailableProducts] = useState<Array<{ id: string; title: string }>>([
    { id: 'muse', title: "Meta's Muse" },
    { id: 'grok', title: 'Grok (xAI)' },
    { id: 'gemini-builder', title: 'Gemini Builder' },
  ]);
  const [knowledgeData, setKnowledgeData] = useState<any>(null);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState<boolean>(false);
  const [guidedApps, setGuidedApps] = useState<any[]>([]);
  const [showAppsSidebar, setShowAppsSidebar] = useState<boolean>(true);

  // Live Audio & Screen Share State
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isConnectingLive, setIsConnectingLive] = useState<boolean>(false);
  const [isGuideSpeaking, setIsGuideSpeaking] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [screenShareSupported, setScreenShareSupported] = useState<boolean>(true);
  const [currentScreenFrame, setCurrentScreenFrame] = useState<string | null>(null);
  const [deepThinking, setDeepThinking] = useState<boolean>(false);

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

  // Session Notes & Escalation
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(false);
  const [showEscalationModal, setShowEscalationModal] = useState<boolean>(false);

  // Chat Transcript State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Client instance ref
  const clientRef = useRef<CalmGuideLiveClient | null>(null);

  // Check URL path on load (/admin)
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setIsAdminView(true);
    }
    setScreenShareSupported(isScreenShareSupported());
  }, []);

  // Auth observer
  useEffect(() => {
    const unsub = authService.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const consent = await getUserConsent(u.uid);
        setHasAcceptedConsent(consent);
        setShowConsentModal(!consent);
        loadSessionNotes(u.uid, currentProduct);
      } else {
        setShowLoginModal(true);
      }
    });
    return unsub;
  }, [currentProduct]);

  // Load products, knowledge, and guided apps
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableProducts(data);
        }
      })
      .catch(console.error);

    fetch(`/api/knowledge/${currentProduct}`)
      .then(res => res.json())
      .then(data => setKnowledgeData(data))
      .catch(console.error);

    fetch(`/api/apps/${currentProduct}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGuidedApps(data);
      })
      .catch(console.error);
  }, [currentProduct]);

  const loadSessionNotes = async (uid: string, product: string) => {
    try {
      const notes = await getUserSessionNotes(uid, product);
      setSessionNotes(notes);
    } catch (err) {
      console.warn('Failed to load notes:', err);
    }
  };

  // Initialize or update Live Client
  useEffect(() => {
    const client = new CalmGuideLiveClient({
      userName: user?.displayName || 'Friend',
      userEmail: user?.email || '',
      product: currentProduct,
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
      useDeepThinking: deepThinking,
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
          onApprove: () => {
            setScreensharePrompt(prev => ({ ...prev, isOpen: false }));
            onApprove();
            setIsScreenSharing(true);
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
        // Find matching guided app and attach card to transcript
        fetch(`/api/apps/${currentProduct}`)
          .then(res => res.json())
          .then(apps => {
            const found = apps.find((a: any) => a.id === appId);
            if (found && clientRef.current) {
              clientRef.current.addMessage('guide', `I've opened the "${found.title}" guide for you below:`, {
                appCard: {
                  appId: found.id,
                  title: found.title,
                  goal: found.goal,
                  activeStep: 1,
                  steps: found.steps.map((s: any) => ({ ...s, completed: false })),
                },
              });
            }
          });
      },
      onNoteSaved: async (text) => {
        if (user) {
          await saveUserSessionNote(user.uid, currentProduct, text);
          loadSessionNotes(user.uid, currentProduct);
        }
      },
    });

    clientRef.current = client;

    // Initial greeting if transcript is empty
    if (messages.length === 0) {
      client.addMessage(
        'guide',
        "Hello. I'm here to help you get comfortable with Meta's Muse at your own pace. You can talk to me, type below, or share your screen whenever you want me to look at something with you. What would you like to explore today?"
      );
    }

    return () => {
      client.stopLiveSession();
    };
  }, [user, currentProduct, deepThinking]);

  // Auto-scroll transcript
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleConsentAccepted = async () => {
    setShowConsentModal(false);
    setHasAcceptedConsent(true);
    if (user) {
      await saveUserConsent(user.uid);
    }
  };

  const handleToggleMic = async () => {
    if (!clientRef.current) return;

    if (isLive) {
      clientRef.current.stopLiveSession();
    } else {
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
      setIsScreenSharing(ok);
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
    loadSessionNotes(user.uid, currentProduct);
  };

  // If viewing /admin
  if (isAdminView) {
    return (
      <AdminView
        onBack={() => {
          setIsAdminView(false);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] flex flex-col font-sans selection:bg-[#EAE4D7]">
      {/* Top Bar Contract */}
      <TopNav
        user={user}
        currentProduct={currentProduct}
        onSelectProduct={(p) => setCurrentProduct(p)}
        availableProducts={availableProducts}
        onOpenKnowledge={() => setShowKnowledgeModal(true)}
        onOpenApps={() => setShowAppsSidebar(prev => !prev)}
        onOpenNotes={() => setShowNotesDrawer(true)}
        onOpenEscalation={() => setShowEscalationModal(true)}
        onOpenAdmin={() => {
          setIsAdminView(true);
          window.history.pushState({}, '', '/admin');
        }}
        onSignOut={() => authService.signOut()}
        onSignIn={() => setShowLoginModal(true)}
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
                    <span className="text-[11px] font-mono text-[#78716C] bg-[#F4F0E8] border border-[#E6DFD3] px-3 py-1 rounded-full inline-block">
                      {m.text}
                    </span>

                    {/* Proposed Times Card in System Turn */}
                    {m.proposedSlots && m.proposedSlots.length > 0 && (
                      <div className="mt-2 max-w-sm mx-auto p-3 bg-white border border-[#E6DFD3] rounded-lg text-left shadow-2xs space-y-1.5 text-xs">
                        <span className="font-semibold text-[#1C1917] block">
                          Nic's Available Slots:
                        </span>
                        {m.proposedSlots.map((s, idx) => (
                          <div key={idx} className="p-1.5 bg-[#FBF9F5] border border-[#E6DFD3] rounded flex justify-between font-mono text-[11px]">
                            <span>{s.displayFormatted}</span>
                            <span className="text-[#14532D]">Open</span>
                          </div>
                        ))}
                        <button
                          onClick={() => setShowEscalationModal(true)}
                          className="w-full mt-2 py-1.5 bg-[#1C1917] text-white rounded text-xs hover:bg-[#292524]"
                        >
                          Confirm with Nic
                        </button>
                      </div>
                    )}

                    {m.bookingUrl && (
                      <div className="mt-2 text-center">
                        <a
                          href={m.bookingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1C1917] bg-white border border-[#E6DFD3] px-3 py-1.5 rounded-lg hover:bg-stone-50"
                        >
                          <span>Open Nic's Booking Page</span>
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
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-[#78716C]">
                    <span className="font-medium text-[#1C1917]">
                      {isGuide ? 'Calm Guide' : user?.displayName || 'You'}
                    </span>
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
                          clientRef.current?.addMessage(
                            'guide',
                            `Great job completing the ${m.appCard?.title} routine! I have recorded your verified safeguards in session notes.`
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

          {/* Error Banner */}
          {liveError && (
            <div className="mx-6 mb-2 p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{liveError}</span>
              </div>
              <button
                onClick={() => setLiveError(null)}
                className="text-amber-800 underline text-[11px]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Controls & Input Strip */}
          <div className="border-t border-[#E6DFD3] bg-white p-4 space-y-3">
            {/* Action Buttons Row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {/* Voice Mic Toggle */}
                <button
                  type="button"
                  onClick={handleToggleMic}
                  disabled={isConnectingLive}
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isLive
                      ? 'bg-[#9A3412] text-white hover:bg-[#832B0F]'
                      : isConnectingLive
                      ? 'bg-[#EAE4D7] text-[#78716C] cursor-wait'
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
                      <span>{isConnectingLive ? 'Connecting Voice...' : 'Start Voice Chat'}</span>
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

                {/* Optional Extended Thinking switch */}
                <label className="hidden md:flex items-center gap-1.5 text-[11px] text-[#78716C] ml-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deepThinking}
                    onChange={(e) => setDeepThinking(e.target.checked)}
                    className="rounded text-[#9A3412] focus:ring-0"
                  />
                  <span>Extended Governance Reasoning</span>
                </label>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#78716C]">
                {isScreenSharing && (
                  <span className="flex items-center gap-1.5 text-[#9A3412] font-medium bg-[#9A3412]/10 px-2 py-0.5 rounded-full border border-[#9A3412]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9A3412] animate-ping" />
                    <span>Screen visible to guide</span>
                  </span>
                )}
                <span className="hidden sm:inline">
                  {isLive ? 'Voice mode (16kHz in / 24kHz out)' : 'Text mode (gemini-3.8-flash with vision)'}
                </span>
              </div>
            </div>

            {/* Text Input Form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask anything, or describe what you want to achieve with Muse..."
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
                Short guided prompt flows with step-by-step guardrails for {currentProduct.toUpperCase()}.
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

            {/* Quick Session Notes Preview */}
            <div className="border-t border-[#E6DFD3] pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1C1917]">Session Notes</span>
                <button
                  onClick={() => setShowNotesDrawer(true)}
                  className="text-[11px] text-[#9A3412] hover:underline"
                >
                  View all ({sessionNotes.length})
                </button>
              </div>

              {sessionNotes.length === 0 ? (
                <p className="text-[11px] text-[#78716C] italic">
                  No notes saved yet. The guide writes short summaries as you complete routines.
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
        isOpen={showConsentModal}
        onAccept={handleConsentAccepted}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={(u) => {
          setUser(u);
          setShowLoginModal(false);
        }}
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
        userName={user?.displayName || 'Visitor'}
        userEmail={user?.email || ''}
        product={currentProduct}
        transcript={messages.map(m => ({ role: m.role, text: m.text }))}
        onEscalated={(msg) => {
          clientRef.current?.addMessage('system', msg);
        }}
      />

      <NotesDrawer
        isOpen={showNotesDrawer}
        onClose={() => setShowNotesDrawer(false)}
        notes={sessionNotes}
        onDeleteNote={handleDeleteNote}
        product={currentProduct}
      />

      <KnowledgeModal
        isOpen={showKnowledgeModal}
        onClose={() => setShowKnowledgeModal(false)}
        knowledge={knowledgeData}
      />
    </div>
  );
}
