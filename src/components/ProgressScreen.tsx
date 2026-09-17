import React, { useEffect, useState } from 'react';
import { Word, DailyProgress, WordProgress, Settings } from '../types';
import { getTodayProgress, getTotalStats, getAllProgress } from '../services/db';
import { ArrowLeft, Star, Award, Heart, CheckCircle2 } from 'lucide-react';
import { WordImage } from './WordImage';
import { getThemeConfig } from '../theme/themeConfig';

interface ProgressScreenProps {
  words: Word[];
  settings?: Settings;
  onBack: () => void;
  onPracticeWord?: (wordId: string) => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  words,
  settings,
  onBack,
  onPracticeWord,
}) => {
  const [today, setToday] = useState<DailyProgress>({ date: '', wordsCompleted: 0, lettersTraced: 0 });
  const [totalStats, setTotalStats] = useState({ totalWordsCompleted: 0, totalLettersTraced: 0, distinctWordsCompleted: 0 });
  const [wordProgressList, setWordProgressList] = useState<WordProgress[]>([]);

  const themeConfig = getThemeConfig(settings?.theme);

  useEffect(() => {
    getTodayProgress().then(setToday);
    getTotalStats().then(setTotalStats);
    getAllProgress().then(setWordProgressList);
  }, []);

  const favoriteWords = words.filter((w) => w.favorite);

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

        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2">
          <Award className="w-8 h-8 text-amber-500" />
          <span>My Progress</span>
        </h1>

        <div className="w-14" />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full pb-[calc(2rem+var(--safe-bottom))] space-y-6">
        {/* TODAY SECTION */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 text-center">
          <h2 className="text-xl font-extrabold text-slate-500 uppercase tracking-wider mb-2">Today</h2>
          
          {/* Gentle Star Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 my-4">
            {today.wordsCompleted === 0 ? (
              <p className="text-slate-400 font-semibold text-lg py-2">
                Ready to trace your first word today!
              </p>
            ) : (
              Array.from({ length: Math.min(10, today.wordsCompleted) }).map((_, i) => (
                <span key={`star-${i}`} className="text-4xl sm:text-5xl animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>
                  ⭐
                </span>
              ))
            )}
          </div>

          <p className="text-3xl sm:text-4xl font-black text-sky-700 mt-2">
            {today.wordsCompleted} {today.wordsCompleted === 1 ? 'word' : 'words'} completed
          </p>
          <p className="text-slate-500 font-medium mt-1">
            {today.lettersTraced} letters traced today
          </p>
        </section>

        {/* OVERALL STATS */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-slate-100 text-center">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 block">
              {totalStats.totalWordsCompleted}
            </span>
            <span className="text-slate-500 font-bold text-sm sm:text-base">
              Total Words Completed
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-slate-100 text-center">
            <span className="text-3xl sm:text-4xl font-black text-purple-600 block">
              {totalStats.totalLettersTraced}
            </span>
            <span className="text-slate-500 font-bold text-sm sm:text-base">
              Total Letters Traced
            </span>
          </div>
        </section>

        {/* FAVORITE WORDS */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Heart className="w-7 h-7 text-rose-500 fill-rose-400" />
              <span>Favorite Words ({favoriteWords.length})</span>
            </h2>
          </div>

          {favoriteWords.length === 0 ? (
            <p className="text-slate-400 font-medium py-4 text-center">
              No favorite words marked yet. Tap the star in any word to add it here!
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favoriteWords.map((word) => (
                <div
                  key={`fav-${word.id}`}
                  onClick={() => onPracticeWord && onPracticeWord(word.id)}
                  className="p-3 bg-rose-50/50 hover:bg-rose-100/60 rounded-2xl border border-rose-100 flex flex-col items-center cursor-pointer active:scale-95 transition"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24">
                    <WordImage word={word} className="w-full h-full" />
                  </div>
                  <span className="text-xl font-black text-slate-800 mt-2">{word.text}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
