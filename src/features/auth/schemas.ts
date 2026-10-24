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

export const passwordSchema = z.string().min(8, 'validation.passwordMin').max(128, 'validation.max|128');

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
