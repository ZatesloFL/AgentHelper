/**
 * Screen share capture and frame downscaling utility
 * - Enforces max width 1280px
 * - JPEG quality 0.7
 * - Maximum 1 frame per second (1 FPS)
 * - Feature detects navigator.mediaDevices.getDisplayMedia
 * - Never stores frames to disk
 */

export interface ScreenCaptureController {
  start: () => Promise<MediaStream>;
  stop: () => void;
  isActive: () => boolean;
}

export function isScreenShareSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function'
  );
}

export class ScreenStreamer {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private intervalId: any = null;
  private latestFrame: string | null = null;
  private onFrameCallback: ((jpegBase64: string) => void) | null = null;
  private onStopCallback: (() => void) | null = null;

  constructor(
    onFrame: (jpegBase64: string) => void,
    onStop?: () => void
  ) {
    this.onFrameCallback = onFrame;
    this.onStopCallback = onStop || null;
  }

  public getLatestFrame(): string | null {
    return this.latestFrame;
  }

  public async startCapture(): Promise<boolean> {
    if (!isScreenShareSupported()) {
      throw new Error('Screen sharing is not supported in this browser.');
    }

    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { max: 1 },
          width: { max: 1280 },
        },
        audio: false,
      });

      // Handle user stopping screen share via native browser UI bar
      this.stream.getVideoTracks()[0].onended = () => {
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

      // Start 1 FPS capture loop (1000ms interval)
      this.intervalId = setInterval(() => {
        this.captureFrame();
      }, 1000);

      // Immediate first frame
      setTimeout(() => this.captureFrame(), 300);

      return true;
    } catch (err) {
      this.stopCapture();
      throw err;
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
      this.latestFrame = base64Data;
      if (this.onFrameCallback) {
        this.onFrameCallback(base64Data);
      }
    }
  }

  public stopCapture() {
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

    if (this.onStopCallback) {
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
