import { Stack, Typography } from '@mui/material';
import { CancelRounded, CheckCircleRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PASSWORD_RULES } from './schemas';

/** Şifre kuralları madde madde: sağlanan kural yeşil (✓), sağlanmayan kırmızı (✕). Yazdıkça güncellenir. */
export function PasswordRules({ password }: { password: string }) {
  const { t } = useTranslation('auth');
  return (
    <Stack component="ul" spacing={0.5} aria-live="polite" sx={{ m: 0, p: 0, listStyle: 'none' }}>
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        const Icon = ok ? CheckCircleRounded : CancelRounded;
        return (
          <Stack
            key={rule.key}
            component="li"
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', color: ok ? 'success.main' : 'error.main' }}
          >
            <Icon sx={{ fontSize: 18 }} aria-hidden />
            <Typography variant="body2" color="inherit">
              {t(`rules.${rule.key.split('.')[1]}`)}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
