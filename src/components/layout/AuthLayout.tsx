import { Suspense } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageSkeleton } from '@/components/feedback/LoadingSkeleton';
import { BrandLogo } from './BrandLogo';
import { LanguageMenu } from './LanguageMenu';
import { ThemeModeMenu } from './ThemeModeMenu';

/**
 * Giriş öncesi sayfalar: masaüstünde solda koyu siyah marka paneli, sağda açık zeminde form.
 * Mobilde üstte ince koyu şerit + form.
 */
export function AuthLayout() {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          bgcolor: 'inverse.main',
          color: 'inverse.contrastText',
          px: { xs: 2, md: 6 },
          py: { xs: 1.5, md: 6 },
          pt: { xs: 'calc(12px + env(safe-area-inset-top))', md: 6 },
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          alignItems: { xs: 'center', md: 'flex-start' },
          justifyContent: 'space-between',
          borderBottom: { xs: 2, md: 0 },
          borderRight: { md: 2 },
          borderColor: { xs: 'inverse.accent', md: 'inverse.accent' },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <BrandLogo />
        <Box sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 420 }}>
          <Box sx={{ width: 56, height: 4, bgcolor: 'inverse.accent', borderRadius: 2, mb: 3 }} />
          <Typography variant="h3" component="p" sx={{ mb: 2, lineHeight: 1.15 }}>
            {t('tagline')}
          </Typography>
        </Box>
        <Stack direction="row" sx={{ display: { xs: 'flex', md: 'none' } }}>
          <ThemeModeMenu />
          <LanguageMenu />
        </Stack>
        <Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' }, opacity: 0.6 }}>
          © {new Date().getFullYear()} {t('appName')}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Stack direction="row" sx={{ justifyContent: 'flex-end', p: 1.5, display: { xs: 'none', md: 'flex' } }}>
          <ThemeModeMenu />
          <LanguageMenu />
        </Stack>
        <Box sx={{ flexGrow: 1, display: 'grid', placeItems: 'center', px: 2, py: { xs: 3, md: 4 } }}>
          <Paper variant="outlined" sx={{ width: '100%', maxWidth: 480, p: { xs: 2.5, sm: 4 } }}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
