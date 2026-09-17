export interface Word {
  id: string;
  text: string; // Uppercase word, e.g. "BALL"
  length: number;
  categoryId: string;
  builtInImage?: string; // Key to built-in vector illustration, e.g. "ball"
  imageId?: string; // IDB key for uploaded custom image blob
  audioId?: string; // IDB key for uploaded/recorded custom audio blob
  enabled: boolean;
  favorite: boolean;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export type TracingDifficulty = 'easy' | 'medium' | 'advanced';
export type ParentGateType = 'hold' | 'math' | 'none';
export type CelebrationStyle = 'stars' | 'balloons' | 'sparkles' | 'confetti';
export type AppTheme = 'forest' | 'sunset' | 'cosmic' | 'lavender' | 'classic';

export interface Settings {
  theme: AppTheme;
  childMode: boolean;
  enabledWordLengths: number[]; // e.g. [3, 4]
  tracingDifficulty: TracingDifficulty;
  showArrows: boolean;
  showStartPoint: boolean;
  phonicsEnabled: boolean;
  wordAudioEnabled: boolean;
  celebrationEnabled: boolean;
  celebrationStyle: CelebrationStyle;
  randomWords: boolean;
  autoNext: boolean;
  autoNextDelay: number; // in milliseconds
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  animationLevel: 'full' | 'gentle' | 'minimal';
  parentGateType: ParentGateType;
  soundVolume: number; // 0.0 to 1.0
  selectedCategory: string; // 'all' or category ID
}

export interface WordProgress {
  wordId: string;
  timesPracticed: number;
  timesCompleted: number;
  lastPracticed: number;
  completedCount: number;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  wordsCompleted: number;
  lettersTraced: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface StrokeSegment {
  id: number;
  pathD: string;
  points: Point[]; // Pre-sampled points along stroke for proximity collision & progress tracking
  startPoint: Point;
  endPoint: Point;
  arrowPoint?: Point;
  arrowAngle?: number; // In degrees
}

export interface LetterDefinition {
  letter: string;
  strokes: StrokeSegment[];
  viewBox: string; // Typically "0 0 200 240"
}

export type AppScreen = 'home' | 'tracing' | 'word-mode' | 'free-practice' | 'progress' | 'favorites' | 'settings';

export type PracticeMode = 'guided' | 'word' | 'free';
