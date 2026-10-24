import { DarkModeRounded, LightModeRounded, SettingsBrightnessRounded } from '@mui/icons-material';

export const themeModeOptions = [
  { value: 'light', label: 'theme.light', icon: <LightModeRounded fontSize="small" /> },
  { value: 'dark', label: 'theme.dark', icon: <DarkModeRounded fontSize="small" /> },
  { value: 'system', label: 'theme.system', icon: <SettingsBrightnessRounded fontSize="small" /> },
] as const;
