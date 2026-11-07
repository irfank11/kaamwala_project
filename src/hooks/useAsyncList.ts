import { useCallback, useEffect, useState } from 'react';

export function useAsyncList<T>(load: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    load()
      .then((rows) => {
        if (active) setItems(rows);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  return { items, loading, error, reload };
}
