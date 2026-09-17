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

/**
 * Speak text using Web SpeechSynthesis TTS with friendly child-level tone
 */
export function speakText(
  text: string,
  options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onEnd?: () => void;
  } = {}
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (options.onEnd) options.onEnd();
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance = utterance;

      utterance.rate = options.rate ?? 0.85; // Slightly slower, calm cadence
      utterance.pitch = options.pitch ?? 1.1; // Gentle, warmer pitch
      utterance.volume = options.volume ?? 1.0;

      // Select warm English voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Samantha') ||
              v.name.includes('Karen') ||
              v.name.includes('Google') ||
              v.name.includes('Siri'))
        ) || voices.find((v) => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
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
 * Pronounces a letter (either phonics sound e.g. "buh" or letter name e.g. "B")
 */
export async function speakLetter(
  letter: string,
  phonicsEnabled: boolean,
  volume: number = 1.0
): Promise<void> {
  const upper = letter.toUpperCase();
  if (phonicsEnabled && LETTER_PHONICS[upper]) {
    // Speak phonetic sound e.g. "buh"
    await speakText(LETTER_PHONICS[upper].sound, { rate: 0.8, pitch: 1.15, volume });
  } else {
    // Speak letter name e.g. "B"
    await speakText(upper, { rate: 0.85, pitch: 1.1, volume });
  }
}

/**
 * Pronounces the whole word, checking first for custom recorded/uploaded audio in IDB
 */
export async function speakWord(
  wordText: string,
  audioId?: string,
  volume: number = 1.0
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

  // Fallback to TTS
  await speakText(wordText, { rate: 0.82, pitch: 1.05, volume });
}
