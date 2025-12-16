import { useEffect, useMemo, useState } from 'react';
import { getRecipeImage } from '../../utils/recipeImages.js';

export function ImageWithFallback({ src, alt, className, fallbackSrc, ...props }) {
  const candidates = useMemo(() => {
    const recipeImage = getRecipeImage(alt);
    const generic = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=60';
    const list = [src, recipeImage, fallbackSrc, generic]
      .map((v) => (typeof v === 'string' ? v.trim() : ''))
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [src, alt, fallbackSrc]);

  const [idx, setIdx] = useState(0);
  const [imgSrc, setImgSrc] = useState(() => candidates[0] || '');

  useEffect(() => {
    setIdx(0);
    setImgSrc(candidates[0] || '');
  }, [candidates]);

  const handleError = () => {
    // Try recipe-specific fallback first
    const next = Math.min(candidates.length - 1, idx + 1);
    if (next !== idx) {
      setIdx(next);
      setImgSrc(candidates[next]);
      return;
    }
    // Final fallback to generic food image
    if (candidates.length) setImgSrc(candidates[candidates.length - 1]);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
