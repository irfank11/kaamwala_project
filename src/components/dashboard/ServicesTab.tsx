import { useState, type FormEvent } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { replaceWorkerCategories } from '@/services/workers';
import { buttonPrimary, cardClass, inputClass } from '@/lib/styles';
import { resolveIcon } from '@/lib/icons';
import type { ServiceCategory } from '@/lib/types';
import { FormFeedback, type FeedbackMessage } from '@/components/ui/FormFeedback';
import type { TabProps } from '@/components/dashboard/tabProps';

interface ServicesTabProps extends TabProps {
  categories: ServiceCategory[];
}

export default function ServicesTab({ worker, categories, onSaved }: ServicesTabProps) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(worker.worker_categories.map((link) => [link.category.id, link.expertise])),
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const activeCategories = categories.filter((category) => category.is_active);

  const toggle = (categoryId: string) => {
    setSelected((current) => {
      const next = { ...current };
      if (categoryId in next) delete next[categoryId];
      else next[categoryId] = '';
      return next;
    });
  };

  const updateExpertise = (categoryId: string, expertise: string) => {
    setSelected((current) => ({ ...current, [categoryId]: expertise }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const links = Object.entries(selected).map(([category_id, expertise]) => ({
      category_id,
      expertise: expertise.trim(),
    }));
    if (links.length === 0) {
      setFeedback({ tone: 'error', text: 'Choose at least one service you offer.' });
      return;
    }
    if (links.some((link) => link.expertise.length > 200)) {
      setFeedback({ tone: 'error', text: 'Keep each expertise note under 200 characters.' });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      await replaceWorkerCategories(worker.id, links);
      await onSaved();
      setFeedback({ tone: 'success', text: 'Services saved.' });
    } catch {
      setFeedback({ tone: 'error', text: "We couldn't save your services. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} space-y-6 p-6 sm:p-8`}>
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Services you offer</h2>
        <p className="text-sm text-slate-500">Pick every category that describes your work and add a short note on your expertise.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {activeCategories.map((category) => {
          const isOn = category.id in selected;
          const Icon = resolveIcon(category.icon);
          return (
            <div
              key={category.id}
              className={`rounded-2xl border-2 p-4 transition duration-300 ${
                isOn ? 'border-brand-500 bg-brand-50/60' : 'border-slate-200 bg-white hover:border-brand-200'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(category.id)}
                aria-pressed={isOn}
                className="flex w-full items-center gap-3 text-left"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isOn ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex-1 text-sm font-bold text-slate-900">{category.name}</span>
                {isOn ? (
                  <CheckCircle2 className="h-5 w-5 text-brand-600" aria-hidden="true" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300" aria-hidden="true" />
                )}
              </button>
              {isOn && (
                <input
                  aria-label={`Expertise in ${category.name}`}
                  value={selected[category.id]}
                  onChange={(event) => updateExpertise(category.id, event.target.value)}
                  maxLength={200}
                  placeholder="e.g. MCB and wiring repairs"
                  className={`${inputClass} mt-3 py-2.5`}
                />
              )}
            </div>
          );
        })}
      </div>

      <FormFeedback message={feedback} />
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={buttonPrimary}>
          {saving ? 'Saving...' : 'Save services'}
        </button>
      </div>
    </form>
  );
}
