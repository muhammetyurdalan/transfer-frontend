import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import 'dayjs/locale/en';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { readStorage, STORAGE_KEYS, writeStorage } from '@/lib/storage';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

/**
 * Çeviriler namespace başına ayrı dosyadadır: `locales/<dil>/<namespace>.json`.
 * Yeni namespace eklenince buraya import edilir. Kullanım: `t('transfers:list.title')`.
 */
const modules = import.meta.glob<{ default: Record<string, unknown> }>('./locales/*/*.json', {
  eager: true,
});

const resources: Record<string, Record<string, Record<string, unknown>>> = {};
for (const [path, mod] of Object.entries(modules)) {
  const [, lng, ns] = path.match(/\.\/locales\/(\w+)\/(\w+)\.json$/) ?? [];
  if (!lng || !ns) continue;
  resources[lng] ??= {};
  resources[lng][ns] = mod.default;
}

export const LANGUAGES = ['en', 'tr'] as const;
export type AppLanguage = (typeof LANGUAGES)[number];

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return !!value && (LANGUAGES as readonly string[]).includes(value);
}

/** Backend `Language` enum'u ↔ i18n dili */
export const toBackendLanguage = (lng: string) => (lng === 'tr' ? 'TR' : 'EN') as 'EN' | 'TR';
export const fromBackendLanguage = (lng: string | null | undefined): AppLanguage =>
  lng === 'TR' ? 'tr' : 'en';

function initialLanguage(): AppLanguage {
  const stored = readStorage(STORAGE_KEYS.language);
  if (isAppLanguage(stored)) return stored;
  const nav = navigator.language?.slice(0, 2).toLowerCase();
  return isAppLanguage(nav) ? nav : 'en';
}

const lng = initialLanguage();
dayjs.locale(lng);

void i18n.use(initReactI18next).init({
  resources,
  lng,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: Object.keys(resources.en ?? {}),
  interpolation: { escapeValue: false },
  returnNull: false,
});

i18n.on('languageChanged', (next) => {
  dayjs.locale(next);
  document.documentElement.lang = next;
  writeStorage(STORAGE_KEYS.language, next);
});
document.documentElement.lang = lng;

/** Kullanıcının kendi seçimi olmadan (ilk açılışta) backend dilini uygular. */
export function hasStoredLanguage() {
  return isAppLanguage(readStorage(STORAGE_KEYS.language));
}

export default i18n;
