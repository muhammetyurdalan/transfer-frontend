import { useCallback, useEffect, useState } from 'react';
import { fetchRoute, type LatLng } from '@/lib/geo';
import type { RouteInfo } from './types';

type Result = { key: string; route: RouteInfo | null; failed: boolean };

/**
 * `points` (pickup, seçilmiş ara duraklar, dropoff) sırasıyla OSRM'den rota alır.
 * İlk ve son nokta seçilmeden istek atılmaz. Noktalar değişince önceki istek iptal edilir.
 */
export function useRoute(points: (LatLng | null)[]) {
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);
  const first = points[0];
  const last = points[points.length - 1];
  const route = first && last && points.length >= 2 ? points.filter((p): p is LatLng => !!p) : null;
  const coords = route?.map((p) => `${p.lat},${p.lng}`).join(';') ?? null;
  const key = coords && `${coords}#${attempt}`;

  useEffect(() => {
    if (!key || !route) return;
    const controller = new AbortController();
    fetchRoute(route, controller.signal)
      .then((r) =>
        setResult({
          key,
          failed: false,
          route: { distance: r.distance, duration: r.duration, path: r.path, segments: r.segments },
        }),
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
