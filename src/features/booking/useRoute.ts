import { useCallback, useEffect, useState } from 'react';
import { fetchRoute, type LatLng } from '@/lib/geo';
import type { RouteInfo } from './types';

type Result = { key: string; route: RouteInfo | null; failed: boolean };

/** İki nokta seçiliyse OSRM'den rota alır. Nokta değişince önceki istek iptal edilir. */
export function useRoute(from: LatLng | null, to: LatLng | null) {
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);
  const coords = from && to ? `${from.lat},${from.lng};${to.lat},${to.lng}` : null;
  const key = coords && `${coords}#${attempt}`;

  useEffect(() => {
    if (!key || !from || !to) return;
    const controller = new AbortController();
    fetchRoute(from, to, controller.signal)
      .then((r) =>
        setResult({ key, failed: false, route: { distance: r.distance, duration: r.duration, path: r.path } }),
      )
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') setResult({ key, failed: true, route: null });
      });
    return () => controller.abort();
    // `key` koordinatları ve deneme sayısını temsil eder.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const current = key && result?.key === key ? result : null;
  const status: 'idle' | 'loading' | 'ok' | 'error' = !key
    ? 'idle'
    : !current
      ? 'loading'
      : current.failed
        ? 'error'
        : 'ok';
  return { status, route: current?.route ?? null, retry };
}
