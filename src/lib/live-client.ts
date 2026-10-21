import {
  startAudioWorkletMicCapture,
  MicWorkletController,
  LiveAudioPlayer,
} from './audio-utils.js';
import {
  ScreenStreamer,
  hasScreenVisiblyChanged,
} from './screen-share.js';
import { getIdToken, authFetch, ProgressSummaryDoc } from './firebase.js';

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
    steps: Array<{ number: number; title: string; detail: string; completed?: boolean; coachPrompt?: string }>;
  };
  reportCard?: {
    goal: string;
    tried: string;
    blocker: string;
  };
  toolNotice?: string;
  bookingUrl?: string;
  retryText?: string;
}

export interface LiveClientConfig {
  user?: { uid: string; displayName: string | null; email: string | null } | null;
  product: string;
  productName?: string;
  userTimezone: string;
  progressSummary?: ProgressSummaryDoc | null;
  sessionNotes?: string[];
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
}

const MIN_FRAME_INTERVAL_MS = 3000; // At most 1 frame every 3 seconds in voice mode
const CONNECT_TIMEOUT_MS = 15000; // 15-second timeout waiting for { connected: true }

export class CalmGuideLiveClient {
  private config: LiveClientConfig;
  private ws: WebSocket | null = null;
  private audioPlayer: LiveAudioPlayer;
  private micStream: MediaStream | null = null;
  private micWorklet: MicWorkletController | null = null;
  private connectTimeoutId: ReturnType<typeof setTimeout> | null = null;

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

  /**
   * Updates client configuration (user, product, progressSummary, sessionNotes)
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
    return {
      timezone: this.config.userTimezone,
      routineState: this.getRoutineState(),
      progressSummary: this.config.progressSummary || null,
      sessionNotes: this.config.sessionNotes || [],
      recentTranscript: this.messages
        .filter(m => m.role === 'user' || m.role === 'guide')
        .slice(-20)
        .map(m => ({ role: m.role, text: m.text.slice(0, 800) })),
      ...(this.config.context || {}),
    };
  }

  private pushLiveContextRefresh(includeRoutineTurnUpdate: boolean = false) {
    if (this.isLiveActive && this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const ctx = this.buildContextPayload();
        this.ws.send(
          JSON.stringify({
            type: 'context',
            context: ctx,
            routineState: includeRoutineTurnUpdate ? ctx.routineState : undefined,
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
      const wsUrl = `${protocol}//${window.location.host}/api/live-ws`;

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

      // 4. Initial connection confirmed by server
      if (data.connected) {
        this.clearConnectTimeout();
        this.isConnecting = false;
        this.isLiveActive = true;
        this.isListening = true;
        this.currentError = null;
        this.updateState();
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

    const isFirstChunkOfTurn = !this.currentUserMessageId;
    this.currentUserTurnText += textChunk;
    const displayText = this.currentUserTurnText.trim() || textChunk;

    if (isFirstChunkOfTurn) {
      // Send latest screen frame right away when a new user speech turn starts (respecting 3s minimum)
      this.maybeSendLiveScreenFrame({ forceChange: true, bypassCooldown: false });

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

  private handleToolCalls(toolCall: any, executedResponses?: any[]) {
    const calls = toolCall.functionCalls || [];
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
      } else if (name === 'update_routine_progress') {
        const appId = args?.app_id;
        const completedStep = Number(args?.completed_step);
        const nextStep = args?.next_step !== undefined ? Number(args?.next_step) : null;
        this.updateRoutineCardProgress(appId, completedStep, nextStep);
      } else if (name === 'save_session_note') {
        const text = args?.text || '';
        this.config.onNoteSaved(text);
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
        this.addMessage(
          'guide',
          "I've drafted a short note for Nic below. Have a look, change anything you like, and press Send if it looks right. You can also book a time directly.",
          {
            source: this.isLiveActive ? 'spoken' : 'typed',
            reportCard: {
              goal,
              tried,
              blocker,
            },
          }
        );
      }
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

      if (data.reply) {
        this.addMessage(
          'guide',
          data.reply,
          reportCardData ? { source: 'typed', reportCard: reportCardData } : { source: 'typed' }
        );
      } else if (reportCardData) {
        this.addMessage(
          'guide',
          "I've drafted a short note for Nic below. Have a look, change anything you like, and press Send if it looks right. You can also book a time directly.",
          { source: 'typed', reportCard: reportCardData }
        );
      }

      // Check for executed tools
      if (data.toolInvocations) {
        for (const ti of data.toolInvocations) {
          if (ti.name === 'launch_app') {
            this.config.onAppLaunched(ti.args?.app_id);
          } else if (ti.name === 'update_routine_progress') {
            const appId = ti.args?.app_id;
            const completedStep = Number(ti.args?.completed_step);
            const nextStep = ti.args?.next_step !== undefined ? Number(ti.args?.next_step) : null;
            this.updateRoutineCardProgress(appId, completedStep, nextStep);
          } else if (ti.name === 'save_session_note') {
            this.config.onNoteSaved(ti.args?.text);
          } else if (ti.name === 'request_screenshare') {
            const reason = ti.args?.reason || 'Let me see your screen.';
            this.config.onRequestScreenshareConsent(
              reason,
              () => this.startScreenShare(),
              () => this.addMessage('system', 'Screen sharing was declined by you.')
            );
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

  public updateRoutineCardProgress(appId: string | undefined, completedStep: number, nextStep: number | null) {
    let updated = false;
    let newlyCompletedAppId: string | null = null;

    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (msg.appCard && (!appId || msg.appCard.appId === appId)) {
        const wasAllDone = msg.appCard.steps.length > 0 && msg.appCard.steps.every(s => s.completed);
        const steps = msg.appCard.steps.map(s => {
          if (s.number === completedStep) {
            return { ...s, completed: true };
          }
          return s;
        });
        const isNowAllDone = steps.length > 0 && steps.every(s => s.completed);
        const activeStep = nextStep !== null && nextStep !== undefined ? nextStep : completedStep;
        msg.appCard = {
          ...msg.appCard,
          steps,
          activeStep,
        };
        updated = true;
        if (!wasAllDone && isNowAllDone) {
          newlyCompletedAppId = msg.appCard.appId;
        }
        break;
      }
    }
    if (updated) {
      this.config.onTranscriptUpdate([...this.messages]);
      this.pushLiveContextRefresh(true);
      if (newlyCompletedAppId) {
        this.config.onRoutineCompleted?.(newlyCompletedAppId);
      }
    }
  }

  public toggleRoutineStep(appId: string, stepNumber: number, isDone: boolean) {
    let newlyCompletedAppId: string | null = null;

    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (msg.appCard && (!appId || msg.appCard.appId === appId)) {
        const wasAllDone = msg.appCard.steps.length > 0 && msg.appCard.steps.every(s => s.completed);
        const steps = msg.appCard.steps.map(s =>
          s.number === stepNumber ? { ...s, completed: isDone } : s
        );
        const isNowAllDone = steps.length > 0 && steps.every(s => s.completed);
        msg.appCard = {
          ...msg.appCard,
          steps,
        };
        if (!wasAllDone && isNowAllDone) {
          newlyCompletedAppId = msg.appCard.appId;
        }
        break;
      }
    }
    this.config.onTranscriptUpdate([...this.messages]);
    this.pushLiveContextRefresh(true);
    if (newlyCompletedAppId) {
      this.config.onRoutineCompleted?.(newlyCompletedAppId);
    }
  }

  public setRoutineActiveStep(appId: string, stepNumber: number) {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (msg.appCard && (!appId || msg.appCard.appId === appId)) {
        msg.appCard = {
          ...msg.appCard,
          activeStep: stepNumber,
        };
        break;
      }
    }
    this.config.onTranscriptUpdate([...this.messages]);
    this.pushLiveContextRefresh(true);
  }

  public async startGuidedRoutine(app: any): Promise<void> {
    this.noteSavedInRoutine = false;
    const firstStep = app.steps && app.steps.length > 0 ? app.steps[0] : null;
    const firstStepPrompt = firstStep?.coachPrompt || firstStep?.detail || '';

    // 1. Add interactive appCard to transcript
    this.addMessage('guide', `Starting the "${app.title}" routine with you. Let's take it one step at a time:`, {
      source: 'typed',
      appCard: {
        appId: app.id,
        title: app.title,
        goal: app.goal,
        activeStep: 1,
        steps: app.steps.map((s: any) => ({ ...s, completed: false })),
      },
    });

    // 2. Prepare user prompt and routine coaching directive
    const userPromptText = `Please walk me through the "${app.title}" routine.`;
    const directiveContext = `[Guided Routine Started: "${app.title}"]
Goal: ${app.goal}
Total Steps: ${app.steps.length}
Active Step: Step 1 ("${firstStep?.title || 'Understand Intended Use'}" — ${firstStep?.detail || ''})
Coach Inquiry for Step 1: "${firstStepPrompt}"

Agent Coaching Instructions:
- The UI is already displaying the full stepped progress card to the user so they can see their progress.
- NEVER list out all the steps or dump a checklist into your response.
- Welcome them warmly to the routine in ONE short, calming sentence.
- Ask the inquiry for Step 1: "${firstStepPrompt}" to get their input.
- Wait for the user to respond before proceeding to Step 2.`;

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
