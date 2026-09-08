import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface PhotoCaptureResult {
  imageUrl: string;
  format: string;
}

export function openFileCameraPicker(): Promise<PhotoCaptureResult> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.style.position = 'fixed';
    input.style.top = '-9999px';
    input.style.left = '-9999px';
    input.style.opacity = '0';

    let settled = false;

    const cleanup = () => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    };

    input.onchange = (e: any) => {
      settled = true;
      const file = e.target?.files?.[0];
      cleanup();
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          imageUrl: reader.result as string,
          format: file.type || 'image/jpeg',
        });
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    };

    const onFocus = () => {
      window.removeEventListener('focus', onFocus);
      setTimeout(() => {
        if (!settled) {
          settled = true;
          cleanup();
          reject(new Error('Capture cancelled by user'));
        }
      }, 1500);
    };
    window.addEventListener('focus', onFocus);

    document.body.appendChild(input);
    input.click();
  });
}

export async function requestCameraPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const check = await Camera.checkPermissions();
      if (check.camera === 'granted') return true;
      const res = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
      return res.camera === 'granted';
    } catch {
      return false;
    }
  }

  // Web browser
  if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

export async function captureProducePhoto(): Promise<PhotoCaptureResult> {
  // 1. If running inside Capacitor native container (Android APK / iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      // Explicitly check & request Android runtime camera permissions
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        // Still attempt Camera.getPhoto as Capacitor may show its own prompt
      }

      const photoPromise = Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Camera launch timeout')), 10000)
      );

      const photo = await Promise.race([photoPromise, timeoutPromise]);
      return {
        imageUrl: photo.dataUrl || '',
        format: photo.format,
      };
    } catch (error: any) {
      if (error?.message?.includes('cancelled') || error?.message?.includes('User cancelled')) {
        throw new Error('Capture cancelled by user');
      }
      // Fallback to HTML5 file camera picker if native camera fails
      return openFileCameraPicker();
    }
  }

  // 2. Running on desktop/mobile web browser (HTTP/HTTPS)
  // Request camera permission if browser supports mediaDevices
  if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach((t) => t.stop());
    } catch (err: any) {
      console.warn('Browser camera permission prompt result:', err.message);
    }
  }

  return openFileCameraPicker();
}
