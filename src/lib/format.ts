import type { DayKey, PricingType, WorkerListing } from '@/lib/types';

export const DAYS: { key: DayKey; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

const PRICING_SUFFIX: Record<PricingType, string> = {
  hourly: '/hr',
  daily: '/day',
  fixed: ' fixed',
};

export const PRICING_OPTIONS: { value: PricingType; label: string }[] = [
  { value: 'hourly', label: 'Per hour' },
  { value: 'daily', label: 'Per day' },
  { value: 'fixed', label: 'Fixed price' },
];

export function formatRupees(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatRate(price: number, pricing: PricingType): string {
  return `${formatRupees(price)}${PRICING_SUFFIX[pricing]}`;
}

export function formatTime(time: string): string {
  const [hourText, minute] = time.split(':');
  const hour = Number(hourText);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${suffix}`;
}

export function toTimeInput(time: string): string {
  return time.slice(0, 5);
}

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(km < 10 ? 1 : 0)} km away`;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function formatJoinDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export type AvailabilityState = 'now' | 'today' | 'off' | 'unavailable';

export function getAvailabilityState(worker: WorkerListing, now: Date = new Date()): AvailabilityState {
  if (!worker.is_available) return 'unavailable';
  const todayKey = DAYS[(now.getDay() + 6) % 7].key;
  if (!worker.working_days.includes(todayKey)) return 'off';
  const minutes = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = worker.start_time.split(':').map(Number);
  const [eh, em] = worker.end_time.split(':').map(Number);
  return minutes >= sh * 60 + sm && minutes <= eh * 60 + em ? 'now' : 'today';
}

export const AVAILABILITY_LABEL: Record<AvailabilityState, string> = {
  now: 'Available now',
  today: 'Available today',
  off: 'Off today',
  unavailable: 'Not taking jobs',
};

export function contactDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}
