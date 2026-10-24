import { env } from '@/lib/env';
import { toCoord } from '@/lib/format';
import { districtNameFrom } from './district';
import type { GeocodeResult, LatLng, PhotonProperties } from './types';

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: PhotonProperties & { osm_id?: number; osm_type?: string };
};

const MAX_ADDRESS = 255;

function joinUnique(parts: (string | undefined)[]) {
  const seen = new Set<string>();
  return parts
    .filter((p): p is string => !!p && !seen.has(p) && !!seen.add(p))
    .join(', ');
}

function toResult(f: PhotonFeature, index: number): GeocodeResult {
  const p = f.properties;
  const [lng, lat] = f.geometry.coordinates;
  const street = joinUnique([p.street, p.housenumber]);
  const title = p.name || street || p.district || p.city || '';
  const subtitle = joinUnique([p.name ? street : undefined, p.district, p.county, p.city, p.state]);
  const address = joinUnique([title, subtitle, p.country]).slice(0, MAX_ADDRESS);
  return {
    id: `${p.osm_type ?? ''}${p.osm_id ?? index}-${index}`,
    title,
    subtitle,
    position: { lat, lng },
    selected: {
      address,
      latitude: toCoord(lat),
      longitude: toCoord(lng),
      districtName: districtNameFrom(p),
    },
  };
}

function allowedCountry(f: PhotonFeature) {
  const codes = env.GEOCODER_COUNTRY_CODES;
  return codes.length === 0 || codes.includes((f.properties.countrycode ?? '').toLowerCase());
}

/** Yazarken adres araması (Photon). `lang` gönderilmez ki yerel (Türkçe) isimler dönsün. */
export async function searchAddress(query: string, near: LatLng | null, signal?: AbortSignal) {
  const url = new URL('/api', env.GEOCODER_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '6');
  if (near) {
    url.searchParams.set('lat', String(near.lat));
    url.searchParams.set('lon', String(near.lng));
  }
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoder ${res.status}`);
  const data = (await res.json()) as { features: PhotonFeature[] };
  return data.features.filter(allowedCountry).map(toResult);
}

/** Koordinattan adres (haritadan seç, konumum). */
export async function reverseGeocode(position: LatLng, signal?: AbortSignal) {
  const url = new URL('/reverse', env.GEOCODER_URL);
  url.searchParams.set('lat', String(position.lat));
  url.searchParams.set('lon', String(position.lng));
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoder ${res.status}`);
  const data = (await res.json()) as { features: PhotonFeature[] };
  const feature = data.features[0];
  if (!feature) return null;
  const result = toResult(feature, 0);
  // Pin'in tam konumu kullanılır, en yakın OSM nesnesinin konumu değil.
  return {
    ...result,
    position,
    selected: { ...result.selected, latitude: toCoord(position.lat), longitude: toCoord(position.lng) },
  };
}
