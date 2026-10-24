import dayjs, { type Dayjs } from 'dayjs';
import { z } from 'zod';
import type { TFunction } from 'i18next';
import type { SelectedAddress } from '@/lib/geo';

/** Pickup için en erken zaman: şu an + 15 dk (backend gelecek ister, ERR016). */
export const MIN_LEAD_MINUTES = 15;
export const minPickupTime = () => dayjs().add(MIN_LEAD_MINUTES, 'minute');

/** Pickup ile dropoff arasına eklenebilecek en fazla ara durak */
export const MAX_STOPS = 10;

const isAddress = (v: unknown): v is SelectedAddress =>
  !!v &&
  typeof v === 'object' &&
  !!(v as SelectedAddress).address &&
  !!(v as SelectedAddress).latitude &&
  !!(v as SelectedAddress).longitude;

/**
 * Form şeması. Mesajlar i18n'den gelir.
 * `initialPickupTime` (düzenleme): değişmeyen geçmiş zaman tekrar doğrulanmaz.
 */
export function makeTransferSchema(t: TFunction, initialPickupTime?: Dayjs | null) {
  const required = t('booking:validation.required');
  const max = (n: number) => t('booking:validation.max', { max: n });
  const address = z.custom<SelectedAddress | null>(isAddress, { message: t('booking:validation.address') });
  const dateTime = z.custom<Dayjs | null>((v) => dayjs.isDayjs(v) && v.isValid(), { message: required });
  const count = (min: number) =>
    z
      .number({ message: required })
      .int({ message: t('booking:validation.integer') })
      .min(min, { message: t('booking:validation.min', { min }) });

  return z.object({
    pickup: address,
    dropoff: address,
    pickupTime: dateTime.refine(
      (v) =>
        !!v &&
        ((initialPickupTime && v.isSame(initialPickupTime)) ||
          !v.isBefore(minPickupTime().subtract(1, 'minute'))),
      { message: t('booking:validation.future') },
    ),
    passengerCount: count(1),
    luggageCount: count(0),
    childSeatCount: count(0),
    needsWheelchair: z.boolean(),
    passengerName: z.string().trim().min(1, { message: required }).max(100, { message: max(100) }),
    passengerPhone: z.string().trim().max(20, { message: max(20) }),
    flightNumber: z.string().trim().max(10, { message: max(10) }),
    note: z.string(),
    stops: z.array(z.object({ address })).max(MAX_STOPS),
  });
}
