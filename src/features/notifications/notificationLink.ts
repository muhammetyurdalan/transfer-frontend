/** Bildirim `data`'sından gidilecek transfer id'si (`data.transferId` veya `data.id`). */
export function notificationTransferId(data: Record<string, unknown> | null | undefined): string | null {
  const id = data?.transferId ?? data?.id;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : null;
}
