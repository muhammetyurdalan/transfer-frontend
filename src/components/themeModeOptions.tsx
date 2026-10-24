import { DarkModeRounded, LightModeRounded, SettingsBrightnessRounded } from '@mui/icons-material';

export const themeModeOptions = [
  { value: 'light', label: 'theme.light', icon: <LightModeRounded /> },
  { value: 'dark', label: 'theme.dark', icon: <DarkModeRounded /> },
  { value: 'system', label: 'theme.system', icon: <SettingsBrightnessRounded /> },
] as const;
