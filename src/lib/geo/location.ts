import type { LatLng } from './types';

/** Tarayıcı konumu. İzin reddi/zaman aşımında `GeolocationPositionError` fırlatır. */
export function getCurrentPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  });
}

/** Mesajlarda kullanılan konum formatı: `"lat,lng"` */
export function formatLocation(p: LatLng) {
  return `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
}

export function parseLocation(value: string | null | undefined): LatLng | null {
  if (!value) return null;
  const [lat, lng] = value.split(',').map(Number);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

export function mapsLink(p: LatLng) {
  return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
}

export function directionsLink(p: LatLng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
}
