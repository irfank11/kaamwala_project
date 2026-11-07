import { useState, type FormEvent } from 'react';
import { saveWorkerProfile } from '@/services/workers';
import { buttonPrimary, cardClass, inputClass, labelClass } from '@/lib/styles';
import { FormFeedback, type FeedbackMessage } from '@/components/ui/FormFeedback';
import type { TabProps } from '@/components/dashboard/tabProps';

const MAX_SKILLS = 12;

export default function ProfileTab({ worker, onSaved }: TabProps) {
  const [headline, setHeadline] = useState(worker.headline);
  const [bio, setBio] = useState(worker.bio);
  const [years, setYears] = useState(String(worker.years_experience));
  const [skills, setSkills] = useState(worker.skills.join(', '));
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanHeadline = headline.trim();
    const cleanBio = bio.trim();
    const yearsValue = Number(years);
    const skillList = [...new Set(skills.split(',').map((skill) => skill.trim()).filter(Boolean))];

    if (cleanHeadline.length < 3 || cleanHeadline.length > 120) {
      setFeedback({ tone: 'error', text: 'Headline should be between 3 and 120 characters.' });
      return;
    }
    if (cleanBio.length > 1000) {
      setFeedback({ tone: 'error', text: 'Your bio can be up to 1000 characters.' });
      return;
    }
    if (!Number.isInteger(yearsValue) || yearsValue < 0 || yearsValue > 60) {
      setFeedback({ tone: 'error', text: 'Years of experience should be a whole number between 0 and 60.' });
      return;
    }
    if (skillList.length > MAX_SKILLS || skillList.some((skill) => skill.length > 30)) {
      setFeedback({ tone: 'error', text: `Add up to ${MAX_SKILLS} skills, each under 30 characters.` });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      await saveWorkerProfile(worker.id, {
        headline: cleanHeadline,
        bio: cleanBio,
        years_experience: yearsValue,
        skills: skillList,
      });
      await onSaved();
      setFeedback({ tone: 'success', text: 'Profile saved.' });
    } catch {
      setFeedback({ tone: 'error', text: "We couldn't save your profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} space-y-6 p-6 sm:p-8`}>
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Your profile</h2>
        <p className="text-sm text-slate-500">This is the first thing customers read when they find you.</p>
      </div>

      <div>
        <label htmlFor="profile-headline" className={labelClass}>Headline</label>
        <input
          id="profile-headline"
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
          placeholder="e.g. Certified electrician for homes and offices"
          maxLength={120}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="profile-bio" className={labelClass}>About you</label>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={5}
          maxLength={1000}
          placeholder="Describe the work you do, how you work and what makes you reliable."
          className={inputClass}
        />
        <p className="mt-1.5 text-right text-xs text-slate-400">{bio.trim().length}/1000</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-years" className={labelClass}>Years of experience</label>
          <input
            id="profile-years"
            type="number"
            min={0}
            max={60}
            value={years}
            onChange={(event) => setYears(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="profile-skills" className={labelClass}>Skills</label>
          <input
            id="profile-skills"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            placeholder="Wiring, MCB repair, Inverter setup"
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-slate-400">Separate skills with commas.</p>
        </div>
      </div>

      <FormFeedback message={feedback} />
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={buttonPrimary}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </div>
    </form>
  );
}
