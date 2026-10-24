import { useEffect } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { RefreshRounded, ReportProblemRounded } from '@mui/icons-material';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { useTranslation } from 'react-i18next';
import { env } from '@/lib/env';
import { StatusPage } from './StatusPage';

/** Yeni sürüm yayınlandıktan sonra eski lazy chunk'ları yüklenemez: yenilemek yeter. */
function isChunkLoadError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  return (
    (error instanceof Error && error.name === 'ChunkLoadError') ||
    /dynamically imported module|Importing a module script failed|error loading dynamically imported/i.test(message)
  );
}

/**
 * Router `errorElement`'i (§7). Render/yükleme sırasında fırlatılan hataları yakalar.
 * `fullPage`: layout dışında (kök route) kullanıldığında kendi zeminini çizer.
 */
export default function ErrorBoundaryPage({ fullPage }: { fullPage?: boolean }) {
  const { t } = useTranslation();
  const error = useRouteError();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const response = isRouteErrorResponse(error) ? error : null;
  const chunk = isChunkLoadError(error);
  const code = response ? String(response.status) : '500';
  const body = chunk ? t('errorBoundary.chunk') : response?.status === 404 ? t('pages.notFoundBody') : t('errorBoundary.body');
  const details = response ? `${response.status} ${response.statusText}` : error instanceof Error ? (error.stack ?? error.message) : String(error);

  const page = (
    <StatusPage
      code={code}
      title={response?.status === 404 ? t('pages.notFoundTitle') : t('errorBoundary.title')}
      body={body}
      reloadHome
      icon={
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'highlight.main',
            border: 1,
            borderColor: 'highlight.border',
            color: 'primary.dark',
          }}
        >
          <ReportProblemRounded sx={{ fontSize: 36 }} />
        </Box>
      }
      actions={
        <Button variant="outlined" color="secondary" startIcon={<RefreshRounded />} onClick={() => window.location.reload()}>
          {t('errorBoundary.reload')}
        </Button>
      }
    >
      {env.DEV && (
        <Box
          component="details"
          sx={{ width: '100%', maxWidth: 720, textAlign: 'left', mt: 2, '& summary': { cursor: 'pointer', color: 'text.secondary' } }}
        >
          <summary>{t('errorBoundary.details')}</summary>
          <Typography
            component="pre"
            variant="caption"
            sx={{ mt: 1, p: 2, borderRadius: 2, bgcolor: 'inverse.main', color: 'inverse.contrastText', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {details}
          </Typography>
        </Box>
      )}
    </StatusPage>
  );

  if (!fullPage) return page;
  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'grid', alignItems: 'center' }}>
      <Container maxWidth="sm">{page}</Container>
    </Box>
  );
}
