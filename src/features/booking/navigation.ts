import type { VehicleOptionItemFragment } from '@/graphql/generated/graphql';

/** Araç seçimi sayfasına route state ile taşınan veri (§8.3). */
export type VehicleRouteState = { vehicleOptions?: VehicleOptionItemFragment[] };
