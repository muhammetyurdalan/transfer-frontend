import dayjs from 'dayjs';
import i18n from '@/i18n';

const locale = () => (i18n.language === 'tr' ? 'tr-TR' : 'en-US');

export function formatMoney(amount: string | number | null | undefined, currency?: string | null) {
  if (amount === null || amount === undefined || amount === '') return '—';
  const value = typeof amount === 'string' ? Number(amount) : amount;
  return new Intl.NumberFormat(locale(), {
    style: 'currency',
    currency: currency ?? 'TRY',
  }).format(value);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  return dayjs(value).format('L LT');
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  return dayjs(value).format('L');
}

export function formatTime(value: string | null | undefined) {
  if (!value) return '—';
  return dayjs(value).format('LT');
}

export function fromNow(value: string | null | undefined) {
  if (!value) return '';
  return dayjs(value).fromNow();
}

export function formatDistance(km: string | number | null | undefined) {
  if (km === null || km === undefined || km === '') return '—';
  const value = typeof km === 'string' ? Number(km) : km;
  return `${new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(value)} km`;
}

export function formatDuration(minutes: number | null | undefined) {
  if (minutes === null || minutes === undefined) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const t = i18n.t.bind(i18n);
  if (h === 0) return t('common:duration.minutes', { count: m });
  if (m === 0) return t('common:duration.hours', { count: h });
  return t('common:duration.hoursMinutes', { h, m });
}

/** `45 km · 1 sa 10 dk` */
export function formatRoute(km: string | number | null | undefined, minutes: number | null | undefined) {
  return `${formatDistance(km)} · ${formatDuration(minutes)}`;
}

/** Koordinatı backend'in istediği 6 ondalıklı string'e çevirir. */
export function toCoord(value: number): string {
  return value.toFixed(6);
}

/** Decimal alanlar backend'e string gider: `'40.50'`. */
export function toDecimal(value: number | string): string {
  return Number(value).toFixed(2);
}

export function initials(first?: string | null, last?: string | null, fallback?: string | null) {
  const text = [first, last].filter(Boolean).join(' ') || fallback || '';
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}
