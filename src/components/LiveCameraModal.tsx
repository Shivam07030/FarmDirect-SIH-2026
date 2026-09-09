import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  X, 
  RotateCcw, 
  Check, 
  FlipHorizontal, 
  Upload, 
  AlertCircle, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (imageDataUrl: string) => void;
  cropNameHint?: string;
  isHindi?: boolean;
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  cropNameHint = 'Produce',
  isHindi = false,
}) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileFallbackRef = useRef<HTMLInputElement | null>(null);

  // Stop current video stream tracks safely
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Start live camera stream
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopStream();
    setCameraError(null);
    setCapturedImage(null);

    // If native Capacitor container on Android/iOS, trigger native hardware camera directly
    if (Capacitor.isNativePlatform()) {
      try {
        setIsCapturing(true);
        const photo = await CapCamera.getPhoto({
          quality: 85,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
        });
        if (photo.dataUrl) {
          setCapturedImage(photo.dataUrl);
        }
      } catch (err: any) {
        if (!err?.message?.includes('cancelled') && !err?.message?.includes('User cancelled')) {
          setCameraError(isHindi ? 'कैमरा खोलने में असमर्थ। गैलरी से चुनें।' : 'Unable to open camera. Try gallery upload.');
        } else {
          onClose();
        }
      } finally {
        setIsCapturing(false);
      }
      return;
    }

    // Web browser getUserMedia flow
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        isHindi
          ? 'आपका ब्राउज़र सीधे कैमरे को सपोर्ट नहीं करता। कृपया गैलरी या फ़ाइल से अपलोड करें।'
          : 'Direct camera stream not supported by browser. Please use gallery upload.'
      );
      return;
    }

    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera getUserMedia error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          isHindi
            ? 'कैमरा अनुमति अस्वीकृत है। ब्राउज़र सेटिंग में कैमरा अनुमति चालू करें या फ़ाइल अपलोड करें।'
            : 'Camera permission denied. Allow camera in browser settings or use file upload.'
        );
      } else {
        setCameraError(
          isHindi
            ? 'कैमरा शुरू नहीं हो सका। कृपया फ़ाइल से अपलोड करें।'
            : 'Unable to start camera stream. You can upload an image file instead.'
        );
      }
    } finally {
      setIsCapturing(false);
    }
  }, [stopStream, isHindi, onClose]);

  // Handle modal open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedImage(null);
      setCameraError(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream]);

  if (!isOpen) return null;

  // Toggle front/rear camera
  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Capture current frame from video onto hidden canvas
  const handleSnapPhoto = () => {
    const video = videoRef.current;
    if (!video || !isCameraActive) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if front-facing selfie camera
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedImage(dataUrl);
    stopStream();
  };

  // Confirm and use snapped photo
  const handleConfirmPhoto = () => {
    if (capturedImage) {
      onPhotoCaptured(capturedImage);
      onClose();
    }
  };

  // Discard and retake
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  // Fallback file input change
  const handleFallbackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCapturedImage(reader.result);
          stopStream();
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col max-h-[90vh]">
        
        {/* Top Navigation Bar */}
        <div className="p-4 bg-stone-950/80 backdrop-blur-md border-b border-stone-800 flex items-center justify-between text-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-1.5">
                <span>{isHindi ? 'लाइव फसल कैमरा' : 'Live Produce Camera'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono border border-emerald-400/30">
                  {cropNameHint}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                {isHindi ? 'ताजी सब्जियों की सीधी तस्वीर लें' : 'Snap direct farmgate photo (No old photos)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!capturedImage && isCameraActive && (
              <button
                type="button"
                onClick={handleFlipCamera}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
                title={isHindi ? 'कैमरा बदलें' : 'Switch Camera'}
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[340px] sm:min-h-[420px] overflow-hidden">
          {/* Active Live Video Stream */}
          {!capturedImage && (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[500px]"
              />

              {/* Viewfinder Target Framing Overlay */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
                  {/* Framing Reticle */}
                  <div className="w-full max-w-xs h-64 border-2 border-dashed border-emerald-400/60 rounded-3xl relative flex items-center justify-center shadow-lg">
                    {/* Corner brackets */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-emerald-400 rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-emerald-400 rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-emerald-400 rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-emerald-400 rounded-br-xl" />

                    <div className="bg-stone-900/80 backdrop-blur-xs text-emerald-300 text-[11px] font-medium px-3 py-1 rounded-full border border-emerald-400/30">
                      {isHindi ? 'सब्जियों को फ्रेम के अंदर रखें' : 'Align fresh produce in frame'}
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-300 bg-stone-950/70 px-3 py-1 rounded-full backdrop-blur-xs">
                    {isHindi ? 'स्पष्ट रोशनी में सीधी तस्वीर खींचें' : 'Clear daylight view · Direct farm harvest'}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isCapturing && !isCameraActive && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                  <p className="text-xs">{isHindi ? 'कैमरा शुरू हो रहा है...' : 'Starting live camera feed...'}</p>
                </div>
              )}

              {/* Camera Error / Permission Fallback */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-stone-300 gap-3 bg-stone-900/90">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <div className="text-sm font-bold text-white">
                      {isHindi ? 'कैमरा उपलब्ध नहीं है' : 'Camera Unavailable'}
                    </div>
                    <p className="text-xs text-stone-400">{cameraError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileFallbackRef.current?.click()}
                    className="mt-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isHindi ? 'गैलरी / फाइल से फोटो चुनें' : 'Choose Photo from Gallery'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Snapped Photo Review */}
          {capturedImage && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured crop"
                className="w-full h-full object-cover max-h-[500px]"
              />
              <div className="absolute top-3 left-3 bg-emerald-950/80 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <Check className="w-3 h-3" />
                <span>{isHindi ? 'कैमरा से फोटो ली गई' : 'Photo Captured Directly'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Input for fallback gallery pick */}
        <input
          type="file"
          ref={fileFallbackRef}
          accept="image/*"
          className="hidden"
          onChange={handleFallbackFileChange}
        />

        {/* Bottom Control Bar */}
        <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3">
          {!capturedImage ? (
            <>
              {/* Secondary Gallery Pick */}
              <button
                type="button"
                onClick={() => fileFallbackRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isHindi ? 'गैलरी से चुनें' : 'Or Pick from Gallery'}</span>
                <span className="sm:hidden">{isHindi ? 'गैलरी' : 'Gallery'}</span>
              </button>

              {/* Big Circular Camera Shutter Button */}
              <button
                type="button"
                onClick={handleSnapPhoto}
                disabled={!isCameraActive}
                className="w-16 h-16 rounded-full bg-white hover:bg-stone-200 active:scale-95 disabled:opacity-40 disabled:scale-100 flex items-center justify-center p-1.5 border-4 border-emerald-500 shadow-xl transition-all cursor-pointer mx-auto"
                title={isHindi ? 'फोटो खींचें' : 'Take Photo'}
              >
                <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                </div>
              </button>

              <div className="w-20" /> {/* Spacer for symmetrical center */}
            </>
          ) : (
            /* Review & Action Bar */
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isHindi ? 'दोबारा खींचें (Retake)' : 'Retake Photo'}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-[#0E3B2B] hover:from-emerald-500 hover:to-[#144E39] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isHindi ? 'इस फोटो का उपयोग करें' : 'Use This Photo'}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
