import dayjs from 'dayjs';
import type {
  BookingTransferFieldsFragment,
  CreateLeg,
  CreateTransfer,
  CurrentUserFragment,
  UpdateTransfer,
} from '@/graphql/generated/graphql';
import type { SelectedAddress } from '@/lib/geo';
import { toPhoneValue } from '@/lib/phone';
import { minPickupTime } from './schema';
import type { RouteInfo, TransferFormValues } from './types';

export const sameAddress = (a: SelectedAddress | null, b: SelectedAddress | null) =>
  !!a && !!b && a.latitude === b.latitude && a.longitude === b.longitude && a.address === b.address;

const blankToUndefined = (v: string) => (v.trim() ? v.trim() : undefined);

/** Yeni transfer formu: yolcu bilgisi varsayılan olarak giriş yapan kullanıcıdır. */
export function emptyValues(user: CurrentUserFragment | null): TransferFormValues {
  return {
    pickup: null,
    dropoff: null,
    pickupTime: minPickupTime().add(45, 'minute').startOf('hour'),
    passengerCount: 1,
    luggageCount: 0,
    childSeatCount: 0,
    needsWheelchair: false,
    passengerName: user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' '),
    passengerPhone: toPhoneValue(user?.phone),
    flightNumber: '',
    note: '',
    stops: [],
  };
}

function addressOf(
  address: string | null,
  lat: string | null,
  lng: string | null,
  district: { name: string | null } | null,
): SelectedAddress | null {
  if (!address || !lat || !lng) return null;
  // Backend koordinatı 6 ondalık döner; karşılaştırma için aynı biçime getirilir.
  return {
    address,
    latitude: Number(lat).toFixed(6),
    longitude: Number(lng).toFixed(6),
    districtName: district?.name ?? '',
  };
}

export function fromTransfer(t: BookingTransferFieldsFragment): TransferFormValues {
  return {
    pickup: addressOf(t.pickupAddress, t.pickupLatitude, t.pickupLongitude, t.pickupDistrict),
    dropoff: addressOf(t.dropoffAddress, t.dropoffLatitude, t.dropoffLongitude, t.dropoffDistrict),
    pickupTime: t.pickupTime ? dayjs(t.pickupTime) : null,
    passengerCount: t.passengerCount ?? 1,
    luggageCount: t.luggageCount ?? 0,
    childSeatCount: t.childSeatCount ?? 0,
    needsWheelchair: !!t.needsWheelchair,
    passengerName: t.passengerName ?? '',
    passengerPhone: toPhoneValue(t.passengerPhone),
    flightNumber: t.flightNumber ?? '',
    note: t.note ?? '',
    stops: [],
  };
}

export function routeFromTransfer(t: BookingTransferFieldsFragment): RouteInfo | null {
  return t.distance && t.duration ? { distance: Number(t.distance).toFixed(2), duration: t.duration } : null;
}

/**
 * Ara durak varsa rota bölümlerinden `legs` üretilir: pickup → durak 1 → … → dropoff.
 * Zamanlar pickup zamanından başlayıp OSRM bölüm süreleri eklenerek hesaplanır.
 */
export function buildLegs(v: TransferFormValues, route: RouteInfo): CreateLeg[] {
  const stops = v.stops.map((s) => s.address).filter((a): a is SelectedAddress => !!a);
  if (stops.length === 0 || !v.pickup || !v.dropoff || !v.pickupTime) return [];
  const points = [v.pickup, ...stops, v.dropoff];
  let start = v.pickupTime;
  return points.slice(0, -1).map((from, order) => {
    const to = points[order + 1];
    const minutes = Math.max(1, route.segments?.[order]?.duration ?? 1);
    const end = start.add(minutes, 'minute');
    const leg: CreateLeg = {
      startAddress: from.address,
      startLatitude: from.latitude,
      startLongitude: from.longitude,
      startTime: start.toISOString(),
      endAddress: to.address,
      endLatitude: to.latitude,
      endLongitude: to.longitude,
      endTime: end.toISOString(),
      order,
    };
    start = end;
    return leg;
  });
}

export function toCreateInput(v: TransferFormValues, route: RouteInfo): CreateTransfer {
  const pickup = v.pickup!;
  const dropoff = v.dropoff!;
  const legs = buildLegs(v, route);
  return {
    pickupAddress: pickup.address,
    pickupLatitude: pickup.latitude,
    pickupLongitude: pickup.longitude,
    pickupDistrictName: pickup.districtName,
    dropoffAddress: dropoff.address,
    dropoffLatitude: dropoff.latitude,
    dropoffLongitude: dropoff.longitude,
    dropoffDistrictName: dropoff.districtName,
    pickupTime: v.pickupTime!.toISOString(),
    distance: route.distance,
    duration: route.duration,
    passengerCount: v.passengerCount,
    luggageCount: v.luggageCount,
    childSeatCount: v.childSeatCount,
    needsWheelchair: v.needsWheelchair,
    passengerName: v.passengerName.trim(),
    passengerPhone: blankToUndefined(v.passengerPhone.number),
    flightNumber: blankToUndefined(v.flightNumber.toUpperCase()),
    note: blankToUndefined(v.note),
    ...(legs.length > 0 && { legs }),
  };
}

/** Rota/ihtiyaç alanları: değişirse backend araç seçimini ve fiyatı sıfırlar (§8.5). */
const RESET_FIELDS = [
  'pickupTime',
  'distance',
  'duration',
  'passengerCount',
  'luggageCount',
  'childSeatCount',
  'needsWheelchair',
] as const;

/** Sadece değişen alanları içeren `UpdateTransfer`. `resetsVehicle`: araç seçimine dönülmeli mi. */
export function toUpdateInput(id: string, v: TransferFormValues, initial: TransferFormValues, route: RouteInfo) {
  const data: UpdateTransfer = { id };
  if (!sameAddress(v.pickup, initial.pickup) && v.pickup) {
    data.pickupAddress = v.pickup.address;
    data.pickupLatitude = v.pickup.latitude;
    data.pickupLongitude = v.pickup.longitude;
    data.pickupDistrictName = v.pickup.districtName;
  }
  if (!sameAddress(v.dropoff, initial.dropoff) && v.dropoff) {
    data.dropoffAddress = v.dropoff.address;
    data.dropoffLatitude = v.dropoff.latitude;
    data.dropoffLongitude = v.dropoff.longitude;
    data.dropoffDistrictName = v.dropoff.districtName;
  }
  if (data.pickupAddress || data.dropoffAddress) {
    data.distance = route.distance;
    data.duration = route.duration;
  }
  if (v.pickupTime && !(initial.pickupTime && v.pickupTime.isSame(initial.pickupTime))) {
    data.pickupTime = v.pickupTime.toISOString();
  }
  if (v.passengerCount !== initial.passengerCount) data.passengerCount = v.passengerCount;
  if (v.luggageCount !== initial.luggageCount) data.luggageCount = v.luggageCount;
  if (v.childSeatCount !== initial.childSeatCount) data.childSeatCount = v.childSeatCount;
  if (v.needsWheelchair !== initial.needsWheelchair) data.needsWheelchair = v.needsWheelchair;
  if (v.passengerName.trim() !== initial.passengerName) data.passengerName = v.passengerName.trim();
  if (v.passengerPhone.number !== initial.passengerPhone.number) data.passengerPhone = v.passengerPhone.number;
  const flight = v.flightNumber.trim().toUpperCase();
  if (flight !== initial.flightNumber) data.flightNumber = flight;
  if (v.note !== initial.note) data.note = v.note;

  const changed = Object.keys(data).length > 1;
  const resetsVehicle = RESET_FIELDS.some((f) => data[f] !== undefined);
  return { data, changed, resetsVehicle };
}
