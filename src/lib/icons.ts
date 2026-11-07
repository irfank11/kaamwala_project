import {
  Car,
  Droplets,
  Gem,
  Hammer,
  PaintRoller,
  Ruler,
  Snowflake,
  Sofa,
  SprayCan,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  Zap,
  Droplets,
  Hammer,
  PaintRoller,
  SprayCan,
  Gem,
  Car,
  Sofa,
  Snowflake,
  Ruler,
  Wrench,
};

export function resolveIcon(name: string): LucideIcon {
  return SERVICE_ICONS[name] ?? Wrench;
}
