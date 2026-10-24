import { Alert, Step, StepLabel, Stepper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { TransferStatus } from '@/graphql/generated/graphql';
import { useIsMobile } from '@/hooks/useIsMobile';

const FLOW: TransferStatus[] = ['PENDING', 'PAID', 'ASSIGNED', 'STARTED', 'COMPLETED'];

/** PENDING → PAID → ASSIGNED → STARTED → COMPLETED. İptalde kırmızı uyarı (§8.6). */
export function StatusTimeline({ status }: { status?: TransferStatus | null }) {
  const { t } = useTranslation('transfers');
  const mobile = useIsMobile();
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
      alternativeLabel={!mobile}
      orientation={mobile ? 'vertical' : 'horizontal'}
    >
      {FLOW.map((s) => (
        <Step key={s}>
          <StepLabel>{t(`timeline.${s}`)}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
