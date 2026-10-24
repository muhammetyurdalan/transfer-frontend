import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  Checkbox,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  useMediaQuery,
  useTheme,
  type Breakpoint,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useIsMobile } from '@/hooks/useIsMobile';
import { RowActions } from './RowActions';
import type { Column, RowAction } from './types';
import type { TableOrdering } from './useTableState';

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  count: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  ordering?: TableOrdering;
  onOrderingChange?: (ordering: TableOrdering) => void;
  actions?: RowAction<T>[];
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  emptyState?: ReactNode;
  selectable?: boolean;
  onSelectionChange?: (rows: T[]) => void;
  getRowId?: (row: T) => string;
};

const defaultRowId = (row: unknown) => String((row as { id: string }).id);
const EMPTY_SELECTION: ReadonlySet<string> = new Set();

/** Projedeki tüm listeler (§6.2). `>= sm` tablo, `< sm` kart görünümü. */
export function DataTable<T>(props: Props<T>) {
  const {
    columns,
    rows,
    count,
    loading,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    ordering,
    onOrderingChange,
    actions,
    onRowClick,
    toolbar,
    emptyState,
    selectable,
    onSelectionChange,
    getRowId = defaultRowId,
  } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  const mobile = useIsMobile();
  const belowMd = useMediaQuery(theme.breakpoints.down('md'));
  const belowLg = useMediaQuery(theme.breakpoints.down('lg'));
  // Seçim, ait olduğu `rows` ile saklanır: sayfa/veri değişince kendiliğinden sıfırlanır.
  const [selection, setSelection] = useState<{ rows: T[]; ids: Set<string> }>({ rows, ids: new Set() });
  const selected = selection.rows === rows ? selection.ids : EMPTY_SELECTION;
  const hadSelection = useRef(false);
  const notifyRef = useRef(onSelectionChange);
  useEffect(() => {
    notifyRef.current = onSelectionChange;
  });
  useEffect(() => {
    if (hadSelection.current) notifyRef.current?.([]);
    hadSelection.current = false;
  }, [rows]);

  const setSelected = (ids: Set<string>) => {
    setSelection({ rows, ids });
    hadSelection.current = ids.size > 0;
    onSelectionChange?.(rows.filter((r) => ids.has(getRowId(r))));
  };

  const hidden = (bp?: Breakpoint) =>
    (bp === 'sm' && mobile) || (bp === 'md' && belowMd) || (bp === 'lg' && belowLg);
  const visibleColumns = columns.filter((c) => !hidden(c.hideBelow));
  const hasActions = !!actions?.length;
  const showEmpty = !loading && rows.length === 0;

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(getRowId(r)));

  const pagination = (
    <TablePagination
      component="div"
      count={count}
      page={count === 0 ? 0 : Math.min(page, Math.max(0, Math.ceil(count / pageSize) - 1))}
      rowsPerPage={pageSize}
      rowsPerPageOptions={[10, 20, 50]}
      onPageChange={(_, p) => onPageChange(p)}
      onRowsPerPageChange={(e) => onPageSizeChange(Number(e.target.value))}
      labelRowsPerPage={t('table.rowsPerPage')}
      labelDisplayedRows={({ from, to, count: c }) => t('table.displayedRows', { from, to, count: c })}
      sx={{ '.MuiTablePagination-toolbar': { flexWrap: 'wrap', justifyContent: 'flex-end' } }}
    />
  );

  const empty = emptyState ?? <EmptyState title={t('table.empty')} />;

  if (mobile) {
    const primary = columns.find((c) => c.mobilePrimary) ?? columns[0];
    const rest = columns.filter((c) => c !== primary);
    return (
      <Stack spacing={1.5}>
        {toolbar}
        {loading && rows.length === 0
          ? Array.from({ length: Math.min(pageSize, 5) }, (_, i) => (
              <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 4 }} />
            ))
          : showEmpty
            ? <Paper variant="outlined">{empty}</Paper>
            : rows.map((row) => {
                const id = getRowId(row);
                const body = (
                  <Box sx={{ p: 2, pr: hasActions ? 6 : 2 }}>
                    <Box sx={{ fontWeight: 600, mb: 1, minWidth: 0 }}>{primary.render(row)}</Box>
                    <Stack spacing={0.75} divider={<Divider flexItem />}>
                      {rest.map((c) => (
                        <Stack sx={{ alignItems: 'center', justifyContent: 'space-between' }} key={c.key} direction="row" spacing={2}>
                          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                            {t(c.header)}
                          </Typography>
                          <Box sx={{ minWidth: 0, textAlign: 'right', typography: 'body2' }}>{c.render(row)}</Box>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                );
                return (
                  <Card
                    key={id}
                    sx={{
                      position: 'relative',
                      borderColor: selected.has(id) ? 'primary.main' : undefined,
                      borderLeft: 4,
                      borderLeftColor: 'primary.main',
                    }}
                  >
                    {onRowClick ? <CardActionArea onClick={() => onRowClick(row)}>{body}</CardActionArea> : body}
                    <Stack direction="row" sx={{ position: 'absolute', top: 4, right: 4 }}>
                      {selectable && <Checkbox checked={selected.has(id)} onChange={() => toggle(id)} />}
                      {actions && <RowActions row={row} actions={actions} />}
                    </Stack>
                  </Card>
                );
              })}
        {count > 0 && pagination}
      </Stack>
    );
  }

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      {toolbar && <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>{toolbar}</Box>}
      <TableContainer sx={{ maxHeight: 'calc(100dvh - 260px)', minHeight: showEmpty ? undefined : 200 }}>
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={selected.size > 0 && !allSelected}
                    onChange={() =>
                      setSelected(allSelected ? new Set() : new Set(rows.map((r) => getRowId(r))))
                    }
                  />
                </TableCell>
              )}
              {visibleColumns.map((c) => (
                <TableCell key={c.key} align={c.align} sx={{ width: c.width, whiteSpace: 'nowrap' }}>
                  {c.sortField && onOrderingChange ? (
                    <TableSortLabel
                      active={ordering?.field === c.sortField}
                      direction={ordering?.field === c.sortField && ordering?.direction === 'ASC' ? 'asc' : 'desc'}
                      onClick={() =>
                        onOrderingChange({
                          field: c.sortField!,
                          direction:
                            ordering?.field === c.sortField && ordering?.direction === 'DESC' ? 'ASC' : 'DESC',
                        })
                      }
                    >
                      {t(c.header)}
                    </TableSortLabel>
                  ) : (
                    t(c.header)
                  )}
                </TableCell>
              ))}
              {hasActions && <TableCell sx={{ width: 56 }} />}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && rows.length === 0
              ? Array.from({ length: pageSize }, (_, i) => (
                  <TableRow key={i}>
                    {selectable && <TableCell padding="checkbox" />}
                    {visibleColumns.map((c) => (
                      <TableCell key={c.key}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                    {hasActions && <TableCell />}
                  </TableRow>
                ))
              : rows.map((row) => {
                  const id = getRowId(row);
                  return (
                    <TableRow
                      key={id}
                      hover
                      selected={selected.has(id)}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      sx={{ cursor: onRowClick ? 'pointer' : undefined }}
                    >
                      {selectable && (
                        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={selected.has(id)} onChange={() => toggle(id)} />
                        </TableCell>
                      )}
                      {visibleColumns.map((c) => (
                        <TableCell key={c.key} align={c.align} sx={{ maxWidth: 320 }}>
                          {c.render(row)}
                        </TableCell>
                      ))}
                      {hasActions && (
                        <TableCell align="right" sx={{ py: 0 }}>
                          <RowActions row={row} actions={actions} />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
        {showEmpty && empty}
      </TableContainer>
      {count > 0 && <Divider />}
      {count > 0 && pagination}
    </Paper>
  );
}
