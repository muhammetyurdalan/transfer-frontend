import { useState } from 'react';
import { Autocomplete, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { UsersDocument, type UserItemFragment } from '@/graphql/generated/graphql';
import { UserAvatar } from '@/components/UserAvatar';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { nameOrEmailFilter } from '@/features/users/filters';

type DriverOption = Pick<UserItemFragment, 'id' | 'name' | 'firstName' | 'lastName' | 'profileImage'> &
  Partial<Pick<UserItemFragment, 'email' | 'phone'>>;

type Props = {
  value: DriverOption | null;
  onChange: (driver: DriverOption | null) => void;
  error?: string;
  disabled?: boolean;
  helperText?: string;
};

/** Aktif DRIVER'lar arasında arama (`users` query'si, sadece ADMIN/STAFF). */
export function DriverAutocomplete({ value, onChange, error, disabled, helperText }: Props) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const search = useDebouncedValue(input.trim(), 400);
  const { data, loading } = useQuery(UsersDocument, {
    skip: disabled,
    variables: {
      filters: {
        role: { exact: 'DRIVER' },
        isActive: true,
        ...(search && {
          AND: nameOrEmailFilter(search),
        }),
      },
      ordering: [{ firstName: 'ASC' }],
      pagination: { offset: 0, limit: 20 },
    },
  });
  const options = (data?.users?.users ?? []) as DriverOption[];

  return (
    <Autocomplete
      value={value}
      onChange={(_, v) => onChange(v)}
      inputValue={input}
      onInputChange={(_, v) => setInput(v)}
      options={value && !options.some((o) => o.id === value.id) ? [value, ...options] : options}
      getOptionLabel={(o) => o.name || [o.firstName, o.lastName].filter(Boolean).join(' ')}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      filterOptions={(x) => x}
      loading={loading}
      disabled={disabled}
      noOptionsText={t('noResults')}
      loadingText={t('loading')}
      renderOption={({ key, ...props }, o) => (
        <li key={key} {...props}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <UserAvatar user={o} size={32} />
            <Stack sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {o.name || [o.firstName, o.lastName].filter(Boolean).join(' ')}
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
          label={t('vehicles:fields.driver')}
          required
          error={!!error}
          helperText={error ?? helperText}
        />
      )}
    />
  );
}
