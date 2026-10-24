import type { Dayjs } from 'dayjs';
import type { RouteSegment, SelectedAddress } from '@/lib/geo';

/** Pickup ile dropoff arasındaki ara durak (useFieldArray nesne ister). */
export type StopValue = { address: SelectedAddress | null };

export type TransferFormValues = {
  pickup: SelectedAddress | null;
  dropoff: SelectedAddress | null;
  pickupTime: Dayjs | null;
  passengerCount: number;
  luggageCount: number;
  childSeatCount: number;
  needsWheelchair: boolean;
  passengerName: string;
  passengerPhone: string;
  flightNumber: string;
  note: string;
  /** Ara duraklar, sırayla ziyaret edilir. En fazla `MAX_STOPS` */
  stops: StopValue[];
};

/** OSRM'den hesaplanan rota (submit'te `distance` / `duration` olarak gider). */
export type RouteInfo = {
  distance: string;
  duration: number;
  path?: [number, number][];
  /** Ardışık noktalar arası bölümler (ara durak varsa `legs` bunlardan üretilir) */
  segments?: RouteSegment[];
};

/** Form gönderiminde sunucudan dönen hata kodu (alanlara dağıtılır). */
export type SubmitResult = { errorCode: string | null } | void;
