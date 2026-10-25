import dayjs from 'dayjs';
import type { TransferFilter, TransferStatus } from '@/graphql/generated/graphql';
import type { TableState } from '@/components/data-table';

export const ALL_STATUSES: TransferStatus[] = [
  'PENDING',
  'PAID',
  'ASSIGNED',
  'STARTED',
  'COMPLETED',
  'CANCELLED',
];

/**
 * Arama: A (alış) veya B (bırakış) adresi içinde geçen, sadece rakamsa transfer no'su da eşleşen.
 * Backend `OR`'u aynı seviyedeki tüm filtrelere karşı uygular, bu yüzden üst seviyede `AND` içine konur:
 * `durum VE (A adresi VEYA B adresi VEYA no)`.
 */
function searchFilter(search: string): TransferFilter {
  const byDropoff: TransferFilter = {
    dropoffAddress: { iContains: search },
    ...(/^\d+$/.test(search) && { OR: { id: { exact: search } } }),
  };
  return { pickupAddress: { iContains: search }, OR: byDropoff };
}

/** URL parametrelerinden backend `TransferFilter`'ı üretir. */
export function transferFilterFrom(state: TableState): TransferFilter {
  const statuses = state
    .getAll('status')
    .filter((s): s is TransferStatus => ALL_STATUSES.includes(s as TransferStatus));
  const from = state.get('from');
  const to = state.get('to');
  const search = state.get('q')?.trim();
  const stateId = state.get('stateId');
  const customerId = state.get('customerId');
  return {
    ...(statuses.length && { status: { inList: statuses } }),
    ...((from || to) && {
      pickupTime: {
        range: {
          start: from ? dayjs(from).startOf('day').toISOString() : null,
          end: to ? dayjs(to).endOf('day').toISOString() : null,
        },
      },
    }),
    ...(search && { AND: searchFilter(search) }),
    ...(stateId && { stateId: { exact: stateId } }),
    ...(customerId && { customerId: { exact: customerId } }),
  };
}
