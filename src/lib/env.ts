/** Tüm ortam değişkenleri buradan okunur. Kodun başka hiçbir yerinde `import.meta.env` kullanılmaz. */

function required(key: string): string {
  const value = import.meta.env[key] as string | undefined;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function optional(key: string): string {
  return (import.meta.env[key] as string | undefined) ?? '';
}

function parseCenter(value: string): [number, number] {
  const [lat, lng] = value.split(',').map(Number);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new Error('VITE_DEFAULT_MAP_CENTER must be "lat,lng"');
  }
  return [lat, lng];
}

export const env = {
  /** Geliştirme modu (hata detayları gibi sadece geliştiriciye gösterilenler için) */
  DEV: import.meta.env.DEV,
  API_URL: required('VITE_API_URL'),
  WS_URL: required('VITE_WS_URL'),
  MEDIA_URL: required('VITE_MEDIA_URL'),
  TILE_URL: required('VITE_TILE_URL'),
  TILE_ATTRIBUTION: required('VITE_TILE_ATTRIBUTION'),
  GEOCODER_URL: required('VITE_GEOCODER_URL'),
  ROUTING_URL: required('VITE_ROUTING_URL'),
  DEFAULT_MAP_CENTER: parseCenter(required('VITE_DEFAULT_MAP_CENTER')),
  DEFAULT_MAP_ZOOM: Number(required('VITE_DEFAULT_MAP_ZOOM')),
  GEOCODER_COUNTRY_CODES: required('VITE_GEOCODER_COUNTRY_CODES')
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean),
  FIREBASE: {
    apiKey: optional('VITE_FIREBASE_API_KEY'),
    projectId: optional('VITE_FIREBASE_PROJECT_ID'),
    messagingSenderId: optional('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: optional('VITE_FIREBASE_APP_ID'),
    vapidKey: optional('VITE_FIREBASE_VAPID_KEY'),
  },
} as const;
