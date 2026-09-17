import { LETTER_PHONICS } from '../data/letterPaths';
import { getMediaItem } from './db';

// Web Audio Context singleton
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Keep active utterance referenced to prevent garbage collection bugs in Safari/Chrome
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Cached voices array and listener initialization
let cachedVoices: SpeechSynthesisVoice[] = [];
let voiceLoadingPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/**
 * Retrieves all installed speech synthesis voices, handling async voice initialization
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) {
    cachedVoices = existing;
    return Promise.resolve(existing);
  }

  if (voiceLoadingPromise) {
    return voiceLoadingPromise;
  }

  voiceLoadingPromise = new Promise((resolve) => {
    const handleVoicesChanged = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        cachedVoices = v;
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(v);
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    // Fallback timer in case voiceschanged does not fire
    setTimeout(() => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    }, 1000);
  });

  return voiceLoadingPromise;
}

/**
 * Checks if a voice is an Indian English or Indian voice
 */
export function isIndianVoice(v: SpeechSynthesisVoice): boolean {
  const lang = (v.lang || '').toLowerCase().replace('_', '-');
  const name = (v.name || '').toLowerCase();
  return (
    lang === 'en-in' ||
    lang.startsWith('en-in-') ||
    lang === 'hi-in' ||
    lang.startsWith('hi-') ||
    name.includes('india') ||
    name.includes('neerja') ||
    name.includes('heera') ||
    name.includes('isha') ||
    name.includes('sangeeta') ||
    name.includes('veena') ||
    name.includes('kajal') ||
    name.includes('swara') ||
    name.includes('lekha')
  );
}

/**
 * Checks if a voice is female
 */
export function isFemaleVoice(v: SpeechSynthesisVoice): boolean {
  const name = (v.name || '').toLowerCase();
  const femaleKeywords = [
    'female', 'woman', 'girl',
    'neerja', 'heera', 'isha', 'sangeeta', 'veena', 'kajal',
    'swara', 'ananya', 'sunita', 'aditi', 'pooja', 'lekha', 'kalpana',
    'samantha', 'victoria', 'karen', 'zira', 'jenny', 'siri'
  ];
  const maleKeywords = ['male', 'guy', 'david', 'prabhat', 'george', 'ravi', 'mark', 'richard'];

  if (maleKeywords.some(mk => name.includes(mk))) return false;
  return femaleKeywords.some(fk => name.includes(fk));
}

/**
 * Retrieves all installed Indian voices
 */
export async function getAvailableIndianVoices(): Promise<SpeechSynthesisVoice[]> {
  const voices = await getAvailableVoices();
  return voices.filter(isIndianVoice);
}

/**
 * Selects the optimal Indian English female voice from available system voices
 */
export function selectBestIndianFemaleVoice(
  voices: SpeechSynthesisVoice[],
  selectedURI?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // If parent explicitly selected a voice URI, find it first
  if (selectedURI) {
    const matched = voices.find(v => v.voiceURI === selectedURI || v.name === selectedURI);
    if (matched) return matched;
  }

  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    const name = v.name.toLowerCase();
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    let score = 0;

    // 1. Language matching
    if (lang === 'en-in' || lang.startsWith('en-in-')) {
      score += 100;
    } else if (name.includes('india') || name.includes('indian')) {
      score += 85;
    } else if (lang === 'hi-in' || lang.startsWith('hi-')) {
      score += 65; // Hindi bilingual voices synthesize Indian English words with authentic accent
    } else if (lang.startsWith('en')) {
      score += 15;
    } else {
      return -100;
    }

    // 2. Gender matching (female priority)
    const femaleNames = [
      'neerja', 'heera', 'isha', 'sangeeta', 'veena', 'kajal',
      'swara', 'ananya', 'sunita', 'aditi', 'pooja', 'lekha', 'kalpana'
    ];
    const isNamedFemale = femaleNames.some(fn => name.includes(fn));
    const hasFemaleWord = name.includes('female') || name.includes('woman') || name.includes('girl');
    const hasMaleWord = name.includes('male') || name.includes('david') || name.includes('prabhat') || name.includes('george') || name.includes('ravi');

    if (isNamedFemale) {
      score += 60;
    } else if (hasFemaleWord) {
      score += 50;
    } else if (hasMaleWord) {
      score -= 50;
    } else {
      score += 20;
    }

    // 3. Audio quality indicators (natural/neural engines)
    if (name.includes('natural') || name.includes('neural')) {
      score += 30; // e.g. Microsoft Neerja Online (Natural)
    } else if (name.includes('online')) {
      score += 20;
    } else if (name.includes('google')) {
      score += 15; // Google Indian English
    } else if (name.includes('enhanced')) {
      score += 15; // Apple Enhanced
    }

    return score;
  };

  const ranked = [...voices]
    .map(v => ({ voice: v, score: scoreVoice(v) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length > 0) {
    return ranked[0].voice;
  }

  // Fallback to any English female voice or first English voice
  const fallback = voices.find(
    v => (v.lang || '').startsWith('en') && isFemaleVoice(v)
  ) || voices.find(v => (v.lang || '').startsWith('en'));

  return fallback || null;
}

export interface ActiveVoiceInfo {
  name: string;
  lang: string;
  isIndian: boolean;
  isFemale: boolean;
  displayName: string;
}

export function getVoiceDisplayInfo(voice: SpeechSynthesisVoice | null): ActiveVoiceInfo {
  if (!voice) {
    return {
      name: 'Indian English (System Default)',
      lang: 'en-IN',
      isIndian: true,
      isFemale: true,
      displayName: 'Indian English Female (Default) 🇮🇳',
    };
  }

  const isInd = isIndianVoice(voice);
  const isFem = isFemaleVoice(voice);

  const cleanName = voice.name
    .replace(/\s*\(Natural\)\s*/i, ' (Natural)')
    .replace(/Microsoft\s+/i, '')
    .replace(/Google\s+/i, 'Google ')
    .trim();

  return {
    name: voice.name,
    lang: voice.lang,
    isIndian: isInd,
    isFemale: isFem,
    displayName: `${cleanName}${isInd ? ' 🇮🇳' : ''}`,
  };
}

/**
 * Play a gentle synth tone with exponential decay for sensory calmness
 */
export function playGentleTone(
  freq: number,
  durationMs: number = 250,
  volume: number = 0.7,
  type: OscillatorType = 'sine'
) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Smooth envelope: rapid gentle attack, exponential decay
    const now = ctx.currentTime;
    const durSec = durationMs / 1000;
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(volume * 0.35, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + durSec);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durSec);
  } catch (err) {
    console.warn('Audio play error:', err);
  }
}

/**
 * Soft pleasant chime when a stroke is finished
 */
export function playStrokeCompleteSound(volume: number = 0.8) {
  playGentleTone(587.33, 200, volume, 'sine'); // D5
  setTimeout(() => {
    playGentleTone(783.99, 250, volume * 0.9, 'sine'); // G5
  }, 100);
}

/**
 * Ascending chime when a letter is fully traced
 */
export function playLetterCompleteSound(volume: number = 0.85) {
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playGentleTone(freq, 280, volume, 'sine');
    }, idx * 110);
  });
}

/**
 * Gentle celebration music box melody
 */
export function playCelebrationMelody(volume: number = 0.8) {
  const melody = [
    { freq: 523.25, delay: 0 },    // C5
    { freq: 659.25, delay: 140 },  // E5
    { freq: 783.99, delay: 280 },  // G5
    { freq: 1046.5, delay: 440 },  // C6
    { freq: 880.0, delay: 650 },   // A5
    { freq: 1046.5, delay: 850 },  // C6
  ];

  melody.forEach((note) => {
    setTimeout(() => {
      playGentleTone(note.freq, 350, volume, 'triangle');
    }, note.delay);
  });
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  voiceURI?: string;
  expressive?: boolean;
  onEnd?: () => void;
}

/**
 * Speak text using Web SpeechSynthesis TTS with warm, expressive Indian English female tone
 */
export async function speakText(
  text: string,
  options: SpeakOptions = {}
): Promise<void> {
  return new Promise(async (resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (options.onEnd) options.onEnd();
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Expressive Indian English female voice tuning:
      // - pitch: 1.18 provides a cheerful, warm, engaging melodious tone
      // - rate: 0.90 provides clear, unhurried articulation ideal for children
      // - lang: 'en-IN' instructs system synthesizers to apply Indian English phonology
      const isExpressive = options.expressive !== false;
      const rate = options.rate ?? (isExpressive ? 0.90 : 0.85);
      const pitch = options.pitch ?? (isExpressive ? 1.18 : 1.05);
      const volume = Math.max(0, Math.min(1, options.volume ?? 1.0));

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance = utterance;

      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      utterance.lang = options.lang ?? 'en-IN';

      // Find best Indian female voice
      const voices = await getAvailableVoices();
      const bestVoice = selectBestIndianFemaleVoice(voices, options.voiceURI);

      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang || 'en-IN';
      }

      utterance.onend = () => {
        currentUtterance = null;
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('TTS utterance notice:', e);
        currentUtterance = null;
        if (options.onEnd) options.onEnd();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      if (options.onEnd) options.onEnd();
      resolve();
    }
  });
}

/**
 * Pronounces a letter expressively (either phonics sound e.g. "buh!" or letter name e.g. "B!")
 */
export async function speakLetter(
  letter: string,
  phonicsEnabled: boolean,
  volume: number = 1.0,
  options: { pitch?: number; rate?: number; voiceURI?: string } = {}
): Promise<void> {
  const upper = letter.toUpperCase();
  if (phonicsEnabled && LETTER_PHONICS[upper]) {
    // Speak phonetic sound expressively e.g. "buh!"
    const sound = LETTER_PHONICS[upper].sound;
    await speakText(`${sound}!`, {
      rate: options.rate ?? 0.84,
      pitch: options.pitch ?? 1.16,
      volume,
      voiceURI: options.voiceURI,
      expressive: true,
    });
  } else {
    // Speak letter name with bright cheerful inflection e.g. "B!"
    await speakText(`${upper}!`, {
      rate: options.rate ?? 0.88,
      pitch: options.pitch ?? 1.18,
      volume,
      voiceURI: options.voiceURI,
      expressive: true,
    });
  }
}

/**
 * Pronounces the whole word expressively, checking first for custom recorded/uploaded audio in IDB
 */
export async function speakWord(
  wordText: string,
  audioId?: string,
  volume: number = 1.0,
  options: {
    isCelebration?: boolean;
    pitch?: number;
    rate?: number;
    voiceURI?: string;
  } = {}
): Promise<void> {
  if (audioId) {
    try {
      const mediaItem = await getMediaItem(audioId);
      if (mediaItem && mediaItem.data) {
        const audio = new Audio(mediaItem.data);
        audio.volume = Math.max(0, Math.min(1, volume));
        await audio.play();
        return;
      }
    } catch (err) {
      console.warn('Failed to play custom audio, falling back to TTS:', err);
    }
  }

  // Expressive text with exclamation mark for joyful terminal pitch contour
  const formattedText = `${wordText.trim()}!`;
  const pitch = options.isCelebration
    ? (options.pitch ? options.pitch * 1.05 : 1.24) // Extra joyful on celebration
    : (options.pitch ?? 1.18);

  const rate = options.rate ?? 0.88;

  await speakText(formattedText, {
    rate,
    pitch,
    volume,
    voiceURI: options.voiceURI,
    expressive: true,
  });
}

/**
 * Expressive Indian English encouraging praise
 */
const INDIAN_ENGLISH_PRAISES = [
  'Super!',
  'Very good!',
  'Brilliant!',
  'Wonderful!',
  'Great job!',
  'Well done!',
  'Star work!',
];

export async function speakPraise(
  wordText: string,
  volume: number = 1.0,
  options: { pitch?: number; rate?: number; voiceURI?: string } = {}
): Promise<void> {
  const praise = INDIAN_ENGLISH_PRAISES[Math.floor(Math.random() * INDIAN_ENGLISH_PRAISES.length)];
  const fullText = `${praise} ${wordText.trim()}!`;

  await speakText(fullText, {
    rate: options.rate ?? 0.88,
    pitch: options.pitch ? options.pitch * 1.05 : 1.22,
    volume,
    voiceURI: options.voiceURI,
    expressive: true,
  });
}
