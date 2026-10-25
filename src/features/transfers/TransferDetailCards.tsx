import type { ReactNode } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material';
import {
  AccessibleRounded,
  ChildCareRounded,
  FlightRounded,
  LuggageRounded,
  PeopleRounded,
  PhoneRounded,
  StickyNote2Rounded,
} from '@mui/icons-material';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import {
  TransferTransactionsDocument,
  type TransferDetailFragment,
} from '@/graphql/generated/graphql';
import { RouteMap } from '@/components/map/RouteMap';
import { Money } from '@/components/Money';
import { TransactionChip } from '@/components/StatusChip';
import { UserAvatar } from '@/components/UserAvatar';
import { formatDateTime, formatDistance, formatDuration } from '@/lib/format';
import { mediaUrl } from '@/lib/media';
import { formatPhone } from '@/lib/phone';

type T = TransferDetailFragment;

/** Koyu başlık bantlı kart (siyah zemin + altın alt çizgi). */
export function SectionCard({
  title,
  action,
  children,
  sx,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Card sx={sx}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.25,
          bgcolor: 'inverse.main',
          color: 'inverse.contrastText',
          borderBottom: 2,
          borderColor: 'inverse.accent',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {action}
      </Stack>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Field({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', minWidth: 0 }}>
      {icon && <Box sx={{ color: 'primary.dark', mt: 0.25, display: 'flex' }}>{icon}</Box>}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, overflowWrap: 'anywhere' }}>
          {value ?? '—'}
        </Typography>
      </Box>
    </Stack>
  );
}

const coord = (lat?: string | null, lng?: string | null) =>
  lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;

function Stop({
  letter,
  title,
  address,
  sub,
}: {
  letter: string;
  title: string;
  address?: string | null;
  sub?: string;
}) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Avatar
        sx={{
          width: 28,
          height: 28,
          fontSize: 13,
          fontWeight: 700,
          bgcolor: letter === 'A' ? 'primary.main' : 'inverse.main',
          color: letter === 'A' ? 'primary.contrastText' : 'inverse.accent',
        }}
      >
        {letter}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, overflowWrap: 'anywhere' }}>
          {address}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary">
            {sub}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export function RouteCard({ transfer }: { transfer: T }) {
  const { t } = useTranslation('transfers');
  const pickupSub = [transfer.pickupDistrict?.name, transfer.pickupDistrict?.city?.name]
    .filter(Boolean)
    .join(', ');
  const legs = [...(transfer.legs ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <SectionCard title={t('detail.route')}>
      <Stack spacing={2}>
        <RouteMap
          from={coord(transfer.pickupLatitude, transfer.pickupLongitude)}
          to={coord(transfer.dropoffLatitude, transfer.dropoffLongitude)}
          height={240}
        />
        <Stop
          letter="A"
          title={t('detail.pickup')}
          address={transfer.pickupAddress}
          sub={pickupSub}
        />
        <Stop
          letter="B"
          title={t('detail.dropoff')}
          address={transfer.dropoffAddress}
          sub={transfer.dropoffDistrict?.name ?? undefined}
        />
        {transfer.state?.name && <Field label={t('detail.region')} value={transfer.state.name} />}
        {legs.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              {t('detail.stops')}
            </Typography>
            <List dense disablePadding>
              {legs.map((leg, i) => (
                <ListItem key={leg.id} disableGutters divider={i < legs.length - 1}>
                  <ListItemText
                    primary={`${i + 1}. ${leg.startAddress ?? ''} → ${leg.endAddress ?? ''}`}
                    secondary={`${formatDateTime(leg.startTime)} – ${formatDateTime(leg.endTime)}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Stack>
    </SectionCard>
  );
}

export function TripCard({ transfer }: { transfer: T }) {
  const { t } = useTranslation('transfers');
  return (
    <SectionCard title={t('detail.trip')}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        <Field label={t('detail.time')} value={formatDateTime(transfer.pickupTime)} />
        <Field label={t('detail.endTime')} value={formatDateTime(transfer.endTime)} />
        <Field label={t('detail.distance')} value={formatDistance(transfer.distance)} />
        <Field label={t('detail.duration')} value={formatDuration(transfer.duration)} />
        <Field label={t('detail.passengerName')} value={transfer.passengerName} />
        <Field
          label={t('detail.passengerPhone')}
          value={formatPhone(transfer.passengerPhone) || '—'}
          icon={<PhoneRounded fontSize="small" />}
        />
        <Field
          label={t('detail.passengers')}
          value={transfer.passengerCount ?? 1}
          icon={<PeopleRounded fontSize="small" />}
        />
        <Field
          label={t('detail.luggage')}
          value={transfer.luggageCount ?? 0}
          icon={<LuggageRounded fontSize="small" />}
        />
        <Field
          label={t('detail.childSeats')}
          value={transfer.childSeatCount ?? 0}
          icon={<ChildCareRounded fontSize="small" />}
        />
        <Field
          label={t('detail.wheelchair')}
          value={t(transfer.needsWheelchair ? 'common:yes' : 'common:no')}
          icon={<AccessibleRounded fontSize="small" />}
        />
        <Field
          label={t('detail.flight')}
          value={transfer.flightNumber || '—'}
          icon={<FlightRounded fontSize="small" />}
        />
      </Box>
      {transfer.note && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'highlight.main',
            border: 1,
            borderColor: 'highlight.border',
          }}
        >
          <Field
            label={t('detail.note')}
            value={transfer.note}
            icon={<StickyNote2Rounded fontSize="small" />}
          />
        </Box>
      )}
    </SectionCard>
  );
}

export function VehicleDriverCard({ transfer }: { transfer: T }) {
  const { t } = useTranslation('transfers');
  const { driver, vehicle, vehicleCategory } = transfer;
  return (
    <SectionCard title={t('detail.vehicleDriver')}>
      <Stack spacing={2}>
        {vehicleCategory && (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar
              variant="rounded"
              src={mediaUrl(vehicleCategory.image)}
              sx={{ width: 56, height: 56, bgcolor: 'highlight.main', color: 'primary.dark' }}
            />
            <Field label={t('detail.category')} value={vehicleCategory.name} />
          </Stack>
        )}
        <Divider />
        {driver ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <UserAvatar user={driver} size={48} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2">{driver.name}</Typography>
              {driver.phone && (
                <Link href={`tel:${driver.phone}`} variant="body2">
                  {formatPhone(driver.phone)}
                </Link>
              )}
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('detail.noDriver')}
          </Typography>
        )}
        {vehicle && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Field label={t('detail.plate')} value={vehicle.plate} />
            <Field
              label={t('columns.vehicle')}
              value={[vehicle.brand, vehicle.model, vehicle.color].filter(Boolean).join(' ')}
            />
          </Box>
        )}
        {(transfer.customer || transfer.operator) && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {transfer.customer && (
              <Field label={t('detail.customer')} value={transfer.customer.name} />
            )}
            {transfer.operator && (
              <Field label={t('detail.operator')} value={transfer.operator.name} />
            )}
          </Box>
        )}
      </Stack>
    </SectionCard>
  );
}

export function PaymentCard({ transfer }: { transfer: T }) {
  const { t } = useTranslation('transfers');
  const { data, dataState, loading } = useQuery(TransferTransactionsDocument, {
    variables: { transferId: transfer.id },
  });
  const rows = dataState === 'complete' ? (data.transactions.transactions ?? []) : [];
  return (
    <SectionCard title={t('detail.payment')}>
      <Stack spacing={2}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: 'inverse.main',
            color: 'inverse.contrastText',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2">{t('detail.price')}</Typography>
          <Money
            amount={transfer.price}
            currency={transfer.currency}
            variant="h5"
            sx={{ color: 'inverse.accent', fontWeight: 700 }}
          />
        </Box>
        {loading && rows.length === 0 ? (
          <Skeleton variant="rounded" height={48} />
        ) : rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('detail.noTransactions')}
          </Typography>
        ) : (
          <List dense disablePadding>
            {rows.map((tx, i) => (
              <ListItem
                key={tx.id}
                disableGutters
                divider={i < rows.length - 1}
                secondaryAction={
                  <Money
                    amount={tx.orderAmount}
                    currency={tx.currency}
                    negative={tx.category === 'REFUND'}
                    sx={{ fontWeight: 600 }}
                  />
                }
              >
                <ListItemText
                  primary={<TransactionChip category={tx.category} />}
                  secondary={formatDateTime(tx.orderTime)}
                  slotProps={{ primary: { component: 'div' } }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Stack>
    </SectionCard>
  );
}
