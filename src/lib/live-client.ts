import {
  startAudioWorkletMicCapture,
  MicWorkletController,
  LiveAudioPlayer,
} from './audio-utils.js';
import {
  ScreenStreamer,
  hasScreenVisiblyChanged,
} from './screen-share.js';
import {
  getIdToken,
  authFetch,
  ProgressSummaryDoc,
  StoredRoutineStep,
  StepEvidence,
  CompletedStepRecord,
  RoutineProgressDoc,
  ToolsProfileDoc,
  UserToolEntry,
  TaskContractFields,
  UserProjectDoc,
  StoredContractCard,
  AuditArea,
  AuditRating,
  AuditRunDoc,
  StoredScorecardCard,
} from './firebase.js';

export interface RoutineState {
  activeRoutineId: string | null;
  completedSteps: number[];
  activeStep: number | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'guide' | 'system';
  text: string;
  timestamp: string;
  source: 'typed' | 'spoken' | 'system';
  appCard?: {
    appId: string;
    title: string;
    goal: string;
    activeStep?: number;
    steps: StoredRoutineStep[];
  };
  reportCard?: {
    goal: string;
    tried: string;
    blocker: string;
    sentRefId?: string;
  };
  contractCard?: StoredContractCard;
  scorecardCard?: StoredScorecardCard;
  toolNotice?: string;
  bookingUrl?: string;
  retryText?: string;
  undoToolsProfileSnapshot?: ToolsProfileDoc | null;
  undoApplied?: boolean;
  openToolsAction?: boolean;
}

export interface ToolsProfilePatch {
  add?: UserToolEntry[];
  remove?: string[];
  devices?: string[];
  otherAdded?: string[];
}

export interface LiveClientConfig {
  user?: { uid: string; displayName: string | null; email: string | null } | null;
  product: string;
  productName?: string;
  userTimezone: string;
  liveWsHost?: string; // Separate Cloud Run voice service host (App Hosting edge blocks WS upgrades); falls back to page host when unset
  progressSummary?: ProgressSummaryDoc | null;
  sessionNotes?: string[];
  toolsProfile?: ToolsProfileDoc | null;
  userProjects?: Record<string, UserProjectDoc>;
  latestAudit?: AuditRunDoc | null;
  context?: any;
  onTranscriptUpdate: (messages: ChatMessage[]) => void;
  onLiveStateChange: (state: {
    isLive: boolean;
    isConnecting: boolean;
    isSpeaking: boolean;
    isListening: boolean;
    error: string | null;
  }) => void;
  onRequestScreenshareConsent: (reason: string, onApprove: () => Promise<boolean>, onDeny: () => void) => void;
  onStopScreenshareRequested: () => void;
  onAppLaunched: (appId: string) => void;
  onNoteSaved: (text: string) => Promise<boolean> | boolean | void;
  onScreenFrameUpdate?: (frameBase64: string | null) => void;
  onUserMessageTurn?: () => void;
  onRoutineCompleted?: (appId: string) => void;
  onRoutineProgressUpdated?: (
    appId: string,
    progress: {
      status: 'not-started' | 'in-progress' | 'done';
      completedSteps: CompletedStepRecord[];
      activeStep: number;
    }
  ) => void;
  onToolsProfileUpdated?: (
    patch: ToolsProfilePatch
  ) => Promise<{ summaryLine: string; undoSnapshot: ToolsProfileDoc } | null>;
  onContractSaved?: (card: StoredContractCard) => Promise<UserProjectDoc | null>;
  onAuditResultRecorded?: (payload: {
    appId: string;
    area: AuditArea;
    rating: AuditRating;
    reason: string;
  }) => Promise<void> | void;
  onKnowledgeMismatchReported?: (payload: {
    topic: string;
    notesSay: string;
    screenShows: string;
    device: string;
    alsoSavedSessionNote: boolean;
  }) => Promise<void> | void;
}

const MIN_FRAME_INTERVAL_MS = 3000; // At most 1 frame every 3 seconds in voice mode
const CONNECT_TIMEOUT_MS = 15000; // 15-second timeout waiting for { connected: true }
const VOICE_IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5-minute voice idle timeout

export class CalmGuideLiveClient {
  private config: LiveClientConfig;
  private ws: WebSocket | null = null;
  private audioPlayer: LiveAudioPlayer;
  private micStream: MediaStream | null = null;
  private micWorklet: MicWorkletController | null = null;
  private connectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private voiceIdleTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private screenStreamer: ScreenStreamer | null = null;
  private latestScreenFrame: string | null = null;
  private latestScreenThumb: Uint8Array | null = null;
  private lastSentScreenThumb: Uint8Array | null = null;
  private lastSentFrameTime: number = 0;
  private hasSentInitialShareFrame: boolean = false;

  private messages: ChatMessage[] = [];
  private currentGuideTurnText: string = '';
  private currentGuideMessageId: string | null = null;
  private currentUserTurnText: string = '';
  private currentUserMessageId: string | null = null;
  private completedVoiceTurns: number = 0;

  private isLiveActive: boolean = false;
  private isConnecting: boolean = false;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private currentError: string | null = null;
  private noteSavedInRoutine: boolean = false;

  constructor(config: LiveClientConfig) {
    this.config = config;
    this.audioPlayer = new LiveAudioPlayer();
  }

  public hasSavedNoteInRoutine(): boolean {
    return this.noteSavedInRoutine;
  }

  public markReportCardSent(messageId: string, sentRefId: string) {
    const idx = this.messages.findIndex(m => m.id === messageId);
    if (idx !== -1 && this.messages[idx].reportCard) {
      this.messages[idx] = {
        ...this.messages[idx],
        reportCard: {
          ...this.messages[idx].reportCard!,
          sentRefId,
        },
      };
      this.config.onTranscriptUpdate([...this.messages]);
    }
  }

  public markToolsUndoApplied(messageId: string) {
    const idx = this.messages.findIndex(m => m.id === messageId);
    if (idx !== -1) {
      this.messages[idx] = {
        ...this.messages[idx],
        undoApplied: true,
      };
      this.config.onTranscriptUpdate([...this.messages]);
      this.pushLiveContextRefresh(false, true);
    }
  }

  public updateContractCardInMessage(messageId: string, nextCard: StoredContractCard) {
    const idx = this.messages.findIndex(m => m.id === messageId);
    if (idx !== -1) {
      this.messages[idx] = {
        ...this.messages[idx],
        contractCard: nextCard,
      };
      this.config.onTranscriptUpdate([...this.messages]);
      this.pushLiveContextRefresh(false, false, true);
    }
  }

  /**
   * Updates client configuration (user, product, progressSummary, sessionNotes, toolsProfile)
   * without recreating the client, wiping messages, or dropping an active voice session.
   */
  public updateConfig(partial: Partial<LiveClientConfig>) {
    this.config = {
      ...this.config,
      ...partial,
    };
  }

  public getMessages(): ChatMessage[] {
    return this.messages;
  }

  public setMessages(msgs: ChatMessage[]) {
    this.messages = msgs.map(m => ({
      ...m,
      source: m.source || (m.role === 'system' ? 'system' : 'typed'),
    }));
    this.currentGuideMessageId = null;
    this.currentGuideTurnText = '';
    this.currentUserMessageId = null;
    this.currentUserTurnText = '';
    this.config.onTranscriptUpdate([...this.messages]);
  }

  public getLatestScreenFrame(): string | null {
    return this.latestScreenFrame;
  }

  /**
   * Computes the current routine state { activeRoutineId, completedSteps, activeStep }
   * from the latest routine appCard in the transcript.
   */
  public getRoutineState(): RoutineState {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const card = this.messages[i].appCard;
      if (card && card.appId) {
        const completedSteps = (card.steps || [])
          .filter(s => Boolean(s.completed))
          .map(s => Number(s.number));
        const allDone = card.steps.length > 0 && completedSteps.length === card.steps.length;
        return {
          activeRoutineId: card.appId,
          completedSteps,
          activeStep: allDone ? null : card.activeStep ?? 1,
        };
      }
    }
    return {
      activeRoutineId: null,
      completedSteps: [],
      activeStep: null,
    };
  }

  private buildContextPayload() {
    const projectsArray = Object.values(this.config.userProjects || {});
    return {
      timezone: this.config.userTimezone,
      routineState: this.getRoutineState(),
      progressSummary: this.config.progressSummary || null,
      sessionNotes: this.config.sessionNotes || [],
      toolsProfile: this.config.toolsProfile || null,
      userProjects: projectsArray,
      latestAudit: this.config.latestAudit || null,
      recentTranscript: this.messages
        .filter(m => m.role === 'user' || m.role === 'guide')
        .slice(-20)
        .map(m => ({ role: m.role, text: m.text.slice(0, 800) })),
      ...(this.config.context || {}),
    };
  }

  public pushLiveContextRefresh(
    includeRoutineTurnUpdate: boolean = false,
    toolsProfileUpdated: boolean = false,
    userProjectsUpdated: boolean = false,
    latestAuditUpdated: boolean = false
  ) {
    if (this.isLiveActive && this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const ctx = this.buildContextPayload();
        this.ws.send(
          JSON.stringify({
            type: 'context',
            context: ctx,
            routineState: includeRoutineTurnUpdate ? ctx.routineState : undefined,
            toolsProfileUpdated: toolsProfileUpdated || undefined,
            userProjectsUpdated: userProjectsUpdated || undefined,
            latestAuditUpdated: latestAuditUpdated || undefined,
          })
        );
      } catch (_) {}
    }
  }

  /**
   * Smarter screen frames in VOICE mode:
   * - Sends only when voice is live (`this.isLiveActive`) and socket is open
   * - Respects the 3-second minimum interval unless `bypassCooldown` is true (initial share start or session start/reconnect)
   * - Checks 32x18 grayscale thumbnail difference against the last SENT frame unless `forceChange` is true
   */
  private maybeSendLiveScreenFrame(options: { forceChange?: boolean; bypassCooldown?: boolean } = {}) {
    if (!this.isLiveActive || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    if (!this.latestScreenFrame) return;

    const now = Date.now();
    if (!options.bypassCooldown && now - this.lastSentFrameTime < MIN_FRAME_INTERVAL_MS) {
      return;
    }

    const shouldSend =
      Boolean(options.forceChange) ||
      hasScreenVisiblyChanged(this.latestScreenThumb, this.lastSentScreenThumb);

    if (!shouldSend) return;

    try {
      this.ws.send(
        JSON.stringify({
          video: this.latestScreenFrame,
        })
      );
      this.lastSentFrameTime = now;
      if (this.latestScreenThumb) {
        this.lastSentScreenThumb = new Uint8Array(this.latestScreenThumb);
      }
    } catch (_) {}
  }

  public addMessage(
    role: 'user' | 'guide' | 'system',
    text: string,
    extra?: Partial<ChatMessage>
  ): ChatMessage {
    const defaultSource: 'typed' | 'spoken' | 'system' =
      role === 'system' ? 'system' : 'typed';

    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: extra?.source || defaultSource,
      ...extra,
    };
    this.messages.push(msg);
    if (this.messages.length > 400) {
      this.messages = this.messages.slice(-400);
    }
    this.config.onTranscriptUpdate([...this.messages]);
    if (extra?.appCard) {
      this.pushLiveContextRefresh(true);
    }
    return msg;
  }

  public removeMessageById(id: string) {
    const next = this.messages.filter(m => m.id !== id);
    if (next.length !== this.messages.length) {
      this.messages = next;
      this.config.onTranscriptUpdate([...this.messages]);
    }
  }

  private clearConnectTimeout() {
    if (this.connectTimeoutId) {
      clearTimeout(this.connectTimeoutId);
      this.connectTimeoutId = null;
    }
  }

  private clearVoiceIdleTimeout() {
    if (this.voiceIdleTimeoutId) {
      clearTimeout(this.voiceIdleTimeoutId);
      this.voiceIdleTimeoutId = null;
    }
  }

  private resetVoiceIdleTimeout() {
    this.clearVoiceIdleTimeout();
    if (!this.isLiveActive) return;
    this.voiceIdleTimeoutId = setTimeout(() => {
      if (this.isLiveActive) {
        this.stopLiveSession();
        this.addMessage(
          'system',
          "I paused voice since it's been quiet for a while. Press Start Voice Chat whenever you want to talk again."
        );
      }
    }, VOICE_IDLE_TIMEOUT_MS);
  }

  /**
   * Starts the Live voice session using server WebSocket bridge /api/live-ws
   * Sends { type: "init", idToken, product, context } as the first message after socket opens.
   * Only marks voice as "live" after the server sends { connected: true }.
   */
  public async startLiveSession(): Promise<boolean> {
    if (this.isLiveActive || this.isConnecting) return true;

    this.isConnecting = true;
    this.isLiveActive = false;
    this.currentError = null;
    this.updateState();

    // 1. Request microphone access first and detect permission denial clearly
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (micErr: any) {
      const errName = String(micErr?.name || '');
      const errMsg = String(micErr?.message || '');
      if (
        errName === 'NotAllowedError' ||
        errName === 'PermissionDeniedError' ||
        /permission|denied|not allowed|blocked/i.test(errMsg)
      ) {
        this.stopLiveSession(
          "I can't hear you because microphone access is blocked. You can allow it in your browser's address bar, or keep typing — that works just as well."
        );
      } else {
        this.stopLiveSession(
          "Couldn't access your microphone. Please check that a microphone is connected, or keep typing — that works just as well."
        );
      }
      return false;
    }

    try {
      const idToken = await getIdToken();

      // 2. Enforce 15-second timeout waiting for { connected: true }
      this.clearConnectTimeout();
      this.connectTimeoutId = setTimeout(() => {
        if (!this.isLiveActive && this.isConnecting) {
          this.stopLiveSession(
            'Voice took more than 15 seconds to connect. You can try starting voice again, or keep typing below.'
          );
        }
      }, CONNECT_TIMEOUT_MS);

      // 3. Connect via server WebSocket bridge /api/live-ws (no user info in URL)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = this.config.liveWsHost || window.location.host;
      const wsUrl = `${protocol}//${wsHost}/api/live-ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        // Note: do NOT mark isLiveActive = true here; wait for server { connected: true }
        this.ws.send(
          JSON.stringify({
            type: 'init',
            idToken,
            product: this.config.product,
            context: this.buildContextPayload(),
          })
        );
      };

      this.ws.onmessage = (event) => {
        this.handleServerMessage(event.data);
      };

      this.ws.onerror = () => {
        if (!this.currentError) {
          this.stopLiveSession(
            "Couldn't connect to live voice right now. Please try again in a moment, or keep typing — that works just as well."
          );
        }
      };

      this.ws.onclose = () => {
        if (this.isLiveActive || this.isConnecting) {
          this.stopLiveSession(
            this.currentError ||
              'Voice session ended unexpectedly. You can press Start Voice Chat to reconnect, or keep typing.'
          );
        }
      };

      return true;
    } catch (err: any) {
      console.error('Failed to start Live session:', err);
      this.stopLiveSession(
        err?.message || 'Could not start voice session. You can try again, or keep typing below.'
      );
      return false;
    }
  }

  private async startMicStreaming() {
    if (!this.micStream) return;
    if (this.micWorklet) {
      this.micWorklet.stop();
      this.micWorklet = null;
    }

    try {
      this.micWorklet = await startAudioWorkletMicCapture(this.micStream, (base64Pcm) => {
        if (!this.isLiveActive || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(
          JSON.stringify({
            audio: base64Pcm,
          })
        );
      });
    } catch (err: any) {
      console.error('AudioWorklet mic streaming error:', err);
      this.stopLiveSession(
        "Couldn't start microphone audio processing in this browser. You can keep typing below."
      );
    }
  }

  private finalizeCurrentTurnBubbles() {
    if (this.currentUserMessageId) {
      this.currentUserMessageId = null;
      this.currentUserTurnText = '';
      this.completedVoiceTurns += 1;
      this.config.onUserMessageTurn?.();
    }
    if (this.currentGuideMessageId) {
      this.currentGuideMessageId = null;
      this.currentGuideTurnText = '';
    }
  }

  private handleServerMessage(rawData: string) {
    try {
      const data = JSON.parse(rawData);

      // 1. Explicit error from server { type: "error", code, message }
      if (data.type === 'error' || data.error) {
        const msg =
          data.message ||
          data.error ||
          "Voice session encountered an error. You can try starting voice again, or keep typing below.";
        this.currentError = msg;
        this.stopLiveSession(msg);
        return;
      }

      // 2. Background reconnection status updates
      if (data.type === 'status') {
        if (data.state === 'reconnecting') {
          this.audioPlayer.stop();
          this.isSpeaking = false;
          this.finalizeCurrentTurnBubbles();
          this.isConnecting = true;
          this.currentError = 'Voice connection hiccuped — reconnecting in the background…';
          this.updateState();
          return;
        }
        if (data.state === 'live') {
          this.isConnecting = false;
          this.isLiveActive = true;
          this.isListening = true;
          this.currentError = null;
          this.updateState();
          this.resetVoiceIdleTimeout();

          // Send current screen frame once when voice session reconnects
          if (this.latestScreenFrame) {
            this.maybeSendLiveScreenFrame({ forceChange: true, bypassCooldown: true });
          }
          return;
        }
      }

      // 3. System line notification from server (e.g., fresh session fallback)
      if (data.type === 'systemLine' && typeof data.text === 'string') {
        this.addMessage('system', data.text);
        return;
      }

      // 3b. Server auto-disconnect (idle or resume-later): stop BOTH voice and
      // screen share. Stopping voice alone would leave screen share running.
      if (data.type === 'autoDisconnect') {
        const reason =
          typeof data.reason === 'string' && data.reason
            ? data.reason
            : 'Voice and screen share disconnected.';
        this.addMessage('system', reason);
        this.stopScreenShare();
        this.config.onStopScreenshareRequested();
        this.stopLiveSession(reason);
        return;
      }

      // 4. Initial connection confirmed by server
      if (data.connected) {
        this.clearConnectTimeout();
        this.isConnecting = false;
        this.isLiveActive = true;
        this.isListening = true;
        this.currentError = null;
        this.updateState();
        this.resetVoiceIdleTimeout();
        this.startMicStreaming();

        // Send current screen frame once when a voice session starts
        if (this.latestScreenFrame) {
          this.maybeSendLiveScreenFrame({ forceChange: true, bypassCooldown: true });
        }
        return;
      }

      // 5. Server closed session intentionally
      if (data.closed) {
        const reason = data.reason && data.reason !== 'Session ended' ? data.reason : undefined;
        if (reason) this.currentError = reason;
        this.stopLiveSession(reason);
        return;
      }

      // 6. Tool Calls
      if (data.toolCall) {
        this.handleToolCalls(data.toolCall, data.executedResponses);
      }

      // 7. Spoken user input transcription ({ type: "userTranscript", text })
      if (data.type === 'userTranscript' && typeof data.text === 'string') {
        this.appendUserLiveText(data.text);
        return;
      }
      if (data.userText) {
        this.appendUserLiveText(data.userText);
      }

      // 8. Spoken guide output transcription ({ type: "guideTranscript", text })
      if (data.type === 'guideTranscript' && typeof data.text === 'string') {
        this.appendGuideLiveText(data.text);
        return;
      }
      if (data.text) {
        this.appendGuideLiveText(data.text);
      }

      // 9. Server Audio output (24kHz PCM)
      if (data.audio) {
        this.isSpeaking = true;
        this.updateState();
        this.audioPlayer.playPcmChunk(data.audio);
      }

      // 10. Barge-in: user interrupted model -> finalize the guide bubble as-is and stop audio
      if (data.interrupted) {
        this.isSpeaking = false;
        this.audioPlayer.stop();
        this.finalizeCurrentTurnBubbles();
        this.updateState();
        this.pushLiveContextRefresh(false);
      }

      // 11. Turn complete -> finalize current spoken bubbles so next speech starts a new bubble
      if (data.turnComplete) {
        this.isSpeaking = false;
        this.finalizeCurrentTurnBubbles();
        this.updateState();
        // Refresh context every few turns so server always has recent transcript & routine state
        if (this.completedVoiceTurns % 2 === 0) {
          this.pushLiveContextRefresh(false);
        }
      }
    } catch {
      // Ignore malformed non-JSON frame
    }
  }

  /**
   * Appends userTranscript chunks to the current spoken-user bubble.
   * Starts a new bubble after each guide turn.
   * If the first userTranscript chunk for a turn arrives after the guide's bubble for that turn
   * already exists, inserts the user bubble BEFORE that guide bubble so the order reads naturally.
   */
  private appendUserLiveText(textChunk: string) {
    if (!textChunk) return;

    this.resetVoiceIdleTimeout();

    const isFirstChunkOfTurn = !this.currentUserMessageId;
    this.currentUserTurnText += textChunk;
    const displayText = this.currentUserTurnText.trim() || textChunk;

    if (isFirstChunkOfTurn) {
      // Send latest screen frame right away when a new user speech turn starts (bypass the 3s cooldown so the model sees what the user sees as they ask about it)
      this.maybeSendLiveScreenFrame({ forceChange: true, bypassCooldown: true });

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        role: 'user',
        text: displayText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'spoken',
      };

      // Check if the guide's bubble for this turn already exists
      if (this.currentGuideMessageId) {
        const guideIdx = this.messages.findIndex(m => m.id === this.currentGuideMessageId);
        if (guideIdx !== -1) {
          this.messages.splice(guideIdx, 0, newMsg);
        } else {
          this.messages.push(newMsg);
        }
      } else {
        this.messages.push(newMsg);
      }

      if (this.messages.length > 400) {
        this.messages = this.messages.slice(-400);
      }
      this.currentUserMessageId = newMsg.id;
      this.config.onTranscriptUpdate([...this.messages]);
    } else {
      const idx = this.messages.findIndex(m => m.id === this.currentUserMessageId);
      if (idx !== -1) {
        this.messages[idx] = {
          ...this.messages[idx],
          text: displayText,
        };
        this.config.onTranscriptUpdate([...this.messages]);
      }
    }
  }

  private appendGuideLiveText(textChunk: string) {
    if (!textChunk) return;
    this.currentGuideTurnText += textChunk;
    const displayText = this.currentGuideTurnText.trim() || textChunk;

    if (!this.currentGuideMessageId) {
      const msg = this.addMessage('guide', displayText, {
        source: 'spoken',
      });
      this.currentGuideMessageId = msg.id;
    } else {
      const idx = this.messages.findIndex(m => m.id === this.currentGuideMessageId);
      if (idx !== -1) {
        this.messages[idx] = {
          ...this.messages[idx],
          text: displayText,
        };
        this.config.onTranscriptUpdate([...this.messages]);
      }
    }
  }

  private extractDevicesFromText(rawText?: string): string[] {
    if (!rawText || typeof rawText !== 'string') return [];
    const lower = rawText.toLowerCase();
    const detected: string[] = [];
    if (/\b(website|web|browser|muse\.ai|computer|laptop|desktop)\b/.test(lower) && !/\bmac app\b/.test(lower)) {
      detected.push('Website');
    }
    if (/\b(iphone|ios|ipad)\b/.test(lower)) {
      detected.push('iPhone');
    }
    if (/\bandroid\b/.test(lower)) {
      detected.push('Android');
    }
    if (/\b(mac app|macbook|imac|macos|mac)\b/.test(lower)) {
      detected.push('Mac app');
    }
    if (/\bwhatsapp\b/.test(lower)) {
      detected.push('WhatsApp');
    }
    return detected;
  }

  private async applyToolsProfilePatch(patch: ToolsProfilePatch) {
    if (!this.config.onToolsProfileUpdated) return;
    try {
      const outcome = await this.config.onToolsProfileUpdated(patch);
      if (outcome && outcome.summaryLine) {
        this.addMessage('system', outcome.summaryLine, {
          undoToolsProfileSnapshot: outcome.undoSnapshot,
        });
        this.pushLiveContextRefresh(false, true);
      }
    } catch (err) {
      console.warn('Failed to apply tools profile patch:', err);
    }
  }

  private handleToolCalls(toolCall: any, executedResponses?: any[]) {
    const calls = toolCall.functionCalls || [];
    const hasExplicitToolsUpdate = calls.some((c: any) => c.name === 'update_tools_profile');

    for (const call of calls) {
      const { name, args } = call;

      if (name === 'request_screenshare') {
        const reason = args?.reason || 'Let me take a look at what you see.';
        this.addMessage('system', `The guide requested to see your screen: "${reason}"`);
        this.config.onRequestScreenshareConsent(
          reason,
          () => this.startScreenShare(),
          () => this.addMessage('system', 'Screen sharing was declined by you.')
        );
      } else if (name === 'stop_screenshare') {
        this.stopScreenShare();
        this.config.onStopScreenshareRequested();
        this.addMessage('system', 'Screen sharing ended by guide.');
      } else if (name === 'launch_app') {
        const appId = args?.app_id;
        this.config.onAppLaunched(appId);
        this.addMessage('system', `Launched guided routine: ${appId}`);
      } else if (name === 'confirm_step' || name === 'update_routine_progress') {
        const appId = args?.app_id;
        const stepNum = Number(args?.step ?? args?.completed_step ?? 1);
        const evidence: StepEvidence =
          name === 'confirm_step' && args?.evidence === 'screen' ? 'screen' : 'user';
        const note = typeof args?.note === 'string' ? args.note.trim() : undefined;
        const nextStep =
          args?.next_step !== undefined && args?.next_step !== null
            ? Number(args?.next_step)
            : null;
        this.confirmRoutineStep(appId, stepNum, evidence, note, nextStep);

        // Getting Started step 1 (device) should also save the device to tools profile
        if (!hasExplicitToolsUpdate && appId === 'getting-started' && stepNum === 1) {
          const lastUserMsg = [...this.messages].reverse().find(m => m.role === 'user')?.text || '';
          const devices = this.extractDevicesFromText(`${note || ''} ${lastUserMsg}`);
          if (devices.length > 0) {
            this.applyToolsProfilePatch({ devices });
          }
        }
      } else if (name === 'update_tools_profile') {
        const res = executedResponses?.find(r => r.name === 'update_tools_profile')?.response?.result;
        const patch: ToolsProfilePatch = {
          add: Array.isArray(res?.add) ? res.add : Array.isArray(args?.add) ? args.add : [],
          remove: Array.isArray(res?.remove)
            ? res.remove
            : Array.isArray(args?.remove)
            ? args.remove
            : [],
          devices: Array.isArray(res?.devices)
            ? res.devices
            : Array.isArray(args?.devices)
            ? args.devices
            : [],
          otherAdded: Array.isArray(res?.otherAdded) ? res.otherAdded : [],
        };
        this.applyToolsProfilePatch(patch);
      } else if (name === 'save_session_note') {
        const text = args?.text || '';
        Promise.resolve(this.config.onNoteSaved(text))
          .then((ok) => {
            if (ok !== false) {
              this.noteSavedInRoutine = true;
            }
          })
          .catch(() => {});
        this.addMessage('system', `Saved note: "${text}"`);
      } else if (name === 'get_booking_link') {
        const res = executedResponses?.find(r => r.name === 'get_booking_link')?.response?.result;
        if (res?.bookingUrl) {
          this.addMessage('system', "Nic's Booking Page is ready:", {
            bookingUrl: res.bookingUrl,
          });
        }
      } else if (name === 'escalate_to_owner') {
        const goal = args?.goal || '';
        const tried = args?.tried || '';
        const blocker = args?.blocker || args?.summary || '';
        const reportCard = { goal, tried, blocker };

        // In voice mode, attach reportCard to the guide's current spoken bubble (or add card with empty text)
        if (this.isLiveActive) {
          let targetIdx = -1;
          if (this.currentGuideMessageId) {
            targetIdx = this.messages.findIndex(m => m.id === this.currentGuideMessageId);
          }
          if (targetIdx !== -1) {
            this.messages[targetIdx] = {
              ...this.messages[targetIdx],
              reportCard,
            };
            this.config.onTranscriptUpdate([...this.messages]);
          } else {
            const msg = this.addMessage('guide', '', {
              source: 'spoken',
              reportCard,
            });
            this.currentGuideMessageId = msg.id;
          }
        } else {
          this.addMessage(
            'guide',
            "I've drafted a short note for Nic below. Have a look, change anything you like, and press Send if it looks right. You can also book a time directly.",
            {
              source: 'typed',
              reportCard,
            }
          );
        }
      } else if (name === 'save_task_contract') {
        const res = executedResponses?.find(r => r.name === 'save_task_contract')?.response?.result;
        const contractCard = this.buildStoredContractCard(args, res);
        this.attachAndPersistContractCard(contractCard, this.isLiveActive);
      }
    }
  }

  private buildStoredContractCard(args: any, res: any): StoredContractCard {
    const projectId = String(res?.project_id || args?.project_id || 'first-task').trim();
    const title = String(res?.title || args?.title || projectId).trim();
    const rawContract = res?.contract || args || {};
    const contract: TaskContractFields = {
      goal: String(rawContract.goal ?? args?.goal ?? '').trim(),
      do: String(rawContract.do ?? args?.do ?? '').trim(),
      do_not: String(rawContract.do_not ?? args?.do_not ?? '').trim(),
      ask_me_before: String(rawContract.ask_me_before ?? args?.ask_me_before ?? '').trim(),
      report_back: String(rawContract.report_back ?? args?.report_back ?? '').trim(),
      stop_if: String(rawContract.stop_if ?? args?.stop_if ?? '').trim(),
    };
    const rungNum = Number(res?.rung ?? args?.rung ?? 1);
    const rung: 0 | 1 | 2 | 3 =
      rungNum <= 0 ? 0 : rungNum === 1 ? 1 : rungNum === 2 ? 2 : 3;
    const rungName = String(res?.rungName || `Rung ${rung}`).trim();
    const rungText = res?.rungText ? String(res.rungText) : undefined;
    let ladder: Array<{ rung: number; name: string; text: string }> | undefined;
    if (Array.isArray(res?.ladder)) {
      ladder = res.ladder;
    } else if (res?.ladder && typeof res.ladder === 'object') {
      ladder = [0, 1, 2, 3].map(r => {
        const raw = String(res.ladder[String(r)] || '');
        const match = raw.match(/^([^—–-]+)[—–-]\s*(.+)$/);
        return {
          rung: r,
          name: match ? match[1].trim() : `Rung ${r}`,
          text: match ? match[2].trim() : raw,
        };
      });
    }

    return {
      projectId,
      title,
      contract,
      rung,
      rungName,
      rungText,
      ladder,
      saved: true,
    };
  }

  private attachAndPersistContractCard(contractCard: StoredContractCard, isVoiceMode: boolean) {
    if (this.config.onContractSaved) {
      Promise.resolve(this.config.onContractSaved(contractCard))
        .then(() => {
          this.pushLiveContextRefresh(false, false, true);
        })
        .catch((err) => {
          console.warn('Failed to save contract from tool call:', err);
        });
    }

    if (isVoiceMode) {
      let targetIdx = -1;
      if (this.currentGuideMessageId) {
        targetIdx = this.messages.findIndex(m => m.id === this.currentGuideMessageId);
      }
      if (targetIdx !== -1) {
        this.messages[targetIdx] = {
          ...this.messages[targetIdx],
          contractCard,
        };
        this.config.onTranscriptUpdate([...this.messages]);
      } else {
        const msg = this.addMessage('guide', '', {
          source: 'spoken',
          contractCard,
        });
        this.currentGuideMessageId = msg.id;
      }
    } else {
      this.addMessage(
        'guide',
        `I've put together your task contract for ${contractCard.title} at Rung ${contractCard.rung} (${contractCard.rungName}) below. You can tweak any field, save it to My projects, or copy the instructions for Muse.`,
        {
          source: 'typed',
          contractCard,
        }
      );
    }
  }

  /**
   * Starts screen sharing with 1 FPS local preview and smart frame sending in voice mode.
   * Returns true ONLY if capture actually started (never sets sharing on cancelled picker).
   */
  public async startScreenShare(): Promise<boolean> {
    if (this.screenStreamer && this.screenStreamer.isSharing()) return true;

    this.hasSentInitialShareFrame = false;

    const streamer = new ScreenStreamer(
      (jpegBase64, thumbnail) => {
        this.latestScreenFrame = jpegBase64;
        this.latestScreenThumb = thumbnail;
        if (this.config.onScreenFrameUpdate) {
          this.config.onScreenFrameUpdate(jpegBase64);
        }

        // In VOICE mode: send once when sharing starts, then only when visibly changed (at most 1 every 3s)
        if (!this.hasSentInitialShareFrame) {
          this.hasSentInitialShareFrame = true;
          this.maybeSendLiveScreenFrame({ forceChange: true, bypassCooldown: true });
        } else {
          this.maybeSendLiveScreenFrame({ forceChange: false, bypassCooldown: false });
        }
      },
      () => {
        this.latestScreenFrame = null;
        this.latestScreenThumb = null;
        this.lastSentScreenThumb = null;
        this.hasSentInitialShareFrame = false;
        if (this.config.onScreenFrameUpdate) {
          this.config.onScreenFrameUpdate(null);
        }
        this.addMessage('system', 'Screen share ended.');
        this.config.onStopScreenshareRequested();
      }
    );

    try {
      const ok = await streamer.startCapture();
      if (ok) {
        this.screenStreamer = streamer;
        this.addMessage(
          'system',
          'Screen sharing active. The guide can now see your screen and offer visual guidance.'
        );
        return true;
      } else {
        this.screenStreamer = null;
        return false;
      }
    } catch (err: any) {
      console.warn('Screen share cancelled or failed:', err);
      this.screenStreamer = null;
      return false;
    }
  }

  public stopScreenShare() {
    if (this.screenStreamer) {
      this.screenStreamer.stopCapture();
      this.screenStreamer = null;
    }
    this.latestScreenFrame = null;
    this.latestScreenThumb = null;
    this.lastSentScreenThumb = null;
    this.hasSentInitialShareFrame = false;
    if (this.config.onScreenFrameUpdate) {
      this.config.onScreenFrameUpdate(null);
    }
  }

  public isSharingScreen(): boolean {
    return this.screenStreamer ? this.screenStreamer.isSharing() : false;
  }

  /**
   * Send a static image (screenshot upload fallback for mobile devices)
   */
  public sendImageFrame(jpegBase64: string) {
    this.latestScreenFrame = jpegBase64;
    if (this.config.onScreenFrameUpdate) {
      this.config.onScreenFrameUpdate(jpegBase64);
    }

    if (this.isLiveActive && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          video: jpegBase64,
        })
      );
      this.lastSentFrameTime = Date.now();
    }
    this.addMessage('system', 'Screenshot uploaded and shared with the guide.');
  }

  /**
   * Retries a failed /api/chat message without duplicating the user bubble in the transcript.
   */
  public async retryTextMessage(systemErrorMessageId: string, textToRetry: string): Promise<void> {
    this.removeMessageById(systemErrorMessageId);
    this.currentError = null;
    this.updateState();
    await this.dispatchChatRequest(textToRetry);
  }

  /**
   * Text message sending (used both when voice is active or in text-only mode)
   */
  public async sendTextMessage(text: string): Promise<void> {
    if (!text.trim()) return;

    this.resetVoiceIdleTimeout();
    this.finalizeCurrentTurnBubbles();
    this.addMessage('user', text, { source: 'typed' });
    this.config.onUserMessageTurn?.();

    // If live WebSocket is connected, send text turn directly and send latest screen frame (respecting 3s minimum)
    if (this.isLiveActive && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.pushLiveContextRefresh(true);
      this.maybeSendLiveScreenFrame({ forceChange: true, bypassCooldown: false });
      this.ws.send(JSON.stringify({ text }));
      return;
    }

    await this.dispatchChatRequest(text);
  }

  private async dispatchChatRequest(lastUserText: string): Promise<void> {
    try {
      const chatMessagesPayload = this.messages
        .filter(m => !m.retryText)
        .slice(-60)
        .map(m => ({ role: m.role, text: m.text.slice(0, 4000) }));

      const res = await authFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: this.config.product,
          messages: chatMessagesPayload,
          userTimezone: this.config.userTimezone,
          currentScreenFrame: this.latestScreenFrame,
          routineState: this.getRoutineState(),
          progressSummary: this.config.progressSummary || null,
          sessionNotes: this.config.sessionNotes || [],
          toolsProfile: this.config.toolsProfile || null,
          userProjects: Object.values(this.config.userProjects || {}),
          latestAudit: this.config.latestAudit || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429) {
          const rateMsg =
            data.message ||
            data.error ||
            "You've sent a lot of messages quickly. Please wait a moment and try again.";
          this.currentError = rateMsg;
          this.updateState();
          this.addMessage('system', rateMsg, { retryText: lastUserText });
          return;
        }

        const failMsg = "I couldn't reach the guide just now. Your message is saved.";
        this.currentError = failMsg;
        this.updateState();
        this.addMessage('system', failMsg, { retryText: lastUserText });
        return;
      }

      const escalateInvocation = data.toolInvocations?.find((ti: any) => ti.name === 'escalate_to_owner');
      const reportCardData = escalateInvocation
        ? {
            goal: escalateInvocation.args?.goal || '',
            tried: escalateInvocation.args?.tried || '',
            blocker: escalateInvocation.args?.blocker || escalateInvocation.args?.summary || '',
          }
        : undefined;

      const contractInvocation = data.toolInvocations?.find((ti: any) => ti.name === 'save_task_contract');
      const contractCardData = contractInvocation
        ? this.buildStoredContractCard(contractInvocation.args, contractInvocation.result)
        : undefined;

      if (data.reply) {
        this.addMessage('guide', data.reply, {
          source: 'typed',
          ...(reportCardData ? { reportCard: reportCardData } : {}),
          ...(contractCardData ? { contractCard: contractCardData } : {}),
        });
      } else if (reportCardData || contractCardData) {
        this.addMessage(
          'guide',
          reportCardData
            ? "I've drafted a short note for Nic below. Have a look, change anything you like, and press Send if it looks right. You can also book a time directly."
            : `I've put together your task contract for ${contractCardData?.title || 'your project'} below.`,
          {
            source: 'typed',
            ...(reportCardData ? { reportCard: reportCardData } : {}),
            ...(contractCardData ? { contractCard: contractCardData } : {}),
          }
        );
      }

      // Check for executed tools
      if (data.toolInvocations) {
        const hasExplicitToolsUpdate = data.toolInvocations.some(
          (ti: any) => ti.name === 'update_tools_profile'
        );
        const hasExplicitSessionNote = data.toolInvocations.some(
          (ti: any) => ti.name === 'save_session_note'
        );

        // Sort so record_audit_result runs before confirm_step
        const sortedInvocations = [...data.toolInvocations].sort((a: any, b: any) => {
          if (a?.name === 'record_audit_result' && b?.name !== 'record_audit_result') return -1;
          if (a?.name !== 'record_audit_result' && b?.name === 'record_audit_result') return 1;
          return 0;
        });

        for (const ti of sortedInvocations) {
          if (ti.name === 'record_audit_result') {
            const resObj = ti.result || {};
            const appId = String(
              resObj.app_id || ti.args?.app_id || this.getRoutineState().activeRoutineId || 'safety-audit'
            ).trim();
            const area = String(resObj.area || ti.args?.area || 'connections').trim() as AuditArea;
            const rawRating = String(resObj.rating || ti.args?.rating || 'amber').trim().toLowerCase();
            const rating: AuditRating =
              rawRating === 'green' || rawRating === 'amber' || rawRating === 'red'
                ? rawRating
                : 'amber';
            const reason = String(resObj.reason || ti.args?.reason || '').trim();
            if (this.config.onAuditResultRecorded) {
              try {
                await this.config.onAuditResultRecorded({ appId, area, rating, reason });
              } catch (err) {
                console.warn('Failed to record audit result:', err);
              }
            }
          } else if (ti.name === 'report_knowledge_mismatch') {
            const resObj = ti.result || {};
            const topic = String(resObj.topic || ti.args?.topic || 'menu or setting').trim();
            const notesSay = String(resObj.notes_say || ti.args?.notes_say || '').trim();
            const screenShows = String(resObj.screen_shows || ti.args?.screen_shows || '').trim();
            const device = String(
              resObj.device ||
                ti.args?.device ||
                this.config.toolsProfile?.devices?.[0] ||
                'Website'
            ).trim();
            if (this.config.onKnowledgeMismatchReported) {
              try {
                await this.config.onKnowledgeMismatchReported({
                  topic,
                  notesSay,
                  screenShows,
                  device,
                  alsoSavedSessionNote: hasExplicitSessionNote,
                });
              } catch (err) {
                console.warn('Failed to handle knowledge mismatch:', err);
              }
            }
          } else if (ti.name === 'launch_app') {
            this.config.onAppLaunched(ti.args?.app_id);
          } else if (ti.name === 'confirm_step' || ti.name === 'update_routine_progress') {
            const appId = ti.args?.app_id || ti.result?.app_id;
            const stepNum = Number(
              ti.args?.step ?? ti.args?.completed_step ?? ti.result?.step ?? 1
            );
            const evidence: StepEvidence =
              ti.name === 'confirm_step' &&
              (ti.args?.evidence === 'screen' || ti.result?.evidence === 'screen')
                ? 'screen'
                : 'user';
            const note =
              typeof ti.args?.note === 'string'
                ? ti.args.note.trim()
                : typeof ti.result?.note === 'string'
                ? ti.result.note.trim()
                : undefined;
            const nextStep =
              ti.args?.next_step !== undefined && ti.args?.next_step !== null
                ? Number(ti.args.next_step)
                : ti.result?.next_step !== undefined && ti.result?.next_step !== null
                ? Number(ti.result.next_step)
                : null;
            this.confirmRoutineStep(appId, stepNum, evidence, note, nextStep);

            // Getting Started step 1 (device) should also save the device to tools profile
            if (!hasExplicitToolsUpdate && appId === 'getting-started' && stepNum === 1) {
              const devices = this.extractDevicesFromText(`${note || ''} ${lastUserText}`);
              if (devices.length > 0) {
                await this.applyToolsProfilePatch({ devices });
              }
            }
          } else if (ti.name === 'update_tools_profile') {
            const resObj = ti.result || {};
            const patch: ToolsProfilePatch = {
              add: Array.isArray(resObj.add) ? resObj.add : Array.isArray(ti.args?.add) ? ti.args.add : [],
              remove: Array.isArray(resObj.remove)
                ? resObj.remove
                : Array.isArray(ti.args?.remove)
                ? ti.args.remove
                : [],
              devices: Array.isArray(resObj.devices)
                ? resObj.devices
                : Array.isArray(ti.args?.devices)
                ? ti.args.devices
                : [],
              otherAdded: Array.isArray(resObj.otherAdded) ? resObj.otherAdded : [],
            };
            await this.applyToolsProfilePatch(patch);
          } else if (ti.name === 'save_task_contract') {
            const cardToSave =
              contractCardData || this.buildStoredContractCard(ti.args, ti.result);
            if (this.config.onContractSaved) {
              try {
                await this.config.onContractSaved(cardToSave);
              } catch (err) {
                console.warn('Failed to persist task contract:', err);
              }
            }
          } else if (ti.name === 'save_session_note') {
            const savedOk = await this.config.onNoteSaved(ti.args?.text);
            if (savedOk !== false) {
              this.noteSavedInRoutine = true;
            }
          } else if (ti.name === 'request_screenshare') {
            const reason = ti.args?.reason || 'Let me see your screen.';
            this.config.onRequestScreenshareConsent(
              reason,
              () => this.startScreenShare(),
              () => this.addMessage('system', 'Screen sharing was declined by you.')
            );
          } else if (ti.name === 'stop_screenshare') {
            this.stopScreenShare();
            this.config.onStopScreenshareRequested();
            this.addMessage('system', 'Screen sharing ended by guide.');
          } else if (ti.name === 'end_voice_and_screen_share') {
            // Voice disconnect itself happens server-side after the guide's
            // goodbye turn; stop screen share now so it does not linger.
            this.stopScreenShare();
            this.config.onStopScreenshareRequested();
            this.addMessage('system', 'Screen sharing ended. Voice will disconnect after the guide says goodbye.');
          } else if (ti.name === 'get_booking_link' && ti.result?.bookingUrl) {
            this.addMessage('system', "Nic's Booking Page is ready:", {
              bookingUrl: ti.result.bookingUrl,
            });
          }
        }
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const failMsg = "I couldn't reach the guide just now. Your message is saved.";
      this.currentError = failMsg;
      this.updateState();
      this.addMessage('system', failMsg, { retryText: lastUserText });
    }
  }

  private emitRoutineProgressFromCard(card: NonNullable<ChatMessage['appCard']>) {
    if (!this.config.onRoutineProgressUpdated || !card.appId) return;
    const nowIso = new Date().toISOString();
    const completedSteps: CompletedStepRecord[] = card.steps
      .filter(s => Boolean(s.completed))
      .map(s => ({
        step: Number(s.number),
        evidence: s.evidence || 'self',
        note: s.note,
        at: s.at || nowIso,
      }));
    const isAllDone = card.steps.length > 0 && completedSteps.length === card.steps.length;
    const status: 'not-started' | 'in-progress' | 'done' = isAllDone
      ? 'done'
      : 'in-progress';
    const activeStep = card.activeStep || 1;

    this.config.onRoutineProgressUpdated(card.appId, {
      status,
      completedSteps,
      activeStep,
    });
  }

  public confirmRoutineStep(
    appId: string | undefined,
    stepNum: number,
    evidence: StepEvidence = 'user',
    note?: string,
    explicitNextStep: number | null = null
  ) {
    let updatedCard: NonNullable<ChatMessage['appCard']> | null = null;
    let newlyCompletedAppId: string | null = null;
    const nowIso = new Date().toISOString();

    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (msg.appCard && (!appId || msg.appCard.appId === appId)) {
        const wasAllDone =
          msg.appCard.steps.length > 0 && msg.appCard.steps.every(s => s.completed);
        const steps = msg.appCard.steps.map(s => {
          if (s.number === stepNum) {
            return {
              ...s,
              completed: true,
              evidence,
              note: note || s.note,
              at: nowIso,
            };
          }
          return s;
        });

        const isNowAllDone = steps.length > 0 && steps.every(s => s.completed);

        let nextActive = stepNum;
        if (explicitNextStep !== null && explicitNextStep !== undefined && explicitNextStep > 0) {
          nextActive = explicitNextStep;
        } else {
          const nextUncompletedAfter = steps.find(s => !s.completed && s.number > stepNum);
          const anyUncompleted = steps.find(s => !s.completed);
          if (nextUncompletedAfter) {
            nextActive = nextUncompletedAfter.number;
          } else if (anyUncompleted) {
            nextActive = anyUncompleted.number;
          } else {
            nextActive = steps.length > 0 ? steps[steps.length - 1].number : stepNum;
          }
        }

        msg.appCard = {
          ...msg.appCard,
          steps,
          activeStep: nextActive,
        };
        updatedCard = msg.appCard;
        if (!wasAllDone && isNowAllDone) {
          newlyCompletedAppId = msg.appCard.appId;
        }
        break;
      }
    }

    if (updatedCard) {
      this.config.onTranscriptUpdate([...this.messages]);
      this.pushLiveContextRefresh(true);
      this.emitRoutineProgressFromCard(updatedCard);
      if (newlyCompletedAppId) {
        this.config.onRoutineCompleted?.(newlyCompletedAppId);
      }
    }
  }

  public updateRoutineCardProgress(
    appId: string | undefined,
    completedStep: number,
    nextStep: number | null
  ) {
    this.confirmRoutineStep(appId, completedStep, 'user', undefined, nextStep);
  }

  public toggleRoutineStep(appId: string, stepNumber: number, isDone: boolean) {
    let updatedCard: NonNullable<ChatMessage['appCard']> | null = null;
    let newlyCompletedAppId: string | null = null;
    const nowIso = new Date().toISOString();

    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (msg.appCard && (!appId || msg.appCard.appId === appId)) {
        const wasAllDone =
          msg.appCard.steps.length > 0 && msg.appCard.steps.every(s => s.completed);
        const steps = msg.appCard.steps.map(s => {
          if (s.number === stepNumber) {
            if (isDone) {
              return {
                ...s,
                completed: true,
                evidence: 'self' as StepEvidence,
                at: nowIso,
              };
            } else {
              return {
                ...s,
                completed: false,
                evidence: undefined,
                note: undefined,
                at: undefined,
              };
            }
          }
          return s;
        });

        const isNowAllDone = steps.length > 0 && steps.every(s => s.completed);
        let activeStep = msg.appCard.activeStep || 1;
        if (isDone && activeStep === stepNumber) {
          const nextUncompleted =
            steps.find(s => !s.completed && s.number > stepNumber) ||
            steps.find(s => !s.completed);
          if (nextUncompleted) {
            activeStep = nextUncompleted.number;
          }
        }

        msg.appCard = {
          ...msg.appCard,
          steps,
          activeStep,
        };
        updatedCard = msg.appCard;
        if (!wasAllDone && isNowAllDone) {
          newlyCompletedAppId = msg.appCard.appId;
        }
        break;
      }
    }

    if (updatedCard) {
      this.config.onTranscriptUpdate([...this.messages]);
      this.pushLiveContextRefresh(true);
      this.emitRoutineProgressFromCard(updatedCard);
      if (newlyCompletedAppId) {
        this.config.onRoutineCompleted?.(newlyCompletedAppId);
      }
    }
  }

  public setRoutineActiveStep(appId: string, stepNumber: number) {
    let updatedCard: NonNullable<ChatMessage['appCard']> | null = null;
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (msg.appCard && (!appId || msg.appCard.appId === appId)) {
        msg.appCard = {
          ...msg.appCard,
          activeStep: stepNumber,
        };
        updatedCard = msg.appCard;
        break;
      }
    }
    if (updatedCard) {
      this.config.onTranscriptUpdate([...this.messages]);
      this.pushLiveContextRefresh(true);
      this.emitRoutineProgressFromCard(updatedCard);
    }
  }

  public buildAppCardWithRestoredProgress(
    app: any,
    existingProgress?: RoutineProgressDoc | null
  ): {
    appCard: NonNullable<ChatMessage['appCard']>;
    isResumingInProgress: boolean;
    restoredStepNumber: number;
  } {
    const isResumingInProgress = Boolean(
      existingProgress &&
        existingProgress.status === 'in-progress' &&
        (existingProgress.completedSteps.length > 0 || existingProgress.activeStep > 1)
    );

    const completedMap = new Map<number, CompletedStepRecord>();
    if (isResumingInProgress && existingProgress) {
      for (const cs of existingProgress.completedSteps) {
        completedMap.set(Number(cs.step), cs);
      }
    }

    const steps: StoredRoutineStep[] = (Array.isArray(app.steps) ? app.steps : []).map(
      (s: any) => {
        const num = Number(s.number || 1);
        const saved = completedMap.get(num);
        return {
          ...s,
          number: num,
          title: s.title || `Step ${num}`,
          detail: s.detail || s.why || '',
          coach: s.coach || s.coachPrompt || '',
          coachPrompt: s.coach || s.coachPrompt || '',
          why: s.why || s.detail || '',
          where: s.where,
          done_when: s.done_when,
          verify: s.verify,
          if_stuck: s.if_stuck,
          safety: s.safety,
          area: s.area,
          rating: s.rating,
          completed: Boolean(saved),
          evidence: saved?.evidence,
          note: saved?.note,
          at: saved?.at,
        };
      }
    );

    let restoredStepNumber = 1;
    if (isResumingInProgress && existingProgress) {
      const candidate = existingProgress.activeStep || 1;
      const candidateStep = steps.find(s => s.number === candidate);
      if (candidateStep && !candidateStep.completed) {
        restoredStepNumber = candidate;
      } else {
        const firstUncompleted = steps.find(s => !s.completed);
        restoredStepNumber = firstUncompleted ? firstUncompleted.number : candidate;
      }
    }

    const appCard: NonNullable<ChatMessage['appCard']> = {
      appId: app.id,
      title: app.title,
      goal: app.goal || app.summary || '',
      activeStep: restoredStepNumber,
      steps,
    };

    return {
      appCard,
      isResumingInProgress,
      restoredStepNumber,
    };
  }

  public async startGuidedRoutine(
    app: any,
    existingProgress?: RoutineProgressDoc | null
  ): Promise<void> {
    this.noteSavedInRoutine = false;
    this.resetVoiceIdleTimeout();

    const { appCard, isResumingInProgress, restoredStepNumber } =
      this.buildAppCardWithRestoredProgress(app, existingProgress);

    const activeStepObj =
      (Array.isArray(app.steps)
        ? app.steps.find((s: any) => s.number === restoredStepNumber)
        : null) || (app.steps && app.steps.length > 0 ? app.steps[0] : null);
    const activeStepPrompt =
      activeStepObj?.coach || activeStepObj?.coachPrompt || activeStepObj?.detail || '';

    const introText = isResumingInProgress
      ? `You were on step ${restoredStepNumber} last time. Pick up there?`
      : `Starting the "${app.title}" routine with you. Let's take it one step at a time:`;

    // 1. Add interactive appCard to transcript and persist its in-progress state
    this.addMessage('guide', introText, {
      source: 'typed',
      appCard,
    });
    this.emitRoutineProgressFromCard(appCard);

    // 2. Prepare user prompt and routine coaching directive
    const userPromptText = isResumingInProgress
      ? `Let's pick up the "${app.title}" routine at step ${restoredStepNumber}.`
      : `Please walk me through the "${app.title}" routine.`;

    const directiveContext = `[Guided Routine Started: "${app.title}"]
Goal: ${app.goal}
Total Steps: ${app.steps?.length || 0}
Active Step: Step ${restoredStepNumber} ("${activeStepObj?.title || ''}" — ${activeStepObj?.why || activeStepObj?.detail || ''})
Coach Question for Step ${restoredStepNumber}: "${activeStepPrompt}"

Agent Coaching Instructions:
- The UI is already displaying the interactive routine card at Step ${restoredStepNumber}.
- NEVER list out all the steps or dump a checklist into your response.
- ${
      isResumingInProgress
        ? `Welcome them back to Step ${restoredStepNumber} ("${activeStepObj?.title || ''}") in one short sentence and ask its coach question: "${activeStepPrompt}".`
        : `Welcome them warmly to the routine in ONE short, calming sentence and ask the coach question for Step 1: "${activeStepPrompt}".`
    }
- Wait for the user to respond before calling confirm_step.`;

    if (this.isLiveActive && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.addMessage('user', userPromptText, { source: 'typed' });
      this.config.onUserMessageTurn?.();
      this.pushLiveContextRefresh(true);
      this.maybeSendLiveScreenFrame({ forceChange: true, bypassCooldown: false });
      this.ws.send(JSON.stringify({ text: `${userPromptText}\n\n${directiveContext}` }));
      return;
    }

    // In text mode, post to /api/chat
    this.addMessage('user', userPromptText, { source: 'typed' });
    this.config.onUserMessageTurn?.();
    await this.dispatchChatRequest(userPromptText);
  }

  public stopLiveSession(errorMessage?: string) {
    this.clearConnectTimeout();
    this.clearVoiceIdleTimeout();

    if (this.micWorklet) {
      try {
        this.micWorklet.stop();
      } catch (_) {}
      this.micWorklet = null;
    }

    if (this.micStream) {
      try {
        this.micStream.getTracks().forEach(t => t.stop());
      } catch (_) {}
      this.micStream = null;
    }

    if (this.ws) {
      try {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.close();
      } catch (_) {}
      this.ws = null;
    }

    this.audioPlayer.stop();
    this.finalizeCurrentTurnBubbles();

    this.isLiveActive = false;
    this.isConnecting = false;
    this.isListening = false;
    this.isSpeaking = false;
    this.currentError = errorMessage || null;

    this.config.onLiveStateChange({
      isLive: false,
      isConnecting: false,
      isSpeaking: false,
      isListening: false,
      error: errorMessage || null,
    });
  }

  private updateState() {
    this.config.onLiveStateChange({
      isLive: this.isLiveActive,
      isConnecting: this.isConnecting,
      isSpeaking: this.isSpeaking,
      isListening: this.isListening,
      error: this.currentError,
    });
  }
}
