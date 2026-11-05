import type { ReactNode } from 'react';
import { matchPath } from 'react-router';
import {
  AddRounded,
  ChatRounded,
  DirectionsCarRounded,
  HeadsetMicRounded,
  ListAltRounded,
  WorkRounded,
} from '@mui/icons-material';
import type { Role } from '@/graphql/generated/graphql';

export type NavItem = { to: string; label: string; icon: ReactNode };

/** Role göre header/drawer linkleri (§7). `label` i18n anahtarıdır. */
export function navItemsFor(role: Role | null | undefined): NavItem[] {
  const transfers = { to: '/transfers', label: 'nav.transfers', icon: <ListAltRounded /> };
  const dispatch = { to: '/dispatch', label: 'nav.dispatch', icon: <HeadsetMicRounded /> };
  const vehicles = { to: '/vehicles', label: 'nav.vehicles', icon: <DirectionsCarRounded /> };
  // Mesajlaşma katılımcıları (customer, driver, operator). ADMIN/STAFF mesajları transfer detayında okur.
  const messages = { to: '/messages', label: 'nav.messages', icon: <ChatRounded /> };
  const createTransfer = { to: '/transfers/new', label: 'nav.createTransfer', icon: <AddRounded /> };
  switch (role) {
    case 'CUSTOMER':
      return [
        createTransfer,
        { ...transfers, label: 'nav.myTransfers' },
        messages,
      ];
    case 'OPERATOR':
      // Araçlar, müşteriler ve sürücüler Settings sekmelerinde
      return [dispatch, transfers, createTransfer, messages];
    case 'DRIVER':
      return [
        { to: '/jobs', label: 'nav.jobs', icon: <WorkRounded /> },
        messages,
        { ...vehicles, label: 'nav.myVehicles' },
      ];
    case 'ADMIN':
    case 'STAFF':
      // Araçlar, kategoriler, müşteriler, sürücüler ve operatörler Settings sekmelerinde
      return [transfers, createTransfer, dispatch];
    default:
      return [];
  }
}

/**
 * O anki adrese en uzun eşleşen linki döner. `/transfers/new`'de sadece "Create Transfer",
 * `/transfers/12`'de "Transfers" aktif görünür.
 */
export function activeNavPath(items: NavItem[], pathname: string) {
  return items
    .filter((item) => matchPath({ path: item.to, end: false }, pathname))
    .sort((a, b) => b.to.length - a.to.length)[0]?.to;
}

/** `/` yönlendirmesi */
export function homePathFor(role: Role | null | undefined) {
  switch (role) {
    case 'CUSTOMER':
      return '/transfers/new';
    case 'OPERATOR':
      return '/dispatch';
    case 'DRIVER':
      return '/jobs';
    default:
      return '/transfers';
  }
}
