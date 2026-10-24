import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircleRounded, SearchRounded } from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  AssignDriverDocument,
  AvailableDriversDocument,
  AvailableVehiclesDocument,
} from '@/graphql/generated/graphql';
import { EmptyState } from '@/components/feedback/EmptyState';
import { UserAvatar } from '@/components/UserAvatar';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useIsMobile } from '@/hooks/useIsMobile';
import { errorKey, getErrorCode } from '@/lib/errors';

type Props = { transferId: string | null; onClose: () => void };

/** Sürücü + (opsiyonel) araç seçip atama (§8.7). */
export function AssignDriverDialog({ transferId, onClose }: Props) {
  const mobile = useIsMobile();
  return (
    <Dialog open={!!transferId} onClose={onClose} fullWidth maxWidth="sm" fullScreen={mobile}>
      {transferId && <AssignDriverContent transferId={transferId} onClose={onClose} />}
    </Dialog>
  );
}

function AssignDriverContent({ transferId, onClose }: { transferId: string; onClose: () => void }) {
  const { t } = useTranslation('transfers');
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const term = useDebouncedValue(search.trim(), 400);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [vehicleChoice, setVehicleChoice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const drivers = useQuery(AvailableDriversDocument, {
    variables: {
      transferId,
      pagination: { offset: 0, limit: 50 },
      filters: term
        ? { firstName: { iContains: term }, OR: { lastName: { iContains: term } } }
        : undefined,
    },
    fetchPolicy: 'network-only',
  });
  const vehicles = useQuery(AvailableVehiclesDocument, {
    variables: { transferId },
    fetchPolicy: 'network-only',
  });
  const [assign, { loading }] = useMutation(AssignDriverDocument, {
    context: { skipErrorToast: true },
    refetchQueries: ['Transfers', 'Transfer'],
  });

  const driverList = drivers.data?.availableDrivers.users ?? [];
  const driverVehicles = (vehicles.data?.availableVehicles ?? []).filter(
    (v) => v.driverId === driverId,
  );
  // Tek araç varsa otomatik seçili kabul edilir.
  const vehicleId = vehicleChoice ?? (driverVehicles.length === 1 ? driverVehicles[0].id : null);

  const submit = async () => {
    if (!driverId) return;
    setError(null);
    const res = await assign({ variables: { data: { id: transferId, driverId, vehicleId } } });
    if (res.error) {
      const code = getErrorCode(res.error);
      setError(t(errorKey(code)));
      if (code === 'ERR015') {
        setDriverId(null);
        void drivers.refetch();
      }
      if (code === 'ERR027') {
        setVehicleChoice(null);
        void vehicles.refetch();
      }
      return;
    }
    enqueueSnackbar(t('assign.done'), { variant: 'success' });
    onClose();
  };

  return (
    <>
      <DialogTitle sx={{ bgcolor: 'inverse.main', color: 'inverse.contrastText' }}>
        {t('assign.title')} · #{transferId}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            size="small"
            placeholder={t('assign.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded />
                  </InputAdornment>
                ),
              },
            }}
          />
          {drivers.loading && driverList.length === 0 ? (
            <Stack spacing={1}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} variant="rounded" height={56} />
              ))}
            </Stack>
          ) : driverList.length === 0 ? (
            <EmptyState title={t('assign.noDrivers')} />
          ) : (
            <List
              disablePadding
              sx={{ border: 1, borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}
            >
              {driverList.map((d) => {
                const selected = d.id === driverId;
                return (
                  <ListItemButton
                    key={d.id}
                    selected={selected}
                    divider
                    onClick={() => {
                      setDriverId(d.id);
                      setVehicleChoice(null);
                    }}
                    sx={{ minHeight: 56, '&.Mui-selected': { bgcolor: 'highlight.main' } }}
                  >
                    <ListItemAvatar>
                      <UserAvatar user={d} />
                    </ListItemAvatar>
                    <ListItemText primary={d.name} secondary={d.phone} />
                    {selected && <CheckCircleRounded color="primary" />}
                  </ListItemButton>
                );
              })}
            </List>
          )}
          {driverId && (
            <Box>
              <Typography variant="subtitle2">{t('assign.vehicle')}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t('assign.vehicleOptional')}
              </Typography>
              <RadioGroup
                value={vehicleId ?? ''}
                onChange={(e) => setVehicleChoice(e.target.value)}
              >
                {driverVehicles.map((v) => (
                  <FormControlLabel
                    key={v.id}
                    value={v.id}
                    control={<Radio />}
                    label={`${v.plate} · ${[v.brand, v.model, v.year, v.color].filter(Boolean).join(' ')}`}
                  />
                ))}
              </RadioGroup>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button color="inherit" onClick={onClose} disabled={loading}>
          {t('common:actions.cancel')}
        </Button>
        <Button
          variant="contained"
          disabled={!driverId}
          loading={loading}
          onClick={() => void submit()}
        >
          {t('assign.submit')}
        </Button>
      </DialogActions>
    </>
  );
}
