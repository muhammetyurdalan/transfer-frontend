import { env } from '@/lib/env';
import type { LatLng } from './types';

export type RouteResult = {
  /** km, 2 ondalık string (`"40.50"`) */
  distance: string;
  /** dakika, yukarı yuvarlanmış */
  duration: number;
  /** OSRM encoded polyline (precision 5) */
  polyline: string;
  path: [number, number][];
};

/** OSRM'den sürüş rotası. */
export async function fetchRoute(from: LatLng, to: LatLng, signal?: AbortSignal): Promise<RouteResult> {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = new URL(`/route/v1/driving/${coords}`, env.ROUTING_URL);
  url.searchParams.set('overview', 'full');
  url.searchParams.set('geometries', 'polyline');
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Routing ${res.status}`);
  const data = (await res.json()) as {
    code: string;
    routes: { distance: number; duration: number; geometry: string }[];
  };
  const route = data.routes?.[0];
  if (data.code !== 'Ok' || !route) throw new Error(`Routing ${data.code}`);
  return {
    distance: (route.distance / 1000).toFixed(2),
    duration: Math.max(1, Math.ceil(route.duration / 60)),
    polyline: route.geometry,
    path: decodePolyline(route.geometry),
  };
}

/** Google encoded polyline çözümleyici → [lat, lng][] */
export function decodePolyline(encoded: string, precision = 5): [number, number][] {
  const factor = 10 ** precision;
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    for (const axis of [0, 1]) {
      let result = 0;
      let shift = 0;
      let byte: number;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === 0) lat += delta;
      else lng += delta;
    }
    points.push([lat / factor, lng / factor]);
  }
  return points;
}
