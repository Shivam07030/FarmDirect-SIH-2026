import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface PhotoCaptureResult {
  imageUrl: string;
  format: string;
}

export async function captureProducePhoto(): Promise<PhotoCaptureResult> {
  try {
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
    });

    return {
      imageUrl: photo.dataUrl || '',
      format: photo.format,
    };
  } catch (error: any) {
    if (error?.message?.includes('cancelled')) {
      throw new Error('Capture cancelled by user');
    }
    throw error;
  }
}
