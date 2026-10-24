import type { ReactNode } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import { useTranslation } from 'react-i18next';

export function StatusPage({ code, title, body, icon }: { code: string; title: string; body: string; icon?: ReactNode }) {
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
      <Button component={RouterLink} to="/" variant="contained" color="secondary">
        {t('pages.goHome')}
      </Button>
    </Stack>
  );
}
