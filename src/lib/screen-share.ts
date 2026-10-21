/**
 * Screen share capture, 1 FPS local preview, and 32x18 grayscale change detection
 * - Enforces max width 1280px
 * - JPEG quality 0.7
 * - Captures locally at 1 FPS for the UI preview
 * - Computes a 32x18 grayscale thumbnail for voice-mode visual change detection
 * - Feature detects navigator.mediaDevices.getDisplayMedia
 * - Never stores frames to disk
 */

export const THUMB_WIDTH = 32;
export const THUMB_HEIGHT = 18;
export const DEFAULT_PIXEL_DIFF_THRESHOLD = 4.5; // Average grayscale pixel difference (0-255 scale)

export function isScreenShareSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function'
  );
}

/**
 * Computes a 32x18 grayscale thumbnail (Uint8Array of 576 luminance values) from a CanvasImageSource.
 */
export function extractGrayscaleThumbnail(
  source: CanvasImageSource,
  thumbCanvas?: HTMLCanvasElement
): Uint8Array {
  const canvas = thumbCanvas || document.createElement('canvas');
  canvas.width = THUMB_WIDTH;
  canvas.height = THUMB_HEIGHT;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const gray = new Uint8Array(THUMB_WIDTH * THUMB_HEIGHT);
  if (!ctx) return gray;

  ctx.drawImage(source, 0, 0, THUMB_WIDTH, THUMB_HEIGHT);
  const rgba = ctx.getImageData(0, 0, THUMB_WIDTH, THUMB_HEIGHT).data;
  for (let i = 0, p = 0; i < gray.length; i++, p += 4) {
    // Standard BT.601 luma
    gray[i] = Math.round(0.299 * rgba[p] + 0.587 * rgba[p + 1] + 0.114 * rgba[p + 2]);
  }
  return gray;
}

/**
 * Compares two 32x18 grayscale thumbnails and returns true if the average pixel difference
 * exceeds `threshold`.
 */
export function hasScreenVisiblyChanged(
  currentThumb: Uint8Array | null,
  lastSentThumb: Uint8Array | null,
  threshold: number = DEFAULT_PIXEL_DIFF_THRESHOLD
): boolean {
  if (!currentThumb) return false;
  if (!lastSentThumb || currentThumb.length !== lastSentThumb.length) return true;

  let totalDiff = 0;
  for (let i = 0; i < currentThumb.length; i++) {
    totalDiff += Math.abs(currentThumb[i] - lastSentThumb[i]);
  }
  const avgDiff = totalDiff / currentThumb.length;
  return avgDiff > threshold;
}

export class ScreenStreamer {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private thumbCanvasElement: HTMLCanvasElement | null = null;
  private intervalId: any = null;
  private latestFrame: string | null = null;
  private latestThumbnail: Uint8Array | null = null;
  private onFrameCallback: ((jpegBase64: string, thumbnail: Uint8Array) => void) | null = null;
  private onStopCallback: (() => void) | null = null;

  constructor(
    onFrame: (jpegBase64: string, thumbnail: Uint8Array) => void,
    onStop?: () => void
  ) {
    this.onFrameCallback = onFrame;
    this.onStopCallback = onStop || null;
  }

  public getLatestFrame(): string | null {
    return this.latestFrame;
  }

  public getLatestThumbnail(): Uint8Array | null {
    return this.latestThumbnail;
  }

  public async startCapture(): Promise<boolean> {
    if (!isScreenShareSupported()) {
      throw new Error('Screen sharing is not supported in this browser.');
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { max: 1 },
          width: { max: 1280 },
        },
        audio: false,
      });

      const videoTrack = displayStream.getVideoTracks()[0];
      if (!videoTrack || videoTrack.readyState === 'ended') {
        displayStream.getTracks().forEach(t => t.stop());
        return false;
      }

      this.stream = displayStream;

      // Handle user stopping screen share via native browser UI bar
      videoTrack.onended = () => {
        this.stopCapture();
      };

      // Set up hidden video and canvas elements
      this.videoElement = document.createElement('video');
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      this.videoElement.muted = true;
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      this.canvasElement = document.createElement('canvas');
      this.thumbCanvasElement = document.createElement('canvas');

      // Start 1 FPS local capture loop (1000ms interval)
      this.intervalId = setInterval(() => {
        this.captureFrame();
      }, 1000);

      // Immediate first frame once video dimensions are available
      setTimeout(() => this.captureFrame(), 250);

      return true;
    } catch (err) {
      // Do not trigger onStopCallback if capture never started (e.g. user cancelled picker)
      const hadStream = this.stream !== null;
      this.cleanupResources();
      if (hadStream && this.onStopCallback) {
        this.onStopCallback();
      }
      return false;
    }
  }

  private captureFrame() {
    if (!this.stream || !this.videoElement || !this.canvasElement) return;
    if (this.videoElement.videoWidth === 0 || this.videoElement.videoHeight === 0) return;

    const sourceWidth = this.videoElement.videoWidth;
    const sourceHeight = this.videoElement.videoHeight;

    // Downscale to max 1280px wide preserving aspect ratio
    const maxWidth = 1280;
    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;

    if (sourceWidth > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = Math.round((sourceHeight * maxWidth) / sourceWidth);
    }

    this.canvasElement.width = targetWidth;
    this.canvasElement.height = targetHeight;

    const ctx = this.canvasElement.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(this.videoElement, 0, 0, targetWidth, targetHeight);

    // Export as JPEG with quality 0.7
    const dataUrl = this.canvasElement.toDataURL('image/jpeg', 0.7);
    const base64Data = dataUrl.split(',')[1];

    if (base64Data) {
      const thumbnail = extractGrayscaleThumbnail(
        this.canvasElement,
        this.thumbCanvasElement || undefined
      );
      this.latestFrame = base64Data;
      this.latestThumbnail = thumbnail;
      if (this.onFrameCallback) {
        this.onFrameCallback(base64Data, thumbnail);
      }
    }
  }

  private cleanupResources() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    this.canvasElement = null;
    this.thumbCanvasElement = null;
  }

  public stopCapture() {
    const wasSharing = this.stream !== null;
    this.cleanupResources();
    if (wasSharing && this.onStopCallback) {
      this.onStopCallback();
    }
  }

  public isSharing(): boolean {
    return this.stream !== null && this.stream.active;
  }
}

/**
 * Encodes an uploaded image file (screenshot/photo fallback) to downscaled JPEG base64
 */
export async function processUploadedImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context error'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
