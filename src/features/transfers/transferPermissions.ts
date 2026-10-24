import type { CurrentUserFragment, TransferStatus } from '@/graphql/generated/graphql';

/** Aksiyon görünürlüğü için transferin gereken alanları */
export type TransferLike = {
  status?: TransferStatus | null;
  customerId?: string | null;
  driverId?: string | null;
  operatorId?: string | null;
};

type User = Pick<CurrentUserFragment, 'id' | 'role'> | null | undefined;

const is = (t: TransferLike, ...statuses: TransferStatus[]) =>
  !!t.status && statuses.includes(t.status);
const isStaff = (u: User) => u?.role === 'ADMIN' || u?.role === 'STAFF';
const isOps = (u: User) => isStaff(u) || u?.role === 'OPERATOR';

/** Rol ve duruma göre transfer aksiyon kuralları (§8.2, §8.6). Backend yetkiyi tekrar kontrol eder. */
export const can = {
  pay: (u: User, t: TransferLike) => u?.role === 'CUSTOMER' && is(t, 'PENDING'),
  edit: (u: User, t: TransferLike) => u?.role === 'CUSTOMER' && is(t, 'PENDING'),
  assign: (u: User, t: TransferLike) => isOps(u) && is(t, 'PAID', 'ASSIGNED'),
  start: (u: User, t: TransferLike) =>
    is(t, 'ASSIGNED') && ((u?.role === 'DRIVER' && t.driverId === u.id) || isStaff(u)),
  complete: (u: User, t: TransferLike) =>
    is(t, 'STARTED') && ((u?.role === 'DRIVER' && t.driverId === u.id) || isStaff(u)),
  tip: (u: User, t: TransferLike) => u?.role === 'CUSTOMER' && is(t, 'COMPLETED'),
  cancel: (u: User, t: TransferLike) =>
    (u?.role === 'CUSTOMER' || isOps(u)) && is(t, 'PENDING', 'PAID', 'ASSIGNED'),
  /** Mesajlaşma katılımcısı mı (customer, driver, operator) */
  participant: (u: User, t: TransferLike) =>
    !!u && [t.customerId, t.driverId, t.operatorId].includes(u.id),
  /** Mesaj yazılabilir mi */
  message: (u: User, t: TransferLike) => is(t, 'ASSIGNED', 'STARTED') && can.participant(u, t),
  /** Detay sayfasında gösterilecek en az bir aksiyon var mı */
  anyDetailAction: (u: User, t: TransferLike) =>
    can.pay(u, t) ||
    can.edit(u, t) ||
    can.assign(u, t) ||
    can.start(u, t) ||
    can.complete(u, t) ||
    can.tip(u, t) ||
    can.cancel(u, t),
  /** Mesaj geçmişi görüntülenebilir mi */
  readMessages: (u: User, t: TransferLike) => can.participant(u, t) || isStaff(u),
};
