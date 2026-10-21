import { float32To16kHzPcmBase64, LiveAudioPlayer } from './audio-utils.js';
import { ScreenStreamer } from './screen-share.js';

export interface ChatMessage {
  id: string;
  role: 'user' | 'guide' | 'system';
  text: string;
  timestamp: string;
  appCard?: {
    appId: string;
    title: string;
    goal: string;
    activeStep?: number;
    steps: Array<{ number: number; title: string; detail: string; completed?: boolean; coachPrompt?: string }>;
  };
  toolNotice?: string;
  proposedSlots?: Array<{ displayFormatted: string; startIso: string }>;
  bookingUrl?: string;
}

export interface LiveClientConfig {
  userName: string;
  userEmail: string;
  product: string;
  userTimezone: string;
  useDeepThinking?: boolean;
  onTranscriptUpdate: (messages: ChatMessage[]) => void;
  onLiveStateChange: (state: {
    isLive: boolean;
    isConnecting: boolean;
    isSpeaking: boolean;
    isListening: boolean;
    error: string | null;
  }) => void;
  onRequestScreenshareConsent: (reason: string, onApprove: () => void, onDeny: () => void) => void;
  onStopScreenshareRequested: () => void;
  onAppLaunched: (appId: string) => void;
  onNoteSaved: (text: string) => void;
  onScreenFrameUpdate?: (frameBase64: string | null) => void;
}

export class CalmGuideLiveClient {
  private config: LiveClientConfig;
  private ws: WebSocket | null = null;
  private audioPlayer: LiveAudioPlayer;
  private inputAudioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micProcessor: ScriptProcessorNode | null = null;
  private screenStreamer: ScreenStreamer | null = null;
  private latestScreenFrame: string | null = null;

  private messages: ChatMessage[] = [];
  private currentGuideTurnText: string = '';
  private currentGuideMessageId: string | null = null;

  private isLiveActive: boolean = false;
  private isConnecting: boolean = false;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;

  constructor(config: LiveClientConfig) {
    this.config = config;
    this.audioPlayer = new LiveAudioPlayer();
  }

  public getMessages(): ChatMessage[] {
    return this.messages;
  }

  public setMessages(msgs: ChatMessage[]) {
    this.messages = msgs;
    this.config.onTranscriptUpdate([...this.messages]);
  }

  public getLatestScreenFrame(): string | null {
    return this.latestScreenFrame;
  }

  public addMessage(role: 'user' | 'guide' | 'system', text: string, extra?: Partial<ChatMessage>): ChatMessage {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...extra,
    };
    this.messages.push(msg);
    this.config.onTranscriptUpdate([...this.messages]);
    return msg;
  }

  /**
   * Starts the Live voice session using server WebSocket bridge /api/live-ws
   */
  public async startLiveSession(): Promise<boolean> {
    if (this.isLiveActive || this.isConnecting) return true;

    this.isConnecting = true;
    this.updateState();

    try {
      // 1. Request microphone access first
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 2. Connect via server WebSocket bridge /api/live-ws
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = new URL(`${protocol}//${window.location.host}/api/live-ws`);
      wsUrl.searchParams.set('userName', this.config.userName);
      wsUrl.searchParams.set('userEmail', this.config.userEmail);
      wsUrl.searchParams.set('product', this.config.product);
      wsUrl.searchParams.set('timezone', this.config.userTimezone);
      if (this.config.useDeepThinking) wsUrl.searchParams.set('deep', 'true');

      this.ws = new WebSocket(wsUrl.toString());

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.isLiveActive = true;
        this.isListening = true;
        this.updateState();
        this.startMicStreaming();

        // If screen share is already active, send the current frame immediately
        if (this.latestScreenFrame && this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ video: this.latestScreenFrame }));
        }
      };

      this.ws.onmessage = (event) => {
        this.handleServerMessage(event.data);
      };

      this.ws.onerror = (err) => {
        console.error('Live WebSocket error:', err);
        this.stopLiveSession('Voice connection error. You can continue speaking or typing.');
      };

      this.ws.onclose = () => {
        if (this.isLiveActive) {
          this.stopLiveSession();
        }
      };

      return true;
    } catch (err: any) {
      console.error('Failed to start Live session:', err);
      this.stopLiveSession(err.message || 'Microphone access denied or connection failed.');
      return false;
    }
  }

  private startMicStreaming() {
    if (!this.micStream) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioCtxClass();
      const source = this.inputAudioCtx.createMediaStreamSource(this.micStream);

      // Buffer size 4096 gives ~85ms chunks at 48kHz
      this.micProcessor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);
      const inputRate = this.inputAudioCtx.sampleRate;

      this.micProcessor.onaudioprocess = (e) => {
        if (!this.isLiveActive || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);

        // Convert to 16kHz PCM
        const base64Pcm = float32To16kHzPcmBase64(inputData, inputRate);

        // Send realtime audio input to Gemini Live API
        this.ws.send(JSON.stringify({
          audio: base64Pcm,
        }));
      };

      source.connect(this.micProcessor);
      this.micProcessor.connect(this.inputAudioCtx.destination);
    } catch (err) {
      console.error('Mic streaming error:', err);
    }
  }

  private handleServerMessage(rawData: string) {
    try {
      const data = JSON.parse(rawData);

      if (data.error) {
        console.warn('Live API warning:', data.error);
        return;
      }

      if (data.closed) {
        this.stopLiveSession();
        return;
      }

      // Handle Tool Calls
      if (data.toolCall) {
        this.handleToolCalls(data.toolCall, data.executedResponses);
      }

      // Handle Server Audio output
      if (data.audio) {
        this.isSpeaking = true;
        this.updateState();
        this.audioPlayer.playPcmChunk(data.audio);
      }

      // Handle live text / transcription
      if (data.text) {
        this.appendGuideLiveText(data.text);
      }

      // Barge-in: user spoke while model was speaking
      if (data.interrupted) {
        this.isSpeaking = false;
        this.audioPlayer.stop();
        this.updateState();
      }

      if (data.turnComplete) {
        this.isSpeaking = false;
        this.currentGuideMessageId = null;
        this.currentGuideTurnText = '';
        this.updateState();
      }
    } catch (err) {
      // Non-json chunk
    }
  }

  private appendGuideLiveText(textChunk: string) {
    this.currentGuideTurnText += textChunk;
    if (!this.currentGuideMessageId) {
      const msg = this.addMessage('guide', this.currentGuideTurnText);
      this.currentGuideMessageId = msg.id;
    } else {
      // Update existing message
      const idx = this.messages.findIndex(m => m.id === this.currentGuideMessageId);
      if (idx !== -1) {
        this.messages[idx].text = this.currentGuideTurnText;
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
      } else if (name === 'propose_times') {
        const res = executedResponses?.find(r => r.name === 'propose_times')?.response?.result;
        if (res && Array.isArray(res)) {
          this.addMessage('system', 'Proposed consultation slots with Nic:', {
            proposedSlots: res,
          });
        }
      } else if (name === 'get_booking_link') {
        const res = executedResponses?.find(r => r.name === 'get_booking_link')?.response?.result;
        if (res?.bookingUrl) {
          this.addMessage('system', "Nic's Booking Page is ready:", {
            bookingUrl: res.bookingUrl,
          });
        }
      } else if (name === 'escalate_to_owner') {
        const summary = args?.summary || 'Handoff initiated';
        this.addMessage('system', `Handoff dossier sent to Nic: "${summary}"`);
      }
    }
  }

  /**
   * Starts screen sharing with 1 FPS JPEG downscaling to 1280px
   */
  public async startScreenShare(): Promise<boolean> {
    if (this.screenStreamer && this.screenStreamer.isSharing()) return true;

    this.screenStreamer = new ScreenStreamer(
      (jpegBase64) => {
        this.latestScreenFrame = jpegBase64;
        if (this.config.onScreenFrameUpdate) {
          this.config.onScreenFrameUpdate(jpegBase64);
        }

        // Send video frame via WebSocket if live session is active
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            video: jpegBase64,
          }));
        }
      },
      () => {
        this.latestScreenFrame = null;
        if (this.config.onScreenFrameUpdate) {
          this.config.onScreenFrameUpdate(null);
        }
        this.addMessage('system', 'Screen share ended.');
        this.config.onStopScreenshareRequested();
      }
    );

    try {
      const ok = await this.screenStreamer.startCapture();
      if (ok) {
        this.addMessage('system', 'Screen sharing active. The guide can now see your screen and offer visual guidance.');
      }
      return ok;
    } catch (err: any) {
      console.warn('Screen share cancelled or failed:', err);
      return false;
    }
  }

  public stopScreenShare() {
    if (this.screenStreamer) {
      this.screenStreamer.stopCapture();
      this.screenStreamer = null;
    }
    this.latestScreenFrame = null;
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

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        video: jpegBase64,
      }));
    }
    this.addMessage('system', 'Screenshot uploaded and shared with the guide.');
  }

  /**
   * Text message sending (used both when voice is active or in text-only fallback)
   */
  public async sendTextMessage(text: string): Promise<void> {
    if (!text.trim()) return;

    this.addMessage('user', text);

    // If live WebSocket is connected, we can send text input directly
    if (this.isLiveActive && this.ws && this.ws.readyState === WebSocket.OPEN) {
      if (this.latestScreenFrame) {
        this.ws.send(JSON.stringify({ video: this.latestScreenFrame }));
      }
      this.ws.send(JSON.stringify({ text }));
      return;
    }

    // Text fallback via /api/chat with multimodal screen frame support
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: this.config.userName,
          userEmail: this.config.userEmail,
          product: this.config.product,
          messages: this.messages.map(m => ({ role: m.role, text: m.text })),
          userTimezone: this.config.userTimezone,
          currentScreenFrame: this.latestScreenFrame,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        this.addMessage('guide', data.reply);
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
          } else if (ti.name === 'propose_times' && Array.isArray(ti.result)) {
            this.addMessage('system', 'Proposed consultation slots with Nic:', {
              proposedSlots: ti.result,
            });
          } else if (ti.name === 'get_booking_link' && ti.result?.bookingUrl) {
            this.addMessage('system', "Nic's Booking Page is ready:", {
              bookingUrl: ti.result.bookingUrl,
            });
          }
        }
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      this.addMessage('guide', `I'm right here with you. What would you like to explore next?`);
    }
  }

  public updateRoutineCardProgress(appId: string | undefined, completedStep: number, nextStep: number | null) {
    let updated = false;
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (msg.appCard && (!appId || msg.appCard.appId === appId)) {
        const steps = msg.appCard.steps.map(s => {
          if (s.number === completedStep) {
            return { ...s, completed: true };
          }
          return s;
        });
        const activeStep = nextStep !== null && nextStep !== undefined ? nextStep : completedStep;
        msg.appCard = {
          ...msg.appCard,
          steps,
          activeStep,
        };
        updated = true;
        break;
      }
    }
    if (updated) {
      this.config.onTranscriptUpdate([...this.messages]);
    }
  }

  public toggleRoutineStep(appId: string, stepNumber: number, isDone: boolean) {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (msg.appCard && (!appId || msg.appCard.appId === appId)) {
        msg.appCard = {
          ...msg.appCard,
          steps: msg.appCard.steps.map(s => s.number === stepNumber ? { ...s, completed: isDone } : s),
        };
        break;
      }
    }
    this.config.onTranscriptUpdate([...this.messages]);
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
  }

  public async startGuidedRoutine(app: any): Promise<void> {
    const firstStep = app.steps && app.steps.length > 0 ? app.steps[0] : null;
    const firstStepPrompt = firstStep?.coachPrompt || firstStep?.detail || '';

    // 1. Add interactive appCard to transcript
    this.addMessage('guide', `Starting the "${app.title}" routine with you. Let's take it one step at a time:`, {
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
      this.addMessage('user', userPromptText);
      if (this.latestScreenFrame) {
        this.ws.send(JSON.stringify({ video: this.latestScreenFrame }));
      }
      this.ws.send(JSON.stringify({ text: `${userPromptText}\n\n${directiveContext}` }));
      return;
    }

    // In text mode, post to /api/chat
    this.addMessage('user', userPromptText);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: this.config.userName,
          userEmail: this.config.userEmail,
          product: this.config.product,
          messages: [
            ...this.messages.slice(0, -1).map(m => ({ role: m.role, text: m.text })),
            { role: 'user', text: `${userPromptText}\n\n${directiveContext}` },
          ],
          userTimezone: this.config.userTimezone,
          currentScreenFrame: this.latestScreenFrame,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        this.addMessage('guide', data.reply);
      }
      if (data.toolInvocations) {
        for (const ti of data.toolInvocations) {
          if (ti.name === 'update_routine_progress') {
            this.updateRoutineCardProgress(
              ti.args?.app_id,
              Number(ti.args?.completed_step),
              ti.args?.next_step !== undefined ? Number(ti.args?.next_step) : null
            );
          } else if (ti.name === 'save_session_note') {
            this.config.onNoteSaved(ti.args?.text);
          }
        }
      }
    } catch (err) {
      console.error('Routine start chat error:', err);
      this.addMessage('guide', `I'm right here with you to walk through the ${app.title}. To start: what specific task or role are you hoping Muse will help you with first, and how comfortable are you feeling?`);
    }
  }

  public stopLiveSession(errorMessage?: string) {
    if (this.micProcessor) {
      try {
        this.micProcessor.disconnect();
      } catch (_) {}
      this.micProcessor = null;
    }

    if (this.inputAudioCtx) {
      try {
        this.inputAudioCtx.close();
      } catch (_) {}
      this.inputAudioCtx = null;
    }

    if (this.micStream) {
      try {
        this.micStream.getTracks().forEach(t => t.stop());
      } catch (_) {}
      this.micStream = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch (_) {}
      this.ws = null;
    }

    this.audioPlayer.stop();

    this.isLiveActive = false;
    this.isConnecting = false;
    this.isListening = false;
    this.isSpeaking = false;

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
      error: null,
    });
  }
}
