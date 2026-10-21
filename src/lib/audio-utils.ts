/**
 * Audio processing utilities for Gemini Live API:
 * - 16kHz 16-bit mono PCM input
 * - 24kHz 16-bit mono PCM output with gapless scheduled playback
 * - Instant queue flush on barge-in
 */

/**
 * Resamples a Float32Array from inputSampleRate to 16000 Hz,
 * then converts to 16-bit PCM little-endian base64.
 */
export function float32To16kHzPcmBase64(
  inputData: Float32Array,
  inputSampleRate: number
): string {
  const targetSampleRate = 16000;
  let resampledData: Float32Array;

  if (inputSampleRate === targetSampleRate) {
    resampledData = inputData;
  } else {
    const ratio = inputSampleRate / targetSampleRate;
    const newLength = Math.round(inputData.length / ratio);
    resampledData = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const originalIndex = i * ratio;
      const indexFloor = Math.floor(originalIndex);
      const indexCeil = Math.min(inputData.length - 1, indexFloor + 1);
      const fraction = originalIndex - indexFloor;
      resampledData[i] = inputData[indexFloor] * (1 - fraction) + inputData[indexCeil] * fraction;
    }
  }

  // Convert to 16-bit integer PCM
  const buffer = new ArrayBuffer(resampledData.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < resampledData.length; i++) {
    // Clamp to [-1, 1]
    const s = Math.max(-1, Math.min(1, resampledData[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true); // little-endian
  }

  // Convert ArrayBuffer to binary string and base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Audio playback queue for 24kHz model output
 */
export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isMuted: boolean = false;

  constructor() {
    // Will be lazily initialized on user interaction
  }

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
