import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '@/lib/format';
import type { BookingTransferFieldsFragment } from '@/graphql/generated/graphql';

type Leg = NonNullable<BookingTransferFieldsFragment['legs']>[number];

/** Düzenlemede salt okunur ara duraklar (`updateTransfer` leg değiştiremez). */
export function LegsReadOnly({ legs }: { legs: Leg[] }) {
  const { t } = useTranslation('booking');
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 4, p: { xs: 2, sm: 3 } }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        {t('sections.legs')}
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1.5 }}>
        {t('legs.readOnly')}
      </Typography>
      {legs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('legs.none')}
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {[...legs]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((leg, i) => (
              <Box key={leg.id} sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t('legs.segment', { n: i + 1 })}: {leg.startAddress} → {leg.endAddress}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(leg.startTime)} – {formatDateTime(leg.endTime)}
                </Typography>
              </Box>
            ))}
        </Stack>
      )}
    </Box>
  );
}
