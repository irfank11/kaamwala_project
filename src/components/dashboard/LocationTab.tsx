import { useState, type FormEvent } from 'react';
import { Crosshair, Loader2 } from 'lucide-react';
import { saveWorkerProfile } from '@/services/workers';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { buttonPrimary, buttonSecondary, cardClass, inputClass, labelClass } from '@/lib/styles';
import { FormFeedback, type FeedbackMessage } from '@/components/ui/FormFeedback';
import type { TabProps } from '@/components/dashboard/tabProps';

const MAX_RADIUS_KM = 200;

export default function LocationTab({ worker, onSaved }: TabProps) {
  const [city, setCity] = useState(worker.city);
  const [area, setArea] = useState(worker.area);
  const [radius, setRadius] = useState(String(worker.service_radius_km));
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(
    worker.latitude !== null && worker.longitude !== null
      ? { latitude: worker.latitude, longitude: worker.longitude }
      : null,
  );
  const { coords: detected, status, request } = useCurrentLocation();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const activeCoords = detected ?? coords;
  const locating = status === 'locating';

  const handleUseLocation = () => {
    request();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const radiusValue = Number(radius);
    if (city.trim().length < 2) {
      setFeedback({ tone: 'error', text: 'Please enter the city you work in.' });
      return;
    }
    if (!Number.isInteger(radiusValue) || radiusValue < 1 || radiusValue > MAX_RADIUS_KM) {
      setFeedback({ tone: 'error', text: `Service radius should be a whole number from 1 to ${MAX_RADIUS_KM} km.` });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      await saveWorkerProfile(worker.id, {
        city: city.trim(),
        area: area.trim(),
        service_radius_km: radiusValue,
        latitude: activeCoords?.latitude ?? null,
        longitude: activeCoords?.longitude ?? null,
      });
      await onSaved();
      setCoords(activeCoords);
      setFeedback({ tone: 'success', text: 'Location saved.' });
    } catch {
      setFeedback({ tone: 'error', text: "We couldn't save your location. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} space-y-6 p-6 sm:p-8`}>
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Where you work</h2>
        <p className="text-sm text-slate-500">Nearby customers find you based on your location and service radius.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="location-city" className={labelClass}>City</label>
          <input id="location-city" value={city} onChange={(event) => setCity(event.target.value)} maxLength={100} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="location-area" className={labelClass}>Area or locality</label>
          <input id="location-area" value={area} onChange={(event) => setArea(event.target.value)} maxLength={100} placeholder="e.g. Koramangala" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="location-radius" className={labelClass}>Service radius (km)</label>
          <input
            id="location-radius"
            type="number"
            min={1}
            max={MAX_RADIUS_KM}
            value={radius}
            onChange={(event) => setRadius(event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          <p className="font-bold text-slate-900">Map position</p>
          <p className="text-slate-500">
            {activeCoords
              ? `Set to your current position (${activeCoords.latitude.toFixed(3)}, ${activeCoords.longitude.toFixed(3)})`
              : 'Not set yet. Use your current location so nearby customers can find you.'}
          </p>
          {status === 'denied' && <p className="mt-1 font-semibold text-rose-600">Location access was denied in your browser.</p>}
          {status === 'unavailable' && <p className="mt-1 font-semibold text-rose-600">Your browser cannot share its location.</p>}
        </div>
        <button type="button" onClick={handleUseLocation} disabled={locating} className={`${buttonSecondary} shrink-0`}>
          {locating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Crosshair className="h-4 w-4" aria-hidden="true" />}
          {locating ? 'Locating...' : 'Use my current location'}
        </button>
      </div>

      <FormFeedback message={feedback} />
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={buttonPrimary}>
          {saving ? 'Saving...' : 'Save location'}
        </button>
      </div>
    </form>
  );
}
