import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
  type PhoneNumber,
} from 'libphonenumber-js/max';
import examples from 'libphonenumber-js/mobile/examples';
import { z } from 'zod';

export type { CountryCode };

/**
 * Telefon numaraları backend'e E.164 biçiminde gider (`+905321234567`).
 * Form'da değer `PhoneValue`'dur (seçili ülke + E.164). Doğrulama `libphonenumber-js/max` metadata'sı ile
 * **seçili ülkenin** numara kurallarına göre yapılır: başka ülkeye ait geçerli bir numara da reddedilir.
 */

/**
 * Tarayıcı dilinden ülke çıkarılamazsa kullanılan ülke. Ülke kodu olmadan kaydedilmiş eski numaralar
 * (`0532…`) da bu ülkeye göre yorumlanır (tarayıcının ülkesine göre değil).
 */
const FALLBACK_PHONE_COUNTRY: CountryCode = 'TR';

/**
 * Tarayıcının ülkesi: `navigator.languages` sırasıyla bölge kodu (`tr-TR` → TR, `en-GB` → GB).
 * Bölgesiz dil etiketlerinde en olası bölge alınır (`tr` → TR, `de` → DE, `en` → US).
 */
function browserCountry(): CountryCode {
  if (typeof navigator === 'undefined') return FALLBACK_PHONE_COUNTRY;
  const supported = new Set<string>(getCountries());
  const tags = [...(navigator.languages ?? []), navigator.language].filter(Boolean);
  for (const tag of tags) {
    try {
      const region = new Intl.Locale(tag).maximize().region;
      if (region && supported.has(region)) return region as CountryCode;
    } catch {
      // geçersiz dil etiketi
    }
  }
  return FALLBACK_PHONE_COUNTRY;
}

/** Numara boşken seçili gelen ülke: tarayıcının ülkesi */
export const DEFAULT_PHONE_COUNTRY: CountryCode = browserCountry();

/** Form değeri: seçili ülke + E.164 numara (boşsa `''`) */
export type PhoneValue = { country: CountryCode; number: string };

export type PhoneCountry = { code: CountryCode; callingCode: string; name: string; flag: string };

/** ISO kodundan bayrak emojisi (TR → 🇹🇷) */
export const flagEmoji = (code: string) =>
  String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

const countryCache = new Map<string, PhoneCountry[]>();

/** Dile göre adlandırılmış ve sıralanmış ülke listesi (dil başına bir kez hesaplanır) */
export function phoneCountries(language: string): PhoneCountry[] {
  const cached = countryCache.get(language);
  if (cached) return cached;
  let names: Intl.DisplayNames | undefined;
  try {
    names = new Intl.DisplayNames([language], { type: 'region' });
  } catch {
    names = undefined;
  }
  const list = getCountries()
    .map((code) => ({
      code,
      callingCode: getCountryCallingCode(code),
      name: names?.of(code) ?? code,
      flag: flagEmoji(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, language));
  countryCache.set(language, list);
  return list;
}

export const callingCode = (country: CountryCode) => getCountryCallingCode(country);

/** Numaranın ülke kodu olmadan uluslararası biçimi: `532 123 45 67` */
const nationalPart = (p: PhoneNumber) => p.formatInternational().replace(/^\+\d+\s?/, '');

const countryOf = (p: PhoneNumber, preferred: CountryCode): CountryCode => {
  if (p.country) return p.country;
  const possible = p.getPossibleCountries();
  return possible.includes(preferred) ? preferred : (possible[0] ?? preferred);
};

/** Kayıtlı değeri ülke + ulusal kısım olarak ayırır (input'ta göstermek için) */
export function splitPhone(value: string, fallback: CountryCode): { country: CountryCode; national: string } {
  if (!value) return { country: fallback, national: '' };
  const p = parsePhoneNumberFromString(value, fallback);
  if (!p) return { country: fallback, national: value };
  return { country: countryOf(p, fallback), national: nationalPart(p) };
}

/** Ülke + kullanıcının yazdığı numarayı E.164'e çevirir. Boşsa `''`, ayrıştırılamazsa ham rakamlar döner (doğrulama yakalar). */
export function joinPhone(country: CountryCode, national: string): string {
  const text = national.trim();
  const digits = text.replace(/\D/g, '');
  if (!digits) return '';
  if (text.startsWith('+')) return parsePhoneNumberFromString(text)?.number ?? `+${digits}`;
  return parsePhoneNumberFromString(text, country)?.number ?? `+${getCountryCallingCode(country)}${digits}`;
}

/** `+` ile başlayan bir yapıştırmadan ülkeyi çıkarır: `+44 7911 123456` → GB + `7911 123456` */
export function detectCountry(text: string) {
  if (!text.trim().startsWith('+')) return undefined;
  const p = parsePhoneNumberFromString(text);
  // Ülke kesinleşene kadar (ör. `+1` birden çok ülke) metin olduğu gibi kalır
  if (!p?.country) return undefined;
  return { country: p.country, national: p.nationalNumber as string };
}

/** Odaktan çıkınca ulusal kısmı ülkenin biçimine göre düzenler */
export function formatNational(country: CountryCode, national: string): string {
  const p = parsePhoneNumberFromString(national, country);
  if (p?.isValid()) return nationalPart(p);
  return national.replace(/\D/g, '') ? new AsYouType(country).input(national.replace(/[^\d]/g, '')) : '';
}

/** Placeholder için ülkenin örnek numarası */
export function examplePhone(country: CountryCode): string {
  const p = getExampleNumber(country, examples);
  return p ? nationalPart(p) : '';
}

/**
 * Numara seçili ülke için geçerli mi? Boş geçerlidir (alanlar opsiyonel).
 * Alan kodu paylaşılan ülkelerde (+1 US/CA, +44 GB/GG, +7 RU/KZ…) numaranın seçili ülkeye ait olması gerekir.
 */
export function isValidPhoneFor(number: string, country: CountryCode): boolean {
  if (!number) return true;
  if (!isValidPhoneNumber(number)) return false;
  const p = parsePhoneNumberFromString(number);
  if (!p) return false;
  return p.country ? p.country === country : p.getPossibleCountries().includes(country);
}

/** Telefon alanı şeması. Mesaj `PhoneField` tarafından ülke adı ve örnek numarayla gösterilir. */
export const phoneSchema = z
  .object({ country: z.custom<CountryCode>((v) => typeof v === 'string'), number: z.string() })
  .refine((v) => isValidPhoneFor(v.number, v.country), { message: 'phone.invalid' });

/** Boş form değeri (tarayıcının ülkesi seçili) */
export const emptyPhone = (): PhoneValue => ({ country: DEFAULT_PHONE_COUNTRY, number: '' });

/** Kayıtlı numaradan form değeri: ülke numaradan çıkarılır, boşsa tarayıcının ülkesi */
export function toPhoneValue(stored: string | null | undefined): PhoneValue {
  const number = normalizePhone(stored);
  return { country: splitPhone(number, DEFAULT_PHONE_COUNTRY).country, number };
}

/** Eski/serbest biçimli kayıtlı numarayı (ör. `0532…`) mümkünse E.164'e çevirir */
export function normalizePhone(value: string | null | undefined): string {
  const text = value?.trim() ?? '';
  if (!text) return '';
  const p = parsePhoneNumberFromString(text, FALLBACK_PHONE_COUNTRY);
  return p?.isValid() ? p.number : text;
}

/** Gösterim için: `+90 532 123 45 67` */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '';
  const p = parsePhoneNumberFromString(value, FALLBACK_PHONE_COUNTRY);
  return p?.isValid() ? p.formatInternational() : value;
}
