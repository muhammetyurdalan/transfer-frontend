import { Box, Typography } from '@mui/material';
import { AirportShuttleRounded } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router';
import { useTranslation } from 'react-i18next';

/** Koyu zemin üzerinde altın logo. `tone="dark"` açık zemin için siyah metin kullanır. */
export function BrandLogo({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { t } = useTranslation();
  return (
    <Box
      component={RouterLink}
      to="/"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        color: tone === 'light' ? 'inverse.contrastText' : 'text.primary',
        textDecoration: 'none',
        minHeight: 44,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2.5,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <AirportShuttleRounded fontSize="small" />
      </Box>
      <Typography variant="h6" component="span" sx={{ letterSpacing: '0.02em' }}>
        {t('appName')}
      </Typography>
    </Box>
  );
}
