import { useState, type FormEvent } from 'react';
import { createCategory, setCategoryActive, fetchCategories } from '@/services/categories';
import { SERVICE_ICONS, resolveIcon } from '@/lib/icons';
import { buttonPrimary, buttonSecondary, cardClass, inputClass, labelClass } from '@/lib/styles';
import { FormFeedback, type FeedbackMessage } from '@/components/ui/FormFeedback';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useAsyncList } from '@/hooks/useAsyncList';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminCategories() {
  const { items: categories, loading, error, reload } = useAsyncList(fetchCategories);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(Object.keys(SERVICE_ICONS)[0]);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanSlug = slug.trim();
    if (cleanName.length < 2 || cleanName.length > 60) {
      setFeedback({ tone: 'error', text: 'Category names should be 2 to 60 characters.' });
      return;
    }
    if (!SLUG_PATTERN.test(cleanSlug) || cleanSlug.length > 60) {
      setFeedback({ tone: 'error', text: 'The web address can only use lowercase letters, numbers and single hyphens.' });
      return;
    }
    if (description.trim().length > 300) {
      setFeedback({ tone: 'error', text: 'Descriptions can be up to 300 characters.' });
      return;
    }
    if (categories.some((category) => category.slug === cleanSlug)) {
      setFeedback({ tone: 'error', text: 'A category with this web address already exists.' });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      await createCategory({ name: cleanName, slug: cleanSlug, description: description.trim(), icon });
      setName('');
      setSlug('');
      setDescription('');
      setFeedback({ tone: 'success', text: `${cleanName} is now a category.` });
      reload();
    } catch {
      setFeedback({ tone: 'error', text: "We couldn't create that category. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    setTogglingId(id);
    setFeedback(null);
    try {
      await setCategoryActive(id, !isActive);
      reload();
    } catch {
      setFeedback({ tone: 'error', text: "We couldn't update that category." });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
      <form onSubmit={handleCreate} className={`${cardClass} h-fit space-y-5 p-6 lg:sticky lg:top-24`}>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Add a category</h2>
          <p className="text-sm text-slate-500">New categories appear in the search filters and on the home page.</p>
        </div>
        <div>
          <label htmlFor="category-name" className={labelClass}>Name</label>
          <input
            id="category-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setSlug(slugify(event.target.value));
            }}
            maxLength={60}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="category-slug" className={labelClass}>Web address</label>
          <input id="category-slug" value={slug} onChange={(event) => setSlug(event.target.value)} maxLength={60} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="category-description" className={labelClass}>Description</label>
          <textarea id="category-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={300} className={inputClass} />
        </div>
        <div>
          <label htmlFor="category-icon" className={labelClass}>Icon</label>
          <select id="category-icon" value={icon} onChange={(event) => setIcon(event.target.value)} className={inputClass}>
            {Object.keys(SERVICE_ICONS).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <FormFeedback message={feedback} />
        <button type="submit" disabled={saving} className={`${buttonPrimary} w-full`}>
          {saving ? 'Adding...' : 'Add category'}
        </button>
      </form>

      <div>
        {loading ? (
          <LoadingState label="Loading categories..." />
        ) : error ? (
          <ErrorState message="We couldn't load categories." onRetry={reload} />
        ) : categories.length === 0 ? (
          <EmptyState title="No categories yet" description="Add your first service category to get started." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {categories.map((category) => {
              const Icon = resolveIcon(category.icon);
              return (
                <li key={category.id} className={`${cardClass} flex items-start gap-4 p-5`}>
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${category.is_active ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-bold text-slate-900">{category.name}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${category.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {category.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs text-slate-500">{category.description || 'No description'}</p>
                    <button
                      type="button"
                      disabled={togglingId === category.id}
                      onClick={() => toggleActive(category.id, category.is_active)}
                      className={`${buttonSecondary} !px-3 !py-1.5 text-xs`}
                    >
                      {category.is_active ? 'Hide category' : 'Show category'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
