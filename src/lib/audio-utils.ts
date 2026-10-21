/**
 * Audio processing utilities for Gemini Live API:
 * - AudioWorklet mic capture outputting 16 kHz 16-bit mono PCM in ~100 ms chunks (1600 samples)
 * - 24 kHz 16-bit mono PCM output with gapless scheduled playback
 * - Instant queue flush on barge-in
 */

const WORKLET_PROCESSOR_NAME = 'calm-guide-pcm16-worklet';

const WORKLET_SOURCE = `
class CalmGuidePcm16Worklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRate = 16000;
    this.chunkSamples = 1600; // 100 ms at 16 kHz
    this.buffer = new Int16Array(this.chunkSamples);
    this.writeIndex = 0;
    this.readPhase = 0;
    this.lastSample = 0;
    this.hasLastSample = false;
  }

  appendSample(floatSample) {
    const s = Math.max(-1, Math.min(1, floatSample));
    this.buffer[this.writeIndex++] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    if (this.writeIndex >= this.chunkSamples) {
      const out = this.buffer;
      this.buffer = new Int16Array(this.chunkSamples);
      this.writeIndex = 0;
      this.port.postMessage(out.buffer, [out.buffer]);
    }
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) {
      return true;
    }
    const channelData = input[0];
    const inLen = channelData.length;

    if (sampleRate === this.targetRate) {
      for (let i = 0; i < inLen; i++) {
        this.appendSample(channelData[i]);
      }
      return true;
    }

    const step = sampleRate / this.targetRate;
    if (!this.hasLastSample) {
      this.lastSample = channelData[0];
      this.hasLastSample = true;
    }

    let pos = this.readPhase;
    while (pos < inLen) {
      const idxFloor = Math.floor(pos);
      const frac = pos - idxFloor;
      const s0 = idxFloor < 0 ? this.lastSample : channelData[idxFloor];
      const s1 = idxFloor + 1 < inLen ? channelData[idxFloor + 1] : channelData[inLen - 1];
      const interpolated = s0 + (s1 - s0) * frac;
      this.appendSample(interpolated);
      pos += step;
    }

    this.readPhase = pos - inLen;
    this.lastSample = channelData[inLen - 1];
    return true;
  }
}

registerProcessor('${WORKLET_PROCESSOR_NAME}', CalmGuidePcm16Worklet);
`;

/**
 * Converts a 16-bit PCM ArrayBuffer (little-endian) to base64
 */
export function pcm16BufferToBase64(pcmBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(pcmBuffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export interface MicWorkletController {
  stop: () => void;
}

/**
 * Starts microphone capture using an AudioWorkletNode that outputs 16 kHz 16-bit PCM
 * in ~100 ms chunks (1600 samples per chunk).
 */
export async function startAudioWorkletMicCapture(
  micStream: MediaStream,
  onPcmBase64Chunk: (base64Pcm: string) => void
): Promise<MicWorkletController> {
  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioCtxClass({ sampleRate: 16000 });
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  const blob = new Blob([WORKLET_SOURCE], { type: 'application/javascript' });
  const workletUrl = URL.createObjectURL(blob);

  try {
    await audioCtx.audioWorklet.addModule(workletUrl);
  } finally {
    URL.revokeObjectURL(workletUrl);
  }

  const source = audioCtx.createMediaStreamSource(micStream);
  const workletNode = new AudioWorkletNode(audioCtx, WORKLET_PROCESSOR_NAME);

  workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
    if (event.data && event.data.byteLength > 0) {
      const base64Pcm = pcm16BufferToBase64(event.data);
      onPcmBase64Chunk(base64Pcm);
    }
  };

  source.connect(workletNode);

  return {
    stop: () => {
      try {
        workletNode.port.onmessage = null;
        workletNode.disconnect();
      } catch (_) {}
      try {
        source.disconnect();
      } catch (_) {}
      try {
        if (audioCtx.state !== 'closed') {
          audioCtx.close();
        }
      } catch (_) {}
    },
  };
}

/**
 * Audio playback queue for 24kHz model output
 */
export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isMuted: boolean = false;

  private initContext() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
      this.nextStartTime = this.audioCtx.currentTime;
    } else if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Plays a base64 encoded chunk of raw 16-bit PCM audio (24kHz mono)
   */
  public playPcmChunk(base64Pcm: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const binary = atob(base64Pcm);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      const audioBuffer = this.audioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioCtx.destination);

      // Schedule gapless playback
      const currentTime = this.audioCtx.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime + 0.02; // Tiny cushion to prevent pops
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) this.activeSources.splice(idx, 1);
      };
    } catch (err) {
      console.error('Audio chunk decoding error:', err);
    }
  }

  /**
   * Barge-in: stops all scheduled playback immediately and resets clock
   */
  public stop() {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Source already ended
      }
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) this.stop();
  }

  public close() {
    this.stop();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
