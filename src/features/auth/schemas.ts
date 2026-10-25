import { z } from 'zod';

import type { TFunction } from 'i18next';

/**
 * Mesajlar i18n anahtarıdır (`auth:validation.*`). Parametreli olanlar `anahtar|değer` şeklindedir
 * (`validation.max|100`), `validationText` ile çevrilir.
 */
export function validationText(t: TFunction, message: string | undefined) {
  if (!message) return undefined;
  const [key, max] = message.split('|');
  return t(`auth:${key}`, { max });
}

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'validation.required')
  .max(100, 'validation.max|100')
  .email('validation.email');

/**
 * Şifre kuralları: en az 8 karakter (backend `MinimumLengthValidator` varsayılanı), en az bir büyük harf
 * ve en az bir özel karakter (harf/rakam/boşluk dışı). `passwordSchema` ve `PasswordRules` listesi bunlardan üretilir.
 */
export const PASSWORD_RULES = [
  { key: 'validation.passwordMin', test: (v: string) => v.length >= 8 },
  { key: 'validation.passwordUpper', test: (v: string) => /\p{Lu}/u.test(v) },
  { key: 'validation.passwordSpecial', test: (v: string) => /[^\p{L}\p{N}\s]/u.test(v) },
] as const;

/** Kayıt ve şifre sıfırlamada kullanılır */
export const passwordSchema = PASSWORD_RULES.reduce(
  (schema, rule) => schema.refine(rule.test, rule.key),
  z.string().max(128, 'validation.max|128'),
);

export const nameSchema = z.string().trim().min(1, 'validation.required').max(50, 'validation.max|50');

export const codeSchema = z.string().regex(/^\d{6}$/, 'validation.code');

export const passwordFields = { password: passwordSchema, passwordRepeat: z.string() };

/** `.refine(...passwordsMatch)`: şifre ve tekrarı aynı olmalı */
export const passwordsMatch: [
  (v: { password: string; passwordRepeat: string }) => boolean,
  { path: string[]; message: string },
] = [
  (v) => v.password === v.passwordRepeat,
  { path: ['passwordRepeat'], message: 'validation.passwordMatch' },
];
