import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import { useTranslation } from 'react-i18next';

/** VIP + araç logosu (`public/logo.svg`) ve uygulama adı. `tone="dark"` açık zemin için siyah metin kullanır. */
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
        component="img"
        src="/logo.svg"
        alt=""
        // Dark modda header zemini de siyah; ince altın çerçeve kenarı belli eder
        sx={{ width: 36, height: 36, borderRadius: '8px', display: 'block', border: 1, borderColor: 'inverse.accentSoft' }}
      />
      <Typography variant="h6" component="span" sx={{ letterSpacing: '0.02em' }}>
        {t('appName')}
      </Typography>
    </Box>
  );
}
