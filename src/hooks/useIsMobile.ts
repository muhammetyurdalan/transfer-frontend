import { useMediaQuery, useTheme } from '@mui/material';

/** `< sm` (600px): dialog'lar tam ekran, DataTable kart görünümü. */
export function useIsMobile() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
}

/** `< md` (900px): header linkleri drawer'a taşınır. */
export function useIsCompact() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'));
}
