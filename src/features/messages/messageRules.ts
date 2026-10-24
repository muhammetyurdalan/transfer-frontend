import dayjs from 'dayjs';
import type { MessageItemFragment } from '@/graphql/generated/graphql';

/** İstemci dosya sınırı (backend ERR024 ile aynı) */
export const MAX_MESSAGE_FILE = 2 * 1024 * 1024;
const EDIT_WINDOW_MINUTES = 60;

/** Sadece metin mesajı, silinmemiş ve gönderimden sonraki 1 saat içinde düzenlenebilir. */
export function canEditMessage(m: MessageItemFragment) {
  return (
    !m.isDeleted &&
    !!m.message &&
    !m.file &&
    !m.location &&
    !!m.time &&
    dayjs().diff(dayjs(m.time), 'minute') < EDIT_WINDOW_MINUTES
  );
}
