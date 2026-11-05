import type { StateItemFragment } from '@/graphql/generated/graphql';

/** İptal cezası basamağı: başlangıca `hours` saatten az kala iptal edilirse `percent`% ceza */
export type PenaltyTier = { hours: string; percent: string };

/** Backend JSON alanı dizi değilse boş kabul edilir. */
const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** `customerImposedHours` + `customerImposedRates` (0-1) → form basamakları (yüzde). */
export function tiersOf(s: Pick<StateItemFragment, 'customerImposedHours' | 'customerImposedRates'> | null) {
  const hours = asArray(s?.customerImposedHours);
  const rates = asArray(s?.customerImposedRates);
  return hours.map<PenaltyTier>((h, i) => ({
    hours: String(h),
    percent: String(Math.round(Number(rates[i] ?? 0) * 10000) / 100),
  }));
}

/** Form basamakları → backend listeleri: saate göre artan sıralı, oran 0-1 aralığında Decimal string. */
export function toPenaltyLists(tiers: PenaltyTier[]) {
  const sorted = tiers
    .map((t) => ({ hours: Number(t.hours), rate: Number(t.percent.replace(',', '.')) / 100 }))
    .sort((a, b) => a.hours - b.hours);
  return {
    customerImposedHours: sorted.map((t) => t.hours),
    customerImposedRates: sorted.map((t) => String(Number(t.rate.toFixed(4)))),
  };
}
