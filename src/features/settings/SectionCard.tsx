import type { ReactNode } from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';

type Props = { title: string; description?: string; children?: ReactNode; tone?: 'default' | 'danger' };

/** Settings sayfasındaki başlıklı kart. `danger` kırmızı kenarlıklıdır. */
export function SectionCard({ title, description, children, tone = 'default' }: Props) {
  return (
    <Card sx={tone === 'danger' ? { borderColor: 'error.main' } : undefined}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h6" color={tone === 'danger' ? 'error' : undefined}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Stack>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}
