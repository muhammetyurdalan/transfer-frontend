import type { Dayjs } from 'dayjs';
import type { SelectedAddress } from '@/lib/geo';

export type LegValues = {
  start: SelectedAddress | null;
  end: SelectedAddress | null;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
};

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
  legs: LegValues[];
};

/** OSRM'den hesaplanan rota (submit'te `distance` / `duration` olarak gider). */
export type RouteInfo = {
  distance: string;
  duration: number;
  path?: [number, number][];
};

/** Form gönderiminde sunucudan dönen hata kodu (alanlara dağıtılır). */
export type SubmitResult = { errorCode: string | null } | void;
