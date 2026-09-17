import React, { useState } from 'react';
import { Settings } from '../types';
import { LetterTracer } from './LetterTracer';
import { RAW_LETTERS } from '../data/letterPaths';
import { Home, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { speakLetter, playLetterCompleteSound } from '../services/audio';
import { getThemeConfig } from '../theme/themeConfig';

interface FreePracticeProps {
  settings: Settings;
  onHome: () => void;
}

const ALPHABET = Object.keys(RAW_LETTERS);

export const FreePracticeScreen: React.FC<FreePracticeProps> = ({
  settings,
  onHome,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [tracerKey, setTracerKey] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);

  const themeConfig = getThemeConfig(settings.theme);

  const handleLetterDone = () => {
    setCompletedCount((p) => p + 1);
  };

  const handleReset = () => {
    setTracerKey((p) => p + 1);
  };

  const handleHearLetter = () => {
    speakLetter(selectedLetter, settings.phonicsEnabled, settings.soundVolume, {
      pitch: settings.voicePitch,
      rate: settings.voiceRate,
      voiceURI: settings.selectedVoiceURI,
    });
  };

  return (
    <div className={`relative flex flex-col h-full w-full ${themeConfig.bgMain} overflow-hidden select-none`}>
      {/* Top Header */}
      <header className="flex-none flex items-center justify-between px-4 sm:px-8 py-3 pt-[calc(0.75rem+var(--safe-top))] z-20">
        <button
          onClick={onHome}
          aria-label="Back to Home"
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-3xl ${themeConfig.cardBg} shadow-soft border-2 ${themeConfig.cardBorder} flex items-center justify-center text-slate-700 active:scale-95 transition hover:opacity-90`}
        >
          <Home className={`w-7 h-7 sm:w-8 sm:h-8 ${themeConfig.titleAccent}`} />
        </button>

        <div className={`flex items-center gap-2 ${themeConfig.headerBg} px-5 py-2.5 rounded-3xl shadow-soft border ${themeConfig.cardBorder}`}>
          <Sparkles className="w-6 h-6 text-amber-500" />
          <span className={`text-xl sm:text-2xl font-black ${themeConfig.titleAccent}`}>Free Practice</span>
          {completedCount > 0 && (
            <span className={`ml-2 px-2.5 py-0.5 ${themeConfig.pillDone} rounded-full text-sm font-bold`}>
              ★ {completedCount}
            </span>
          )}
        </div>

        <button
          onClick={handleHearLetter}
          aria-label="Hear Letter"
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-3xl ${themeConfig.cardBg} shadow-soft border-2 ${themeConfig.cardBorder} flex items-center justify-center active:scale-95 transition ${themeConfig.titleAccent} hover:opacity-90`}
        >
          <Volume2 className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>
      </header>

      {/* A-Z Horizontal Letter Ribbon */}
      <div className="flex-none w-full px-4 py-2 overflow-x-auto no-scrollbar z-10">
        <div className="flex items-center gap-2 sm:gap-3 justify-start sm:justify-center min-w-max mx-auto py-1">
          {ALPHABET.map((char) => {
            const isCurrent = char === selectedLetter;
            return (
              <button
                key={`alp-${char}`}
                onClick={() => {
                  setSelectedLetter(char);
                  setTracerKey((p) => p + 1);
                }}
                className={`w-11 h-12 sm:w-12 sm:h-14 rounded-2xl font-extrabold text-xl sm:text-2xl transition-all ${
                  isCurrent
                    ? `${themeConfig.pillActive} font-black`
                    : `${themeConfig.cardBg} hover:opacity-90 text-slate-700 shadow-sm border ${themeConfig.cardBorder}`
                }`}
              >
                {char}
              </button>
            );
          })}
        </div>
      </div>

      {/* Central Large Tracing Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-2 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center max-h-[68vh] max-w-2xl">
          <LetterTracer
            key={`free-tracer-${selectedLetter}-${tracerKey}`}
            letter={selectedLetter}
            theme={settings.theme}
            difficulty={settings.tracingDifficulty}
            showArrows={settings.showArrows}
            showStartPoint={settings.showStartPoint}
            soundVolume={settings.soundVolume}
            phonicsEnabled={settings.phonicsEnabled}
            voicePitch={settings.voicePitch}
            voiceRate={settings.voiceRate}
            voiceURI={settings.selectedVoiceURI}
            onComplete={handleLetterDone}
            className="w-full h-full"
          />
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="flex-none flex items-center justify-between px-6 sm:px-12 py-4 pb-[calc(1rem+var(--safe-bottom))] z-20">
        <button
          onClick={handleReset}
          className={`h-16 px-6 sm:px-8 rounded-3xl ${themeConfig.cardBg} shadow-soft border-2 ${themeConfig.cardBorder} flex items-center gap-2 text-slate-700 font-bold text-lg active:scale-95 transition hover:opacity-90`}
        >
          <RotateCcw className={`w-7 h-7 ${themeConfig.titleAccent}`} />
          <span>Clear</span>
        </button>

        <button
          onClick={handleHearLetter}
          className={`h-16 px-8 sm:px-10 rounded-3xl ${themeConfig.btnStart} font-extrabold text-xl shadow-lg flex items-center gap-2 active:scale-95 transition`}
        >
          <Volume2 className="w-7 h-7" />
          <span>Say "{selectedLetter}"</span>
        </button>
      </footer>
    </div>
  );
};
