import type { UserItemFragment } from '@/graphql/generated/graphql';

/** Transfer oluştururken personelin seçtiği CUSTOMER */
export type CustomerOption = Pick<
  UserItemFragment,
  'id' | 'name' | 'firstName' | 'lastName' | 'email' | 'phone' | 'profileImage'
>;

export const customerName = (c: CustomerOption) =>
  c.name || [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || '';
