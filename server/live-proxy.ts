import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { config } from './config.js';
import { buildSystemInstruction, getGuidedApps } from './knowledge.js';
import { toolDeclarations } from './models.js';
import { proposeTimes } from './calendar.js';
import { logAndDispatchEscalation } from './escalations.js';

export function setupLiveWebSocket(wss: WebSocketServer) {
  wss.on('connection', async (clientWs: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userName = url.searchParams.get('userName') || 'Friend';
    const userEmail = url.searchParams.get('userEmail') || '';
    const product = url.searchParams.get('product') || 'muse';
    const userTimezone = url.searchParams.get('timezone') || 'America/New_York';
    const deepModel = url.searchParams.get('deep') === 'true';

    const selectedModel = deepModel ? config.liveModelDeep : config.liveModel;

    if (!config.geminiApiKey) {
      clientWs.send(JSON.stringify({
        error: 'GEMINI_API_KEY is not configured on the server. Falling back to text mode.',
      }));
      clientWs.close();
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: config.geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = buildSystemInstruction(userName, product);

    let session: any = null;
    let isClosed = false;

    try {
      session = await ai.live.connect({
        model: selectedModel,
        config: {
          responseModalities: [Modality.AUDIO],
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

            // 1. Tool Call handling
            if (message.toolCall) {
              const calls = message.toolCall.functionCalls || [];
              const responses: any[] = [];

              for (const call of calls) {
                let result: any = null;
                const name = call.name || '';
                const args = (call.args as any) || {};

                try {
                  if (name === 'propose_times') {
                    const duration = (args?.duration_minutes as number) || 30;
                    const tz = (args?.user_timezone as string) || userTimezone;
                    result = await proposeTimes(duration, tz);
                  } else if (name === 'get_booking_link') {
                    result = { bookingUrl: config.bookingUrl };
                  } else if (name === 'escalate_to_owner') {
                    const summary = (args?.summary as string) || 'User requested human assistance';
                    result = await logAndDispatchEscalation({
                      userName,
                      userEmail,
                      product,
                      goal: summary,
                      tried: 'Live voice guidance session',
                      screenSeen: 'Described live during screen share',
                      blocker: summary,
                      proposedTimes: [],
                      transcriptExcerpt: [],
                    });
                  } else if (name === 'launch_app') {
                    const appId = args?.app_id as string;
                    const apps = getGuidedApps(product);
                    const matched = apps.find(a => a.id === appId);
                    result = matched || { id: appId, status: 'launched' };
                  } else if (name === 'update_routine_progress') {
                    const appId = args?.app_id as string;
                    const completedStep = Number(args?.completed_step);
                    const nextStep = args?.next_step !== undefined ? Number(args?.next_step) : null;
                    result = { updated: true, app_id: appId, completed_step: completedStep, next_step: nextStep };
                  } else if (name === 'save_session_note') {
                    result = { saved: true, text: args?.text };
                  } else if (name === 'request_screenshare') {
                    result = { requested: true, reason: args?.reason };
                  } else if (name === 'stop_screenshare') {
                    result = { stopped: true };
                  }
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

              // Send responses back to session
              if (responses.length > 0 && session) {
                try {
                  session.sendToolResponse({ functionResponses: responses });
                } catch (sendErr) {
                  console.error('Failed to send tool response to Gemini session:', sendErr);
                }
              }

              // Forward tool call event to client
              clientWs.send(JSON.stringify({
                toolCall: message.toolCall,
                executedResponses: responses,
              }));
              return;
            }

            // 2. Server content / Audio output
            if (message.serverContent) {
              const parts = message.serverContent.modelTurn?.parts || [];
              let textAccumulator = '';
              let audioPcmBase64: string | null = null;

              for (const part of parts) {
                if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/pcm')) {
                  audioPcmBase64 = part.inlineData.data || null;
                }
                if (part.text) {
                  textAccumulator += part.text;
                }
              }

              if (message.serverContent.outputTranscription?.text) {
                textAccumulator += message.serverContent.outputTranscription.text;
              }

              clientWs.send(JSON.stringify({
                audio: audioPcmBase64,
                text: textAccumulator,
                interrupted: Boolean(message.serverContent.interrupted),
                turnComplete: Boolean(message.serverContent.turnComplete),
              }));
            }
          },
          onclose: (e) => {
            if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ closed: true, reason: 'Session ended' }));
              clientWs.close();
            }
          },
          onerror: (err) => {
            console.error('Gemini Live session error:', err);
            if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ error: err.message || 'Voice session error' }));
            }
          },
        },
      });

      // Notify client that connection is ready
      clientWs.send(JSON.stringify({ connected: true, model: selectedModel }));
    } catch (err: any) {
      console.error('Failed to connect to Gemini Live session:', err);
      clientWs.send(JSON.stringify({ error: err.message || 'Failed to start Live session' }));
      clientWs.close();
      return;
    }

    clientWs.on('message', (rawData) => {
      if (!session || isClosed) return;

      try {
        const parsed = JSON.parse(rawData.toString());

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
        if (parsed.video) {
          session.sendRealtimeInput({
            video: {
              data: parsed.video,
              mimeType: 'image/jpeg',
            },
          });
        }

        // Realtime text turn
        if (parsed.text) {
          session.sendClientContent({
            turns: [
              {
                role: 'user',
                parts: [{ text: parsed.text }],
              },
            ],
            turnComplete: true,
          });
        }
      } catch (err: any) {
        console.warn('Failed to parse client message:', err.message);
      }
    });

    clientWs.on('close', () => {
      isClosed = true;
      if (session) {
        try {
          session.close();
        } catch (_) {}
      }
    });

    clientWs.on('error', (err) => {
      console.error('Client WebSocket error:', err);
      isClosed = true;
      if (session) {
        try {
          session.close();
        } catch (_) {}
      }
    });
  });
}
