import React, { useState } from 'react';
import { Settings, Word, Category, TracingDifficulty, CelebrationStyle, ParentGateType } from '../types';
import { WordImage } from './WordImage';
import { WordModal } from './WordModal';
import {
  saveSettings,
  saveWord,
  deleteWord,
  saveCategory,
  deleteCategory,
  exportBackup,
  importBackup,
  resetAllData,
  getDB,
} from '../services/db';
import { speakWord, playCelebrationMelody } from '../services/audio';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Sliders,
  Volume2,
  Eye,
  Database,
  Plus,
  Trash2,
  Edit2,
  Star,
  Check,
  Download,
  Upload,
  RefreshCw,
  Search,
  Lock,
} from 'lucide-react';

interface SettingsScreenProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => void;
  words: Word[];
  categories: Category[];
  onReloadData: () => void;
  onBack: () => void;
}

type TabKey = 'general' | 'tracing' | 'audio' | 'visual' | 'words' | 'data';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  words,
  categories,
  onReloadData,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New category inline input
  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  // Notification helper
  const showNotice = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Update a single setting
  const updateSetting = async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    await saveSettings(updated);
  };

  // Toggle word length
  const toggleLength = async (len: number) => {
    let lengths = [...settings.enabledWordLengths];
    if (lengths.includes(len)) {
      if (lengths.length === 1) {
        showNotice('At least one word length must be selected.');
        return;
      }
      lengths = lengths.filter((l) => l !== len);
    } else {
      lengths = [...lengths, len].sort((a, b) => a - b);
    }
    await updateSetting('enabledWordLengths', lengths);
  };

  // Delete word
  const handleDeleteWord = async (id: string, text: string) => {
    if (window.confirm(`Delete word "${text}"?`)) {
      await deleteWord(id);
      onReloadData();
      showNotice(`Deleted "${text}".`);
    }
  };

  // Toggle word enabled
  const handleToggleWordEnabled = async (word: Word) => {
    const updated = { ...word, enabled: !word.enabled };
    await saveWord(updated);
    onReloadData();
  };

  // Toggle word favorite
  const handleToggleWordFav = async (word: Word) => {
    const updated = { ...word, favorite: !word.favorite };
    await saveWord(updated);
    onReloadData();
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const catId = newCatName.trim().toLowerCase().replace(/\s+/g, '-');
    const newCat: Category = {
      id: catId,
      name: newCatName.trim(),
      icon: 'Tag',
      enabled: true,
    };
    await saveCategory(newCat);
    setNewCatName('');
    setShowAddCat(false);
    onReloadData();
    showNotice(`Added category "${newCat.name}".`);
  };

  // Export Backup
  const handleExportBackup = async () => {
    try {
      const jsonStr = await exportBackup(true);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trace-words-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotice('Backup exported successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to export backup.');
    }
  };

  // Import Backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const jsonStr = reader.result as string;
        const ok = await importBackup(jsonStr);
        if (ok) {
          onReloadData();
          showNotice('Backup restored successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to restore backup.');
      }
    };
    reader.readAsText(file);
  };

  // Reset progress only
  const handleResetProgress = async () => {
    if (window.confirm('Reset all words completed and tracing statistics to 0?')) {
      const db = await getDB();
      await db.clear('progress');
      await db.clear('dailyProgress');
      onReloadData();
      showNotice('Progress stats reset.');
    }
  };

  // Factory reset
  const handleResetDefaults = async () => {
    if (window.confirm('Reset the app back to initial factory words and settings? Custom words will be deleted.')) {
      await resetAllData();
      onReloadData();
      showNotice('App restored to factory defaults.');
    }
  };

  // Filtered words for word list
  const filteredWords = words.filter((w) => {
    const matchesSearch = w.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || w.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 overflow-hidden select-none">
      {/* Word Add/Edit Modal */}
      <WordModal
        isOpen={isWordModalOpen}
        onClose={() => {
          setIsWordModalOpen(false);
          setEditingWord(null);
        }}
        onSaved={() => {
          onReloadData();
          showNotice('Word saved successfully.');
        }}
        editingWord={editingWord}
        categories={categories}
      />

      {/* TOP HEADER */}
      <header className="flex-none flex items-center justify-between px-6 sm:px-8 py-4 pt-[calc(1rem+var(--safe-top))] bg-white border-b border-slate-200 z-10">
        <button
          onClick={onBack}
          aria-label="Back to App"
          className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-sky-600" />
          <span>Parent Settings</span>
        </h1>

        <div className="w-14" />
      </header>

      {/* STATUS NOTIFICATION BANNER */}
      {statusMessage && (
        <div className="bg-emerald-500 text-white text-center py-2 px-4 text-sm font-bold animate-fade-in flex-none">
          {statusMessage}
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div className="flex-none bg-white border-b border-slate-200 px-4 sm:px-8 overflow-x-auto no-scrollbar">
        <div className="flex space-x-2 sm:space-x-4 min-w-max py-2">
          {[
            { id: 'general', label: 'General', icon: Sliders },
            { id: 'tracing', label: 'Tracing', icon: Edit2 },
            { id: 'audio', label: 'Audio', icon: Volume2 },
            { id: 'visual', label: 'Visual', icon: Eye },
            { id: 'words', label: 'Words', icon: Star },
            { id: 'data', label: 'Data & Backup', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabKey)}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-base flex items-center gap-2 transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TAB CONTENT */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full pb-[calc(2rem+var(--safe-bottom))]">
        {/* 1. GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Word Length Filtering */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200">
              <h3 className="text-xl font-black text-slate-800 mb-1">Word Length</h3>
              <p className="text-sm text-slate-500 mb-4">Choose which word lengths are active in the tracing rotation:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[3, 4, 5, 6].map((len) => {
                  const isChecked = settings.enabledWordLengths.includes(len);
                  return (
                    <button
                      key={`len-${len}`}
                      onClick={() => toggleLength(len)}
                      className={`p-4 rounded-2xl border-2 font-black text-lg flex items-center justify-between transition ${
                        isChecked
                          ? 'border-sky-500 bg-sky-50 text-sky-800'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <span>{len} Letters</span>
                      {isChecked && <Check className="w-6 h-6 text-sky-600 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter for Tracing */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200">
              <h3 className="text-xl font-black text-slate-800 mb-1">Active Practice Category</h3>
              <p className="text-sm text-slate-500 mb-4">Focus tracing on all words or a specific category:</p>
              <select
                value={settings.selectedCategory}
                onChange={(e) => updateSetting('selectedCategory', e.target.value)}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-slate-200 font-bold text-slate-700 bg-slate-50 outline-none"
              >
                <option value="all">All Categories</option>
                <option value="my-words">⭐ My Words (Favorites Only)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Randomization & Auto Next */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200 space-y-5">
              <h3 className="text-xl font-black text-slate-800 mb-2">Practice Flow</h3>

              {/* Random Words */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-lg">Randomize Words</span>
                  <span className="text-sm text-slate-500">Shuffle words randomly when starting</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.randomWords}
                  onChange={(e) => updateSetting('randomWords', e.target.checked)}
                  className="w-7 h-7 accent-sky-600 rounded cursor-pointer"
                />
              </div>

              <hr className="border-slate-100" />

              {/* Auto Next */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-lg">Auto-Advance Next Word</span>
                  <span className="text-sm text-slate-500">Automatically proceed after completion</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoNext}
                  onChange={(e) => updateSetting('autoNext', e.target.checked)}
                  className="w-7 h-7 accent-sky-600 rounded cursor-pointer"
                />
              </div>

              <hr className="border-slate-100" />

              {/* Parent Gate Type */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800 block text-lg">Parent Gate Protection</span>
                  <span className="text-sm text-slate-500">Prevent child from accidentally entering Settings</span>
                </div>
                <select
                  value={settings.parentGateType}
                  onChange={(e) => updateSetting('parentGateType', e.target.value as ParentGateType)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-slate-700 bg-slate-50"
                >
                  <option value="hold">Hold for 3 Seconds</option>
                  <option value="math">Adult Math Challenge</option>
                  <option value="none">Disabled (Direct)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 2. TRACING TAB */}
        {activeTab === 'tracing' && (
          <div className="space-y-6">
            {/* Difficulty Level */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200">
              <h3 className="text-xl font-black text-slate-800 mb-1">Tracing Difficulty</h3>
              <p className="text-sm text-slate-500 mb-4">Adjust path thickness and margin of tolerance:</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'easy',
                    title: 'Easy',
                    desc: 'Very thick tracing path, large tolerance, strong directional guidance.',
                  },
                  {
                    id: 'medium',
                    title: 'Medium',
                    desc: 'Moderate path width and tolerance for developing motor skills.',
                  },
                  {
                    id: 'advanced',
                    title: 'Advanced',
                    desc: 'Thin guide, smaller tolerance, encourages independent writing.',
                  },
                ].map((d) => {
                  const isSelected = settings.tracingDifficulty === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => updateSetting('tracingDifficulty', d.id as TracingDifficulty)}
                      className={`p-5 rounded-2xl border-2 text-left flex flex-col justify-between transition ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl font-black">{d.title}</span>
                        {isSelected && <Check className="w-6 h-6 text-sky-600 stroke-[3]" />}
                      </div>
                      <p className="text-xs text-slate-500">{d.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Guides */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200 space-y-5">
              <h3 className="text-xl font-black text-slate-800 mb-2">Visual Guidance</h3>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-lg">Show Directional Arrows</span>
                  <span className="text-sm text-slate-500">Displays animated chevrons pointing the stroke direction</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showArrows}
                  onChange={(e) => updateSetting('showArrows', e.target.checked)}
                  className="w-7 h-7 accent-sky-600 rounded cursor-pointer"
                />
              </div>

              <hr className="border-slate-100" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-lg">Show Starting Point Indicator</span>
                  <span className="text-sm text-slate-500">Pulsing golden ring showing where to begin</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showStartPoint}
                  onChange={(e) => updateSetting('showStartPoint', e.target.checked)}
                  className="w-7 h-7 accent-sky-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. AUDIO TAB */}
        {activeTab === 'audio' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200 space-y-5">
              <h3 className="text-xl font-black text-slate-800 mb-2">Voice & Pronunciation</h3>

              {/* Phonics Sound */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-lg">Say Letter Phonics Sounds</span>
                  <span className="text-sm text-slate-500">
                    Speaks phonetic sound (B → "buh", A → "ah") when completing a letter
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.phonicsEnabled}
                  onChange={(e) => updateSetting('phonicsEnabled', e.target.checked)}
                  className="w-7 h-7 accent-sky-600 rounded cursor-pointer"
                />
              </div>

              <hr className="border-slate-100" />

              {/* Word Sound */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-lg">Speak Whole Word on Completion</span>
                  <span className="text-sm text-slate-500">Pronounces whole word (e.g. "BALL")</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.wordAudioEnabled}
                  onChange={(e) => updateSetting('wordAudioEnabled', e.target.checked)}
                  className="w-7 h-7 accent-sky-600 rounded cursor-pointer"
                />
              </div>

              <hr className="border-slate-100" />

              {/* Celebration Melody */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-lg">Gentle Celebration Chimes</span>
                  <span className="text-sm text-slate-500">Soft sensory-friendly marimba music on success</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.celebrationEnabled}
                  onChange={(e) => updateSetting('celebrationEnabled', e.target.checked)}
                  className="w-7 h-7 accent-sky-600 rounded cursor-pointer"
                />
              </div>

              <hr className="border-slate-100" />

              {/* Volume Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 text-lg">Sound Volume</span>
                  <span className="font-bold text-sky-700">{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => updateSetting('soundVolume', parseFloat(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Test Audio Button */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => speakWord('BALL')}
                  className="px-5 py-2.5 rounded-xl bg-sky-50 text-sky-700 font-bold border border-sky-200 hover:bg-sky-100 flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Test Word Voice</span>
                </button>
                <button
                  type="button"
                  onClick={() => playCelebrationMelody(settings.soundVolume)}
                  className="px-5 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-200 hover:bg-purple-100 flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Test Chime</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. VISUAL TAB */}
        {activeTab === 'visual' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200 space-y-5">
              <h3 className="text-xl font-black text-slate-800 mb-2">Visual Style & Sensory Comfort</h3>

              {/* Celebration Style */}
              <div>
                <label className="block font-bold text-slate-800 text-lg mb-2">
                  Celebration Animation Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'stars', label: '⭐ Stars' },
                    { id: 'balloons', label: '🎈 Balloons' },
                    { id: 'sparkles', label: '✨ Sparkles' },
                    { id: 'confetti', label: '🎉 Confetti' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => updateSetting('celebrationStyle', style.id as CelebrationStyle)}
                      className={`p-3.5 rounded-2xl border-2 font-black text-base flex items-center justify-between transition ${
                        settings.celebrationStyle === style.id
                          ? 'border-sky-500 bg-sky-50 text-sky-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>{style.label}</span>
                      {settings.celebrationStyle === style.id && <Check className="w-5 h-5 text-sky-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-lg">Reduced Motion</span>
                  <span className="text-sm text-slate-500">Minimizes all UI animations for sensory calming</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => {
                    updateSetting('reducedMotion', e.target.checked);
                    if (e.target.checked) {
                      document.documentElement.classList.add('reduced-motion');
                    } else {
                      document.documentElement.classList.remove('reduced-motion');
                    }
                  }}
                  className="w-7 h-7 accent-sky-600 rounded cursor-pointer"
                />
              </div>

              <hr className="border-slate-100" />

              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-lg">High Contrast Mode</span>
                  <span className="text-sm text-slate-500">Dark high-contrast background with crisp white cards</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => {
                    updateSetting('highContrast', e.target.checked);
                    if (e.target.checked) {
                      document.documentElement.classList.add('high-contrast');
                    } else {
                      document.documentElement.classList.remove('high-contrast');
                    }
                  }}
                  className="w-7 h-7 accent-sky-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. WORDS TAB */}
        {activeTab === 'words' && (
          <div className="space-y-6">
            {/* Top actions bar */}
            <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
              {/* Search & Category Filter */}
              <div className="flex flex-1 w-full gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search words..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 font-bold text-slate-700 bg-slate-50 outline-none focus:border-sky-500"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="py-2.5 px-3 rounded-2xl border border-slate-200 font-bold text-slate-700 bg-slate-50"
                >
                  <option value="all">All</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Word Button */}
              <button
                onClick={() => {
                  setEditingWord(null);
                  setIsWordModalOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-black text-base shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>Add Word</span>
              </button>
            </div>

            {/* Words List */}
            <div className="bg-white rounded-3xl shadow-soft border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50 flex items-center justify-between text-xs font-black text-slate-500 uppercase tracking-wider">
                <span>Word ({filteredWords.length})</span>
                <span>Actions</span>
              </div>

              {filteredWords.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-bold">
                  No matching words found.
                </div>
              ) : (
                filteredWords.map((word) => (
                  <div
                    key={`word-item-${word.id}`}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      {/* Image Thumbnail */}
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 p-0.5 flex-none flex items-center justify-center border border-slate-200">
                        <WordImage word={word} isThumbnail className="w-full h-full" />
                      </div>

                      {/* Word Name & Category */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-slate-800">{word.text}</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold text-xs">
                            {word.length}L
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-semibold capitalize">
                          {categories.find((c) => c.id === word.categoryId)?.name || word.categoryId}
                        </span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Favorite Toggle */}
                      <button
                        onClick={() => handleToggleWordFav(word)}
                        aria-label="Toggle Favorite"
                        className={`p-2 rounded-xl transition ${
                          word.favorite ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-slate-400'
                        }`}
                      >
                        <Star className={`w-6 h-6 ${word.favorite ? 'fill-current' : ''}`} />
                      </button>

                      {/* Enabled Toggle */}
                      <button
                        onClick={() => handleToggleWordEnabled(word)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                          word.enabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {word.enabled ? 'Active' : 'Hidden'}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditingWord(word);
                          setIsWordModalOpen(true);
                        }}
                        aria-label="Edit Word"
                        className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteWord(word.id, word.text)}
                        aria-label="Delete Word"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 6. DATA & BACKUP TAB */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* Backup & Restore */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200">
              <h3 className="text-xl font-black text-slate-800 mb-1">Backup & Restore</h3>
              <p className="text-sm text-slate-500 mb-5">
                Export all custom words, settings, and progress to a single portable JSON file, or restore on another device.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export */}
                <button
                  onClick={handleExportBackup}
                  className="p-5 rounded-2xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 text-sky-800 font-extrabold flex items-center justify-center gap-3 transition active:scale-95"
                >
                  <Download className="w-6 h-6 text-sky-600" />
                  <span>EXPORT BACKUP</span>
                </button>

                {/* Import */}
                <label className="p-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-emerald-800 font-extrabold flex items-center justify-center gap-3 cursor-pointer transition active:scale-95">
                  <Upload className="w-6 h-6 text-emerald-600" />
                  <span>IMPORT BACKUP</span>
                  <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                </label>
              </div>
            </div>

            {/* Reset Actions */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-rose-100 space-y-4">
              <h3 className="text-xl font-black text-rose-900 mb-1">Reset Options</h3>
              <p className="text-sm text-slate-500 mb-4">
                Use caution when resetting data:
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleResetProgress}
                  className="px-6 py-3.5 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-sm transition active:scale-95"
                >
                  Reset Progress Stats
                </button>

                <button
                  onClick={handleResetDefaults}
                  className="px-6 py-3.5 rounded-2xl border-2 border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-extrabold text-sm transition active:scale-95"
                >
                  Restore Factory Defaults
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
