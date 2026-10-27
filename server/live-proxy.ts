import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { config } from './config.js';
import {
  buildSystemInstruction,
  formatRoutineStateSection,
  formatToolsProfileSection,
  formatUserProjectsSection,
  formatLatestAuditSection,
  SystemInstructionContext,
} from './knowledge.js';
import { toolDeclarations, executeServerTool } from './tools.js';
import { verifyIdTokenString, VerifiedUser } from './auth.js';
import { isKnownProduct } from './products.js';

// Note: The extended-thinking live model needs non-blocking tools and interaction_status handling, which this app doesn't implement, so it must not be dropped in as LIVE_MODEL without that work. Never send thinkingConfig to the live voice model.

// Track active live sessions per uid (allow at most 1 live session per uid at a time)
const activeSessionsByUid = new Map<string, { closeOlder: () => void }>();

function mergeContextObject(
  target: SystemInstructionContext,
  contextObj: any
): SystemInstructionContext {
  if (!contextObj) return target;

  if (typeof contextObj === 'string') {
    target.extraContext = contextObj.slice(0, 2000);
    return target;
  }

  if (typeof contextObj === 'object') {
    if (contextObj.progressSummary !== undefined) {
      target.progressSummary = contextObj.progressSummary;
    } else if (typeof contextObj.notesSummary === 'string' && contextObj.notesSummary.trim()) {
      target.progressSummary = contextObj.notesSummary.trim().slice(0, 1500);
    }

    if (Array.isArray(contextObj.sessionNotes)) {
      target.sessionNotes = contextObj.sessionNotes
        .filter((n: any) => typeof n === 'string')
        .slice(0, 20);
    }

    if (contextObj.routineState && typeof contextObj.routineState === 'object') {
      target.routineState = {
        activeRoutineId:
          typeof contextObj.routineState.activeRoutineId === 'string'
            ? contextObj.routineState.activeRoutineId
            : null,
        completedSteps: Array.isArray(contextObj.routineState.completedSteps)
          ? contextObj.routineState.completedSteps.map((n: any) => Number(n))
          : [],
        activeStep:
          typeof contextObj.routineState.activeStep === 'number'
            ? contextObj.routineState.activeStep
            : null,
      };
    }

    if (contextObj.toolsProfile && typeof contextObj.toolsProfile === 'object') {
      target.toolsProfile = {
        devices: Array.isArray(contextObj.toolsProfile.devices)
          ? contextObj.toolsProfile.devices.map(String)
          : [],
        tools: Array.isArray(contextObj.toolsProfile.tools)
          ? contextObj.toolsProfile.tools.map((t: any) => ({
              id: String(t?.id || ''),
              name: String(t?.name || t?.id || ''),
              category: String(t?.category || 'other'),
              account: t?.account === 'work' ? ('work' as const) : ('personal' as const),
              sensitive: Boolean(t?.sensitive),
            }))
          : [],
        other:
          typeof contextObj.toolsProfile.other === 'string'
            ? contextObj.toolsProfile.other.slice(0, 300)
            : '',
      };
    }

    if (Array.isArray(contextObj.userProjects)) {
      target.userProjects = contextObj.userProjects
        .filter((p: any) => p && typeof p.projectId === 'string')
        .slice(0, 20)
        .map((p: any) => ({
          projectId: String(p.projectId).trim(),
          title: typeof p.title === 'string' ? p.title.slice(0, 200) : undefined,
          rung: Number.isFinite(Number(p.rung)) ? Math.max(0, Math.min(3, Math.round(Number(p.rung)))) : 0,
          status: p.status === 'paused' ? ('paused' as const) : ('active' as const),
          contract: {
            goal: typeof p.contract?.goal === 'string' ? p.contract.goal.slice(0, 1000) : '',
            do: typeof p.contract?.do === 'string' ? p.contract.do.slice(0, 1500) : '',
            do_not: typeof p.contract?.do_not === 'string' ? p.contract.do_not.slice(0, 1500) : '',
            ask_me_before:
              typeof p.contract?.ask_me_before === 'string'
                ? p.contract.ask_me_before.slice(0, 1000)
                : '',
            report_back:
              typeof p.contract?.report_back === 'string'
                ? p.contract.report_back.slice(0, 1000)
                : '',
            stop_if: typeof p.contract?.stop_if === 'string' ? p.contract.stop_if.slice(0, 1000) : '',
          },
        }));
    }

    if (contextObj.latestAudit !== undefined) {
      if (contextObj.latestAudit && typeof contextObj.latestAudit === 'object') {
        const rawResults =
          contextObj.latestAudit.results && typeof contextObj.latestAudit.results === 'object'
            ? contextObj.latestAudit.results
            : {};
        const cleanResults: Record<string, { rating: string; reason: string }> = {};
        for (const [area, val] of Object.entries(rawResults)) {
          if (val && typeof val === 'object') {
            cleanResults[area] = {
              rating: String((val as any).rating || 'amber').slice(0, 20),
              reason: String((val as any).reason || '').slice(0, 500),
            };
          }
        }
        target.latestAudit = {
          appId:
            typeof contextObj.latestAudit.appId === 'string'
              ? contextObj.latestAudit.appId.slice(0, 80)
              : 'safety-audit',
          startedAt:
            typeof contextObj.latestAudit.startedAt === 'string'
              ? contextObj.latestAudit.startedAt.slice(0, 60)
              : undefined,
          completedAt:
            typeof contextObj.latestAudit.completedAt === 'string'
              ? contextObj.latestAudit.completedAt.slice(0, 60)
              : null,
          results: cleanResults,
        };
      } else {
        target.latestAudit = null;
      }
    }

    if (Array.isArray(contextObj.recentTranscript)) {
      target.recentTranscript = contextObj.recentTranscript
        .slice(-20)
        .filter((t: any) => t && typeof t.text === 'string' && t.text.trim())
        .map((t: any) => ({
          role: typeof t.role === 'string' ? t.role : 'user',
          text: t.text.slice(0, 1000),
        }));
    }
  }

  return target;
}

export function setupLiveWebSocket(wss: WebSocketServer) {
  wss.on('connection', (clientWs: WebSocket, _req: IncomingMessage) => {
    let session: any = null;
    let isClosed = false;
    let isInitialized = false;
    let isReconnecting = false;
    let verifiedUser: VerifiedUser | null = null;
    let product = 'muse';
    let resumptionHandle: string | undefined = undefined;
    const reconnectTimestamps: number[] = [];
    const latestContext: SystemInstructionContext = {};

    // --- Proactive step state (screen-change, idle, off-track) ---
    // Activity that resets the idle timer: user speech (transcription), a typed
    // text turn, a screen-frame change, or a context/tool update. Continuous mic
    // audio chunks are NOT activity, or the timer would never fire.
    const PROACTIVE_SCREEN_COOLDOWN_MS = 30_000;
    const IDLE_CHECK_MS = 60_000;
    const IDLE_DISCONNECT_MS = 60_000;
    const PROACTIVE_TICK_MS = 10_000;
    let lastUserActivityAt = Date.now();
    let modelSpeaking = false;
    let lastProactiveScreenAt = 0;
    let lastProactiveIdleAt = 0;
    let idleStage: 'active' | 'checkinSent' = 'active';
    let proactivePausedUntil = 0;
    let pendingAutoDisconnect: 'idle' | 'resumeLater' | null = null;
    let proactiveTimerId: ReturnType<typeof setInterval> | null = null;
    let greetingSent = false;
    // Step-watch state: a friend looking over your shoulder during a routine.
    let lastScreenFrameAt = 0;
    let lastModelTurnEndAt = 0;
    let lastStepWatchAt = 0;
    const STEP_WATCH_SILENCE_MS = 12_000;
    const STEP_WATCH_COOLDOWN_MS = 25_000;

    const sendToClient = (payload: Record<string, any>) => {
      if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
        try {
          clientWs.send(JSON.stringify(payload));
        } catch (_) {}
      }
    };

    const cleanupSession = () => {
      isClosed = true;
      if (proactiveTimerId) {
        clearInterval(proactiveTimerId);
        proactiveTimerId = null;
      }
      const currentSession = session;
      session = null;
      if (currentSession) {
        try {
          currentSession.close();
        } catch (_) {}
      }
      if (verifiedUser) {
        const currentEntry = activeSessionsByUid.get(verifiedUser.uid);
        if (currentEntry && currentEntry.closeOlder === closeThisSession) {
          activeSessionsByUid.delete(verifiedUser.uid);
        }
      }
    };

    const closeThisSession = () => {
      if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
        sendToClient({
          closed: true,
          reason: 'A newer live voice session was started on your account.',
        });
        try {
          clientWs.close();
        } catch (_) {}
      }
      cleanupSession();
    };

    // --- Proactive helpers ---
    const markUserActivity = (opts: { clearPause?: boolean } = {}) => {
      lastUserActivityAt = Date.now();
      idleStage = 'active';
      if (opts.clearPause !== false) {
        // Speech / text clears a "wait" pause: the user is back. Screen changes
        // alone do not clear it (a detour page changing is still a detour).
        proactivePausedUntil = 0;
      }
    };

    const isProactivePaused = () => Date.now() < proactivePausedUntil;

    const workContextBlock = () => {
      const routine = formatRoutineStateSection(product, latestContext.routineState);
      const progress = latestContext.progressSummary
        ? `Progress so far: ${String(latestContext.progressSummary).slice(0, 600)}`
        : 'No progress summary yet.';
      return `Product: ${product}.\n${routine}\n${progress}`;
    };

    const injectProactiveTurn = (kind: string, text: string) => {
      if (!session || isClosed || isReconnecting) return;
      try {
        session.sendClientContent({
          turns: [{ role: 'user', parts: [{ text }] }],
          turnComplete: true,
        });
        console.log(`Live WS proactive ${kind}`);
      } catch (err: any) {
        console.warn(`Failed to send proactive ${kind} turn:`, err?.message);
      }
    };

    const maybeProactiveScreenCheck = () => {
      const now = Date.now();
      if (!session || isClosed || isReconnecting) return;
      if (isProactivePaused()) {
        console.log('Live WS screen frame: proactive skipped, paused');
        return;
      }
      if (modelSpeaking) {
        console.log('Live WS screen frame: proactive skipped, model speaking');
        return;
      }
      if (now - lastProactiveScreenAt < PROACTIVE_SCREEN_COOLDOWN_MS) {
        console.log('Live WS screen frame: proactive skipped, cooldown');
        return;
      }
      lastProactiveScreenAt = now;
      // Delay the turn ~1.5s so the just-forwarded video frame has landed in
      // the model's context before it is asked about it. Re-check the gates
      // at fire time; a newer frame cannot pre-empt this one because the
      // cooldown above blocks scheduling a second turn in the meantime.
      const scheduledAt = now;
      setTimeout(() => {
        if (!session || isClosed || isReconnecting) return;
        if (lastProactiveScreenAt !== scheduledAt) return;
        if (modelSpeaking) return;
        if (isProactivePaused()) return;
        injectProactiveTurn(
          'screen check',
          `[Proactive screen check] The user's screen just changed, and you have the latest frame. The user is working on:\n${workContextBlock()}\nIf this screen moves that work forward, shows a blocker, or looks like the user has left the app or the steps they were on, say ONE short sentence naming the step and offering the next action. If they have left the work, say so plainly and ask whether they want to turn off now and resume later, or wait while they finish something quick. If NO routine is active, the work is whatever the user is doing in the product app right now: do NOT stay silent just because there is no step to name — say in ONE short sentence what you see them doing in the app and ask what they are trying to do. A screen inside the product app itself IS relevant. Only stay silent if the screen is clearly unrelated to the product and their work, and even then use the off-track branch above.`
        );
      }, 1500);
    };

    const maybeGreetOnVoiceStart = () => {
      if (greetingSent) return;
      greetingSent = true;
      // Small delay so the session settles before the first model turn.
      setTimeout(() => {
        if (!session || isClosed || isReconnecting) return;
        injectProactiveTurn(
          'session greeting',
          `[Session start] You are Calm Guide. Greet the user warmly by voice in ONE short friendly sentence, introduce yourself as Calm Guide, and ask what they would like to work on today. Do not wait for the user to speak first. Context, if any:\n${workContextBlock()}`
        );
      }, 750);
    };

    const doAutoDisconnect = (reason: string) => {
      if (isClosed) return;
      console.log('Live WS auto-disconnecting voice and screen share');
      sendToClient({ type: 'autoDisconnect', reason });
      // Give the client a moment to receive the message and stop screen share
      // before the server closes the socket.
      setTimeout(() => {
        try {
          clientWs.close();
        } catch (_) {}
        cleanupSession();
      }, 500);
    };

    const startProactiveLoop = () => {
      if (proactiveTimerId) return;
      proactiveTimerId = setInterval(() => {
        try {
          if (!session || isClosed || isReconnecting) return;
          if (isProactivePaused()) return;
          if (modelSpeaking) return; // Pauses, does not reset, the idle timer.
          const now = Date.now();
          if (idleStage === 'active' && now - lastUserActivityAt >= IDLE_CHECK_MS) {
            idleStage = 'checkinSent';
            lastProactiveIdleAt = now;
            injectProactiveTurn(
              'idle check-in',
              '[Idle check-in] The user has not spoken, typed, changed screens, or made tool progress for about a minute. Ask in ONE short sentence whether they want to continue, or need any help. Do not repeat instructions or narrate the screen.'
            );
            return;
          }
          if (
            idleStage === 'checkinSent' &&
            now - lastProactiveIdleAt >= IDLE_DISCONNECT_MS
          ) {
            pendingAutoDisconnect = 'idle';
            injectProactiveTurn(
              'auto-disconnect notice',
              '[Auto-disconnect] The user has not responded for another minute after the idle check-in. Tell them in ONE short sentence that you are disconnecting voice and screen share now, and they can press Start Voice Chat to resume, with progress saved. Then stop speaking.'
            );
            // Fallback if the model never completes this turn.
            setTimeout(() => {
              if (pendingAutoDisconnect === 'idle' && !isClosed) {
                doAutoDisconnect(
                  'Disconnected voice and screen share after about 2 minutes with no response. Press Start Voice Chat to resume.'
                );
              }
            }, 15_000);
            return;
          }
          // Step-watch: a friend looking over your shoulder during a guided
          // routine. The old model was turn-waiting: give an instruction, then
          // wait for the user to speak before doing anything, so a user doing
          // settings/permissions steps in silence heard nothing until they
          // asked or made a major screen change. This fires instead when the
          // user has been quiet for a while mid-routine, the screen is being
          // shared, and a frame arrived recently — and the prompt tells the
          // model to speak ONLY on completion, stuck, or off-track, and to
          // stay silent while the user is mid-action and progressing.
          if (
            idleStage === 'active' &&
            !pendingAutoDisconnect &&
            latestContext.routineState?.activeRoutineId &&
            lastScreenFrameAt > 0 &&
            now - lastScreenFrameAt <= 30_000 &&
            now - lastUserActivityAt >= STEP_WATCH_SILENCE_MS &&
            now - lastStepWatchAt >= STEP_WATCH_COOLDOWN_MS &&
            now - lastProactiveScreenAt >= STEP_WATCH_COOLDOWN_MS &&
            (lastModelTurnEndAt === 0 || now - lastModelTurnEndAt >= 5_000)
          ) {
            lastStepWatchAt = now;
            injectProactiveTurn(
              'step watch',
              `[Step watch] You are walking the user through a guided routine and you can see their screen. Look at the latest frame and compare it to the current step:\n${workContextBlock()}\nIf the step looks complete, say ONE short sentence confirming what you see and ask if they are ready for the next step — do NOT call confirm_step until they confirm. If they look stuck (same screen with no progress, a wrong page for this step, or a control they keep missing), say ONE short sentence naming what looks stuck or wrong and offer one hint or the way back. If they are mid-action and progressing normally (a menu open, a dropdown open, cursor on a control, a toggle just changed), stay silent and do not interrupt. Do not narrate the screen for its own sake.`
            );
          }
          }
        } catch (_) {}
      }, PROACTIVE_TICK_MS);
    };

    const openGeminiSession = async (
      handleToUse: string | undefined,
      includeTranscriptInSystemPrompt: boolean
    ): Promise<any> => {
      const activeKey = process.env.API_KEY || process.env.GEMINI_API_KEY || config.geminiApiKey;
      if (!activeKey) {
        throw new Error('GEMINI_API_KEY is not configured on the server.');
      }

      const ai = new GoogleGenAI({
        apiKey: activeKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contextForPrompt: SystemInstructionContext = {
        progressSummary: latestContext.progressSummary,
        sessionNotes: latestContext.sessionNotes,
        routineState: latestContext.routineState,
        toolsProfile: latestContext.toolsProfile,
        userProjects: latestContext.userProjects,
        latestAudit: latestContext.latestAudit,
        extraContext: latestContext.extraContext,
        recentTranscript: includeTranscriptInSystemPrompt ? latestContext.recentTranscript : undefined,
      };

      const systemInstruction = buildSystemInstruction(
        verifiedUser?.name || 'Friend',
        product,
        contextForPrompt
      );

      let thisSessionRef: any = null;
      const openedWithHandle = Boolean(handleToUse);
      let sessionOpenedAt = Date.now();

      const connectPromise = ai.live.connect({
        model: config.liveModel,
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          contextWindowCompression: { slidingWindow: {} },
          // NOTE: Do NOT send proactivity here. For gemini-3.8-live, proactive
          // audio is permanently enabled / included in the model, and the Live
          // API server rejects the proactivity field in setup (close 1007,
          // 'Unknown name "proactivity"'). The field is only required for
          // gemini-live-2.5-flash-native-audio. Removing it restores connect
          // without losing proactive behavior on 3.8-live.
          sessionResumption: { handle: handleToUse },
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Kore', // Warm, calm voice
              },
            },
          },
          systemInstruction,
          tools: [{ functionDeclarations: toolDeclarations }],
        },
        callbacks: {
          onmessage: async (message: LiveServerMessage) => {
            if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;
            if (thisSessionRef && session && thisSessionRef !== session) return;

            // 1. Session Resumption Handle Update
            const resumptionUpdate = (message as any).sessionResumptionUpdate;
            if (resumptionUpdate?.resumable && typeof resumptionUpdate.newHandle === 'string') {
              resumptionHandle = resumptionUpdate.newHandle;
            }

            // 2. Server goAway signal -> reconnect in background before session drops
            if ((message as any).goAway) {
              triggerBackgroundReconnect();
              return;
            }

            // 3. Tool Call handling (shared executeServerTool)
            if (message.toolCall) {
              const calls = message.toolCall.functionCalls || [];
              const responses: any[] = [];

              for (const call of calls) {
                let result: any = null;
                const name = call.name || '';
                const args = (call.args as Record<string, any>) || {};

                // Proactive-step tools are handled here, not by the shared
                // tool executor, because they change this live session's state.
                if (name === 'pause_proactive_prompts') {
                  const minutes = Math.max(
                    1,
                    Math.min(15, Number(args.minutes) || 5)
                  );
                  proactivePausedUntil = Date.now() + minutes * 60_000;
                  idleStage = 'active';
                  result = { paused: true, minutes };
                  console.log(`Live WS proactive paused for ${minutes} min`);
                } else if (name === 'end_voice_and_screen_share') {
                  pendingAutoDisconnect = 'resumeLater';
                  result = {
                    ended: true,
                    reason: typeof args.reason === 'string' ? args.reason : '',
                  };
                  console.log('Live WS end requested by user via tool');
                } else {
                  try {
                    result = executeServerTool(name, args, product);
                  } catch (toolErr: any) {
                    console.error(`Tool execution failed for ${name}:`, toolErr);
                    result = { error: toolErr.message || 'Execution failed' };
                  }
                }

                responses.push({
                  name,
                  id: call.id,
                  response: { result },
                });
              }

              if (responses.length > 0 && session) {
                try {
                  session.sendToolResponse({ functionResponses: responses });
                } catch (sendErr) {
                  console.error('Failed to send tool response to Gemini session:', sendErr);
                }
              }

              sendToClient({
                toolCall: message.toolCall,
                executedResponses: responses,
              });
              return;
            }

            // 4. Server content: transcriptions, audio parts, interruption, and turn completion
            if (message.serverContent) {
              const inputText = message.serverContent.inputTranscription?.text;
              if (inputText) {
                // Real user speech: activity, and it cancels a "wait" pause.
                markUserActivity();
                sendToClient({
                  type: 'userTranscript',
                  text: inputText,
                });
              }

              const outputText = message.serverContent.outputTranscription?.text;
              if (outputText) {
                modelSpeaking = true;
                sendToClient({
                  type: 'guideTranscript',
                  text: outputText,
                });
              }

              // Forward ALL audio parts in the message, not just the last one
              const parts = message.serverContent.modelTurn?.parts || [];
              for (const part of parts) {
                if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/pcm')) {
                  modelSpeaking = true;
                  sendToClient({
                    audio: part.inlineData.data,
                  });
                }
              }

              if (message.serverContent.interrupted) {
                modelSpeaking = false;
                lastModelTurnEndAt = Date.now();
                sendToClient({ interrupted: true });
              }

              if (message.serverContent.turnComplete) {
                modelSpeaking = false;
                lastModelTurnEndAt = Date.now();
                sendToClient({ turnComplete: true });
                if (pendingAutoDisconnect) {
                  const kind = pendingAutoDisconnect;
                  pendingAutoDisconnect = null;
                  doAutoDisconnect(
                    kind === 'idle'
                      ? 'Disconnected voice and screen share after about 2 minutes with no response. Press Start Voice Chat to resume.'
                      : 'Voice and screen share turned off to resume later. Press Start Voice Chat whenever you want to continue.'
                  );
                }
              }
            }
          },
          onclose: () => {
            console.log('Live WS Gemini session closed');
            if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;
            if (thisSessionRef && session && thisSessionRef !== session) return;
            // If a session opened with a resumptionHandle closes within 10 seconds of opening, clear resumptionHandle before reconnecting
            if (openedWithHandle && Date.now() - sessionOpenedAt < 10_000) {
              resumptionHandle = undefined;
            }
            triggerBackgroundReconnect();
          },
          onerror: (err: any) => {
            console.error('Gemini Live session error:', err);
          },
        },
      });

      const createdSession = await Promise.race([
        connectPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini Live connect timed out after 12000ms')), 12000)),
      ]);
      sessionOpenedAt = Date.now();
      thisSessionRef = createdSession;
      return createdSession;
    };

    const giveUpReconnect = (message: string) => {
      isReconnecting = false;
      sendToClient({
        type: 'error',
        code: 'reconnect_failed',
        message,
      });
      cleanupSession();
      try {
        clientWs.close();
      } catch (_) {}
    };

    const triggerBackgroundReconnect = async () => {
      if (isClosed || isReconnecting || clientWs.readyState !== WebSocket.OPEN) return;

      // Track total reconnects per client socket and give up after 5 total reconnects within 10 minutes
      const now = Date.now();
      const tenMinutesAgo = now - 10 * 60 * 1000;
      while (reconnectTimestamps.length > 0 && reconnectTimestamps[0] <= tenMinutesAgo) {
        reconnectTimestamps.shift();
      }

      if (reconnectTimestamps.length >= 5) {
        giveUpReconnect(
          "Voice connection dropped too many times in the last 10 minutes. You can keep typing below, or press Start Voice Chat to try again."
        );
        return;
      }

      reconnectTimestamps.push(now);
      isReconnecting = true;

      // Detach and close the previous Gemini session without closing the browser socket
      const oldSession = session;
      session = null;
      if (oldSession) {
        try {
          oldSession.close();
        } catch (_) {}
      }

      sendToClient({ type: 'status', state: 'reconnecting' });

      for (let attempt = 1; attempt <= 3; attempt++) {
        if (isClosed || clientWs.readyState !== WebSocket.OPEN) {
          isReconnecting = false;
          return;
        }

        let newSession: any = null;
        let usedFreshSession = false;

        // First try resuming with the stored handle if we have one
        if (resumptionHandle) {
          try {
            newSession = await openGeminiSession(resumptionHandle, false);
          } catch (resumeErr: any) {
            console.warn(`Live session resume with handle failed (attempt ${attempt}):`, resumeErr?.message || resumeErr);
            resumptionHandle = undefined;
          }
        }

        // If resuming failed (or there was no handle), open a fresh session with progressSummary, routineState, and last 20 transcript turns
        if (!newSession) {
          try {
            newSession = await openGeminiSession(undefined, true);
            usedFreshSession = true;
          } catch (freshErr: any) {
            console.warn(`Fresh live session reconnect failed (attempt ${attempt}/3):`, freshErr?.message || freshErr);
          }
        }

        if (newSession) {
          session = newSession;
          isReconnecting = false;
          sendToClient({
            type: 'status',
            state: 'live',
            freshSession: usedFreshSession,
          });
          if (usedFreshSession) {
            sendToClient({
              type: 'systemLine',
              text: 'Voice reconnected — I still have our conversation.',
            });
          }
          return;
        }

        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      // Gave up after 3 failed attempts in a row
      giveUpReconnect(
        "Voice connection dropped and couldn't reconnect after 3 tries. You can keep typing below, or press Start Voice Chat to try again."
      );
    };

    clientWs.on('message', async (rawData) => {
      if (isClosed) return;

      let parsed: any;
      try {
        parsed = JSON.parse(rawData.toString());
      } catch (err: any) {
        console.warn('Failed to parse client message:', err.message);
        return;
      }

      // 1. Expect first message to be { type: "init", idToken, product, context }
      if (!isInitialized) {
        console.log('Live WS init message received');
        if (parsed?.type !== 'init' || typeof parsed.idToken !== 'string' || !parsed.idToken.trim()) {
          sendToClient({
            type: 'error',
            code: 'auth',
            message: 'Please sign in with Google before starting a voice session.',
          });
          clientWs.close();
          return;
        }

        // Verify Firebase ID token BEFORE calling ai.live.connect
        try {
          verifiedUser = await verifyIdTokenString(parsed.idToken);
          console.log('Live WS token verified');
        } catch (authErr: any) {
          sendToClient({
            type: 'error',
            code: 'auth',
            message: 'Your sign-in session could not be verified. Please sign in again.',
          });
          clientWs.close();
          return;
        }

        // Validate product against registry
        const requestedProduct = parsed.product || 'muse';
        if (!isKnownProduct(requestedProduct)) {
          sendToClient({
            type: 'error',
            code: 'invalid_product',
            message: `Unknown product "${requestedProduct}".`,
          });
          clientWs.close();
          return;
        }
        product = requestedProduct;

        mergeContextObject(latestContext, parsed.context);

        // Enforce at most 1 live session per uid at a time (close the older one)
        const existingSession = activeSessionsByUid.get(verifiedUser.uid);
        if (existingSession) {
          existingSession.closeOlder();
        }
        activeSessionsByUid.set(verifiedUser.uid, { closeOlder: closeThisSession });

        isInitialized = true;

        const activeKey = process.env.API_KEY || process.env.GEMINI_API_KEY || config.geminiApiKey;
        if (!activeKey) {
          sendToClient({
            type: 'error',
            code: 'missing_key',
            message: 'Voice is temporarily unavailable on the server. You can continue typing below.',
          });
          cleanupSession();
          clientWs.close();
          return;
        }

        console.log('Live WS opening Gemini session, model=' + config.liveModel);
        try {
          session = await openGeminiSession(
            resumptionHandle,
            Boolean(latestContext.recentTranscript && latestContext.recentTranscript.length > 0)
          );
          console.log('Live WS Gemini session opened');
          sendToClient({ connected: true, model: config.liveModel });
          lastUserActivityAt = Date.now();
          startProactiveLoop();
          maybeGreetOnVoiceStart();
        } catch (err: any) {
          console.error('Failed to connect to Gemini Live session:', err);
          sendToClient({
            type: 'error',
            code: 'gemini_connect',
            message:
              err?.message ||
              "Couldn't start the live voice session right now. You can try again, or keep typing — that works just as well.",
          });
          cleanupSession();
          try {
            clientWs.close();
          } catch (_) {}
        }
        return;
      }

      // Context refresh from client (accepts { type: "context", ... } or { type: "context_update", ... })
      if (parsed.type === 'context' || parsed.type === 'context_update') {
        // Progress / routine change is user activity, but does not clear a
        // "wait" pause (it may be model-driven, not the user returning).
        markUserActivity({ clearPause: false });
        mergeContextObject(latestContext, parsed.context || parsed);
        if (
          (parsed.routineState ||
            parsed.toolsProfileUpdated ||
            parsed.userProjectsUpdated ||
            parsed.latestAuditUpdated) &&
          session &&
          !isReconnecting
        ) {
          try {
            const routineBlock = formatRoutineStateSection(product, latestContext.routineState);
            const toolsBlock = formatToolsProfileSection(latestContext.toolsProfile);
            const projectsBlock = formatUserProjectsSection(product, latestContext.userProjects);
            const auditBlock = formatLatestAuditSection(latestContext.latestAudit);
            session.sendClientContent({
              turns: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `[System Context Update]\n${routineBlock}\n\n${toolsBlock}\n\n${projectsBlock}\n\n${auditBlock}`,
                    },
                  ],
                },
              ],
              turnComplete: false,
            });
          } catch (_) {}
        }
        return;
      }

      // Subsequent media/text messages after init
      if (!session || isClosed || isReconnecting) return;

      try {
        // Audio mic streaming (16kHz PCM little-endian)
        if (parsed.audio) {
          session.sendRealtimeInput({
            audio: {
              data: parsed.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        }

        // Screen share video frame (JPEG base64 downscaled to <= 1280px)
        // NOTE: continuous mic audio above is NOT user activity. A video frame
        // is: the client only sends one when the screen visibly changed.
        if (parsed.video && typeof parsed.video === 'string' && parsed.video.length <= 2 * 1024 * 1024) {
          console.log('Live WS screen frame received');
          session.sendRealtimeInput({
            video: {
              data: parsed.video,
              mimeType: 'image/jpeg',
            },
          });
          lastScreenFrameAt = Date.now();
          if (parsed.periodic) {
            // Periodic frame: fresh screen for step-watch, but NOT user
            // activity — otherwise the idle timer would never fire while
            // sharing, and it must not trigger a screen-change turn.
          } else {
            // Screen change is activity, but does not clear a "wait" pause.
            markUserActivity({ clearPause: false });
            maybeProactiveScreenCheck();
          }
        } else if (parsed.video) {
          console.log('Live WS screen frame dropped, over 2MB');
        }

        // Realtime text turn
        if (parsed.text && typeof parsed.text === 'string') {
          markUserActivity();
          session.sendClientContent({
            turns: [
              {
                role: 'user',
                parts: [{ text: parsed.text.slice(0, 4000) }],
              },
            ],
            turnComplete: true,
          });
        }
      } catch (err: any) {
        console.warn('Failed to forward client message to live session:', err.message);
      }
    });

    clientWs.on('close', () => {
      cleanupSession();
    });

    clientWs.on('error', (err) => {
      console.error('Client WebSocket error:', err);
      cleanupSession();
    });
  });
}
