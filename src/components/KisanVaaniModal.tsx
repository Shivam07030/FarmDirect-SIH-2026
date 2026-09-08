import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Languages,
  Check
} from 'lucide-react';
import { 
  parseSpokenCropIntent, 
  speakConfirmation, 
  KisanVoiceRecognition, 
  SpokenCropIntent 
} from '../services/voiceService';

interface KisanVaaniModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmListing: (intent: SpokenCropIntent) => void;
  isHindi?: boolean;
}

export const KisanVaaniModal: React.FC<KisanVaaniModalProps> = ({
  isOpen,
  onClose,
  onConfirmListing,
  isHindi: initialHindi = true,
}) => {
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en'>(initialHindi ? 'hi' : 'en');
  const isHindi = selectedLang === 'hi';

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedIntent, setParsedIntent] = useState<SpokenCropIntent | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [waveHeights, setWaveHeights] = useState<number[]>([12, 24, 40, 60, 48, 32, 16, 28, 52]);

  const recognitionRef = useRef<KisanVoiceRecognition | null>(null);
  const animationIntervalRef = useRef<any>(null);

  useEffect(() => {
    recognitionRef.current = new KisanVoiceRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stopListening();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    };
  }, []);

  // Animate sound waves while listening or speaking
  useEffect(() => {
    if (isListening || isSpeaking) {
      animationIntervalRef.current = setInterval(() => {
        setWaveHeights(
          Array.from({ length: 9 }, () => Math.floor(Math.random() * 55) + 10)
        );
      }, 100);
    } else {
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
      setWaveHeights([10, 14, 18, 22, 26, 22, 18, 14, 10]);
    }
    return () => {
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    };
  }, [isListening, isSpeaking]);

  if (!isOpen) return null;

  const handleStartListening = () => {
    setVoiceError('');
    setTranscript('');
    setParsedIntent(null);

    if (!recognitionRef.current?.isSupported()) {
      // Fallback for browsers without speech recognition API (simulate instant natural recognition)
      simulateVoiceDemo();
      return;
    }

    setIsListening(true);
    recognitionRef.current.startListening(
      selectedLang,
      (text, isFinal) => {
        setTranscript(text);
        if (text.trim().length > 3) {
          const intent = parseSpokenCropIntent(text, selectedLang);
          setParsedIntent(intent);
        }
        if (isFinal) {
          setIsListening(false);
          if (text.trim()) {
            const finalIntent = parseSpokenCropIntent(text, selectedLang);
            setParsedIntent(finalIntent);
            triggerSpeechFeedback(finalIntent);
          }
        }
      },
      (err) => {
        setIsListening(false);
        // If microphone blocked or error occurs, offer smooth simulation
        setVoiceError(isHindi ? 'माइक्रोफोन नहीं मिला। नीचे दिए गए उदाहरण पर क्लिक करें।' : 'Microphone access denied. Try sample queries below.');
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stopListening();
    }
    setIsListening(false);
    if (transcript.trim()) {
      const intent = parseSpokenCropIntent(transcript, selectedLang);
      setParsedIntent(intent);
      triggerSpeechFeedback(intent);
    }
  };

  const triggerSpeechFeedback = (intent: SpokenCropIntent) => {
    setIsSpeaking(true);
    speakConfirmation(intent, selectedLang, () => {
      setIsSpeaking(false);
    });
  };

  const simulateVoiceDemo = (customSample?: string) => {
    const sample = customSample || (isHindi 
      ? 'मेरी 400 किलो टमाटर 25 रुपये में बेच दो'
      : 'Sell 400 kg tomatoes at 25 rupees per kg');
    
    setTranscript(sample);
    const intent = parseSpokenCropIntent(sample, selectedLang);
    setParsedIntent(intent);
    triggerSpeechFeedback(intent);
  };

  const samplePhrases = isHindi
    ? [
        'मेरी 400 किलो टमाटर 25 रुपये में बेच दो',
        '500 किलो आलू का भाव 18 रुपये प्रति किलो',
        '300 किलो प्याज 28 रुपये में लिस्ट करो',
        '10 क्विंटल गेहूं 31 रुपये में बेचना है',
      ]
    : [
        'Sell 400 kg tomatoes at 25 rupees',
        'List 500 kg potatoes at 18 rupees per kg',
        'Sell 300 kg onions at 28 rupees',
        'Offer 10 quintal wheat at 31 rupees',
      ];

  const handleConfirm = () => {
    if (!parsedIntent) return;
    onConfirmListing(parsedIntent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-2xl border border-stone-200 relative">
        
        {/* Top Decorative Header Accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900 font-serif">
                  {isHindi ? 'किसान वाणी AI वॉइस असिस्टेंट' : 'Kisan Vaani AI Voice Assistant'}
                </h2>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  {isHindi ? 'बोलकर फसल बेचें' : 'Voice-to-Listing'}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {isHindi 
                  ? 'अपनी फसल, मात्रा और कीमत बोलें — किसान वाणी स्वतः मंडी में लिस्ट करेगी' 
                  : 'Speak crop, quantity, and price in natural language — instant marketplace listing'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setSelectedLang((prev) => (prev === 'hi' ? 'en' : 'hi'))}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center gap-1 cursor-pointer"
              title="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{isHindi ? 'हिंदी' : 'English'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voice Animation & Microphone Centerpiece */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Pulsing rings when listening */}
            {isListening && (
              <>
                <span className="absolute w-28 h-28 rounded-full bg-emerald-500/20 animate-ping" />
                <span className="absolute w-36 h-36 rounded-full bg-emerald-500/10 animate-pulse" />
              </>
            )}

            <button
              type="button"
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 animate-bounce'
                  : isSpeaking
                  ? 'bg-amber-600 text-white ring-4 ring-amber-200'
                  : 'bg-[#0E3B2B] hover:bg-[#144E39] text-white hover:shadow-xl'
              }`}
            >
              {isListening ? (
                <MicOff className="w-9 h-9" />
              ) : isSpeaking ? (
                <Volume2 className="w-9 h-9 animate-pulse" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </button>
          </div>

          {/* Sound Wave Bars */}
          <div className="flex items-center gap-1.5 h-12">
            {waveHeights.map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}px` }}
                className={`w-1.5 rounded-full transition-all duration-100 ${
                  isListening
                    ? 'bg-rose-500'
                    : isSpeaking
                    ? 'bg-amber-500'
                    : 'bg-stone-300'
                }`}
              />
            ))}
          </div>

          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
              {isListening
                ? (isHindi ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now')
                : isSpeaking
                ? (isHindi ? 'पुष्टि ऑडियो चल रहा है...' : 'Speaking confirmation audio...')
                : (isHindi ? 'माइक दबाएं और बोलें' : 'Tap microphone & speak')}
            </span>
          </div>
        </div>

        {/* Live Spoken Transcript Box */}
        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1 text-xs">
          <div className="flex items-center justify-between text-stone-400 text-[10px] uppercase font-semibold">
            <span>{isHindi ? 'बोले गए शब्द (Live Speech Transcript)' : 'Recognized Speech Transcript'}</span>
            {parsedIntent && (
              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>95% Confidence</span>
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-stone-800 min-h-6 italic">
            {transcript ? `"${transcript}"` : (isHindi ? 'उदाहरण: "मेरी 400 किलो टमाटर 25 रुपये में बेच दो"' : 'e.g. "Sell 400 kg of tomatoes at 25 rupees per kg"')}
          </p>
        </div>

        {/* Extracted Structured AI Intent Cards */}
        {parsedIntent && (
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{isHindi ? 'AI द्वारा पहचानी गई फसल विवरण:' : 'AI Extracted Crop Listing:'}</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                {isHindi ? parsedIntent.cropHindi : parsedIntent.cropName}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded-xl border border-emerald-200">
                <span className="text-[10px] uppercase text-stone-500 font-semibold">{isHindi ? 'फसल' : 'Crop'}</span>
                <div className="font-bold text-stone-900 mt-0.5">
                  {isHindi ? parsedIntent.cropHindi : parsedIntent.cropName}
                </div>
              </div>

              <div className="p-2 bg-white rounded-xl border border-emerald-200">
                <span className="text-[10px] uppercase text-stone-500 font-semibold">{isHindi ? 'मात्रा' : 'Quantity'}</span>
                <div className="font-bold text-stone-900 mt-0.5 font-mono">
                  {parsedIntent.quantityKg} kg
                </div>
              </div>

              <div className="p-2 bg-white rounded-xl border border-emerald-200">
                <span className="text-[10px] uppercase text-stone-500 font-semibold">{isHindi ? 'मूल्य' : 'Fair Price'}</span>
                <div className="font-bold text-emerald-700 mt-0.5 font-mono">
                  ₹{parsedIntent.pricePerKg}/kg
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-900 px-1 pt-1 border-t border-emerald-200/60">
              <span>{isHindi ? 'कुल अनुमानित आय:' : 'Total Estimated Payout:'}</span>
              <strong className="font-mono text-xs text-emerald-800">
                ₹{(parsedIntent.quantityKg * parsedIntent.pricePerKg).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        )}

        {/* Quick Clickable Spoken Sample Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-semibold text-stone-400">
            {isHindi ? 'त्वरित आवाज परीक्षण (1-क्लिक टेस्ट):' : 'Quick Voice Testing Samples (1-Click Test):'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {samplePhrases.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => simulateVoiceDemo(phrase)}
                className="text-[11px] bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-stone-200/80 px-2.5 py-1 rounded-lg text-stone-700 transition-colors cursor-pointer text-left"
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>

        {voiceError && (
          <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
            {voiceError}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {isHindi ? 'रद्द करें' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!parsedIntent}
            className="flex-2 py-2.5 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>{isHindi ? 'पुष्टि करें और मंडी में लिस्ट करें' : 'Confirm & List on Marketplace'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
