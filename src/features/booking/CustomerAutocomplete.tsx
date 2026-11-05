import { useState } from 'react';
import { Autocomplete, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { UsersDocument } from '@/graphql/generated/graphql';
import { UserAvatar } from '@/components/UserAvatar';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { nameOrEmailFilter } from '@/features/users/filters';
import { customerName, type CustomerOption } from './customer';

/** Aramanın başlaması için gereken en az karakter */
const MIN_CHARS = 3;
/** Liste bu kadar kayıttan sonra kaydırılır */
const VISIBLE_ROWS = 10;
const ROW_HEIGHT = 56;

type Props = {
  value: CustomerOption | null;
  onChange: (customer: CustomerOption | null) => void;
};

/** OPERATOR/ADMIN/STAFF transfer oluştururken CUSTOMER seçer (ad, soyad veya e-posta ile arama). */
export function CustomerAutocomplete({ value, onChange }: Props) {
  const { t } = useTranslation(['booking', 'common']);
  const [input, setInput] = useState('');
  const search = useDebouncedValue(input.trim(), 400);
  // Seçili kaydın etiketi input'a yazıldığında yeniden arama yapılmaz
  const searching = search.length >= MIN_CHARS && (!value || search !== customerName(value));
  const { data, loading } = useQuery(UsersDocument, {
    skip: !searching,
    variables: {
      filters: { role: { exact: 'CUSTOMER' }, isActive: true, AND: nameOrEmailFilter(search) },
      ordering: [{ firstName: 'ASC' }],
      pagination: { offset: 0, limit: 50 },
    },
  });
  const found = searching ? ((data?.users?.users ?? []) as CustomerOption[]) : [];
  const options = value && !found.some((o) => o.id === value.id) ? [value, ...found] : found;

  return (
    <Autocomplete
      value={value}
      onChange={(_, v) => onChange(v)}
      inputValue={input}
      onInputChange={(_, v) => setInput(v)}
      options={options}
      getOptionLabel={customerName}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      filterOptions={(x) => x}
      loading={searching && loading}
      noOptionsText={
        input.trim().length < MIN_CHARS ? t('booking:customer.minChars', { count: MIN_CHARS }) : t('common:noResults')
      }
      loadingText={t('common:loading')}
      slotProps={{ listbox: { sx: { maxHeight: VISIBLE_ROWS * ROW_HEIGHT } } }}
      renderOption={({ key, ...props }, o) => (
        <li key={key} {...props} style={{ minHeight: ROW_HEIGHT }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <UserAvatar user={o} size={32} />
            <Stack sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {customerName(o)}
              </Typography>
              {o.email && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {o.email}
                </Typography>
              )}
            </Stack>
          </Stack>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('booking:customer.label')}
          placeholder={t('booking:customer.placeholder')}
          helperText={t('booking:customer.helper')}
        />
      )}
    />
  );
}
