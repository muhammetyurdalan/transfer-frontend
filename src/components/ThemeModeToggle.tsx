import { ToggleButton, ToggleButtonGroup, useColorScheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { themeModeOptions } from './themeModeOptions';

/** Settings > Profil > Görünüm kartındaki Açık / Koyu / Sistem seçici (§5.2). */
export function ThemeModeToggle() {
  const { t } = useTranslation();
  const { mode, setMode } = useColorScheme();
  return (
    <ToggleButtonGroup
      exclusive
      fullWidth
      value={mode ?? 'light'}
      onChange={(_, value) => value && setMode(value)}
      aria-label={t('nav.theme')}
    >
      {themeModeOptions.map((o) => (
        <ToggleButton key={o.value} value={o.value} sx={{ gap: 1, minHeight: 44 }}>
          {o.icon}
          {t(o.label)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
