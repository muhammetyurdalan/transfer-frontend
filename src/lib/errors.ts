import { CombinedGraphQLErrors } from '@apollo/client/errors';

/** Backend hata kodları (`errors.txt`). Mesaj `{"code":"ERR013"}` şeklinde JSON gelir. */
export type ErrorCode = `ERR0${number}`;

export const LOGOUT_CODES: ReadonlySet<string> = new Set(['ERR002', 'ERR003', 'ERR010']);

/** Tek bir GraphQL hata mesajından kodu çıkarır. JSON değilse `null`. */
export function parseErrorCode(message: string | undefined): string | null {
  if (!message) return null;
  try {
    const parsed = JSON.parse(message) as { code?: unknown };
    return typeof parsed.code === 'string' ? parsed.code : null;
  } catch {
    return null;
  }
}

/** Apollo hatasından (mutation/query `error`) ilk backend kodunu döner. */
export function getErrorCode(error: unknown): string | null {
  if (CombinedGraphQLErrors.is(error)) {
    for (const e of error.errors) {
      const code = parseErrorCode(e.message);
      if (code) return code;
    }
  }
  return null;
}

/** Kodun i18n anahtarı. Bilinmeyen/JSON olmayan hatalar genel mesaja düşer. */
export function errorKey(code: string | null): string {
  return code ? `errors:${code}` : 'errors:unknown';
}
