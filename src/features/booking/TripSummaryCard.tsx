import { Box, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import {
  AccessibleRounded,
  ChildFriendlyRounded,
  LuggageRounded,
  PersonRounded,
  ScheduleRounded,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { BookingTransferFieldsFragment } from '@/graphql/generated/graphql';
import { formatDateTime, formatRoute } from '@/lib/format';

/** Araç seçimi ekranının üstündeki koyu özet kartı (güzergah, zaman, yolcu/bagaj). */
export function TripSummaryCard({ transfer }: { transfer: BookingTransferFieldsFragment | null | undefined }) {
  const { t } = useTranslation('booking');
  if (!transfer) return <Skeleton variant="rounded" height={148} sx={{ borderRadius: 4 }} />;

  const stops = [
    { label: 'A', text: transfer.pickupAddress },
    { label: 'B', text: transfer.dropoffAddress },
  ];
  return (
    <Card sx={{ bgcolor: 'inverse.main', color: 'inverse.contrastText', borderColor: 'inverse.main' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="overline" sx={{ color: 'inverse.accent' }}>
          {t('vehicle.summary')} · #{transfer.id}
        </Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {stops.map((s) => (
            <Stack key={s.label} direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  bgcolor: s.label === 'A' ? 'primary.main' : 'inverse.light',
                  color: s.label === 'A' ? 'primary.contrastText' : 'inverse.accent',
                }}
              >
                {s.label}
              </Box>
              <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                {s.text}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{ mt: 2, flexWrap: 'wrap', alignItems: 'center', opacity: 0.9, '& svg': { color: 'inverse.accent' } }}
        >
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <ScheduleRounded fontSize="small" />
            <Typography variant="body2">{formatDateTime(transfer.pickupTime)}</Typography>
          </Stack>
          <Typography variant="body2">{formatRoute(transfer.distance, transfer.duration)}</Typography>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <PersonRounded fontSize="small" />
            <Typography variant="body2">{t('summary.passengers', { count: transfer.passengerCount ?? 1 })}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <LuggageRounded fontSize="small" />
            <Typography variant="body2">{t('summary.luggage', { count: transfer.luggageCount ?? 0 })}</Typography>
          </Stack>
          {!!transfer.childSeatCount && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <ChildFriendlyRounded fontSize="small" />
              <Typography variant="body2">{transfer.childSeatCount}</Typography>
            </Stack>
          )}
          {transfer.needsWheelchair && <AccessibleRounded fontSize="small" aria-label={t('vehicle.wheelchair')} />}
        </Stack>
      </CardContent>
    </Card>
  );
}
