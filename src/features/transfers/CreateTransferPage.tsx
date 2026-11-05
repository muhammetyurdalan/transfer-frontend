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
import type { CustomerOption } from '@/features/booking/customer';

/** `/transfers/new` (§8.3). Başarılıysa her zaman araç seçimine gidilir. */
export default function CreateTransferPage() {
  const { t } = useTranslation('booking');
  const { user, hasRole } = useAuth();
  // Personel başkası adına transfer açabilir; CUSTOMER her zaman kendi adına açar.
  const canPickCustomer = hasRole('OPERATOR', 'ADMIN', 'STAFF');
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
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
        customer={canPickCustomer ? { value: customer, onChange: setCustomer } : undefined}
        onSubmit={async (values, route) => {
          try {
            const { data } = await createTransfer({
              variables: {
                data: {
                  ...toCreateInput(values, route),
                  // Müşteri seçilmezse transfer giriş yapan personelin hesabına açılır
                  ...(canPickCustomer && { customerId: customer?.id ?? user?.id }),
                },
              },
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
