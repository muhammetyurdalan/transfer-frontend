import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import type { TransferRowFragment } from '@/graphql/generated/graphql';
import type { Column } from '@/components/data-table';
import { Money } from '@/components/Money';
import { StatusChip } from '@/components/StatusChip';
import { formatDateTime, formatDuration, formatRoute } from '@/lib/format';
import { TransferRouteCell } from './TransferRouteCell';

/** Transfer listesi, dispatch ve sürücü işlerinde ortak sütunlar (§8.2). */
export function transferColumns(t: TFunction): Column<TransferRowFragment>[] {
  return [
    {
      key: 'id',
      header: 'transfers:columns.id',
      columnLabel: 'transfers:columns.transferNo',
      render: (r) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
          #{r.id}
        </Typography>
      ),
      width: 64,
    },
    {
      key: 'pickupTime',
      header: 'transfers:columns.pickupTime',
      sortField: 'pickupTime',
      render: (r) => <Box sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.pickupTime)}</Box>,
    },
    {
      key: 'route',
      header: 'transfers:columns.route',
      mobilePrimary: true,
      render: (r) => <TransferRouteCell row={r} />,
    },
    {
      key: 'passenger',
      header: 'transfers:columns.passenger',
      render: (r) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" noWrap>
            {r.passengerName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('transfers:passengers', { count: r.passengerCount ?? 1 })}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'vehicle',
      header: 'transfers:columns.vehicle',
      hideBelow: 'lg',
      render: (r) => r.vehicleCategory?.name ?? '—',
    },
    {
      key: 'price',
      header: 'transfers:columns.price',
      align: 'right',
      render: (r) => <Money amount={r.price} currency={r.currency} sx={{ fontWeight: 600 }} />,
    },
    {
      key: 'status',
      header: 'transfers:columns.status',
      render: (r) => <StatusChip status={r.status} />,
    },
    {
      key: 'driver',
      header: 'transfers:columns.driver',
      hideBelow: 'md',
      render: (r) => r.driver?.name ?? '—',
    },
  ];
}

/**
 * Transfer listesinde sütun seçiciden eklenebilen ek sütunlar (§8.2).
 * `staff` false ise (müşteri) müşteri/operatör sütunları sunulmaz.
 */
export function extraTransferColumns(staff: boolean): Column<TransferRowFragment>[] {
  return [
    {
      key: 'flightNumber',
      header: 'transfers:columns.flightNumber',
      render: (r) => r.flightNumber || '—',
    },
    {
      key: 'luggage',
      header: 'transfers:columns.luggage',
      align: 'right',
      render: (r) => r.luggageCount ?? 0,
    },
    {
      key: 'distance',
      header: 'transfers:columns.distance',
      render: (r) => <Box sx={{ whiteSpace: 'nowrap' }}>{formatRoute(r.distance, r.duration)}</Box>,
    },
    ...(staff
      ? [
          {
            key: 'customer',
            header: 'transfers:columns.customer',
            render: (r: TransferRowFragment) => r.customer?.name ?? '—',
          },
          {
            key: 'operator',
            header: 'transfers:columns.operator',
            render: (r: TransferRowFragment) => r.operator?.name ?? '—',
          },
        ]
      : []),
    {
      key: 'createdAt',
      header: 'transfers:columns.createdAt',
      sortField: 'createdAt',
      render: (r) => <Box sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.createdAt)}</Box>,
    },
  ];
}

/** Dispatch: alışa kalan süre. 1 saatten azsa warning rengi. */
export function timeToPickupColumn(t: TFunction): Column<TransferRowFragment> {
  return {
    key: 'timeToPickup',
    header: 'transfers:columns.timeToPickup',
    render: (r) => {
      if (!r.pickupTime) return '—';
      const minutes = dayjs(r.pickupTime).diff(dayjs(), 'minute');
      const urgent = minutes < 60;
      return (
        <Typography
          variant="body2"
          sx={{
            color: urgent ? 'warning.main' : 'text.primary',
            fontWeight: urgent ? 700 : 400,
            whiteSpace: 'nowrap',
          }}
        >
          {minutes < 0 ? t('transfers:dispatch.overdue') : formatDuration(minutes)}
        </Typography>
      );
    },
  };
}
