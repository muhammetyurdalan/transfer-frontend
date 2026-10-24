import type { LatLng, SelectedAddress } from '@/lib/geo';

/** Seçilmiş adresin (string) koordinatlarını sayıya çevirir. */
export function positionOf(a: SelectedAddress | null | undefined): LatLng | null {
  if (!a) return null;
  const lat = Number(a.latitude);
  const lng = Number(a.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}
