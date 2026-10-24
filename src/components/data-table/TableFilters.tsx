import type { ReactNode } from 'react';
import { Stack } from '@mui/material';

/** DataTable `toolbar`'ı için filtre satırı: mobilde alt alta, geniş ekranda yan yana. */
export function TableFilters({ children }: { children: ReactNode }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      useFlexGap
     
     
      sx={{ alignItems: { xs: 'stretch', md: 'center' }, flexWrap: 'wrap', '& > *': { minWidth: { md: 200 } } }}
    >
      {children}
    </Stack>
  );
}
