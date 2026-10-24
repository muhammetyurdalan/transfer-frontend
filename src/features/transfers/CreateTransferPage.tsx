import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CreateTransferDocument } from '@/graphql/generated/graphql';
import { useAuth } from '@/app/providers/AuthProvider';
import { PageHeader } from '@/components/PageHeader';
import { getErrorCode } from '@/lib/errors';
import { TransferForm } from '@/features/booking/TransferForm';
import { emptyValues, toCreateInput } from '@/features/booking/values';
import type { VehicleRouteState } from '@/features/booking/navigation';

/** `/transfers/new` (§8.3). Başarılıysa her zaman araç seçimine gidilir. */
export default function CreateTransferPage() {
  const { t } = useTranslation('booking');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [defaults] = useState(() => emptyValues(user));
  const [createTransfer, { loading }] = useMutation(CreateTransferDocument, {
    context: { skipErrorToast: true },
  });

  return (
    <>
      <PageHeader title={t('create.title')} subtitle={t('create.subtitle')} />
      <TransferForm
        mode="create"
        defaultValues={defaults}
        submitLabel={t('create.submit')}
        submitting={loading}
        onSubmit={async (values, route) => {
          try {
            const { data } = await createTransfer({
              variables: { data: toCreateInput(values, route) },
            });
            const result = data?.createTransfer;
            if (!result) return 'unknown';
            const state: VehicleRouteState = { vehicleOptions: result.vehicleOptions };
            void navigate(`/transfers/${result.transfer.id}/vehicle`, { state });
            return null;
          } catch (e) {
            return getErrorCode(e) ?? 'unknown';
          }
        }}
      />
    </>
  );
}
