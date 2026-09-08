import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Thermometer, 
  Award, 
  Languages, 
  AlertTriangle, 
  RefreshCw,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { 
  analyzeProduceImage, 
  ProduceScanResult, 
  SAMPLE_PRODUCE_PHOTOS, 
  SampleProducePhoto 
} from '../services/aiVisionService';

interface ProduceQualityScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropHint?: string;
  onApplyGrade?: (result: ProduceScanResult, imageSrc: string) => void;
  isHindi?: boolean;
}

export const ProduceQualityScannerModal: React.FC<ProduceQualityScannerModalProps> = ({
  isOpen,
  onClose,
  cropHint = 'Tomato',
  onApplyGrade,
  isHindi: initialHindi = false,
}) => {
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en'>(initialHindi ? 'hi' : 'en');
  const isHindi = selectedLang === 'hi';

  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_PRODUCE_PHOTOS[0].imageUrl);
  const [selectedCrop, setSelectedCrop] = useState<string>(cropHint || 'Tomato');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ProduceScanResult | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Auto run initial scan on opening
      handleStartScan(selectedImage, selectedCrop);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartScan = async (imgUrl: string, crop: string) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanResult(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    const result = await analyzeProduceImage(imgUrl, crop);

    clearInterval(interval);
    setScanProgress(100);
    setTimeout(() => {
      setScanResult(result);
      setIsScanning(false);
    }, 300);
  };

  const handleSelectSample = (sample: SampleProducePhoto) => {
    setSelectedImage(sample.imageUrl);
    setSelectedCrop(sample.crop);
    handleStartScan(sample.imageUrl, sample.crop);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setSelectedImage(src);
        handleStartScan(src, selectedCrop);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmAndApply = () => {
    if (scanResult && onApplyGrade) {
      onApplyGrade(scanResult, selectedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  {isHindi ? 'एआई फसल गुणवत्ता व शेल्फ-लाइफ स्कैनर' : 'AI Produce Grading & Spoilage Scanner'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  APEDA / AGMARK
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {isHindi 
                  ? 'सतह दोष, ताजगी स्कोर व कोल्ड-चेन स्थिरता की वास्तविक जांच' 
                  : 'Computer vision surface defect inspection & shelf life prediction'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedLang(selectedLang === 'hi' ? 'en' : 'hi')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{selectedLang === 'hi' ? 'English' : 'हिन्दी'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          
          {/* Preset Sample Selector */}
          <div>
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-2">
              {isHindi ? 'नमूना फसल चुनें या अपनी फोटो अपलोड करें' : 'Select sample crop or upload photo'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PRODUCE_PHOTOS.map((sample) => {
                const isSelected = selectedImage === sample.imageUrl;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <img 
                      src={sample.imageUrl} 
                      alt={sample.name} 
                      className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0" 
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-stone-900 truncate">
                        {isHindi ? sample.hindi : sample.name}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold truncate">
                        {sample.badge}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inspection Viewport & Scanner Overlay */}
          <div className="relative rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-inner">
            <div className="relative h-60 sm:h-72 w-full flex items-center justify-center overflow-hidden">
              <img
                src={selectedImage}
                alt="Produce Under Scan"
                className="w-full h-full object-cover opacity-90 transition-all duration-300"
              />

              {/* Scanning HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff8815_1px,transparent_1px),linear-gradient(to_bottom,#00ff8815_1px,transparent_1px)] bg-[size:24px_24px]" />

                {/* Laser scan bar when scanning */}
                {isScanning && (
                  <div 
                    className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-pulse transition-all duration-100"
                    style={{ top: `${scanProgress}%` }}
                  />
                )}

                {/* Target Bounding Box */}
                <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-emerald-400/70 rounded-2xl flex flex-col justify-between p-3">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-300 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md self-start border border-emerald-500/30">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      {isScanning ? (isHindi ? 'न्यूरल स्कैनिंग जारी...' : 'AI Surface Scan Active...') : (isHindi ? 'स्कैन सम्पन्न' : 'Analysis Complete')}
                    </span>
                  </div>

                  {/* Corner Targets */}
                  <div className="flex justify-between items-end text-[10px] font-mono text-emerald-300/80">
                    <span className="bg-black/50 px-2 py-0.5 rounded border border-emerald-500/20">
                      FOV: RGB-D MATRIX
                    </span>
                    <span className="bg-black/50 px-2 py-0.5 rounded border border-emerald-500/20">
                      {selectedCrop.toUpperCase()} · 1080p
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar inside photo viewport */}
            <div className="p-3 bg-stone-900 border-t border-stone-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-stone-700"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isHindi ? 'अपनी फोटो अपलोड करें' : 'Upload Produce Photo'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleStartScan(selectedImage, selectedCrop)}
                disabled={isScanning}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? (isHindi ? 'विश्लेषण जारी...' : 'Scanning...') : (isHindi ? 'पुनः स्कैन करें' : 'Re-Scan Produce')}</span>
              </button>
            </div>
          </div>

          {/* AI Inspection Results & Certificate */}
          {scanResult && !isScanning && (
            <div className="space-y-4">
              {/* Primary Grade Header Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-stone-50 border border-emerald-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-stone-900">
                        {isHindi ? scanResult.gradeHindi : scanResult.grade}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {scanResult.certificateId}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {isHindi 
                        ? `परिपक्वता: ${scanResult.ripenessHindi} · निर्यात मानक उत्तीर्ण`
                        : `Ripeness: ${scanResult.ripeness} · Meets APEDA Codex Standards`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  <div className="text-center sm:text-right">
                    <div className="text-2xl font-mono font-black text-emerald-700">
                      {scanResult.freshnessScore}%
                    </div>
                    <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                      {isHindi ? 'ताजगी सूचकांक' : 'Freshness Index'}
                    </div>
                  </div>
                  <div className="text-center sm:text-right border-l pl-4 border-stone-200">
                    <div className="text-2xl font-mono font-black text-stone-800">
                      {scanResult.defectPercentage}%
                    </div>
                    <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                      {isHindi ? 'सतह दोष' : 'Defect Ratio'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold uppercase">
                    <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isHindi ? 'कोल्ड-चेन स्थिरता' : 'Reefer Cold-Chain'}</span>
                  </div>
                  <div className="text-base font-mono font-bold text-stone-900 mt-1">
                    {scanResult.shelfLifeColdDays} {isHindi ? 'दिन' : 'Days'}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    @ {scanResult.optimalTempC}°C
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold uppercase">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isHindi ? 'सामान्य शेल्फ-लाइफ' : 'Ambient Shelf-Life'}</span>
                  </div>
                  <div className="text-base font-mono font-bold text-stone-900 mt-1">
                    {scanResult.shelfLifeAmbientDays} {isHindi ? 'दिन' : 'Days'}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    @ 28°C Mandi Temp
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold uppercase">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isHindi ? 'रंग एकरूपता' : 'Color Uniformity'}</span>
                  </div>
                  <div className="text-base font-mono font-bold text-stone-900 mt-1">
                    {scanResult.colorUniformity}%
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    No Blotching
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold uppercase">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>{isHindi ? 'मजबूती सूचकांक' : 'Firmness Index'}</span>
                  </div>
                  <div className="text-base font-mono font-bold text-stone-900 mt-1">
                    {scanResult.firmnessIndex}%
                  </div>
                  <div className="text-[10px] text-purple-700 font-semibold mt-0.5">
                    Transit Sturdy
                  </div>
                </div>
              </div>

              {/* Detected Computer Vision Features */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isHindi ? 'कंप्यूटर विजन सतह निरीक्षण बिंदु' : 'Computer Vision Surface Inspection Checklist'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                  {(isHindi ? scanResult.detectedFeaturesHindi : scanResult.detectedFeatures).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {isHindi ? 'रद्द करें' : 'Cancel'}
          </button>

          {onApplyGrade && scanResult && (
            <button
              type="button"
              onClick={handleConfirmAndApply}
              className="px-5 py-2.5 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>
                {isHindi 
                  ? `प्रमाणपत्र लागू करें (${scanResult.gradeHindi.split(' ')[0]})` 
                  : `Apply ${scanResult.grade.split(' ')[0]} Grade to Produce`}
              </span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
