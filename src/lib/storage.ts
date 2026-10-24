/** localStorage / sessionStorage anahtarları ve güvenli erişim (gizli modda erişim hata fırlatabilir). */

export const STORAGE_KEYS = {
  token: 'transfer.token',
  language: 'transfer.language',
  fcmToken: 'transfer.fcmToken',
  pendingPayment: 'pendingPayment',
} as const;

export function readStorage(key: string, storage: Storage = localStorage): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string | null, storage: Storage = localStorage) {
  try {
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    // depolama kapalıysa sessizce geç
  }
}

export const tokenStore = {
  get: () => readStorage(STORAGE_KEYS.token),
  set: (token: string | null) => writeStorage(STORAGE_KEYS.token, token),
};

export type PendingPayment = { transferId: string; kind: 'payment' | 'tip' };

export const pendingPaymentStore = {
  get(): PendingPayment | null {
    const raw = readStorage(STORAGE_KEYS.pendingPayment, sessionStorage);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PendingPayment;
    } catch {
      return null;
    }
  },
  set(value: PendingPayment | null) {
    writeStorage(STORAGE_KEYS.pendingPayment, value && JSON.stringify(value), sessionStorage);
  },
};
