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

export async function captureProducePhoto(): Promise<PhotoCaptureResult> {
  // If running inside Capacitor native container (Android APK / iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      const photoPromise = Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Camera launch timeout')), 5000)
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

  // Running on desktop/mobile web browser (HTTP/HTTPS)
  return openFileCameraPicker();
}
