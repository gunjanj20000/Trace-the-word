import React, { useState, useEffect } from 'react';
import { Word, Category, Settings, AppScreen } from './types';
import { initStorage, getAllWords, getAllCategories, getSettings } from './services/db';
import { HomeScreen } from './components/HomeScreen';
import { TracingScreen } from './components/TracingScreen';
import { FreePracticeScreen } from './components/FreePracticeScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { FavoritesScreen } from './components/FavoritesScreen';
import { SettingsScreen } from './components/SettingsScreen';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize offline storage and load data
  const loadAppData = async () => {
    try {
      const data = await initStorage();
      setWords(data.words);
      setCategories(data.categories);
      setSettings(data.settings);

      // Apply initial accessibility classes
      if (data.settings.highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }

      if (data.settings.reducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    } catch (err) {
      console.error('Failed to initialize app storage:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();

    // Online / Offline status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isLoading || !settings) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-emerald-50/60">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-emerald-600 shadow-xl flex items-center justify-center animate-bounce">
            <span className="text-white text-4xl font-black">A</span>
          </div>
          <span className="text-xl font-extrabold text-emerald-900 tracking-wide">Loading Trace Words...</span>
        </div>
      </div>
    );
  }

  // SCREEN ROUTER
  switch (currentScreen) {
    case 'tracing':
      return (
        <TracingScreen
          words={words}
          settings={settings}
          onHome={() => setCurrentScreen('home')}
          mode="guided"
          initialWordIndex={selectedWordIndex}
        />
      );

    case 'word-mode':
      return (
        <TracingScreen
          words={words}
          settings={settings}
          onHome={() => setCurrentScreen('home')}
          mode="word"
          initialWordIndex={selectedWordIndex}
        />
      );

    case 'free-practice':
      return (
        <FreePracticeScreen
          settings={settings}
          onHome={() => setCurrentScreen('home')}
        />
      );

    case 'progress':
      return (
        <ProgressScreen
          words={words}
          settings={settings}
          onBack={() => setCurrentScreen('home')}
          onPracticeWord={(wordId) => {
            const idx = words.findIndex((w) => w.id === wordId);
            setSelectedWordIndex(idx >= 0 ? idx : 0);
            setCurrentScreen('tracing');
          }}
        />
      );

    case 'favorites':
      return (
        <FavoritesScreen
          words={words}
          settings={settings}
          onBack={() => setCurrentScreen('home')}
          onSelectWord={(idx) => {
            setSelectedWordIndex(idx);
            setCurrentScreen('tracing');
          }}
        />
      );

    case 'settings':
      return (
        <SettingsScreen
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings(newSettings)}
          words={words}
          categories={categories}
          onReloadData={loadAppData}
          onBack={() => setCurrentScreen('home')}
        />
      );

    case 'home':
    default:
      return (
        <HomeScreen
          onStart={() => {
            setSelectedWordIndex(0);
            setCurrentScreen('tracing');
          }}
          onSelectMode={(mode) => {
            setSelectedWordIndex(0);
            if (mode === 'guided') setCurrentScreen('tracing');
            else if (mode === 'word') setCurrentScreen('word-mode');
            else if (mode === 'free') setCurrentScreen('free-practice');
          }}
          onOpenSettings={() => setCurrentScreen('settings')}
          onOpenProgress={() => setCurrentScreen('progress')}
          onOpenFavorites={() => setCurrentScreen('favorites')}
          settings={settings}
          words={words}
          isOnline={isOnline}
        />
      );
  }
};

export default App;
