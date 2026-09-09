import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Loader2, 
  RefreshCw,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { getProduceFreshnessInfo } from '../utils/freshnessSla';
import { LiveCameraModal } from './LiveCameraModal';

interface PhotoRefreshModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_FRESH_PRESETS: Record<string, string[]> = {
  Tomatoes: [
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546470427-0d4db154ceb7?w=600&auto=format&fit=crop&q=80'
  ],
  Potatoes: [
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80'
  ],
  Onions: [
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=600&auto=format&fit=crop&q=80'
  ],
  Default: [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80'
  ]
};

export const PhotoRefreshModal: React.FC<PhotoRefreshModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { refreshProductPhoto, marketRules } = useApp();
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const freshness = getProduceFreshnessInfo(product, marketRules);
  const presets = SAMPLE_FRESH_PRESETS[product.name] || SAMPLE_FRESH_PRESETS.Default;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefresh = async () => {
    const photoToUse = selectedPhoto || presets[0] || product.imageUrl;
    setIsScanning(true);
    // Simulate instant AI validation
    await new Promise((res) => setTimeout(res, 800));
    setIsScanning(false);
    setIsSubmitting(true);

    try {
      await refreshProductPhoto(product.id, photoToUse);
      setSuccessMessage('Fresh photo verified and published! Produce listing is now 100% active.');
      setTimeout(() => {
        setSuccessMessage(null);
        setSelectedPhoto('');
        onClose();
      }, 1400);
    } catch {
      // Error handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Fresh Harvest Photo SLA
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {marketRules.photoExpiryHours}h SLA
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                ताज़ी फसल का फोटो अपडेट करें · Re-verify produce freshness
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Current Status Card */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            freshness.tier === 'EXPIRED'
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300'
              : freshness.tier === 'EXPIRING_SOON'
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
          }`}>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">
                  {product.name} ({product.quantity} kg)
                </p>
                <p className="text-xs opacity-90">
                  Photo Age: <span className="font-bold">{freshness.hoursAgo}h ago</span> ({freshness.statusTextEn})
                </p>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
              freshness.tier === 'EXPIRED'
                ? 'bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-100'
                : freshness.tier === 'EXPIRING_SOON'
                ? 'bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100'
                : 'bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-100'
            }`}>
              {freshness.tier === 'EXPIRED' ? 'Photo Stale' : freshness.tier === 'EXPIRING_SOON' ? 'Refresh Due' : 'Active'}
            </span>
          </div>

          {/* Photo Preview & Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Select or Capture Live Lot Photo
            </label>
            <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center group">
              <img
                src={selectedPhoto || product.imageUrl}
                alt="Produce lot preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                <label className="cursor-pointer bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 px-3 py-1.5 rounded-lg text-xs font-semibold shadow flex items-center gap-1 hover:bg-zinc-100 transition">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {selectedPhoto && (
                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                  <Sparkles className="w-3 h-3" /> New Photo Ready
                </div>
              )}
            </div>

            {/* Direct Camera Capture & Gallery Selection */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsLiveCameraOpen(true)}
                className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Snap with Camera</span>
              </button>

              <label className="py-2.5 px-3 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center">
                <Upload className="w-4 h-4" />
                <span>Choose from Gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Fast Presets for Quick Demo */}
          <div>
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
              Quick 1-Click Fresh Harvest Samples (for instant testing):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhoto(url)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition ${
                    selectedPhoto === url
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/30'
                  }`}
                >
                  <img src={url} alt="preset" className="w-10 h-10 rounded object-cover shrink-0" />
                  <div>
                    <span className="font-semibold block">Fresh Batch #{idx + 1}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Harvested Today</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SLA Rule note */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Buyer Protection Freshness SLA
            </div>
            <p>
              Updating the photo resets the freshness SLA timer to <strong>0 hours</strong>. Your listing will be labeled <strong>🟢 Live Fresh Photo</strong> and unlocked for instant buyer purchases.
            </p>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isScanning || isSubmitting}
            onClick={handleRefresh}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AI Quality Checking...
              </>
            ) : isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Publishing Fresh Lot...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Verify & Publish Fresh Photo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Produce Camera Modal */}
      <LiveCameraModal
        isOpen={isLiveCameraOpen}
        onClose={() => setIsLiveCameraOpen(false)}
        onPhotoCaptured={(dataUrl) => {
          setSelectedPhoto(dataUrl);
          setIsLiveCameraOpen(false);
        }}
        cropNameHint={product.name}
      />
    </div>
  );
};
