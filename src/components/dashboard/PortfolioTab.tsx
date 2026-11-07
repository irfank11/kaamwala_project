import { useState, type FormEvent } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { addPortfolioImage, deletePortfolioImage } from '@/services/workers';
import { uploadImage, validateImageFile } from '@/services/media';
import { buttonDanger, buttonPrimary, cardClass, inputClass, labelClass } from '@/lib/styles';
import { FormFeedback, type FeedbackMessage } from '@/components/ui/FormFeedback';
import { EmptyState } from '@/components/ui/States';
import type { TabProps } from '@/components/dashboard/tabProps';

const MAX_PORTFOLIO_IMAGES = 24;

export default function PortfolioTab({ worker, onSaved }: TabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const images = worker.portfolio_images;
  const full = images.length >= MAX_PORTFOLIO_IMAGES;

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setFeedback({ tone: 'error', text: 'Choose a photo of your work first.' });
      return;
    }
    const problem = validateImageFile(file);
    if (problem) {
      setFeedback({ tone: 'error', text: problem });
      return;
    }
    if (caption.trim().length > 120) {
      setFeedback({ tone: 'error', text: 'Captions can be up to 120 characters.' });
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      const url = await uploadImage(worker.id, file, 'portfolio');
      await addPortfolioImage(worker.id, url, caption.trim());
      setFile(null);
      setCaption('');
      (event.target as HTMLFormElement).reset();
      await onSaved();
      setFeedback({ tone: 'success', text: 'Photo added to your portfolio.' });
    } catch {
      setFeedback({ tone: 'error', text: "We couldn't add that photo. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId);
    setFeedback(null);
    try {
      await deletePortfolioImage(imageId);
      await onSaved();
    } catch {
      setFeedback({ tone: 'error', text: "We couldn't remove that photo. Please try again." });
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleUpload} className={`${cardClass} space-y-5 p-6 sm:p-8`}>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Portfolio</h2>
          <p className="text-sm text-slate-500">
            Show finished work. {images.length} of {MAX_PORTFOLIO_IMAGES} photos used.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_1fr]">
          <div>
            <label htmlFor="portfolio-file" className={labelClass}>Photo (JPG, PNG or WebP, up to 5 MB)</label>
            <input
              id="portfolio-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={full || busy}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-50 file:px-4 file:py-2.5 file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>
          <div>
            <label htmlFor="portfolio-caption" className={labelClass}>Caption (optional)</label>
            <input
              id="portfolio-caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              maxLength={120}
              disabled={full || busy}
              placeholder="e.g. Kitchen rewiring"
              className={inputClass}
            />
          </div>
        </div>

        <FormFeedback message={feedback} />
        <div className="flex justify-end">
          <button type="submit" disabled={busy || full || !file} className={buttonPrimary}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="h-4 w-4" aria-hidden="true" />}
            {busy ? 'Uploading...' : full ? 'Portfolio full' : 'Add photo'}
          </button>
        </div>
      </form>

      {images.length === 0 ? (
        <EmptyState title="No photos yet" description="Add a few photos of finished jobs to build trust with customers." />
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((image) => (
            <li key={image.id} className={`${cardClass} overflow-hidden`}>
              <img src={image.image_url} alt={image.caption || 'Portfolio photo'} loading="lazy" className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="truncate text-xs font-semibold text-slate-600">{image.caption || 'No caption'}</p>
                {confirmId === image.id ? (
                  <button type="button" onClick={() => handleDelete(image.id)} disabled={deletingId === image.id} className={buttonDanger}>
                    {deletingId === image.id ? 'Removing...' : 'Confirm'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(image.id)}
                    aria-label="Remove photo"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
