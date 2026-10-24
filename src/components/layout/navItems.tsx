import type { ReactNode } from 'react';
import {
  CategoryRounded,
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
  switch (role) {
    case 'CUSTOMER':
      return [{ ...transfers, label: 'nav.myTransfers' }];
    case 'OPERATOR':
      return [dispatch, transfers, vehicles];
    case 'DRIVER':
      return [
        { to: '/jobs', label: 'nav.jobs', icon: <WorkRounded /> },
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
