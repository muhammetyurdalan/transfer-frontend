import { Stack, Tooltip, Typography } from '@mui/material';
import { EastRounded } from '@mui/icons-material';
import type { TransferRowFragment } from '@/graphql/generated/graphql';

/** Güzergah hücresi: alış → bırakış, uzun adresler kısaltılıp tooltip'te tam gösterilir. */
export function TransferRouteCell({ row }: { row: TransferRowFragment }) {
  return (
    <Stack sx={{ minWidth: 0, maxWidth: { xs: '100%', sm: 280 } }}>
      <Tooltip title={row.pickupAddress ?? ''}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
          {row.pickupAddress}
        </Typography>
      </Tooltip>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
        <EastRounded sx={{ fontSize: 14, color: 'primary.main' }} />
        <Tooltip title={row.dropoffAddress ?? ''}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.dropoffAddress}
          </Typography>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
