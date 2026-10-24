import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

type Props = { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; back?: ReactNode };

/** Sayfa başlığı + sağda aksiyonlar. Mobilde alt alta dizilir. Başlığın altında altın vurgu çizgisi. */
export function PageHeader({ title, subtitle, actions, back }: Props) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
     
     
      sx={{ alignItems: { xs: 'stretch', sm: 'flex-end' }, justifyContent: 'space-between', mb: { xs: 2, sm: 3 } }}
    >
      <Box sx={{ minWidth: 0 }}>
        {back}
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' } }}>
          {title}
        </Typography>
        <Box sx={{ width: 40, height: 3, bgcolor: 'primary.main', borderRadius: 2, mt: 1 }} />
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', flexShrink: 0 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
