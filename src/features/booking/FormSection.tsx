import type { ReactNode } from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

/** Numaralı form bölümü kartı (siyah numara rozeti, altın rakam). */
export function FormSection({ index, title, children, action }: { index: number; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'inverse.main',
              color: 'inverse.accent',
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {index}
          </Box>
          <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {title}
          </Typography>
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}
