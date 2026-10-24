import type { UserFilter } from '@/graphql/generated/graphql';

/** `firstName | lastName | email` içinde arama. Üst seviyedeki diğer filtrelerle `AND` ile birleştirilir. */
export function nameOrEmailFilter(search: string): UserFilter {
  return {
    firstName: { iContains: search },
    OR: { lastName: { iContains: search }, OR: { email: { iContains: search } } },
  };
}
