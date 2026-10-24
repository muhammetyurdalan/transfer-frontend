import { Typography, type TypographyProps } from '@mui/material';
import { formatMoney } from '@/lib/format';

type Props = {
  amount: string | number | null | undefined;
  currency?: string | null;
  /** İade gibi eksi gösterilecek tutarlar */
  negative?: boolean;
} & Omit<TypographyProps, 'children'>;

export function Money({ amount, currency, negative, ...rest }: Props) {
  const text = formatMoney(amount, currency);
  return (
    <Typography component="span" variant="inherit" sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }} {...rest}>
      {negative && amount ? `−${text}` : text}
    </Typography>
  );
}
