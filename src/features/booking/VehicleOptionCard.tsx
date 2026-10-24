import { Box, Card, CardActionArea, CardContent, Chip, Stack, Tooltip, Typography } from '@mui/material';
import {
  AccessibleRounded,
  CheckCircleRounded,
  ChildFriendlyRounded,
  DirectionsCarRounded,
  LuggageRounded,
  PersonRounded,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { VehicleOptionItemFragment } from '@/graphql/generated/graphql';
import { Money } from '@/components/Money';
import { formatRoute } from '@/lib/format';
import { mediaUrl } from '@/lib/media';

type Props = { option: VehicleOptionItemFragment; selected: boolean; onSelect: () => void };

/** Radio gibi seçilen araç kategorisi kartı (§8.4). Seçili: altın kenar + açık altın zemin. */
export function VehicleOptionCard({ option, selected, onSelect }: Props) {
  const { t } = useTranslation('booking');
  const c = option.vehicleCategory;
  const image = mediaUrl(c.image);

  const capacity = [
    { icon: <PersonRounded fontSize="small" />, label: t('vehicle.passengers', { count: c.maxPassengers ?? 0 }), value: c.maxPassengers ?? 0 },
    { icon: <LuggageRounded fontSize="small" />, label: t('vehicle.luggage', { count: c.maxLuggage ?? 0 }), value: c.maxLuggage ?? 0 },
    ...(c.childSeatCapacity
      ? [{ icon: <ChildFriendlyRounded fontSize="small" />, label: t('vehicle.childSeats', { count: c.childSeatCapacity }), value: c.childSeatCapacity }]
      : []),
  ];

  return (
    <Card
      sx={{
        height: '100%',
        borderWidth: 2,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'highlight.main' : 'background.paper',
        transition: 'border-color .15s, background-color .15s',
      }}
    >
      <CardActionArea
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        sx={{ height: '100%', display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: 'stretch' }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: 112, md: '100%' },
            flexShrink: 0,
            aspectRatio: { md: '16 / 9' },
            bgcolor: 'inverse.main',
            color: 'inverse.accent',
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
          }}
        >
          {image ? (
            <Box component="img" src={image} alt={c.name ?? ''} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <DirectionsCarRounded sx={{ fontSize: 48 }} />
          )}
          {selected && (
            <Chip
              size="small"
              color="primary"
              icon={<CheckCircleRounded />}
              label={t('vehicle.selected')}
              sx={{ position: 'absolute', top: 8, left: 8, display: { xs: 'none', md: 'flex' } }}
            />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, p: 2, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {c.name}
            </Typography>
            {selected && <CheckCircleRounded sx={{ color: 'primary.main', display: { md: 'none' } }} />}
          </Stack>
          {c.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {c.description}
            </Typography>
          )}
          <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap', color: 'text.secondary' }}>
            {capacity.map((cap) => (
              <Tooltip key={cap.label} title={cap.label}>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }} aria-label={cap.label}>
                  {cap.icon}
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {cap.value}
                  </Typography>
                </Stack>
              </Tooltip>
            ))}
            {c.isWheelchairAccessible && (
              <Tooltip title={t('vehicle.wheelchair')}>
                <AccessibleRounded fontSize="small" aria-label={t('vehicle.wheelchair')} />
              </Tooltip>
            )}
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              {formatRoute(option.distance, option.duration)}
            </Typography>
            <Money amount={option.price} currency={option.currency} variant="h5" sx={{ fontWeight: 700 }} />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
