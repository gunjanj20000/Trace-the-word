import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Word, Category, Settings, WordProgress, DailyProgress } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_WORDS, DEFAULT_SETTINGS } from '../data/defaultWords';

interface TraceWordDB extends DBSchema {
  words: {
    key: string;
    value: Word;
    indexes: { 'by-category': string; 'by-length': number };
  };
  categories: {
    key: string;
    value: Category;
  };
  settings: {
    key: string;
    value: { id: string } & Settings;
  };
  progress: {
    key: string;
    value: WordProgress;
  };
  dailyProgress: {
    key: string;
    value: DailyProgress;
  };
  media: {
    key: string;
    value: { id: string; type: 'image' | 'audio'; data: string; mimeType: string };
  };
}

const DB_NAME = 'TraceTheWordDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TraceWordDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<TraceWordDB>> {
  if (!dbPromise) {
    dbPromise = openDB<TraceWordDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Words store
        if (!db.objectStoreNames.contains('words')) {
          const wordStore = db.createObjectStore('words', { keyPath: 'id' });
          wordStore.createIndex('by-category', 'categoryId');
          wordStore.createIndex('by-length', 'length');
        }

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }

        // Word progress store
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'wordId' });
        }

        // Daily progress store
        if (!db.objectStoreNames.contains('dailyProgress')) {
          db.createObjectStore('dailyProgress', { keyPath: 'date' });
        }

        // Media store
        if (!db.objectStoreNames.contains('media')) {
          db.createObjectStore('media', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function initStorage(): Promise<{
  words: Word[];
  categories: Category[];
  settings: Settings;
}> {
  const db = await getDB();

  // Initialize Categories
  const existingCategories = await db.getAll('categories');
  if (existingCategories.length === 0) {
    const tx = db.transaction('categories', 'readwrite');
    for (const cat of DEFAULT_CATEGORIES) {
      await tx.store.put(cat);
    }
    await tx.done;
  }

  // Initialize Words
  const existingWords = await db.getAll('words');
  if (existingWords.length === 0) {
    const tx = db.transaction('words', 'readwrite');
    for (const w of DEFAULT_WORDS) {
      await tx.store.put(w);
    }
    await tx.done;
  }

  // Initialize Settings
  let settingsObj = await db.get('settings', 'app-settings');
  if (!settingsObj) {
    settingsObj = { id: 'app-settings', ...DEFAULT_SETTINGS };
    await db.put('settings', settingsObj);
  } else {
    let needsUpdate = false;
    if (!settingsObj.theme) {
      settingsObj.theme = 'forest';
      needsUpdate = true;
    }
    // Update default to letter names (phonicsEnabled = false)
    if (settingsObj.phonicsEnabled === true) {
      settingsObj.phonicsEnabled = false;
      needsUpdate = true;
    }
    if (needsUpdate) {
      await db.put('settings', settingsObj);
    }
  }

  const [words, categories] = await Promise.all([
    db.getAll('words'),
    db.getAll('categories'),
  ]);

  const { id, ...settings } = settingsObj;
  return { words, categories, settings };
}

// WORDS CRUD
export async function getAllWords(): Promise<Word[]> {
  const db = await getDB();
  return db.getAll('words');
}

export async function saveWord(word: Word): Promise<void> {
  const db = await getDB();
  await db.put('words', word);
}

export async function deleteWord(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('words', id);
  // Also clean up progress if any
  await db.delete('progress', id);
}

export async function toggleWordFavorite(id: string): Promise<boolean> {
  const db = await getDB();
  const word = await db.get('words', id);
  if (word) {
    word.favorite = !word.favorite;
    await db.put('words', word);
    return word.favorite;
  }
  return false;
}

// CATEGORIES CRUD
export async function getAllCategories(): Promise<Category[]> {
  const db = await getDB();
  return db.getAll('categories');
}

export async function saveCategory(category: Category): Promise<void> {
  const db = await getDB();
  await db.put('categories', category);
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('categories', id);
}

// SETTINGS
export async function getSettings(): Promise<Settings> {
  const db = await getDB();
  const s = await db.get('settings', 'app-settings');
  if (s) {
    const { id, ...rest } = s;
    return { ...DEFAULT_SETTINGS, ...rest, theme: rest.theme || DEFAULT_SETTINGS.theme };
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  await db.put('settings', { id: 'app-settings', ...settings });
}

// PROGRESS TRACKING
export async function getAllProgress(): Promise<WordProgress[]> {
  const db = await getDB();
  return db.getAll('progress');
}

export async function recordLetterTraced(): Promise<void> {
  const db = await getDB();
  const today = new Date().toISOString().split('T')[0];
  let daily = await db.get('dailyProgress', today);
  if (!daily) {
    daily = { date: today, wordsCompleted: 0, lettersTraced: 1 };
  } else {
    daily.lettersTraced += 1;
  }
  await db.put('dailyProgress', daily);
}

export async function recordWordCompletion(wordId: string): Promise<void> {
  const db = await getDB();
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  // Update WordProgress
  let prog = await db.get('progress', wordId);
  if (!prog) {
    prog = {
      wordId,
      timesPracticed: 1,
      timesCompleted: 1,
      lastPracticed: now,
      completedCount: 1,
    };
  } else {
    prog.timesPracticed += 1;
    prog.timesCompleted += 1;
    prog.completedCount += 1;
    prog.lastPracticed = now;
  }
  await db.put('progress', prog);

  // Update DailyProgress
  let daily = await db.get('dailyProgress', today);
  if (!daily) {
    daily = { date: today, wordsCompleted: 1, lettersTraced: 0 };
  } else {
    daily.wordsCompleted += 1;
  }
  await db.put('dailyProgress', daily);
}

export async function getTodayProgress(): Promise<DailyProgress> {
  const db = await getDB();
  const today = new Date().toISOString().split('T')[0];
  const daily = await db.get('dailyProgress', today);
  return daily || { date: today, wordsCompleted: 0, lettersTraced: 0 };
}

export async function getTotalStats(): Promise<{
  totalWordsCompleted: number;
  totalLettersTraced: number;
  distinctWordsCompleted: number;
}> {
  const db = await getDB();
  const allDaily = await db.getAll('dailyProgress');
  const allWordProg = await db.getAll('progress');

  const totalWordsCompleted = allDaily.reduce((acc, d) => acc + d.wordsCompleted, 0);
  const totalLettersTraced = allDaily.reduce((acc, d) => acc + d.lettersTraced, 0);
  const distinctWordsCompleted = allWordProg.filter((p) => p.timesCompleted > 0).length;

  return { totalWordsCompleted, totalLettersTraced, distinctWordsCompleted };
}

// MEDIA STORAGE (Images & Audios)
export async function saveMediaItem(
  id: string,
  type: 'image' | 'audio',
  data: string,
  mimeType: string
): Promise<void> {
  const db = await getDB();
  await db.put('media', { id, type, data, mimeType });
}

export async function getMediaItem(id: string): Promise<{ data: string; mimeType: string } | null> {
  const db = await getDB();
  const item = await db.get('media', id);
  return item ? { data: item.data, mimeType: item.mimeType } : null;
}

export async function deleteMediaItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('media', id);
}

// BACKUP & RESTORE
export interface BackupData {
  version: number;
  exportedAt: string;
  words: Word[];
  categories: Category[];
  settings: Settings;
  progress: WordProgress[];
  dailyProgress: DailyProgress[];
  media?: Array<{ id: string; type: 'image' | 'audio'; data: string; mimeType: string }>;
}

export async function exportBackup(includeMedia: boolean = true): Promise<string> {
  const db = await getDB();
  const words = await db.getAll('words');
  const categories = await db.getAll('categories');
  const settings = await getSettings();
  const progress = await db.getAll('progress');
  const dailyProgress = await db.getAll('dailyProgress');
  const media = includeMedia ? await db.getAll('media') : [];

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    words,
    categories,
    settings,
    progress,
    dailyProgress,
    media,
  };

  return JSON.stringify(backup, null, 2);
}

export async function importBackup(jsonString: string): Promise<boolean> {
  try {
    const data: BackupData = JSON.parse(jsonString);
    if (!data.words || !data.categories || !data.settings) {
      throw new Error('Invalid backup file structure.');
    }

    const db = await getDB();

    // Clear and restore words
    const txW = db.transaction('words', 'readwrite');
    await txW.store.clear();
    for (const w of data.words) {
      await txW.store.put(w);
    }
    await txW.done;

    // Clear and restore categories
    const txC = db.transaction('categories', 'readwrite');
    await txC.store.clear();
    for (const c of data.categories) {
      await txC.store.put(c);
    }
    await txC.done;

    // Restore settings
    await saveSettings(data.settings);

    // Restore progress
    if (data.progress) {
      const txP = db.transaction('progress', 'readwrite');
      await txP.store.clear();
      for (const p of data.progress) {
        await txP.store.put(p);
      }
      await txP.done;
    }

    if (data.dailyProgress) {
      const txD = db.transaction('dailyProgress', 'readwrite');
      await txD.store.clear();
      for (const d of data.dailyProgress) {
        await txD.store.put(d);
      }
      await txD.done;
    }

    // Restore media if included
    if (data.media && data.media.length > 0) {
      const txM = db.transaction('media', 'readwrite');
      for (const m of data.media) {
        await txM.store.put(m);
      }
      await txM.done;
    }

    return true;
  } catch (err) {
    console.error('Failed to import backup:', err);
    return false;
  }
}

export async function resetAllData(): Promise<void> {
  const db = await getDB();

  // Clear all stores
  await db.clear('words');
  await db.clear('categories');
  await db.clear('settings');
  await db.clear('progress');
  await db.clear('dailyProgress');
  await db.clear('media');

  // Repopulate defaults
  await initStorage();
}
