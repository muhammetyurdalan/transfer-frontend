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

/** URL parametrelerinden backend `TransferFilter`'ı üretir. */
export function transferFilterFrom(state: TableState): TransferFilter {
  const statuses = state
    .getAll('status')
    .filter((s): s is TransferStatus => ALL_STATUSES.includes(s as TransferStatus));
  const from = state.get('from');
  const to = state.get('to');
  const passenger = state.get('q');
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
    ...(passenger && { passengerName: { iContains: passenger } }),
    ...(stateId && { stateId: { exact: stateId } }),
    ...(customerId && { customerId: { exact: customerId } }),
  };
}
