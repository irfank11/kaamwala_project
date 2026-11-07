import { initialsOf } from '@/lib/format';

const SIZE_CLASS = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-16 w-16 text-xl',
  lg: 'h-24 w-24 text-3xl',
} as const;

export function Avatar({ src, name, size = 'md' }: { src: string | null; name: string; size?: keyof typeof SIZE_CLASS }) {
  const sizeClass = SIZE_CLASS[size];
  if (src) {
    return <img src={src} alt={name} className={`${sizeClass} shrink-0 rounded-2xl object-cover ring-4 ring-white`} loading="lazy" />;
  }
  return (
    <span
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-700 font-bold text-white ring-4 ring-white`}
      aria-label={name}
    >
      {initialsOf(name)}
    </span>
  );
}
