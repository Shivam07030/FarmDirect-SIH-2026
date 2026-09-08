// ==========================================
// KISAN VAANI - AI VOICE ASSISTANT SERVICE
// Natural Language Spoken Crop Listing & NLP
// Supports Hindi (hi-IN) and English (en-IN)
// ==========================================

export interface SpokenCropIntent {
  cropName: string;
  cropHindi: string;
  quantityKg: number;
  pricePerKg: number;
  variety?: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Pulses' | 'Spices';
  confidence: number;
  rawTranscript: string;
  language: 'hi' | 'en';
}

// Crop dictionary for entity extraction in Hindi and English
interface CropDictionaryEntry {
  name: string;
  hindi: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Pulses' | 'Spices';
  aliases: string[];
  defaultPrice: number;
}

export const CROP_DICTIONARY: CropDictionaryEntry[] = [
  {
    name: 'Tomato',
    hindi: 'टमाटर',
    category: 'Vegetables',
    aliases: ['tamatar', 'tomato', 'tamater', 'टमाटर', 'टमाटार'],
    defaultPrice: 24,
  },
  {
    name: 'Potato',
    hindi: 'आलू',
    category: 'Vegetables',
    aliases: ['aaloo', 'aalu', 'potato', 'aloo', 'आलू', 'आलु'],
    defaultPrice: 18,
  },
  {
    name: 'Onion',
    hindi: 'प्याज',
    category: 'Vegetables',
    aliases: ['pyaz', 'pyaj', 'onion', 'pyaaz', 'प्याज', 'पियाज'],
    defaultPrice: 28,
  },
  {
    name: 'Wheat',
    hindi: 'गेहूं',
    category: 'Grains',
    aliases: ['gehu', 'gehun', 'wheat', 'gehoon', 'गेहूं', 'गेहू'],
    defaultPrice: 31,
  },
  {
    name: 'Mustard',
    hindi: 'सरसों',
    category: 'Grains',
    aliases: ['sarson', 'mustard', 'sarso', 'rai', 'सरसों', 'सरसो', 'राई'],
    defaultPrice: 52,
  },
  {
    name: 'Green Chili',
    hindi: 'हरी मिर्च',
    category: 'Vegetables',
    aliases: ['mirch', 'chili', 'chilli', 'hari mirch', 'मिर्च', 'हरी मिर्च'],
    defaultPrice: 45,
  },
  {
    name: 'Cauliflower',
    hindi: 'गोभी',
    category: 'Vegetables',
    aliases: ['gobhi', 'gobi', 'cauliflower', 'phool gobhi', 'गोभी', 'फूल गोभी'],
    defaultPrice: 22,
  },
  {
    name: 'Gram / Chana',
    hindi: 'चना',
    category: 'Pulses',
    aliases: ['chana', 'gram', 'chane', 'चना', 'चने'],
    defaultPrice: 62,
  },
  {
    name: 'Apple',
    hindi: 'सेब',
    category: 'Fruits',
    aliases: ['seb', 'apple', 'saeb', 'सेब'],
    defaultPrice: 85,
  },
];

// Number word mapping for Hindi and English
const NUMBER_WORDS: Record<string, number> = {
  // English words
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  twenty: 20, twentyfive: 25, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, thousand: 1000,
  // Hindi numerals & transliterated
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'पंद्रह': 15, 'बीस': 20, 'पच्चीस': 25, 'तीस': 30, 'पैंतीस': 35, 'चालीस': 40, 'पचास': 50,
  'सौ': 100, 'हजार': 1000, 'क्विंटल': 100,
  ek: 1, do: 2, teen: 3, chaar: 4, paanch: 5, chhe: 6, saat: 7, aath: 8, nau: 9, das: 10,
  pandrah: 15, bees: 20, pacchees: 25, tees: 30, chalees: 40, pachaas: 50, sau: 100, hazaar: 1000,
};

/**
 * Parses spoken text in Hindi or English to extract structured crop listing intent.
 */
export function parseSpokenCropIntent(transcript: string, preferredLang: 'hi' | 'en' = 'hi'): SpokenCropIntent {
  const clean = transcript.toLowerCase().trim();

  // 1. Identify Crop
  let matchedCrop: CropDictionaryEntry = CROP_DICTIONARY[0]; // fallback to Tomato
  let highestCropMatchScore = 0;

  for (const entry of CROP_DICTIONARY) {
    for (const alias of entry.aliases) {
      if (clean.includes(alias.toLowerCase())) {
        if (alias.length > highestCropMatchScore) {
          highestCropMatchScore = alias.length;
          matchedCrop = entry;
        }
      }
    }
  }

  // 2. Identify Quantity & Units
  let quantityKg = 400; // sensible default
  // Match patterns like: "500 kilo", "500 kg", "5 quintal", "5 क्विंटल", "500"
  const qtyNumMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:kilo|kg|किलो|क्विंटल|quintal|ton|टन)?/i);
  if (qtyNumMatch && qtyNumMatch[1]) {
    const val = parseFloat(qtyNumMatch[1]);
    if (clean.includes('quintal') || clean.includes('क्विंटल')) {
      quantityKg = val * 100;
    } else if (clean.includes('ton') || clean.includes('टन')) {
      quantityKg = val * 1000;
    } else {
      quantityKg = val;
    }
  } else {
    // Check number words
    for (const [word, num] of Object.entries(NUMBER_WORDS)) {
      if (clean.includes(word)) {
        quantityKg = num;
        break;
      }
    }
  }

  // 3. Identify Price
  let pricePerKg = matchedCrop.defaultPrice;
  // Patterns like: "25 rupaye", "25 rs", "₹25", "at 25", "25 में"
  const priceRegexes = [
    /(?:rupaye|rs|₹|रुपये|rupees|rate|bhav|भाव)\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:rupaye|rs|₹|रुपये|rupees|per kg|prati kilo|में|me)/i,
    /at\s*(\d+(?:\.\d+)?)/i,
  ];

  for (const regex of priceRegexes) {
    const match = clean.match(regex);
    if (match && match[1]) {
      const parsedPrice = parseFloat(match[1]);
      if (parsedPrice >= 5 && parsedPrice <= 500) {
        pricePerKg = parsedPrice;
        break;
      }
    }
  }

  // If quantity was accidentally taken as price because only 1 number was provided
  if (quantityKg === pricePerKg && quantityKg < 100) {
    quantityKg = 300;
  }

  return {
    cropName: matchedCrop.name,
    cropHindi: matchedCrop.hindi,
    quantityKg: Math.round(quantityKg),
    pricePerKg: Math.round(pricePerKg),
    category: matchedCrop.category,
    confidence: highestCropMatchScore > 0 ? 0.95 : 0.75,
    rawTranscript: transcript,
    language: preferredLang,
  };
}

/**
 * Text-to-Speech synthesizer confirming crop listing in Hindi or English
 */
export function speakConfirmation(
  intent: SpokenCropIntent,
  language: 'hi' | 'en' = 'hi',
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel(); // Stop any pending utterances

  const text =
    language === 'hi'
      ? `आपका ${intent.quantityKg} किलो ${intent.cropHindi}, उचित मूल्य ₹${intent.pricePerKg} प्रति किलो पर मंडी में लिस्ट करने के लिए तैयार है।`
      : `Your ${intent.quantityKg} kg of ${intent.cropName} is ready to list on the marketplace at the fair price of ₹${intent.pricePerKg} per kg.`;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Browser Speech Recognition wrapper supporting Hindi & English
 */
export class KisanVoiceRecognition {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(
    lang: 'hi' | 'en',
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): void {
    if (!this.recognition) {
      onError('Speech recognition not supported in this browser.');
      return;
    }

    if (this.isListening) {
      this.recognition.abort();
    }

    this.recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      const text = final || interim;
      onResult(text, Boolean(final));
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || 'Voice input error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e: any) {
      onError(e.message || 'Failed to start microphone');
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
