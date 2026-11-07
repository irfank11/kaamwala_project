import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfileDetails } from '@/services/profiles';
import { uploadImage, validateImageFile } from '@/services/media';
import { buttonPrimary, buttonSecondary, cardClass, containerClass, inputClass, labelClass } from '@/lib/styles';
import { formatJoinDate } from '@/lib/format';
import { Avatar } from '@/components/ui/Avatar';
import { FormFeedback, type FeedbackMessage } from '@/components/ui/FormFeedback';

export default function AccountPage() {
  const { session, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name);
    setPhone(profile.phone);
    setCity(profile.city);
    setAvatarUrl(profile.avatar_url);
  }, [profile]);

  if (!session || !profile) return null;

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setMessage({ tone: 'error', text: problem });
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      setAvatarUrl(await uploadImage(session.user.id, file, 'avatar'));
    } catch {
      setMessage({ tone: 'error', text: "We couldn't upload that photo. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fullName.trim().length < 2) {
      setMessage({ tone: 'error', text: 'Please enter your full name.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await updateProfileDetails(session.user.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        avatar_url: avatarUrl,
      });
      await refreshProfile();
      setMessage({ tone: 'success', text: 'Your details are saved.' });
    } catch {
      setMessage({ tone: 'error', text: "We couldn't save your details. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className={`${containerClass} grid gap-8 lg:grid-cols-[18rem_1fr]`}>
        <aside className={`${cardClass} flex flex-col items-center gap-4 p-6 text-center lg:sticky lg:top-24 lg:self-start`}>
          <div className="relative">
            <Avatar src={avatarUrl} name={fullName || 'You'} size="lg" />
            <label className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:scale-110 hover:bg-brand-700">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Camera className="h-4 w-4" aria-hidden="true" />}
              <span className="sr-only">Upload profile photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={(event) => handlePhoto(event.target.files?.[0])}
              />
            </label>
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900">{profile.full_name || 'Your name'}</p>
            <p className="text-sm capitalize text-slate-500">{profile.role} account</p>
            <p className="mt-1 text-xs text-slate-400">Joined {formatJoinDate(profile.created_at)}</p>
          </div>
          {profile.role === 'worker' && (
            <Link to="/dashboard" className={`${buttonSecondary} w-full`}>
              Go to my dashboard
            </Link>
          )}
        </aside>

        <form onSubmit={handleSubmit} className={`${cardClass} space-y-6 p-6 sm:p-8`}>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">My details</h1>
            <p className="text-sm text-slate-500">Professionals see your name and phone number when you book or review them.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="account-name" className={labelClass}>Full name</label>
              <input id="account-name" value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={100} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="account-phone" className={labelClass}>Phone number</label>
              <input id="account-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={20} placeholder="e.g. 98765 43210" className={inputClass} />
            </div>
            <div>
              <label htmlFor="account-city" className={labelClass}>City</label>
              <input id="account-city" value={city} onChange={(event) => setCity(event.target.value)} maxLength={100} className={inputClass} />
            </div>
          </div>

          <FormFeedback message={message} />

          <div className="flex justify-end">
            <button type="submit" disabled={saving || uploading} className={buttonPrimary}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
