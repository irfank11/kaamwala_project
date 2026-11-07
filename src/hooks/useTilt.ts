import { useRef, type MouseEvent } from 'react';

export function useTilt<T extends HTMLElement>(maxTilt = 8) {
  const ref = useRef<T>(null);

  const onMouseMove = (event: MouseEvent<T>) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    element.style.transform = `perspective(900px) rotateX(${(0.5 - py) * maxTilt}deg) rotateY(${(px - 0.5) * maxTilt}deg) translateY(-6px)`;
    element.style.setProperty('--glare-x', `${px * 100}%`);
    element.style.setProperty('--glare-y', `${py * 100}%`);
  };

  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return { ref, onMouseMove, onMouseLeave };
}
