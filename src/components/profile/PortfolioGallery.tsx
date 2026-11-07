import { useState } from 'react';
import { X } from 'lucide-react';
import type { PortfolioImage } from '@/lib/types';
import { cardClass } from '@/lib/styles';
import { useEscapeKey } from '@/hooks/useEscapeKey';

export default function PortfolioGallery({ images }: { images: PortfolioImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  useEscapeKey(() => setOpenIndex(null), openIndex !== null);

  if (images.length === 0) {
    return (
      <div className={`${cardClass} p-8 text-center text-sm text-slate-500`}>No portfolio photos added yet.</div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-card ring-1 ring-slate-900/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
            aria-label={image.caption || `Portfolio photo ${index + 1}`}
          >
            <img
              src={image.image_url}
              alt={image.caption || 'Portfolio photo'}
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />
            {image.caption && (
              <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-slate-950/80 to-transparent px-3 pb-3 pt-8 text-left text-xs font-semibold text-white transition duration-300 group-hover:translate-y-0">
                {image.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio photo"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm animate-fade-up"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close photo"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <img
            src={images[openIndex].image_url}
            alt={images[openIndex].caption || 'Portfolio photo'}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
          {images[openIndex].caption && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
              {images[openIndex].caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}
