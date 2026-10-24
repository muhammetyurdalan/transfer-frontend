import { useState } from 'react';
import { Box, Card, CardContent, Link, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CurrencyExchangeRounded, OpenInNewRounded, ReceiptLongRounded } from '@mui/icons-material';
import { useQuery } from '@apollo/client/react';
import { Link as RouterLink, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  TransactionsDocument,
  type TransactionCategory,
  type TransactionFilter,
  type TransactionItemFragment,
  type TransactionOrder,
} from '@/graphql/generated/graphql';
import { DataTable, TableFilters, useTableState, type Column, type RowAction } from '@/components/data-table';
import { Money } from '@/components/Money';
import { TransactionChip } from '@/components/StatusChip';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAuth } from '@/app/providers/AuthProvider';
import { useIsMobile } from '@/hooks/useIsMobile';
import { formatDateTime, formatMoney } from '@/lib/format';
import { RefundDialog } from './RefundDialog';

const CATEGORIES: TransactionCategory[] = ['PAYMENT', 'TIP', 'REFUND'];
const DEFAULT_ORDERING = { field: 'orderTime', direction: 'DESC' as const };
const EMPTY: never[] = [];

/** Para birimine göre toplamlar: "₺1.200,00 · €40,00" */
function sumByCurrency(rows: TransactionItemFragment[], category: TransactionCategory) {
  const totals = new Map<string, number>();
  for (const r of rows) {
    if (r.category !== category) continue;
    const cur = r.currency ?? 'TRY';
    totals.set(cur, (totals.get(cur) ?? 0) + Number(r.orderAmount ?? 0));
  }
  if (totals.size === 0) return formatMoney(0, 'TRY');
  return [...totals].map(([cur, v]) => formatMoney(v, cur)).join(' · ');
}

/** Ödeme hareketleri sekmesi (§8.12). Kapsamı backend role göre belirler. */
export function StatementTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mobile = useIsMobile();
  const { hasRole } = useAuth();
  const canRefund = hasRole('ADMIN', 'STAFF');
  const table = useTableState(DEFAULT_ORDERING);
  const categories = table.getAll('category') as TransactionCategory[];
  const from = table.get('from');
  const to = table.get('to');
  const [refundRow, setRefundRow] = useState<TransactionItemFragment | null>(null);

  const filters: TransactionFilter = {
    ...(categories.length && { category: { inList: categories } }),
    ...((from || to) && {
      orderTime: {
        range: {
          start: from ? dayjs(from).startOf('day').toISOString() : null,
          end: to ? dayjs(to).endOf('day').toISOString() : null,
        },
      },
    }),
  };
  const { data, loading, error, refetch } = useQuery(TransactionsDocument, {
    variables: { filters, ordering: table.orderingInput as TransactionOrder[] | undefined, pagination: table.pagination },
  });
  const rows = (data?.transactions?.transactions ?? EMPTY) as TransactionItemFragment[];

  const columns: Column<TransactionItemFragment>[] = [
    { key: 'date', header: 'settings:statement.columns.date', sortField: 'orderTime', render: (r) => formatDateTime(r.orderTime) },
    { key: 'type', header: 'settings:statement.columns.type', render: (r) => <TransactionChip category={r.category} /> },
    {
      key: 'amount',
      header: 'settings:statement.columns.amount',
      sortField: 'orderAmount',
      align: 'right',
      mobilePrimary: true,
      render: (r) => (
        <Money
          amount={r.orderAmount}
          currency={r.currency}
          negative={r.category === 'REFUND'}
          sx={{ fontWeight: 700, color: r.category === 'REFUND' ? 'warning.main' : 'text.primary' }}
        />
      ),
    },
    {
      key: 'transfer',
      header: 'settings:statement.columns.transfer',
      render: (r) => (
        <Link component={RouterLink} to={`/transfers/${r.transferId}`} onClick={(e) => e.stopPropagation()}>
          #{r.transferId}
        </Link>
      ),
    },
    {
      key: 'note',
      header: 'settings:statement.columns.note',
      hideBelow: 'md',
      render: (r) => (
        <Typography variant="body2" noWrap title={r.note ?? ''} sx={{ maxWidth: 220 }}>
          {r.note || '—'}
        </Typography>
      ),
    },
    { key: 'orderId', header: 'settings:statement.columns.orderId', hideBelow: 'lg', render: (r) => r.orderId || '—' },
    {
      key: 'parent',
      header: 'settings:statement.columns.parent',
      hideBelow: 'md',
      render: (r) => (r.category === 'REFUND' && r.parentId ? `#${r.parentId}` : '—'),
    },
  ];

  const actions: RowAction<TransactionItemFragment>[] = [
    {
      label: 'settings:statement.actions.viewTransfer',
      icon: <OpenInNewRounded fontSize="small" />,
      onClick: (r) => void navigate(`/transfers/${r.transferId}`),
    },
    {
      label: 'settings:statement.actions.refund',
      icon: <CurrencyExchangeRounded fontSize="small" />,
      visible: (r) => canRefund && (r.category === 'PAYMENT' || r.category === 'TIP'),
      color: 'error',
      dividerBefore: true,
      onClick: setRefundRow,
    },
  ];

  const summary = [
    { key: 'PAYMENT' as const, label: 'settings:statement.summaryPayment', dark: true },
    { key: 'TIP' as const, label: 'settings:statement.summaryTip', dark: false },
    { key: 'REFUND' as const, label: 'settings:statement.summaryRefund', dark: false },
  ];

  return (
    <Stack spacing={2}>
      {!mobile && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 2 }}>
          {summary.map((s) => (
            <Card
              key={s.key}
              sx={
                s.dark
                  ? { bgcolor: 'inverse.main', color: 'inverse.contrastText', borderColor: 'inverse.accent' }
                  : { borderTop: 3, borderTopColor: s.key === 'REFUND' ? 'warning.main' : 'primary.main' }
              }
            >
              <CardContent>
                <Typography variant="caption" sx={{ opacity: s.dark ? 0.75 : 1 }} color={s.dark ? undefined : 'text.secondary'}>
                  {t(s.label)}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mt: 0.5, color: s.dark ? 'inverse.accent' : undefined, fontVariantNumeric: 'tabular-nums' }}
                  noWrap
                >
                  {s.key === 'REFUND' && rows.some((r) => r.category === 'REFUND') ? '−' : ''}
                  {sumByCurrency(rows, s.key)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      {error && !data ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          count={data?.transactions?.count ?? 0}
          loading={loading}
          page={table.page}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
          ordering={table.ordering}
          onOrderingChange={table.setOrdering}
          actions={actions}
          toolbar={
            <TableFilters>
              <TextField
                select
                size="small"
                fullWidth={false}
                label={t('settings:statement.category')}
                value={categories}
                onChange={(e) => {
                  const v = e.target.value as unknown as string[] | string;
                  table.set('category', typeof v === 'string' ? v.split(',') : v);
                }}
                slotProps={{
                  select: {
                    multiple: true,
                    renderValue: (v) => (v as string[]).map((c) => t(`transactionCategory.${c}`)).join(', ') || t('all'),
                    displayEmpty: true,
                  },
                  inputLabel: { shrink: true },
                }}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {t(`transactionCategory.${c}`)}
                  </MenuItem>
                ))}
              </TextField>
              <DatePicker
                label={t('dateRange.from')}
                value={from ? dayjs(from) : null}
                onChange={(d) => table.set('from', d?.isValid() ? d.format('YYYY-MM-DD') : null)}
                slotProps={{ textField: { size: 'small', fullWidth: false }, field: { clearable: true } }}
              />
              <DatePicker
                label={t('dateRange.to')}
                value={to ? dayjs(to) : null}
                minDate={from ? dayjs(from) : undefined}
                onChange={(d) => table.set('to', d?.isValid() ? d.format('YYYY-MM-DD') : null)}
                slotProps={{ textField: { size: 'small', fullWidth: false }, field: { clearable: true } }}
              />
            </TableFilters>
          }
          emptyState={<EmptyState icon={<ReceiptLongRounded />} title={t('settings:statement.empty')} />}
        />
      )}
      <RefundDialog transaction={refundRow} onClose={() => setRefundRow(null)} onDone={() => void refetch()} />
    </Stack>
  );
}
