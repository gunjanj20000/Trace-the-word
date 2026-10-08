/**
 * Universal Word Pack Interchange Format
 * Enables seamless sharing of words, images, and audio across CogniCard, TraceTheWord, and WordLearn.
 */

export interface UniversalCategory {
  id: string | number;
  name: string;
  icon?: string;
  color?: string;
  enabled?: boolean;
}

export interface UniversalWordItem {
  id: string;
  word: string;          // Lowercase: "apple"
  text: string;          // Uppercase: "APPLE"
  englishWord: string;   // Title-cased: "Apple"
  hindiWord?: string;    // Optional Hindi translation
  category: string;      // Category name: "Food"
  categoryId?: string | number;
  imageDataUrl?: string; // base64 or SVG data URL
  imageBase64?: string;  // Alias for imageDataUrl
  audioDataUrl?: string; // base64 audio data URL
  englishAudioBase64?: string; // Alias
  hindiAudioBase64?: string;   // Alias
  builtInImage?: string; // Built-in vector illustration key if any
  imageId?: string;
  audioId?: string;
  createdAt?: number;
  length?: number;
  enabled?: boolean;
  favorite?: boolean;
  orderIndex?: number;
}

export interface UniversalMediaItem {
  id: string;
  type: 'image' | 'audio';
  data: string; // Data URL
  mimeType: string;
}

export interface UniversalWordPack {
  version: number;
  format: 'universal-word-pack';
  appName: string;
  exportedAt: string;
  totalWords: number;
  totalCategories: number;
  categories: UniversalCategory[];
  words: UniversalWordItem[];
  flashcards?: any[];
  media?: UniversalMediaItem[];
  settings?: any;
}

export interface ParsedWordPackResult {
  words: UniversalWordItem[];
  categories: UniversalCategory[];
  hasAudioCount: number;
  hasImageCount: number;
  appName?: string;
  exportedAt?: string;
  rawSettings?: any;
}

/**
 * Universal parser that understands files from:
 * 1. Universal Word Pack (v2 format)
 * 2. CogniCard (categories + flashcards with imageBase64)
 * 3. TraceTheWord (words + media store + categories)
 * 4. WordLearn (words with imageDataUrl + categories)
 * 5. Simple word arrays [ { word: "..." }, ... ]
 */
export function parseAnyWordPack(input: string | any): ParsedWordPackResult {
  let data: any;
  if (typeof input === 'string') {
    try {
      data = JSON.parse(input);
    } catch {
      throw new Error('File is not valid JSON. Please upload a valid JSON file.');
    }
  } else {
    data = input;
  }

  if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
    throw new Error('Invalid file structure. Expected JSON object or array.');
  }

  // 1. Build Media Map if media array exists (TraceTheWord format)
  const mediaMap = new Map<string, { data: string; mimeType: string }>();
  if (Array.isArray(data.media)) {
    for (const m of data.media) {
      if (m && m.id && m.data) {
        mediaMap.set(String(m.id), {
          data: String(m.data),
          mimeType: m.mimeType || 'image/png',
        });
      }
    }
  }

  // 2. Extract Categories
  const categories: UniversalCategory[] = [];
  const categoryIdToName = new Map<string | number, string>();
  if (Array.isArray(data.categories)) {
    for (const c of data.categories) {
      if (c && (c.name || c.id)) {
        const catName = String(c.name || c.id).trim();
        const cleanName = catName.charAt(0).toUpperCase() + catName.slice(1);
        categories.push({
          id: c.id !== undefined ? c.id : cleanName.toLowerCase(),
          name: cleanName,
          icon: c.icon,
          color: c.color,
          enabled: c.enabled !== false,
        });
        if (c.id !== undefined) {
          categoryIdToName.set(c.id, cleanName);
          categoryIdToName.set(String(c.id), cleanName);
        }
      }
    }
  }

  // 3. Extract Raw Words
  let rawList: any[] = [];
  if (Array.isArray(data)) {
    rawList = data;
  } else if (Array.isArray(data.words)) {
    rawList = data.words;
  } else if (Array.isArray(data.flashcards)) {
    rawList = data.flashcards;
  } else {
    throw new Error('No words or flashcards found in the file.');
  }

  const words: UniversalWordItem[] = [];
  const seenWordKeys = new Set<string>();
  let hasImageCount = 0;
  let hasAudioCount = 0;

  for (const raw of rawList) {
    if (!raw || typeof raw !== 'object') continue;

    const rawWord = String(
      raw.word || raw.text || raw.englishWord || raw.name || raw.title || ''
    ).trim();

    if (!rawWord) continue;

    const lower = rawWord.toLowerCase();
    if (seenWordKeys.has(lower)) continue;
    seenWordKeys.add(lower);

    const upper = rawWord.toUpperCase();
    const title = rawWord.charAt(0).toUpperCase() + rawWord.slice(1);
    const hindiWord = raw.hindiWord ? String(raw.hindiWord).trim() : '';

    // Determine category name
    let categoryName = 'General';
    if (raw.category && typeof raw.category === 'string' && raw.category.trim()) {
      categoryName = raw.category.trim();
    } else if (raw.categoryId !== undefined && categoryIdToName.has(raw.categoryId)) {
      categoryName = categoryIdToName.get(raw.categoryId)!;
    } else if (typeof raw.categoryId === 'string' && raw.categoryId.trim()) {
      categoryName = raw.categoryId.trim();
    }
    categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

    // Extract image
    let imageDataUrl: string | undefined = undefined;
    if (typeof raw.imageDataUrl === 'string' && raw.imageDataUrl.startsWith('data:image/')) {
      imageDataUrl = raw.imageDataUrl;
    } else if (typeof raw.imageBase64 === 'string' && raw.imageBase64.startsWith('data:image/')) {
      imageDataUrl = raw.imageBase64;
    } else if (raw.imageId && mediaMap.has(String(raw.imageId))) {
      imageDataUrl = mediaMap.get(String(raw.imageId))?.data;
    } else if (raw.id && mediaMap.has(String(raw.id))) {
      imageDataUrl = mediaMap.get(String(raw.id))?.data;
    } else if (typeof raw.image === 'string' && raw.image.startsWith('data:image/')) {
      imageDataUrl = raw.image;
    }

    if (imageDataUrl) hasImageCount++;

    // Extract audio
    let audioDataUrl: string | undefined = undefined;
    if (typeof raw.audioDataUrl === 'string' && raw.audioDataUrl.startsWith('data:audio/')) {
      audioDataUrl = raw.audioDataUrl;
    } else if (typeof raw.englishAudioBase64 === 'string' && raw.englishAudioBase64.startsWith('data:audio/')) {
      audioDataUrl = raw.englishAudioBase64;
    } else if (raw.audioId && mediaMap.has(String(raw.audioId))) {
      audioDataUrl = mediaMap.get(String(raw.audioId))?.data;
    }

    if (audioDataUrl) hasAudioCount++;

    let hindiAudioBase64: string | undefined = undefined;
    if (typeof raw.hindiAudioBase64 === 'string' && raw.hindiAudioBase64.startsWith('data:audio/')) {
      hindiAudioBase64 = raw.hindiAudioBase64;
    } else if (typeof raw.hindiAudioDataUrl === 'string' && raw.hindiAudioDataUrl.startsWith('data:audio/')) {
      hindiAudioBase64 = raw.hindiAudioDataUrl;
    }

    const builtInImage = raw.builtInImage ? String(raw.builtInImage).trim().toLowerCase() : undefined;

    words.push({
      id: raw.id ? String(raw.id) : `word_${lower}_${Date.now()}`,
      word: lower,
      text: upper,
      englishWord: title,
      hindiWord,
      category: categoryName,
      categoryId: raw.categoryId ?? categoryName.toLowerCase(),
      imageDataUrl,
      imageBase64: imageDataUrl,
      audioDataUrl,
      englishAudioBase64: audioDataUrl,
      hindiAudioBase64,
      builtInImage,
      imageId: raw.imageId ? String(raw.imageId) : (imageDataUrl ? `img-${lower}` : undefined),
      audioId: raw.audioId ? String(raw.audioId) : (audioDataUrl ? `aud-${lower}` : undefined),
      createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
      length: typeof raw.length === 'number' ? raw.length : rawWord.length,
      enabled: raw.enabled !== false,
      favorite: Boolean(raw.favorite),
      orderIndex: typeof raw.orderIndex === 'number' ? raw.orderIndex : undefined,
    });
  }

  if (words.length === 0) {
    throw new Error('No valid words found in the file.');
  }

  // 4. Ensure implicit categories exist
  const existingCatNames = new Set(categories.map((c) => c.name.toLowerCase()));
  for (const w of words) {
    if (!existingCatNames.has(w.category.toLowerCase())) {
      categories.push({
        id: w.category.toLowerCase(),
        name: w.category,
        icon: '📁',
        color: '#8B5CF6',
        enabled: true,
      });
      existingCatNames.add(w.category.toLowerCase());
    }
  }

  return {
    words,
    categories,
    hasImageCount,
    hasAudioCount,
    appName: data.appName,
    exportedAt: data.exportedAt || data.exportDate || data.timestamp,
    rawSettings: data.settings,
  };
}

/**
 * Creates the universal export JSON string containing all formats for universal compatibility.
 */
export function createUniversalWordPack(params: {
  appName: string;
  words: UniversalWordItem[];
  categories: UniversalCategory[];
  media?: UniversalMediaItem[];
  settings?: any;
}): string {
  const { appName, words, categories, settings } = params;

  // Build media items
  const mediaList: UniversalMediaItem[] = params.media ? [...params.media] : [];
  const existingMediaIds = new Set(mediaList.map((m) => m.id));

  for (const w of words) {
    if (w.imageDataUrl && w.imageId && !existingMediaIds.has(w.imageId)) {
      const mime = w.imageDataUrl.match(/data:([^;]+);/)?.[1] || 'image/png';
      mediaList.push({
        id: w.imageId,
        type: 'image',
        data: w.imageDataUrl,
        mimeType: mime,
      });
      existingMediaIds.add(w.imageId);
    }
    if (w.audioDataUrl && w.audioId && !existingMediaIds.has(w.audioId)) {
      const mime = w.audioDataUrl.match(/data:([^;]+);/)?.[1] || 'audio/mp3';
      mediaList.push({
        id: w.audioId,
        type: 'audio',
        data: w.audioDataUrl,
        mimeType: mime,
      });
      existingMediaIds.add(w.audioId);
    }
  }

  // Format flashcards for legacy CogniCard parser compatibility
  const flashcards = words.map((w, idx) => ({
    id: typeof w.categoryId === 'number' ? (idx + 1) : (w.id || idx + 1),
    categoryId: w.categoryId,
    englishWord: w.englishWord,
    hindiWord: w.hindiWord || w.englishWord,
    imagePath: '',
    imageBase64: w.imageDataUrl || w.imageBase64 || '',
    englishAudioBase64: w.audioDataUrl || w.englishAudioBase64 || '',
    hindiAudioBase64: w.hindiAudioBase64 || '',
  }));

  const payload: UniversalWordPack = {
    version: 2,
    format: 'universal-word-pack',
    appName,
    exportedAt: new Date().toISOString(),
    totalWords: words.length,
    totalCategories: categories.length,
    categories,
    words,
    flashcards,
    media: mediaList,
    settings,
  };

  return JSON.stringify(payload, null, 2);
}
