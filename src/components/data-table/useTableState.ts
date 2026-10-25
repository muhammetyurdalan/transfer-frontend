import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

export type Direction = 'ASC' | 'DESC';
export type TableOrdering = { field: string; direction: Direction };

const PAGE_SIZES = [10, 20, 50] as const;

/**
 * DataTable sayfa/sıralama/filtre durumunu URL'de tutar (§6.2):
 * `?page=2&pageSize=20&ordering=-createdAt&status=PAID`.
 * `prefix` ile aynı sayfada birden fazla tablo ayrışır (ör. sekmeler).
 */
export function useTableState(defaultOrdering?: TableOrdering, prefix = '') {
  const [params, setParams] = useSearchParams();
  const key = (k: string) => (prefix ? `${prefix}.${k}` : k);

  const page = Math.max(0, Number(params.get(key('page')) ?? 1) - 1) || 0;
  const rawSize = Number(params.get(key('pageSize')));
  const pageSize = (PAGE_SIZES as readonly number[]).includes(rawSize) ? rawSize : 10;
  const rawOrdering = params.get(key('ordering'));
  const ordering = useMemo<TableOrdering | undefined>(() => {
    if (!rawOrdering) return defaultOrdering;
    const desc = rawOrdering.startsWith('-');
    return { field: desc ? rawOrdering.slice(1) : rawOrdering, direction: desc ? 'DESC' : 'ASC' };
  }, [rawOrdering, defaultOrdering]);

  const update = useCallback(
    (changes: Record<string, string | null>, resetPage = true) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(changes)) {
            const full = prefix ? `${prefix}.${k}` : k;
            if (v === null || v === '') next.delete(full);
            else next.set(full, v);
          }
          if (resetPage && !('page' in changes)) next.delete(prefix ? `${prefix}.page` : 'page');
          return next;
        },
        { replace: true },
      );
    },
    [setParams, prefix],
  );

  return {
    page,
    pageSize,
    ordering,
    /** Backend `pagination` argümanı */
    pagination: { offset: page * pageSize, limit: pageSize },
    /** Backend `ordering` argümanı (`[{ field: DIRECTION }]`) */
    orderingInput: ordering ? [{ [ordering.field]: ordering.direction }] : undefined,
    setPage: (p: number) => update({ page: p > 0 ? String(p + 1) : null }, false),
    setPageSize: (s: number) => update({ pageSize: String(s) }),
    setOrdering: (o: TableOrdering) =>
      update({ ordering: `${o.direction === 'DESC' ? '-' : ''}${o.field}` }),
    /** Filtre parametresi oku */
    get: (k: string) => params.get(key(k)),
    getAll: (k: string) => params.get(key(k))?.split(',').filter(Boolean) ?? [],
    /** Filtre parametresi yaz (sayfa sıfırlanır) */
    set: (k: string, v: string | string[] | null) =>
      update({ [k]: Array.isArray(v) ? v.join(',') || null : v }),
    /** Birden çok filtre parametresini tek seferde yaz (ardışık `set` çağrıları birbirini ezebilir) */
    setMany: (changes: Record<string, string | null>) => update(changes),
  };
}

export type TableState = ReturnType<typeof useTableState>;
