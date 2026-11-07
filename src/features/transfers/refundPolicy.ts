import dayjs from 'dayjs';

/** Ceza basamağı: başlangıca `hours` saatten az kala iptalde ödemenin `rate` (0-1) kadarı kesilir. */
export type PenaltyTier = { hours: number; rate: number };

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** Bölgenin `customerImposedHours` / `customerImposedRates` JSON listeleri → saate göre artan basamaklar. */
export function penaltyTiers(state: { customerImposedHours?: unknown; customerImposedRates?: unknown } | null | undefined) {
  const hours = asArray(state?.customerImposedHours);
  const rates = asArray(state?.customerImposedRates);
  return hours
    .map<PenaltyTier>((h, i) => ({ hours: Number(h), rate: Number(rates[i] ?? 0) }))
    .filter((x) => Number.isFinite(x.hours) && Number.isFinite(x.rate))
    .sort((a, b) => a.hours - b.hours);
}

/**
 * Şu an iptal edilirse uygulanacak basamak: kalan süreden büyük en küçük eşik
 * (ör. 24s→%50, 2s→%100 iken 5 saat kala %50). Hiçbiri tutmuyorsa kesintisiz iptal.
 */
export function applicableTier(tiers: PenaltyTier[], pickupTime: string | null | undefined, now = dayjs()) {
  if (!pickupTime) return null;
  const hoursLeft = dayjs(pickupTime).diff(now, 'minute') / 60;
  return tiers.find((x) => hoursLeft < x.hours) ?? null;
}

/** Kuruş hassasiyetinde kesinti ve iade tutarları. */
export function refundSplit(price: string | number | null | undefined, rate: number) {
  const total = Math.round(Number(price ?? 0) * 100);
  const deducted = Math.round(total * Math.min(Math.max(rate, 0), 1));
  return { total: total / 100, deducted: deducted / 100, refund: (total - deducted) / 100 };
}
