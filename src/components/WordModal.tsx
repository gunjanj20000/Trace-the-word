import React, { useState, useRef, useEffect } from 'react';
import { Word, Category } from '../types';
import { saveWord, saveMediaItem, getMediaItem } from '../services/db';
import { speakWord } from '../services/audio';
import { X, Upload, Mic, Square, Play, Volume2, Check } from 'lucide-react';
import { WordImage } from './WordImage';

interface WordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (word: Word) => void;
  editingWord?: Word | null;
  categories: Category[];
}

export const WordModal: React.FC<WordModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  editingWord,
  categories,
}) => {
  const [text, setText] = useState('');
  const [categoryId, setCategoryId] = useState('things');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const newImageFileRef = useRef<{ data: string; mimeType: string } | null>(null);
  const newAudioBlobRef = useRef<{ data: string; mimeType: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingWord) {
        setText(editingWord.text);
        setCategoryId(editingWord.categoryId);
        // Load custom image or audio if available
        if (editingWord.imageId) {
          getMediaItem(editingWord.imageId).then((item) => {
            if (item) setImagePreview(item.data);
          });
        } else {
          setImagePreview(null);
        }
        if (editingWord.audioId) {
          getMediaItem(editingWord.audioId).then((item) => {
            if (item) setAudioPreviewUrl(item.data);
          });
        } else {
          setAudioPreviewUrl(null);
        }
      } else {
        setText('');
        setCategoryId(categories[0]?.id || 'things');
        setImagePreview(null);
        setAudioPreviewUrl(null);
      }
      newImageFileRef.current = null;
      newAudioBlobRef.current = null;
    }
  }, [isOpen, editingWord, categories]);

  if (!isOpen) return null;

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      newImageFileRef.current = { data: dataUrl, mimeType: file.type };
    };
    reader.readAsDataURL(file);
  };

  // Handle Audio File Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAudioPreviewUrl(dataUrl);
      newAudioBlobRef.current = { data: dataUrl, mimeType: file.type };
    };
    reader.readAsDataURL(file);
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert('Audio recording is not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setAudioPreviewUrl(dataUrl);
          newAudioBlobRef.current = { data: dataUrl, mimeType: 'audio/webm' };
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Play Audio Preview
  const playAudioPreview = () => {
    if (audioPreviewUrl) {
      const audio = new Audio(audioPreviewUrl);
      audio.play().catch(console.warn);
    } else if (text.trim()) {
      speakWord(text.trim());
    }
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWord = text.trim().toUpperCase();
    if (!cleanWord) return;

    setIsSaving(true);

    try {
      const wordId = editingWord ? editingWord.id : `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      let imageId = editingWord?.imageId;
      let audioId = editingWord?.audioId;

      // Save new image if uploaded
      if (newImageFileRef.current) {
        imageId = `img-${wordId}`;
        await saveMediaItem(imageId, 'image', newImageFileRef.current.data, newImageFileRef.current.mimeType);
      }

      // Save new audio if uploaded or recorded
      if (newAudioBlobRef.current) {
        audioId = `aud-${wordId}`;
        await saveMediaItem(audioId, 'audio', newAudioBlobRef.current.data, newAudioBlobRef.current.mimeType);
      }

      const wordToSave: Word = {
        id: wordId,
        text: cleanWord,
        length: cleanWord.length,
        categoryId,
        builtInImage: editingWord?.builtInImage,
        imageId,
        audioId,
        enabled: editingWord ? editingWord.enabled : true,
        favorite: editingWord ? editingWord.favorite : false,
        createdAt: editingWord ? editingWord.createdAt : Date.now(),
      };

      await saveWord(wordToSave);
      onSaved(wordToSave);
      onClose();
    } catch (err) {
      console.error('Failed to save word:', err);
      alert('Could not save word. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">
            {editingWord ? 'Edit Word' : 'Add New Word'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* WORD TEXT INPUT */}
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
              Word (Uppercase)
            </label>
            <input
              type="text"
              required
              autoFocus
              maxLength={8}
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              placeholder="e.g. STAR"
              className="w-full text-3xl font-black text-sky-700 tracking-wider py-3 px-4 rounded-2xl border-2 border-slate-200 focus:border-sky-500 bg-slate-50 uppercase outline-none"
            />
          </div>

          {/* CATEGORY SELECT */}
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full py-3 px-4 rounded-2xl border-2 border-slate-200 focus:border-sky-500 bg-slate-50 font-bold text-slate-700 outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* IMAGE SECTION */}
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
              Word Image
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden flex-none">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                ) : editingWord ? (
                  <WordImage word={editingWord} className="w-full h-full" />
                ) : (
                  <span className="text-xs text-slate-400 font-bold text-center px-1">No Image</span>
                )}
              </div>

              <label className="cursor-pointer px-4 py-3 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-2xl font-bold text-sm flex items-center gap-2 transition active:scale-95">
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* AUDIO SECTION */}
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
              Word Audio
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {/* Record Mic Button */}
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-sm flex items-center gap-2 animate-pulse shadow-md"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Recording</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm flex items-center gap-2 transition active:scale-95"
                >
                  <Mic className="w-4 h-4 text-rose-500" />
                  <span>Record Voice</span>
                </button>
              )}

              {/* Upload audio file */}
              <label className="cursor-pointer px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm flex items-center gap-2 transition active:scale-95">
                <Upload className="w-4 h-4 text-sky-500" />
                <span>Upload Audio</span>
                <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
              </label>

              {/* Playback Test */}
              <button
                type="button"
                onClick={playAudioPreview}
                className="px-4 py-3 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-2xl font-bold text-sm flex items-center gap-2 transition"
              >
                <Volume2 className="w-4 h-4" />
                <span>Test Audio</span>
              </button>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !text.trim()}
              className="px-8 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold shadow-lg flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <Check className="w-5 h-5" />
              <span>{isSaving ? 'Saving...' : 'Save Word'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
