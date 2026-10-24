import { env } from '@/lib/env';
import type { LatLng } from './types';

export type RouteSegment = {
  /** km, 2 ondalık string */
  distance: string;
  /** dakika, yukarı yuvarlanmış */
  duration: number;
};

export type RouteResult = RouteSegment & {
  /** OSRM encoded polyline (precision 5) */
  polyline: string;
  path: [number, number][];
  /** Ardışık iki nokta arasındaki her bölüm (nokta sayısı - 1 adet) */
  segments: RouteSegment[];
};

const toSegment = (meters: number, seconds: number): RouteSegment => ({
  distance: (meters / 1000).toFixed(2),
  duration: Math.max(1, Math.ceil(seconds / 60)),
});

/** OSRM'den sürüş rotası. `points` sırayla ziyaret edilir (pickup, ara duraklar, dropoff). */
export async function fetchRoute(points: LatLng[], signal?: AbortSignal): Promise<RouteResult> {
  if (points.length < 2) throw new Error('Routing needs at least two points');
  const coords = points.map((p) => `${p.lng},${p.lat}`).join(';');
  const url = new URL(`/route/v1/driving/${coords}`, env.ROUTING_URL);
  url.searchParams.set('overview', 'full');
  url.searchParams.set('geometries', 'polyline');
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Routing ${res.status}`);
  const data = (await res.json()) as {
    code: string;
    routes: {
      distance: number;
      duration: number;
      geometry: string;
      legs: { distance: number; duration: number }[];
    }[];
  };
  const route = data.routes?.[0];
  if (data.code !== 'Ok' || !route) throw new Error(`Routing ${data.code}`);
  return {
    ...toSegment(route.distance, route.duration),
    polyline: route.geometry,
    path: decodePolyline(route.geometry),
    segments: route.legs.map((l) => toSegment(l.distance, l.duration)),
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
