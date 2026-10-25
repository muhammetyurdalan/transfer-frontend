import type { ReactNode } from 'react';
import { matchPath } from 'react-router';
import {
  AddRounded,
  CategoryRounded,
  ChatRounded,
  DirectionsCarRounded,
  GroupRounded,
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
  switch (role) {
    case 'CUSTOMER':
      // createTransfer sadece CUSTOMER'a açık
      return [
        { to: '/transfers/new', label: 'nav.createTransfer', icon: <AddRounded /> },
        { ...transfers, label: 'nav.myTransfers' },
        messages,
      ];
    case 'OPERATOR':
      return [dispatch, transfers, messages, vehicles];
    case 'DRIVER':
      return [
        { to: '/jobs', label: 'nav.jobs', icon: <WorkRounded /> },
        messages,
        { ...vehicles, label: 'nav.myVehicles' },
      ];
    case 'ADMIN':
    case 'STAFF':
      return [
        transfers,
        dispatch,
        vehicles,
        { to: '/vehicle-categories', label: 'nav.categories', icon: <CategoryRounded /> },
        { to: '/users', label: 'nav.users', icon: <GroupRounded /> },
      ];
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
    case 'OPERATOR':
      return '/dispatch';
    case 'DRIVER':
      return '/jobs';
    default:
      return '/transfers';
  }
}
