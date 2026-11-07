import { useState, type ReactElement } from 'react';
import { Box, Button, Container, Grid, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import {
  AccessTimeRounded,
  AirportShuttleRounded,
  ArrowForwardRounded,
  DirectionsCarRounded,
  LoginRounded,
  PaymentsRounded,
  PlaceRounded,
  SupportAgentRounded,
  SwapVertRounded,
  VerifiedUserRounded,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AddressField, positionOf } from '@/components/address';
import { RouteMap } from '@/components/map/RouteMap';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { LanguageMenu } from '@/components/layout/LanguageMenu';
import { ThemeModeMenu } from '@/components/layout/ThemeModeMenu';
import { useRoute } from '@/features/booking/useRoute';
import { formatRoute } from '@/lib/format';
import type { SelectedAddress } from '@/lib/geo';
import { bookingDraftStore } from '@/lib/storage';

const FEATURES: { key: string; icon: ReactElement }[] = [
  { key: 'vip', icon: <DirectionsCarRounded /> },
  { key: 'onTime', icon: <AccessTimeRounded /> },
  { key: 'price', icon: <PaymentsRounded /> },
  { key: 'support', icon: <SupportAgentRounded /> },
];
const STEPS = ['route', 'vehicle', 'ride'] as const;

/**
 * Giriş yapmamış kullanıcıların ana sayfası. Üstte A/B noktası seçimi; "Devam" seçimi saklar ve login'e götürür,
 * giriş sonrası transfer oluşturma formu bu noktalarla açılır.
 */
export default function LandingPage() {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<SelectedAddress | null>(null);
  const [dropoff, setDropoff] = useState<SelectedAddress | null>(null);
  const from = positionOf(pickup);
  const to = positionOf(dropoff);
  const route = useRoute([from, to]);

  const start = () => {
    bookingDraftStore.set({ pickup, dropoff });
    void navigate(`/login?next=${encodeURIComponent('/transfers/new')}`);
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Üst bar: logo, tema/dil ve sağ üstte giriş */}
      <Box
        component="header"
        sx={{
          bgcolor: 'inverse.main',
          color: 'inverse.contrastText',
          pt: 'env(safe-area-inset-top)',
          position: 'sticky',
          top: 0,
          zIndex: (th) => th.zIndex.appBar,
          borderBottom: 2,
          borderColor: 'inverse.accent',
        }}
      >
        <Container sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 64 }}>
          <BrandLogo />
          <Box sx={{ flexGrow: 1 }} />
          <ThemeModeMenu />
          <LanguageMenu />
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            startIcon={<LoginRounded />}
            sx={{ bgcolor: 'inverse.accent', color: 'inverse.main', '&:hover': { bgcolor: 'inverse.accent', opacity: 0.9 } }}
          >
            {t('login')}
          </Button>
        </Container>
      </Box>

      {/* Hero + rota seçimi */}
      <Box sx={{ bgcolor: 'inverse.main', color: 'inverse.contrastText', pb: { xs: 6, md: 10 }, pt: { xs: 4, md: 8 } }}>
        <Container>
          <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ width: 56, height: 4, bgcolor: 'inverse.accent', borderRadius: 2, mb: 3 }} />
              <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.1, mb: 2 }}>
                {t('hero.title')}
              </Typography>
              <Typography variant="h6" component="p" sx={{ opacity: 0.75, fontWeight: 400, maxWidth: 480 }}>
                {t('hero.subtitle')}
              </Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 4, flexWrap: 'wrap', rowGap: 1.5 }}>
                {(['airport', 'safe'] as const).map((k) => (
                  <Stack key={k} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    {k === 'airport' ? (
                      <AirportShuttleRounded sx={{ color: 'inverse.accent' }} />
                    ) : (
                      <VerifiedUserRounded sx={{ color: 'inverse.accent' }} />
                    )}
                    <Typography variant="body2">{t(`hero.badges.${k}`)}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, color: 'text.primary' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('booking.title')}
                </Typography>
                <Stack spacing={1}>
                  <AddressField label={t('booking:fields.pickup')} value={pickup} onChange={setPickup} />
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Tooltip title={t('booking:fields.swap')}>
                      <IconButton
                        aria-label={t('booking:fields.swap')}
                        onClick={() => {
                          setPickup(dropoff);
                          setDropoff(pickup);
                        }}
                        sx={{ bgcolor: 'inverse.main', color: 'inverse.accent', '&:hover': { bgcolor: 'inverse.light' } }}
                      >
                        <SwapVertRounded />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <AddressField label={t('booking:fields.dropoff')} value={dropoff} onChange={setDropoff} near={from} />
                </Stack>

                {(from || to) && (
                  <Box sx={{ mt: 2 }}>
                    <RouteMap from={from} to={to} path={route.route?.path} height={200} />
                  </Box>
                )}

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{ mt: 2, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {route.route ? formatRoute(route.route.distance, route.route.duration) : t('booking.hint')}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardRounded />}
                    disabled={!pickup || !dropoff}
                    onClick={start}
                  >
                    {t('booking.continue')}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Özellikler */}
      <Container sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h4" component="h2" sx={{ textAlign: 'center', mb: 1 }}>
          {t('features.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 5, maxWidth: 560, mx: 'auto' }}>
          {t('features.subtitle')}
        </Typography>
        <Grid container spacing={3}>
          {FEATURES.map((f) => (
            <Grid key={f.key} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'highlight.main',
                    color: 'primary.dark',
                    mb: 2,
                  }}
                >
                  {f.icon}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {t(`features.items.${f.key}.title`)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t(`features.items.${f.key}.body`)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Nasıl çalışır */}
      <Box sx={{ bgcolor: 'highlight.main', py: { xs: 6, md: 10 } }}>
        <Container>
          <Typography variant="h4" component="h2" sx={{ textAlign: 'center', mb: 5 }}>
            {t('steps.title')}
          </Typography>
          <Grid container spacing={4}>
            {STEPS.map((s, i) => (
              <Grid key={s} size={{ xs: 12, md: 4 }}>
                <Stack direction="row" spacing={2}>
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'inverse.main',
                      color: 'inverse.accent',
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {t(`steps.items.${s}.title`)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(`steps.items.${s}.body`)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Kapanış çağrısı */}
      <Container sx={{ py: { xs: 6, md: 8 } }}>
        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            bgcolor: 'inverse.main',
            color: 'inverse.contrastText',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'center' },
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
              {t('cta.title')}
            </Typography>
            <Typography sx={{ opacity: 0.75 }}>{t('cta.body')}</Typography>
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
            <Button
              variant="contained"
              startIcon={<PlaceRounded />}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{ bgcolor: 'inverse.accent', color: 'inverse.main', '&:hover': { bgcolor: 'inverse.accent', opacity: 0.9 } }}
            >
              {t('cta.book')}
            </Button>
            <Button component={RouterLink} to="/register" variant="outlined" color="inherit">
              {t('cta.register')}
            </Button>
          </Stack>
        </Paper>
      </Container>

      <Box component="footer" sx={{ mt: 'auto', py: 3, borderTop: 1, borderColor: 'divider' }}>
        <Container sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} {t('common:appName')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('common:tagline')}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
