import { useCallback, useState } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type LocationStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'unavailable';

export function useCurrentLocation() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setStatus('ready');
      },
      () => setStatus('denied'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  return { coords, status, request };
}
