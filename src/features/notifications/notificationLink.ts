import type { NotificationItemFragment } from '@/graphql/generated/graphql';

/** Bildirim `data`'sından gidilecek transfer id'si (`data.transferId` veya `data.id`). */
export function notificationTransferId(data: Record<string, unknown> | null | undefined): string | null {
  const id = data?.transferId ?? data?.id;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : null;
}

/**
 * Bildirime tıklanınca gidilecek sayfa. `MESSAGE` bildirimi o transferin sohbetini açar (`/messages/:id`),
 * diğerleri transfer detayını. Transfer id'si yoksa `null`.
 */
export function notificationLink(n: Pick<NotificationItemFragment, 'action' | 'data'>): string | null {
  const transferId = notificationTransferId(n.data);
  if (!transferId) return null;
  return n.action === 'MESSAGE' ? `/messages/${transferId}` : `/transfers/${transferId}`;
}
