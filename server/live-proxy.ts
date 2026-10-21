import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { config } from './config.js';
import {
  buildSystemInstruction,
  formatRoutineStateSection,
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
    const latestContext: SystemInstructionContext = {};

    const sendToClient = (payload: Record<string, any>) => {
      if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
        try {
          clientWs.send(JSON.stringify(payload));
        } catch (_) {}
      }
    };

    const cleanupSession = () => {
      isClosed = true;
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
        extraContext: latestContext.extraContext,
        recentTranscript: includeTranscriptInSystemPrompt ? latestContext.recentTranscript : undefined,
      };

      const systemInstruction = buildSystemInstruction(
        verifiedUser?.name || 'Friend',
        product,
        contextForPrompt
      );

      let thisSessionRef: any = null;

      const createdSession = await ai.live.connect({
        model: config.liveModel,
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          contextWindowCompression: { slidingWindow: {} },
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

                try {
                  result = executeServerTool(name, args, product);
                } catch (toolErr: any) {
                  console.error(`Tool execution failed for ${name}:`, toolErr);
                  result = { error: toolErr.message || 'Execution failed' };
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
                sendToClient({
                  type: 'userTranscript',
                  text: inputText,
                });
              }

              const outputText = message.serverContent.outputTranscription?.text;
              if (outputText) {
                sendToClient({
                  type: 'guideTranscript',
                  text: outputText,
                });
              }

              // Forward ALL audio parts in the message, not just the last one
              const parts = message.serverContent.modelTurn?.parts || [];
              for (const part of parts) {
                if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/pcm')) {
                  sendToClient({
                    audio: part.inlineData.data,
                  });
                }
              }

              if (message.serverContent.interrupted) {
                sendToClient({ interrupted: true });
              }

              if (message.serverContent.turnComplete) {
                sendToClient({ turnComplete: true });
              }
            }
          },
          onclose: () => {
            if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;
            if (thisSessionRef && session && thisSessionRef !== session) return;
            triggerBackgroundReconnect();
          },
          onerror: (err: any) => {
            console.error('Gemini Live session error:', err);
          },
        },
      });

      thisSessionRef = createdSession;
      return createdSession;
    };

    const triggerBackgroundReconnect = async () => {
      if (isClosed || isReconnecting || clientWs.readyState !== WebSocket.OPEN) return;
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
      isReconnecting = false;
      sendToClient({
        type: 'error',
        code: 'reconnect_failed',
        message:
          "Voice connection dropped and couldn't reconnect after 3 tries. You can keep typing below, or press Start Voice Chat to try again.",
      });
      cleanupSession();
      try {
        clientWs.close();
      } catch (_) {}
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

        try {
          session = await openGeminiSession(
            resumptionHandle,
            Boolean(latestContext.recentTranscript && latestContext.recentTranscript.length > 0)
          );
          sendToClient({ connected: true, model: config.liveModel });
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
        mergeContextObject(latestContext, parsed.context || parsed);
        if (parsed.routineState && session && !isReconnecting) {
          try {
            const routineBlock = formatRoutineStateSection(product, latestContext.routineState);
            session.sendClientContent({
              turns: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `[System Context Update — Current Routine State]\n${routineBlock}`,
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
        if (parsed.video && typeof parsed.video === 'string' && parsed.video.length <= 2 * 1024 * 1024) {
          session.sendRealtimeInput({
            video: {
              data: parsed.video,
              mimeType: 'image/jpeg',
            },
          });
        }

        // Realtime text turn
        if (parsed.text && typeof parsed.text === 'string') {
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
