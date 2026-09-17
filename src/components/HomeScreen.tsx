import React, { useState } from 'react';
import { Settings, Word } from '../types';
import { Play, Sparkles, Settings as SettingsIcon, BookOpen, Star, Award, Layers } from 'lucide-react';
import { ParentGate } from './ParentGate';

interface HomeScreenProps {
  onStart: () => void;
  onSelectMode: (mode: 'guided' | 'word' | 'free') => void;
  onOpenSettings: () => void;
  onOpenProgress: () => void;
  onOpenFavorites: () => void;
  settings: Settings;
  words: Word[];
  isOnline: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStart,
  onSelectMode,
  onOpenSettings,
  onOpenProgress,
  onOpenFavorites,
  settings,
  words,
  isOnline,
}) => {
  const [showParentGate, setShowParentGate] = useState(false);
  const [showPracticeMenu, setShowPracticeMenu] = useState(false);

  const favoriteCount = words.filter((w) => w.favorite).length;

  const handleSettingsClick = () => {
    if (settings.parentGateType === 'none') {
      onOpenSettings();
    } else {
      setShowParentGate(true);
    }
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 overflow-hidden select-none">
      {/* Parent Gate Modal */}
      <ParentGate
        isOpen={showParentGate}
        gateType={settings.parentGateType}
        onSuccess={() => {
          setShowParentGate(false);
          onOpenSettings();
        }}
        onCancel={() => setShowParentGate(false)}
      />

      {/* TOP BAR */}
      <header className="flex-none flex items-center justify-between px-6 sm:px-10 py-4 pt-[calc(1rem+var(--safe-top))] z-20">
        {/* Offline indicator (subtle pill) */}
        {!isOnline && (
          <div className="px-3.5 py-1.5 rounded-full bg-amber-100/90 text-amber-800 text-sm font-semibold border border-amber-200 flex items-center gap-1.5 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Offline Ready</span>
          </div>
        )}
        {isOnline && <div />}

        {/* Top Right: Progress & Parent Settings */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProgress}
            aria-label="View Progress"
            className="h-13 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur shadow-soft border border-sky-100 flex items-center gap-2 text-slate-700 font-bold hover:bg-white active:scale-95 transition"
          >
            <Award className="w-6 h-6 text-amber-500" />
            <span className="hidden sm:inline">Progress</span>
          </button>

          {/* PARENT SETTINGS BUTTON: Visually separate with lock hint */}
          <button
            onClick={handleSettingsClick}
            aria-label="Parent Settings"
            className="h-13 px-4 sm:px-5 py-2 rounded-2xl bg-slate-800 text-white font-semibold shadow-md flex items-center gap-2.5 active:scale-95 transition hover:bg-slate-700"
          >
            <SettingsIcon className="w-5 h-5 text-slate-300" />
            <span className="text-sm sm:text-base font-bold">Parents</span>
          </button>
        </div>
      </header>

      {/* MAIN HERO CONTENT */}
      <main className="flex-1 flex flex-col [@media(max-height:550px)]:flex-row items-center justify-center px-4 py-2 gap-4 sm:gap-6 [@media(max-height:550px)]:gap-8 text-center max-w-4xl mx-auto z-10 overflow-y-auto">
        {/* Playful App Mascot Icon & Title Column */}
        <div className="flex flex-col items-center justify-center [@media(max-height:550px)]:max-w-xs">
          <div className="relative mb-2 sm:mb-4 [@media(max-height:550px)]:mb-2 animate-float-gentle">
            <div className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 [@media(max-height:550px)]:w-20 [@media(max-height:550px)]:h-20 rounded-3xl bg-gradient-to-tr from-sky-400 to-sky-600 shadow-xl flex items-center justify-center p-3 border-4 border-white">
              <img src="/icon.svg" alt="Trace Words" className="w-full h-full object-contain filter drop-shadow-md" />
            </div>
            <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 rounded-full p-2 shadow-lg animate-bounce">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* Large App Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl [@media(max-height:550px)]:text-3xl font-black tracking-tight text-slate-800 mb-1">
            TRACE <span className="text-sky-600">A</span> WORD
          </h1>
          <p className="text-base sm:text-xl font-bold text-slate-500 mb-2 sm:mb-6 [@media(max-height:550px)]:hidden">
            Calm & gentle letter tracing for early words
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="w-full max-w-sm flex flex-col gap-3 sm:gap-4 [@media(max-height:550px)]:gap-2.5">
          {/* 1. START BUTTON (Massive, primary, highest visual hierarchy) */}
          <button
            onClick={onStart}
            aria-label="Start Tracing"
            className="w-full h-16 sm:h-20 md:h-22 [@media(max-height:550px)]:h-14 rounded-3xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-black text-2xl sm:text-3xl md:text-4xl [@media(max-height:550px)]:text-2xl shadow-xl flex items-center justify-center gap-3 sm:gap-4 active:scale-95 transition transform hover:scale-[1.02]"
          >
            <Play className="w-7 h-7 sm:w-10 sm:h-10 fill-current" />
            <span>START</span>
          </button>

          {/* 2. PRACTICE BUTTON */}
          <button
            onClick={() => setShowPracticeMenu(true)}
            aria-label="Practice Modes"
            className="w-full h-14 sm:h-16 md:h-18 [@media(max-height:550px)]:h-12 rounded-3xl bg-white hover:bg-amber-50/50 text-slate-800 font-extrabold text-xl sm:text-2xl [@media(max-height:550px)]:text-lg shadow-soft border-2 border-amber-200 flex items-center justify-center gap-3 active:scale-95 transition"
          >
            <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
            <span>PRACTICE</span>
          </button>

          {/* 3. MY WORDS / FAVORITES QUICK BUTTON */}
          {favoriteCount > 0 && (
            <button
              onClick={onOpenFavorites}
              className="w-full h-12 sm:h-14 [@media(max-height:550px)]:h-10 rounded-2xl bg-white/80 hover:bg-white text-purple-700 font-bold text-base sm:text-lg [@media(max-height:550px)]:text-sm shadow-sm border border-purple-100 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <span>⭐ My Words ({favoriteCount})</span>
            </button>
          )}
        </div>
      </main>

      {/* PRACTICE MODES MODAL */}
      {showPracticeMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Choose Practice Mode</h2>

            <div className="flex flex-col gap-3">
              {/* Guided Mode */}
              <button
                onClick={() => {
                  setShowPracticeMenu(false);
                  onSelectMode('guided');
                }}
                className="w-full p-4 rounded-2xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 text-left flex items-center gap-4 transition active:scale-95"
              >
                <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-sky-900">Guided Mode</h3>
                  <p className="text-sm text-sky-700 font-medium">One letter at a time with big guide</p>
                </div>
              </button>

              {/* Word Mode */}
              <button
                onClick={() => {
                  setShowPracticeMenu(false);
                  onSelectMode('word');
                }}
                className="w-full p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-left flex items-center gap-4 transition active:scale-95"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
                  W
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-emerald-900">Word Mode</h3>
                  <p className="text-sm text-emerald-700 font-medium">See the whole word and trace letters</p>
                </div>
              </button>

              {/* Free Practice */}
              <button
                onClick={() => {
                  setShowPracticeMenu(false);
                  onSelectMode('free');
                }}
                className="w-full p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 text-left flex items-center gap-4 transition active:scale-95"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
                  A-Z
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-purple-900">Free Practice</h3>
                  <p className="text-sm text-purple-700 font-medium">Pick any letter to practice repeatedly</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowPracticeMenu(false)}
              className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="flex-none text-center py-3 pb-[calc(0.75rem+var(--safe-bottom))] text-xs font-semibold text-slate-400">
        Trace Words • Offline Ready • Sensory Friendly
      </footer>
    </div>
  );
};
