import { Skeleton, Stack } from '@mui/material';

/** Sayfa yüklenirken (spinner yerine) kullanılan iskelet. */
export function PageSkeleton() {
  return (
    <Stack spacing={2} aria-busy="true">
      <Skeleton variant="text" width="40%" height={44} />
      <Skeleton variant="rounded" height={120} />
      <Skeleton variant="rounded" height={240} />
    </Stack>
  );
}

export function CardSkeleton({ height = 160 }: { height?: number }) {
  return <Skeleton variant="rounded" height={height} sx={{ borderRadius: 4 }} />;
}
