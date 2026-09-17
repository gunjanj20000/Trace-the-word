import React, { useState, useEffect, useRef } from 'react';
import { Word, Settings } from '../types';
import { LetterTracer } from './LetterTracer';
import { WordImage } from './WordImage';
import { Celebration } from './Celebration';
import { speakWord, playCelebrationMelody, speakLetter, getLetterForWordPhrase } from '../services/audio';
import { recordWordCompletion, recordLetterTraced, toggleWordFavorite } from '../services/db';
import { getThemeConfig } from '../theme/themeConfig';
import { Home, ArrowRight, RotateCcw, Volume2, Star, Sparkles } from 'lucide-react';

interface TracingScreenProps {
  words: Word[];
  settings: Settings;
  onHome: () => void;
  mode: 'guided' | 'word';
  initialWordIndex?: number;
}

export const TracingScreen: React.FC<TracingScreenProps> = ({
  words,
  settings,
  onHome,
  mode = 'guided',
  initialWordIndex = 0,
}) => {
  const themeConfig = getThemeConfig(settings.theme);
  const [currentWordIdx, setCurrentWordIdx] = useState<number>(initialWordIndex);
  const [currentLetterIdx, setCurrentLetterIdx] = useState<number>(0);
  const [isWordCompleted, setIsWordCompleted] = useState<boolean>(false);
  const [activeWordList, setActiveWordList] = useState<Word[]>(words);
  const [tracerKey, setTracerKey] = useState<number>(0);

  const autoNextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAdvancingLetterRef = useRef<boolean>(false);

  // Filter words by settings (lengths, category, enabled status)
  const enabledLengthsStr = (settings.enabledWordLengths || []).join(',');
  useEffect(() => {
    let filtered = words.filter((w) => w.enabled);

    // Category filter
    if (settings.selectedCategory && settings.selectedCategory !== 'all') {
      if (settings.selectedCategory === 'my-words') {
        filtered = filtered.filter((w) => w.favorite);
      } else {
        filtered = filtered.filter((w) => w.categoryId === settings.selectedCategory);
      }
    }

    // Length filter
    if (settings.enabledWordLengths && settings.enabledWordLengths.length > 0) {
      filtered = filtered.filter((w) => settings.enabledWordLengths.includes(w.length));
    }

    // Fallback if filter is empty
    if (filtered.length === 0) {
      filtered = words.filter((w) => w.enabled);
    }

    // Randomize if enabled
    if (settings.randomWords) {
      filtered = [...filtered].sort(() => Math.random() - 0.5);
    }

    setActiveWordList(filtered);
    setCurrentWordIdx((prev) => {
      if (initialWordIndex > 0 && initialWordIndex < filtered.length) {
        return initialWordIndex;
      }
      return Math.min(prev, Math.max(0, filtered.length - 1));
    });
    setCurrentLetterIdx(0);
    setIsWordCompleted(false);
  }, [words, settings.selectedCategory, enabledLengthsStr, settings.randomWords]);

  const currentWord: Word | undefined = activeWordList[currentWordIdx] || activeWordList[0];
  const wordText = currentWord?.text || 'CAT';
  const letters = wordText.split('');
  const currentLetter = letters[currentLetterIdx] || letters[0];

  // Clean up autoNext timer on unmount
  useEffect(() => {
    return () => {
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
    };
  }, []);

  // Handle letter completed with debounce guard
  const handleLetterComplete = () => {
    if (isAdvancingLetterRef.current) return;
    isAdvancingLetterRef.current = true;
    setTimeout(() => {
      isAdvancingLetterRef.current = false;
    }, 450);

    recordLetterTraced();

    if (currentLetterIdx + 1 < letters.length) {
      // Advance to next letter in word
      setCurrentLetterIdx((prev) => prev + 1);
      setTracerKey((prev) => prev + 1);
    } else {
      // Entire word is completed!
      handleWordComplete();
    }
  };

  // Handle word completed
  const handleWordComplete = () => {
    setIsWordCompleted(true);
    if (currentWord) {
      recordWordCompletion(currentWord.id);
    }

    // Gentle celebration sound
    if (settings.celebrationEnabled) {
      playCelebrationMelody(settings.soundVolume);
    }

    // Speak word audio after brief pause with joyful expressive tone
    if (settings.wordAudioEnabled) {
      setTimeout(() => {
        speakWord(wordText, currentWord?.audioId, settings.soundVolume, {
          isCelebration: true,
          pitch: settings.voicePitch,
          rate: settings.voiceRate,
          voiceURI: settings.selectedVoiceURI,
        });
      }, 600);
    }

    // Auto next if enabled in settings
    if (settings.autoNext) {
      autoNextTimerRef.current = setTimeout(() => {
        handleNextWord();
      }, settings.autoNextDelay || 3500);
    }
  };

  // Move to next word
  const handleNextWord = () => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }

    setIsWordCompleted(false);
    setCurrentLetterIdx(0);
    setTracerKey((prev) => prev + 1);

    setCurrentWordIdx((prev) => (prev + 1) % activeWordList.length);
  };

  // Reset current letter
  const handleResetLetter = () => {
    setTracerKey((prev) => prev + 1);
  };

  // Replay word / letter audio
  const handleAudioPlay = () => {
    if (isWordCompleted) {
      speakWord(wordText, currentWord?.audioId, settings.soundVolume, {
        isCelebration: true,
        pitch: settings.voicePitch,
        rate: settings.voiceRate,
        voiceURI: settings.selectedVoiceURI,
      });
    } else {
      speakLetter(currentLetter, settings.phonicsEnabled, settings.soundVolume, {
        pitch: settings.voicePitch,
        rate: settings.voiceRate,
        voiceURI: settings.selectedVoiceURI,
      });
    }
  };

  // Toggle favorite on current word
  const handleToggleFavorite = async () => {
    if (!currentWord) return;
    const newFav = await toggleWordFavorite(currentWord.id);
    setActiveWordList((prev) =>
      prev.map((w) => (w.id === currentWord.id ? { ...w, favorite: newFav } : w))
    );
  };

  if (!currentWord) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
        <p className="text-2xl font-bold text-slate-700 mb-4">No words found for current settings.</p>
        <button
          onClick={onHome}
          className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-3xl font-bold text-xl shadow-lg"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col h-full w-full ${themeConfig.bgMain} overflow-hidden select-none transition-colors duration-500`}>
      {/* Gentle Celebration Overlay */}
      {isWordCompleted && (
        <Celebration
          enabled={settings.celebrationEnabled}
          style={settings.celebrationStyle}
          reducedMotion={settings.reducedMotion}
        />
      )}

      {/* TOP BAR: Ultra uncluttered progress */}
      <header className="flex-none flex items-center justify-between px-4 sm:px-8 py-3 pt-[calc(0.75rem+var(--safe-top))] z-20">
        {/* Home Button (Big, touch friendly) */}
        <button
          onClick={onHome}
          aria-label="Back to Home"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white shadow-soft border-2 border-slate-200/70 flex items-center justify-center text-slate-700 active:scale-95 transition-transform hover:bg-slate-50"
        >
          <Home className={`w-7 h-7 sm:w-8 sm:h-8 ${themeConfig.titleAccent}`} />
        </button>

        {/* Word Letter Indicators with clear B → A → L → L progression */}
        <div className="flex items-center gap-1 sm:gap-2.5 bg-white/90 backdrop-blur px-3 sm:px-5 py-2 rounded-3xl shadow-soft border border-slate-200/70">
          {letters.map((char, idx) => {
            const isDone = isWordCompleted || idx < currentLetterIdx;
            const isCurrent = !isWordCompleted && idx === currentLetterIdx;

            return (
              <React.Fragment key={`word-let-frag-${idx}`}>
                {idx > 0 && (
                  <span className={`text-xs sm:text-sm font-black transition-colors ${isDone ? 'text-emerald-500' : isCurrent ? 'text-emerald-600 animate-pulse' : 'text-slate-300'}`}>
                    →
                  </span>
                )}
                <button
                  key={`word-let-${idx}`}
                  disabled={isWordCompleted || mode !== 'word'}
                  onClick={() => {
                    if (mode === 'word') {
                      setCurrentLetterIdx(idx);
                      setTracerKey((prev) => prev + 1);
                    }
                  }}
                  className={`w-10 h-11 sm:w-13 sm:h-15 rounded-2xl flex items-center justify-center font-extrabold text-xl sm:text-3xl transition-all duration-300 ${
                    isDone
                      ? themeConfig.pillDone
                      : isCurrent
                      ? themeConfig.pillActive
                      : themeConfig.pillInactive
                  }`}
                >
                  {char}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Top Right: Favorite & Audio Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            aria-label="Toggle Favorite"
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white shadow-soft border-2 border-slate-200/70 flex items-center justify-center active:scale-95 transition-transform ${
              currentWord.favorite ? 'text-amber-400' : 'text-slate-300 hover:text-slate-400'
            }`}
          >
            <Star className={`w-7 h-7 sm:w-8 sm:h-8 ${currentWord.favorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-2 sm:py-4 overflow-hidden relative">
        {isWordCompleted ? (
          /* WORD COMPLETION CELEBRATION VIEW */
          <div className="flex flex-col items-center justify-center max-w-lg w-full text-center animate-fade-in z-20">
            {/* Word Heading */}
            <h1 className={`text-6xl sm:text-7xl md:text-8xl font-black ${themeConfig.titleAccent} tracking-wider mb-3 sm:mb-6 animate-bounce`}>
              {wordText}
            </h1>

            {/* Word Illustration Image */}
            <div className="my-2 sm:my-4 transition-transform hover:scale-105 duration-300">
              <WordImage word={currentWord} className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80" />
            </div>

            {/* Audio Hear Again */}
            <button
              onClick={handleAudioPlay}
              className={`mt-2 mb-4 px-6 py-3 rounded-full ${themeConfig.btnMyWords} font-bold text-lg flex items-center gap-2 transition active:scale-95`}
            >
              <Volume2 className="w-6 h-6" />
              <span>Hear "{getLetterForWordPhrase(wordText)}"</span>
            </button>
          </div>
        ) : (
          /* ACTIVE LETTER TRACING VIEW */
          <div className="w-full h-full flex flex-col items-center justify-center max-w-2xl">
            {/* Word Context Banner: Shows current word & illustration thumbnail so child always knows context */}
            <div className="flex items-center gap-3 mb-2 bg-white/95 px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl shadow-sm border border-slate-200/70 animate-fade-in">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200/60 flex-none">
                <WordImage word={currentWord} className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase">Word:</span>
                <span className={`text-xl sm:text-2xl font-black ${themeConfig.titleAccent} tracking-wider`}>{wordText}</span>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100/90 px-2 py-0.5 rounded-full ml-1">
                Letter {currentLetterIdx + 1} of {letters.length}
              </span>
            </div>

            {/* Enormous centered Letter Tracer */}
            <div className="w-full flex-1 flex items-center justify-center max-h-[68vh]">
              <LetterTracer
                key={`tracer-${currentWord.id}-${currentLetterIdx}-${tracerKey}`}
                letter={currentLetter}
                theme={settings.theme}
                difficulty={settings.tracingDifficulty}
                showArrows={settings.showArrows}
                showStartPoint={settings.showStartPoint}
                soundVolume={settings.soundVolume}
                phonicsEnabled={settings.phonicsEnabled}
                voicePitch={settings.voicePitch}
                voiceRate={settings.voiceRate}
                voiceURI={settings.selectedVoiceURI}
                onComplete={handleLetterComplete}
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAVIGATION / ACTION BAR */}
      <footer className="flex-none flex items-center justify-between px-4 sm:px-8 py-4 pb-[calc(1rem+var(--safe-bottom))] z-20">
        {/* Left: Re-trace / Clear Button */}
        <button
          onClick={handleResetLetter}
          disabled={isWordCompleted}
          aria-label="Restart Letter"
          className="h-16 px-5 sm:px-7 rounded-3xl bg-white shadow-soft border-2 border-slate-200/70 flex items-center gap-2 text-slate-700 font-bold text-lg active:scale-95 transition hover:bg-slate-50 disabled:opacity-40"
        >
          <RotateCcw className={`w-7 h-7 ${themeConfig.titleAccent}`} />
          <span className="hidden sm:inline">Clear</span>
        </button>

        {/* Center: Sound Speak Button */}
        <button
          onClick={handleAudioPlay}
          aria-label="Hear Sound"
          className="h-16 px-6 sm:px-8 rounded-3xl bg-white shadow-soft border-2 border-slate-200/70 flex items-center gap-3 text-slate-800 font-extrabold text-xl active:scale-95 transition hover:bg-slate-50"
        >
          <Volume2 className={`w-8 h-8 ${themeConfig.titleAccent}`} />
          <span className="hidden sm:inline">{isWordCompleted ? 'Word' : 'Sound'}</span>
        </button>

        {/* Right: NEXT Button */}
        {isWordCompleted ? (
          <button
            onClick={handleNextWord}
            aria-label="Next Word"
            className={`h-16 sm:h-20 px-8 sm:px-12 rounded-3xl ${themeConfig.btnStart} font-black text-2xl sm:text-3xl shadow-xl flex items-center gap-3 active:scale-95 transition-all transform animate-bounce`}
          >
            <span>NEXT</span>
            <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
          </button>
        ) : (
          <button
            onClick={() => {
              if (currentLetterIdx + 1 < letters.length) {
                setCurrentLetterIdx((p) => p + 1);
                setTracerKey((p) => p + 1);
              } else {
                handleWordComplete();
              }
            }}
            aria-label="Skip to Next Letter"
            className="h-16 px-5 sm:px-7 rounded-3xl bg-white shadow-soft border-2 border-slate-200/70 flex items-center gap-2 text-slate-600 font-bold text-lg active:scale-95 transition hover:bg-slate-50"
          >
            <span className="hidden sm:inline">Skip</span>
            <ArrowRight className="w-7 h-7 text-slate-500" />
          </button>
        )}
      </footer>
    </div>
  );
};
