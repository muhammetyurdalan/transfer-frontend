import { Alert, Step, StepLabel, Stepper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { TransferStatus } from '@/graphql/generated/graphql';

const FLOW: TransferStatus[] = ['PENDING', 'PAID', 'ASSIGNED', 'STARTED', 'COMPLETED'];

/** PENDING → PAID → ASSIGNED → STARTED → COMPLETED, her ekranda dikey. `dense`: küçük ikon ve aralıklar. İptalde kırmızı uyarı (§8.6). */
export function StatusTimeline({ status, dense }: { status?: TransferStatus | null; dense?: boolean }) {
  const { t } = useTranslation('transfers');
  if (status === 'CANCELLED') {
    return (
      <Alert severity="error" variant="filled">
        {t('detail.cancelled')}
      </Alert>
    );
  }
  const active = Math.max(0, FLOW.indexOf(status ?? 'PENDING'));
  return (
    <Stepper
      activeStep={status === 'COMPLETED' ? FLOW.length : active + 1}
      orientation="vertical"
      sx={
        dense
          ? {
              '& .MuiStepLabel-root': { py: 0.25 },
              '& .MuiStepLabel-label': { typography: 'body2' },
              '& .MuiStepIcon-root': { fontSize: '1.25rem' },
              '& .MuiStepConnector-line': { minHeight: 12 },
              '& .MuiStepConnector-root': { ml: '10px' },
            }
          : undefined
      }
    >
      {FLOW.map((s) => (
        <Step key={s}>
          <StepLabel>{t(`timeline.${s}`)}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
