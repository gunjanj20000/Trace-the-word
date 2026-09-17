import React from 'react';
import { Word, Settings } from '../types';
import { WordImage } from './WordImage';
import { ArrowLeft, Star, Play } from 'lucide-react';
import { getThemeConfig } from '../theme/themeConfig';

interface FavoritesScreenProps {
  words: Word[];
  settings?: Settings;
  onBack: () => void;
  onSelectWord: (wordIndex: number) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  words,
  settings,
  onBack,
  onSelectWord,
}) => {
  const favoriteWords = words.filter((w) => w.favorite && w.enabled);
  const themeConfig = getThemeConfig(settings?.theme);

  return (
    <div className={`flex flex-col h-full w-full ${themeConfig.bgMain} overflow-hidden select-none`}>
      {/* Header */}
      <header className={`flex-none flex items-center justify-between px-6 sm:px-8 py-4 pt-[calc(1rem+var(--safe-top))] ${themeConfig.headerBg} border-b ${themeConfig.cardBorder} z-10`}>
        <button
          onClick={onBack}
          aria-label="Back"
          className={`w-14 h-14 rounded-2xl ${themeConfig.cardBg} hover:opacity-90 border ${themeConfig.cardBorder} flex items-center justify-center text-slate-700 active:scale-95 transition`}
        >
          <ArrowLeft className={`w-7 h-7 ${themeConfig.titleAccent}`} />
        </button>

        <h1 className={`text-2xl sm:text-3xl font-black ${themeConfig.titlePrimary} flex items-center gap-2`}>
          <Star className="w-8 h-8 text-amber-500 fill-amber-400" />
          <span>My Words</span>
        </h1>

        <div className="w-14" />
      </header>

      {/* Main Grid */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full pb-[calc(2rem+var(--safe-bottom))]">
        {favoriteWords.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <Star className="w-16 h-16 text-amber-300 mb-4" />
            <p className="text-2xl font-bold text-slate-600 mb-2">No words in My Words yet!</p>
            <p className="text-slate-400 max-w-md">
              Tap the star icon in the tracing screen or enable favorites in Settings to build your personalized word list.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {favoriteWords.map((word) => {
              const fullIndex = words.findIndex((w) => w.id === word.id);
              return (
                <button
                  key={`fav-card-${word.id}`}
                  onClick={() => onSelectWord(fullIndex >= 0 ? fullIndex : 0)}
                  className="group relative p-4 rounded-3xl bg-white shadow-soft hover:shadow-card border-2 border-amber-100 hover:border-amber-400 flex flex-col items-center text-center transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 my-2">
                    <WordImage word={word} className="w-full h-full" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-wide mt-1">
                    {word.text}
                  </span>
                  <div className="mt-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-bold flex items-center gap-1 group-hover:bg-amber-500 group-hover:text-white transition">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Trace</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
