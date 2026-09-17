import React, { useEffect, useState } from 'react';
import { Word } from '../types';
import { ILLUSTRATIONS, DefaultPlaceholder } from '../data/illustrations';
import { getMediaItem } from '../services/db';

interface WordImageProps {
  word: Word;
  className?: string;
  isThumbnail?: boolean;
}

export const WordImage: React.FC<WordImageProps> = ({
  word,
  className = 'w-64 h-64',
  isThumbnail = false,
}) => {
  const [customImageData, setCustomImageData] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (word.imageId) {
      getMediaItem(word.imageId).then((item) => {
        if (isMounted && item) {
          setCustomImageData(item.data);
        }
      });
    } else {
      setCustomImageData(null);
    }
    return () => {
      isMounted = false;
    };
  }, [word.imageId]);

  const paddingClass = isThumbnail ? 'p-1' : 'p-3 sm:p-5';
  const roundedClass = isThumbnail ? 'rounded-xl' : 'rounded-3xl';
  const shadowClass = isThumbnail ? '' : 'shadow-soft';

  // 1. If custom uploaded image exists
  if (customImageData) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden ${roundedClass} bg-white ${shadowClass} ${paddingClass} ${className}`}>
        <img
          src={customImageData}
          alt={word.text}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  // 2. If built-in vector illustration exists
  if (word.builtInImage && ILLUSTRATIONS[word.builtInImage.toLowerCase()]) {
    const Component = ILLUSTRATIONS[word.builtInImage.toLowerCase()];
    return (
      <div className={`relative flex items-center justify-center ${roundedClass} bg-white/90 ${shadowClass} ${paddingClass} ${className}`}>
        <Component className="w-full h-full object-contain filter drop-shadow-sm" />
      </div>
    );
  }

  // 3. Fallback placeholder
  return (
    <div className={`relative flex items-center justify-center ${roundedClass} bg-white/90 ${shadowClass} ${paddingClass} ${className}`}>
      <DefaultPlaceholder className="w-full h-full object-contain" wordText={word.text} />
    </div>
  );
};
