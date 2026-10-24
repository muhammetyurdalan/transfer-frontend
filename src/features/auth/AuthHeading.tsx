import { Box, Typography } from '@mui/material';

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" component="h1">
        {title}
      </Typography>
      <Box sx={{ width: 40, height: 3, bgcolor: 'primary.main', borderRadius: 2, my: 1.25 }} />
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
