import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Word, Category, Settings, WordProgress, DailyProgress } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_WORDS, DEFAULT_SETTINGS } from '../data/defaultWords';
import { ILLUSTRATIONS } from '../data/illustrations';
import {
  parseAnyWordPack,
  createUniversalWordPack,
  type UniversalWordItem,
  type UniversalMediaItem,
} from './universalWordPack';

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
  } else {
    // Ensure Apple and Ball are sorted to the front for existing databases
    const apple = existingWords.find((w) => w.id === 'w-apple');
    const ball = existingWords.find((w) => w.id === 'w-ball');
    if (apple && apple.createdAt !== 1) {
      apple.createdAt = 1;
      await db.put('words', apple);
    }
    if (ball && ball.createdAt !== 2) {
      ball.createdAt = 2;
      await db.put('words', ball);
    }
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
    // Ensure 5-letter words are enabled so "APPLE" is included by default
    if (!settingsObj.enabledWordLengths || !settingsObj.enabledWordLengths.includes(5)) {
      settingsObj.enabledWordLengths = [3, 4, 5];
      needsUpdate = true;
    }
    if (needsUpdate) {
      await db.put('settings', settingsObj);
    }
  }

  const [rawWords, categories] = await Promise.all([
    db.getAll('words'),
    db.getAll('categories'),
  ]);

  // Sort words by createdAt so Apple, Ball, Cat, Dog are presented in clear, natural order
  const words = rawWords.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

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
export interface ImportBackupResult {
  success: boolean;
  addedCount: number;
  skippedCount: number;
  categoriesAddedCount: number;
}

export async function exportBackup(includeMedia: boolean = true): Promise<string> {
  const db = await getDB();
  const words = await db.getAll('words');
  const categories = await db.getAll('categories');
  const settings = await getSettings();
  const progress = await db.getAll('progress');
  const dailyProgress = await db.getAll('dailyProgress');
  const existingMedia = includeMedia ? await db.getAll('media') : [];

  const mediaMap = new Map<string, { data: string; mimeType: string }>();
  for (const m of existingMedia) {
    mediaMap.set(m.id, { data: m.data, mimeType: m.mimeType });
  }

  const allMedia: UniversalMediaItem[] = existingMedia.map(m => ({
    id: m.id,
    type: m.type,
    data: m.data,
    mimeType: m.mimeType,
  }));

  const categoryNameMap = new Map<string, string>();
  for (const c of categories) {
    categoryNameMap.set(c.id, c.name);
  }

  const universalWords: UniversalWordItem[] = words.map((w) => {
    let imgDataUrl: string | undefined = undefined;
    if (w.imageId && mediaMap.has(w.imageId)) {
      imgDataUrl = mediaMap.get(w.imageId)?.data;
    } else if (w.builtInImage && ILLUSTRATIONS[w.builtInImage.toLowerCase()]) {
      try {
        const Comp = ILLUSTRATIONS[w.builtInImage.toLowerCase()];
        const svgStr = renderToStaticMarkup(React.createElement(Comp, {}));
        imgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;
        const builtinMediaId = `builtin-${w.builtInImage.toLowerCase()}`;
        if (!mediaMap.has(builtinMediaId)) {
          allMedia.push({
            id: builtinMediaId,
            type: 'image',
            data: imgDataUrl,
            mimeType: 'image/svg+xml',
          });
          mediaMap.set(builtinMediaId, { data: imgDataUrl, mimeType: 'image/svg+xml' });
        }
      } catch (err) {
        console.warn('Could not generate SVG illustration for:', w.builtInImage, err);
      }
    }

    let audDataUrl: string | undefined = undefined;
    if (w.audioId && mediaMap.has(w.audioId)) {
      audDataUrl = mediaMap.get(w.audioId)?.data;
    }

    const cleanText = w.text.trim();
    const catName = categoryNameMap.get(w.categoryId) || w.categoryId || 'General';

    return {
      id: w.id,
      word: cleanText.toLowerCase(),
      text: cleanText.toUpperCase(),
      englishWord: cleanText.charAt(0).toUpperCase() + cleanText.slice(1).toLowerCase(),
      hindiWord: '',
      category: catName,
      categoryId: w.categoryId,
      imageDataUrl: imgDataUrl,
      imageBase64: imgDataUrl,
      audioDataUrl: audDataUrl,
      englishAudioBase64: audDataUrl,
      builtInImage: w.builtInImage,
      imageId: w.imageId,
      audioId: w.audioId,
      length: w.length || cleanText.length,
      enabled: w.enabled,
      favorite: w.favorite,
      createdAt: w.createdAt || Date.now(),
    };
  });

  return createUniversalWordPack({
    appName: 'TraceTheWord',
    categories: categories.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      enabled: c.enabled,
    })),
    words: universalWords,
    media: allMedia,
    settings: {
      ...settings,
      progress,
      dailyProgress,
    },
  });
}

export async function importBackup(jsonString: string): Promise<ImportBackupResult> {
  try {
    const parsed = parseAnyWordPack(jsonString);
    const db = await getDB();

    const existingWords = await db.getAll('words');
    const existingCategories = await db.getAll('categories');

    // Build lookup of existing words (case-insensitive deduplication)
    const existingWordSet = new Set(existingWords.map(w => w.text.trim().toLowerCase()));

    // Category mapping: match case-insensitively, or add new category
    const categoryIdMap = new Map<string, string>();
    let categoriesAddedCount = 0;

    for (const impCat of parsed.categories) {
      const catKey = impCat.name.trim().toLowerCase();
      const match = existingCategories.find(c => c.name.trim().toLowerCase() === catKey);
      if (match) {
        categoryIdMap.set(catKey, match.id);
        if (impCat.id !== undefined) {
          categoryIdMap.set(String(impCat.id).toLowerCase(), match.id);
        }
      } else {
        const newCatId = impCat.id ? String(impCat.id).toLowerCase() : `cat-${catKey.replace(/[^a-z0-9]/g, '-')}`;
        const newCat: Category = {
          id: newCatId,
          name: impCat.name,
          icon: impCat.icon || 'Star',
          enabled: true,
        };
        await db.put('categories', newCat);
        existingCategories.push(newCat);
        categoryIdMap.set(catKey, newCatId);
        if (impCat.id !== undefined) {
          categoryIdMap.set(String(impCat.id).toLowerCase(), newCatId);
        }
        categoriesAddedCount++;
      }
    }

    const defaultCatId = existingCategories[0]?.id || 'things';

    let addedCount = 0;
    let skippedCount = 0;

    for (const item of parsed.words) {
      const normKey = item.word.toLowerCase();
      if (existingWordSet.has(normKey)) {
        skippedCount++;
        continue; // Non-destructive: DO NOT replace existing word or its image!
      }
      existingWordSet.add(normKey);

      const wordId = `w-${normKey}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      let imageId: string | undefined = undefined;
      let audioId: string | undefined = undefined;

      // Save custom image to media store if available
      if (item.imageDataUrl) {
        imageId = `img-${wordId}`;
        const mime = item.imageDataUrl.match(/data:([^;]+);/)?.[1] || 'image/png';
        await db.put('media', {
          id: imageId,
          type: 'image',
          data: item.imageDataUrl,
          mimeType: mime,
        });
      }

      // Save custom audio to media store if available
      if (item.audioDataUrl) {
        audioId = `aud-${wordId}`;
        const mime = item.audioDataUrl.match(/data:([^;]+);/)?.[1] || 'audio/mp3';
        await db.put('media', {
          id: audioId,
          type: 'audio',
          data: item.audioDataUrl,
          mimeType: mime,
        });
      }

      // Check if builtInImage illustration is available
      const builtInKey = item.builtInImage || (ILLUSTRATIONS[normKey] ? normKey : undefined);

      const catKey = item.category.trim().toLowerCase();
      const targetCatId = categoryIdMap.get(catKey)
        || (item.categoryId !== undefined ? categoryIdMap.get(String(item.categoryId).toLowerCase()) : undefined)
        || defaultCatId;

      const newWord: Word = {
        id: wordId,
        text: item.word.toUpperCase(),
        length: item.word.length,
        categoryId: targetCatId,
        builtInImage: builtInKey,
        imageId,
        audioId,
        enabled: true,
        favorite: false,
        createdAt: Date.now(),
      };

      await db.put('words', newWord);
      addedCount++;
    }

    return {
      success: true,
      addedCount,
      skippedCount,
      categoriesAddedCount,
    };
  } catch (err) {
    console.error('Failed to import backup:', err);
    return {
      success: false,
      addedCount: 0,
      skippedCount: 0,
      categoriesAddedCount: 0,
    };
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
