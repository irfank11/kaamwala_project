import { useState, type FormEvent } from 'react';
import { saveWorkerProfile } from '@/services/workers';
import { buttonPrimary, cardClass, inputClass, labelClass } from '@/lib/styles';
import { DAYS, PRICING_OPTIONS } from '@/lib/format';
import type { DayKey, PricingType } from '@/lib/types';
import { FormFeedback, type FeedbackMessage } from '@/components/ui/FormFeedback';
import type { TabProps } from '@/components/dashboard/tabProps';

const MAX_PRICE = 1000000;

export default function ScheduleTab({ worker, onSaved }: TabProps) {
  const [pricingType, setPricingType] = useState<PricingType>(worker.pricing_type);
  const [price, setPrice] = useState(String(worker.price));
  const [workingDays, setWorkingDays] = useState<DayKey[]>(worker.working_days);
  const [startTime, setStartTime] = useState(worker.start_time.slice(0, 5));
  const [endTime, setEndTime] = useState(worker.end_time.slice(0, 5));
  const [isAvailable, setIsAvailable] = useState(worker.is_available);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const toggleDay = (day: DayKey) => {
    setWorkingDays((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day]));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const priceValue = Number(price);
    if (!Number.isFinite(priceValue) || priceValue <= 0 || priceValue > MAX_PRICE) {
      setFeedback({ tone: 'error', text: 'Enter a rate between 1 and 10,00,000.' });
      return;
    }
    if (startTime && endTime && endTime <= startTime) {
      setFeedback({ tone: 'error', text: 'Closing time must be later than opening time.' });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      await saveWorkerProfile(worker.id, {
        pricing_type: pricingType,
        price: priceValue,
        working_days: DAYS.map((day) => day.key).filter((key) => workingDays.includes(key)),
        start_time: startTime,
        end_time: endTime,
        is_available: isAvailable,
      });
      await onSaved();
      setFeedback({ tone: 'success', text: 'Rates and schedule saved.' });
    } catch {
      setFeedback({ tone: 'error', text: "We couldn't save your schedule. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} space-y-6 p-6 sm:p-8`}>
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Rates and availability</h2>
        <p className="text-sm text-slate-500">Customers see your rate and whether you are available right now.</p>
      </div>

      <div
        className={`flex items-center justify-between gap-4 rounded-2xl p-4 ${isAvailable ? 'bg-emerald-50' : 'bg-slate-100'}`}
      >
        <div>
          <p className="text-sm font-bold text-slate-900">Accepting new work</p>
          <p className="text-xs text-slate-500">Turn this off when you are not taking jobs.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isAvailable}
          onClick={() => setIsAvailable((value) => !value)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 ${
              isAvailable ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
          <span className="sr-only">Accepting new work</span>
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="schedule-pricing" className={labelClass}>How you charge</label>
          <select id="schedule-pricing" value={pricingType} onChange={(event) => setPricingType(event.target.value as PricingType)} className={inputClass}>
            {PRICING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="schedule-price" className={labelClass}>Rate (INR)</label>
          <input
            id="schedule-price"
            type="number"
            min={1}
            max={MAX_PRICE}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>Working days</legend>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => {
            const active = workingDays.includes(day.key);
            return (
              <button
                key={day.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggleDay(day.key)}
                className={`h-10 w-14 rounded-xl text-sm font-bold transition duration-200 ${
                  active ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="schedule-start" className={labelClass}>Opening time</label>
          <input id="schedule-start" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="schedule-end" className={labelClass}>Closing time</label>
          <input id="schedule-end" type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className={inputClass} />
        </div>
      </div>

      <FormFeedback message={feedback} />
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={buttonPrimary}>
          {saving ? 'Saving...' : 'Save rates and schedule'}
        </button>
      </div>
    </form>
  );
}
