import type { ReactNode } from 'react';
import { Paper } from '@mui/material';

/** Form/sayfa aksiyonları için ekranın altına yapışan bar (mobilde zorunlu, §5.3). */
export function StickyActionBar({ children }: { children: ReactNode }) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: (t) => t.zIndex.appBar - 1,
        mt: 3,
        mx: { xs: -2, sm: 0 },
        px: 2,
        py: 1.5,
        pb: 'calc(12px + env(safe-area-inset-bottom))',
        borderRadius: { xs: 0, sm: 4 },
        borderTop: 2,
        borderColor: 'primary.main',
        bgcolor: 'inverse.main',
        color: 'inverse.contrastText',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      {children}
    </Paper>
  );
}
