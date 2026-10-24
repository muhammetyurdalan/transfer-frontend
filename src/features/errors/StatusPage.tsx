import type { ReactNode } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { HomeRounded } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router';
import { useTranslation } from 'react-i18next';

type Props = {
  code: string;
  title: string;
  body: string;
  icon?: ReactNode;
  /** "Ana sayfaya git"ın soluna eklenecek butonlar */
  actions?: ReactNode;
  /** true: ana sayfaya tam sayfa yenilemeyle gidilir (uygulama durumu bozuk olabilir) */
  reloadHome?: boolean;
  children?: ReactNode;
};

export function StatusPage({ code, title, body, icon, actions, reloadHome, children }: Props) {
  const { t } = useTranslation();
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', py: { xs: 6, md: 10 }, textAlign: 'center' }}>
      {icon}
      <Typography
        variant="h1"
        component="p"
        sx={{ fontSize: { xs: '4rem', md: '6rem' }, color: 'primary.main', lineHeight: 1 }}
      >
        {code}
      </Typography>
      <Typography variant="h5" component="h1">
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        {body}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
        {actions}
        <Button
          component={RouterLink}
          to="/"
          reloadDocument={reloadHome}
          variant="contained"
          startIcon={<HomeRounded />}
        >
          {t('pages.goHome')}
        </Button>
      </Stack>
      {children}
    </Stack>
  );
}
