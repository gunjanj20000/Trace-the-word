import { AppTheme } from '../types';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  subtitle: string;
  iconEmoji: string;
  swatchColors: [string, string, string]; // Preview colors
  bgMain: string; // Tailwind gradient classes
  isDark?: boolean;
  
  // Typography
  titlePrimary: string;
  titleAccent: string;
  subtitleColor: string;
  
  // Card & Header
  headerBg: string;
  cardBg: string;
  cardBorder: string;
  
  // Buttons
  btnStart: string;
  btnPractice: string;
  btnPracticeIcon: string;
  btnMyWords: string;
  
  // Tracing Canvas Elements
  tracerUserBrush: {
    start: string;
    end: string;
  };
  tracerTrackActive: string;
  tracerTrackInactive: string;
  tracerGuideBg: string;
  tracerCompletedStroke: {
    start: string;
    end: string;
  };
  tracerStartPoint: {
    ring: string;
    outerStroke: string;
    start: string;
    mid: string;
    end: string;
  };

  // Letter pills at top
  pillDone: string;
  pillActive: string;
  pillInactive: string;

  // Mascot & Badges
  mascotGradient: string;
  mascotBadge: string;
  navHomeText: string;
  navHomeBg: string;
  footerText: string;
}

export const THEMES: Record<AppTheme, ThemeConfig> = {
  forest: {
    id: 'forest',
    name: 'Forest Meadow',
    subtitle: 'Calming sage, matcha greens & warm honey amber',
    iconEmoji: '🌿',
    swatchColors: ['#059669', '#34d399', '#f59e0b'],
    bgMain: 'bg-gradient-to-br from-emerald-50 via-teal-50/50 to-amber-50/40',
    titlePrimary: 'text-emerald-950',
    titleAccent: 'text-emerald-600',
    subtitleColor: 'text-emerald-800/70',
    headerBg: 'bg-white/85 backdrop-blur border-emerald-100/80',
    cardBg: 'bg-white/95',
    cardBorder: 'border-emerald-100',
    btnStart: 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-xl shadow-emerald-700/20',
    btnPractice: 'bg-white hover:bg-amber-50/50 text-emerald-950 shadow-soft border-2 border-amber-200',
    btnPracticeIcon: 'text-amber-500 fill-amber-400',
    btnMyWords: 'bg-white/90 hover:bg-white text-emerald-800 shadow-sm border border-emerald-200',
    tracerUserBrush: {
      start: '#34d399',
      end: '#059669',
    },
    tracerTrackActive: '#10b981',
    tracerTrackInactive: '#94a3b8',
    tracerGuideBg: '#e2e8f0',
    tracerCompletedStroke: {
      start: '#10b981',
      end: '#047857',
    },
    tracerStartPoint: {
      ring: '#10b981',
      outerStroke: '#f59e0b',
      start: '#fef3c7',
      mid: '#f59e0b',
      end: '#d97706',
    },
    pillDone: 'bg-emerald-600 text-white shadow-md',
    pillActive: 'bg-emerald-500 text-white shadow-lg ring-4 ring-emerald-200 scale-105 animate-pulse-subtle',
    pillInactive: 'bg-emerald-50/80 text-emerald-700/40',
    mascotGradient: 'from-emerald-500 to-teal-700',
    mascotBadge: 'bg-amber-400 text-amber-950',
    navHomeText: 'text-emerald-700',
    navHomeBg: 'hover:bg-emerald-50',
    footerText: 'text-emerald-700/60',
  },

  sunset: {
    id: 'sunset',
    name: 'Warm Sunset',
    subtitle: 'Cozy peach, golden apricot & warm terracotta',
    iconEmoji: '🌅',
    swatchColors: ['#ea580c', '#fb923c', '#fbbf24'],
    bgMain: 'bg-gradient-to-br from-orange-50 via-rose-50/50 to-amber-50/60',
    titlePrimary: 'text-stone-900',
    titleAccent: 'text-orange-600',
    subtitleColor: 'text-orange-800/70',
    headerBg: 'bg-white/85 backdrop-blur border-orange-100/80',
    cardBg: 'bg-white/95',
    cardBorder: 'border-orange-100',
    btnStart: 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-xl shadow-orange-600/25',
    btnPractice: 'bg-white hover:bg-orange-50/50 text-stone-900 shadow-soft border-2 border-orange-200',
    btnPracticeIcon: 'text-amber-500 fill-amber-400',
    btnMyWords: 'bg-white/90 hover:bg-white text-orange-800 shadow-sm border border-orange-200',
    tracerUserBrush: {
      start: '#fb923c',
      end: '#ea580c',
    },
    tracerTrackActive: '#f97316',
    tracerTrackInactive: '#94a3b8',
    tracerGuideBg: '#e2e8f0',
    tracerCompletedStroke: {
      start: '#f97316',
      end: '#c2410c',
    },
    tracerStartPoint: {
      ring: '#f97316',
      outerStroke: '#f59e0b',
      start: '#fef08a',
      mid: '#f59e0b',
      end: '#d97706',
    },
    pillDone: 'bg-orange-500 text-white shadow-md',
    pillActive: 'bg-amber-500 text-white shadow-lg ring-4 ring-orange-200 scale-105 animate-pulse-subtle',
    pillInactive: 'bg-orange-50/80 text-orange-700/40',
    mascotGradient: 'from-orange-400 to-amber-600',
    mascotBadge: 'bg-amber-300 text-amber-950',
    navHomeText: 'text-orange-700',
    navHomeBg: 'hover:bg-orange-50',
    footerText: 'text-orange-700/60',
  },

  cosmic: {
    id: 'cosmic',
    name: 'Cosmic Starlight',
    subtitle: 'Calm midnight indigo & luminous pastel starlight',
    iconEmoji: '✨',
    isDark: true,
    swatchColors: ['#1e1b4b', '#38bdf8', '#c084fc'],
    bgMain: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900',
    titlePrimary: 'text-white',
    titleAccent: 'text-cyan-400',
    subtitleColor: 'text-indigo-200/80',
    headerBg: 'bg-slate-900/80 backdrop-blur border-indigo-900/60',
    cardBg: 'bg-slate-800/90 text-white',
    cardBorder: 'border-indigo-800/70',
    btnStart: 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-xl shadow-cyan-500/20',
    btnPractice: 'bg-slate-800/90 hover:bg-slate-800 text-cyan-200 shadow-soft border-2 border-indigo-600',
    btnPracticeIcon: 'text-cyan-400 fill-cyan-300',
    btnMyWords: 'bg-slate-800/80 hover:bg-slate-800 text-indigo-200 shadow-sm border border-indigo-700',
    tracerUserBrush: {
      start: '#38bdf8',
      end: '#06b6d4',
    },
    tracerTrackActive: '#38bdf8',
    tracerTrackInactive: '#475569',
    tracerGuideBg: '#334155',
    tracerCompletedStroke: {
      start: '#38bdf8',
      end: '#0284c7',
    },
    tracerStartPoint: {
      ring: '#38bdf8',
      outerStroke: '#fde047',
      start: '#fef08a',
      mid: '#38bdf8',
      end: '#0284c7',
    },
    pillDone: 'bg-cyan-500 text-slate-950 shadow-md font-black',
    pillActive: 'bg-indigo-500 text-white shadow-lg ring-4 ring-cyan-400/40 scale-105 animate-pulse-subtle',
    pillInactive: 'bg-slate-800 text-slate-400',
    mascotGradient: 'from-indigo-600 to-cyan-500',
    mascotBadge: 'bg-cyan-400 text-slate-950',
    navHomeText: 'text-cyan-400',
    navHomeBg: 'hover:bg-slate-800',
    footerText: 'text-indigo-300/50',
  },

  lavender: {
    id: 'lavender',
    name: 'Lavender Dream',
    subtitle: 'Dreamy soft lilac, powder periwinkle & rose',
    iconEmoji: '🌸',
    swatchColors: ['#7c3aed', '#c084fc', '#f472b6'],
    bgMain: 'bg-gradient-to-br from-purple-50 via-violet-50/50 to-pink-50/40',
    titlePrimary: 'text-purple-950',
    titleAccent: 'text-purple-600',
    subtitleColor: 'text-purple-800/70',
    headerBg: 'bg-white/85 backdrop-blur border-purple-100/80',
    cardBg: 'bg-white/95',
    cardBorder: 'border-purple-100',
    btnStart: 'bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white shadow-xl shadow-purple-600/20',
    btnPractice: 'bg-white hover:bg-purple-50 text-purple-950 shadow-soft border-2 border-purple-200',
    btnPracticeIcon: 'text-amber-500 fill-amber-400',
    btnMyWords: 'bg-white/90 hover:bg-white text-purple-800 shadow-sm border border-purple-200',
    tracerUserBrush: {
      start: '#c084fc',
      end: '#7c3aed',
    },
    tracerTrackActive: '#a855f7',
    tracerTrackInactive: '#94a3b8',
    tracerGuideBg: '#e2e8f0',
    tracerCompletedStroke: {
      start: '#a855f7',
      end: '#6d28d9',
    },
    tracerStartPoint: {
      ring: '#a855f7',
      outerStroke: '#fbbf24',
      start: '#fef08a',
      mid: '#a855f7',
      end: '#7c3aed',
    },
    pillDone: 'bg-purple-600 text-white shadow-md',
    pillActive: 'bg-violet-500 text-white shadow-lg ring-4 ring-purple-200 scale-105 animate-pulse-subtle',
    pillInactive: 'bg-purple-50/80 text-purple-700/40',
    mascotGradient: 'from-purple-500 to-violet-700',
    mascotBadge: 'bg-amber-300 text-purple-950',
    navHomeText: 'text-purple-700',
    navHomeBg: 'hover:bg-purple-50',
    footerText: 'text-purple-700/60',
  },

  classic: {
    id: 'classic',
    name: 'Classic Sky Blue',
    subtitle: 'Bright sunny sky blue, amber & friendly cloud white',
    iconEmoji: '🎈',
    swatchColors: ['#0284c7', '#38bdf8', '#fbbf24'],
    bgMain: 'bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100',
    titlePrimary: 'text-slate-800',
    titleAccent: 'text-sky-600',
    subtitleColor: 'text-slate-500',
    headerBg: 'bg-white/85 backdrop-blur border-sky-100',
    cardBg: 'bg-white',
    cardBorder: 'border-sky-100',
    btnStart: 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-xl shadow-sky-500/20',
    btnPractice: 'bg-white hover:bg-amber-50/50 text-slate-800 shadow-soft border-2 border-amber-200',
    btnPracticeIcon: 'text-amber-500 fill-amber-400',
    btnMyWords: 'bg-white/90 hover:bg-white text-purple-700 shadow-sm border border-purple-100',
    tracerUserBrush: {
      start: '#38bdf8',
      end: '#0284c7',
    },
    tracerTrackActive: '#38bdf8',
    tracerTrackInactive: '#94a3b8',
    tracerGuideBg: '#e2e8f0',
    tracerCompletedStroke: {
      start: '#4ade80',
      end: '#16a34a',
    },
    tracerStartPoint: {
      ring: '#38bdf8',
      outerStroke: '#f59e0b',
      start: '#fef08a',
      mid: '#f59e0b',
      end: '#d97706',
    },
    pillDone: 'bg-emerald-500 text-white shadow-md',
    pillActive: 'bg-sky-500 text-white shadow-lg ring-4 ring-sky-200 scale-105 animate-pulse-subtle',
    pillInactive: 'bg-slate-100 text-slate-400',
    mascotGradient: 'from-sky-400 to-sky-600',
    mascotBadge: 'bg-amber-400 text-amber-950',
    navHomeText: 'text-sky-600',
    navHomeBg: 'hover:bg-sky-50',
    footerText: 'text-slate-400',
  },
};

export function getThemeConfig(theme?: AppTheme): ThemeConfig {
  if (theme && THEMES[theme]) {
    return THEMES[theme];
  }
  return THEMES.forest;
}
