import { Button } from '@mui/material';
import { ErrorOutlineRounded, RefreshRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getErrorCode, errorKey } from '@/lib/errors';
import { EmptyState } from './EmptyState';

export function ErrorState({ error, onRetry }: { error?: unknown; onRetry?: () => void }) {
  const { t } = useTranslation();
  const code = error ? getErrorCode(error) : null;
  return (
    <EmptyState
      icon={<ErrorOutlineRounded color="error" />}
      title={t('error.title')}
      description={code ? t(errorKey(code)) : t('error.body')}
      action={
        onRetry && (
          <Button variant="outlined" startIcon={<RefreshRounded />} onClick={onRetry}>
            {t('actions.retry')}
          </Button>
        )
      }
    />
  );
}
