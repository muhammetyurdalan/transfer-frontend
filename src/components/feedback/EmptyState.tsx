import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { InboxRounded } from '@mui/icons-material';

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, description, icon, action }: Props) {
  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', py: 6, px: 2, textAlign: 'center' }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'highlight.main',
          color: 'primary.dark',
          border: 1,
          borderColor: 'highlight.border',
          '& svg': { fontSize: 32 },
        }}
      >
        {icon ?? <InboxRounded />}
      </Box>
      <Typography sx={{ fontWeight: 600 }} variant="subtitle1">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
