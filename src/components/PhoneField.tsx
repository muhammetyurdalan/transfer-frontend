import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Autocomplete,
  Box,
  ButtonBase,
  ClickAwayListener,
  InputAdornment,
  Paper,
  Popper,
  TextField,
  Typography,
  type PopperProps,
  type TextFieldProps,
} from '@mui/material';
import { ArrowDropDownRounded, SearchRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  callingCode,
  detectCountry,
  examplePhone,
  formatNational,
  isValidPhoneFor,
  joinPhone,
  phoneCountries,
  splitPhone,
  type CountryCode,
  type PhoneCountry,
  type PhoneValue,
} from '@/lib/phone';

type Props = Omit<TextFieldProps, 'value' | 'onChange' | 'defaultValue' | 'type' | 'inputRef'> & {
  /** Seçili ülke + E.164 numara (`toPhoneValue` ile oluşturulur) */
  value: PhoneValue;
  onChange: (value: PhoneValue) => void;
  /** react-hook-form `field.ref` (hata olduğunda odaklanmak için) */
  inputRef?: (el: HTMLInputElement | null) => void;
};

/** Liste bu kadar karakter yazılınca açılır */
const MIN_SEARCH = 2;
/** Liste yüksekliği: sonuç çoksa bu yükseklikte kalır, içi kayar */
const LIST_MAX_HEIGHT = 280;
const LIST_MIN_HEIGHT = 160;
/** Arama kutusu + kenar boşlukları (liste yüksekliği hesabı için) */
const SEARCH_HEIGHT = 72;

/**
 * Ülke kodu (ISO `TR`, alan kodu `90` / `+90`) veya ülke adıyla eşleşenler.
 * Sıra: ISO kodu tam eşleşen → adı aramayla başlayan → alan kodu → adın içinde geçen.
 */
function filterCountries(options: PhoneCountry[], query: string, language: string) {
  const q = query.trim().replace(/^\+/, '').toLocaleLowerCase(language);
  if (q.length < MIN_SEARCH) return [];
  const rank = (o: PhoneCountry) => {
    const name = o.name.toLocaleLowerCase(language);
    if (o.code.toLowerCase() === q) return 0;
    if (name.startsWith(q)) return 1;
    if (o.callingCode.startsWith(q)) return 2;
    if (name.includes(q)) return 3;
    return -1;
  };
  return options
    .map((o) => ({ o, r: rank(o) }))
    .filter((x) => x.r >= 0)
    .sort((a, b) => a.r - b.r)
    .map((x) => x.o);
}

/**
 * Autocomplete listesini Popover içinde, arama kutusunun hemen altında gösterir.
 * MUI'nin `popper` class'ları verilmez: `position: absolute` alıp Popover kartının dışında kırpılıyordu.
 */
function InlinePopper({ children }: PopperProps) {
  return <Box>{children as ReactNode}</Box>;
}

/**
 * Ülke kodu seçicili telefon input'u. Form'a `{ country, number }` verir, doğrulama `phoneSchema` ile
 * seçili ülkeye göre yapılır. `error` varken altta ülke adı ve örnek numarayla hata mesajı gösterilir.
 * `+` ile başlayan bir numara yazılır/yapıştırılırsa ülke otomatik seçilir.
 */
export function PhoneField({
  value,
  onChange,
  onBlur,
  inputRef,
  error,
  helperText,
  disabled,
  slotProps,
  ...rest
}: Props) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const countries = useMemo(() => phoneCountries(language), [language]);
  const [state, setState] = useState(() => ({ ...value, national: splitPhone(value.number, value.country).national }));
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [listHeight, setListHeight] = useState(LIST_MAX_HEIGHT);
  // Seçili ülkenin adı arama kutusunda kalmasın: kutu her açılışta boş gelir
  const [search, setSearch] = useState('');
  const localInput = useRef<HTMLInputElement | null>(null);
  // Form gönderilmeden de geri bildirim: alandan bir kez çıkıldıktan sonra numara seçili ülkeye göre kontrol edilir
  const [touched, setTouched] = useState(false);

  // Dışarıdan gelen değişiklik (form reset vb.): input'u yeniden doldur
  if (value.number !== state.number || value.country !== state.country) {
    setState({ ...value, national: splitPhone(value.number, value.country).national });
  }

  const { country, national } = state;
  const selected = countries.find((c) => c.code === country) ?? null;
  const showError = !!error || (touched && !isValidPhoneFor(state.number, country));

  const emit = (nextCountry: CountryCode, nextNational: string) => {
    const number = joinPhone(nextCountry, nextNational);
    setState({ country: nextCountry, number, national: nextNational });
    if (number !== value.number || nextCountry !== value.country) onChange({ country: nextCountry, number });
  };

  const handleInput = (raw: string) => {
    const text = raw.replace(/[^\d\s()+-]/g, '').slice(0, 20);
    const detected = detectCountry(text);
    if (detected) emit(detected.country, detected.national);
    else emit(country, text);
  };

  // Liste yüksekliği açılışta altta kalan alana göre sabitlenir. Popper yer değiştirmez (flip yok),
  // böylece sonuç sayısı artınca kutu yukarı kayıp diğer alanların üstüne binmez.
  const openPicker = (el: HTMLElement) => {
    const below = window.innerHeight - el.getBoundingClientRect().bottom - SEARCH_HEIGHT - 16;
    setListHeight(Math.max(LIST_MIN_HEIGHT, Math.min(LIST_MAX_HEIGHT, below)));
    setAnchor(el);
  };

  const closePicker = () => {
    setAnchor(null);
    setSearch('');
  };

  const selectCountry = (code: CountryCode) => {
    closePicker();
    emit(code, national);
    requestAnimationFrame(() => localInput.current?.focus());
  };

  const setRefs = (el: HTMLInputElement | null) => {
    localInput.current = el;
    inputRef?.(el);
  };

  return (
    <>
      <TextField
        {...rest}
        type="tel"
        disabled={disabled}
        error={showError}
        helperText={
          showError
            ? t('phone.invalid', { country: selected?.name ?? country, example: examplePhone(country) })
            : helperText
        }
        value={national}
        onChange={(e) => handleInput(e.target.value)}
        onBlur={(e) => {
          const formatted = formatNational(country, national);
          if (formatted !== national) setState((s) => ({ ...s, national: formatted }));
          setTouched(true);
          onBlur?.(e);
        }}
        inputRef={setRefs}
        placeholder={examplePhone(country)}
        autoComplete="tel-national"
        slotProps={{
          ...slotProps,
          htmlInput: { inputMode: 'tel', ...(slotProps?.htmlInput as object) },
          input: {
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 0.5 }}>
                <ButtonBase
                  disabled={disabled}
                  onClick={(e) => (anchor ? closePicker() : openPicker(e.currentTarget))}
                  aria-label={t('phone.country')}
                  aria-haspopup="listbox"
                  sx={{
                    gap: 0.5,
                    pl: 0.75,
                    pr: 0.25,
                    py: 0.5,
                    ml: -0.75,
                    borderRadius: 1,
                    color: 'text.primary',
                    typography: 'body1',
                    '&:hover, &.Mui-focusVisible': { bgcolor: 'highlight.main' },
                  }}
                >
                  <Box component="span" aria-hidden sx={{ fontSize: '1.25rem', lineHeight: 1 }}>
                    {selected?.flag}
                  </Box>
                  <span>+{callingCode(country)}</span>
                  <ArrowDropDownRounded fontSize="small" sx={{ color: 'text.secondary' }} />
                </ButtonBase>
              </InputAdornment>
            ),
          },
        }}
      />
      <Popper
        open={!!anchor}
        anchorEl={anchor}
        placement="bottom-start"
        modifiers={[
          { name: 'flip', enabled: false },
          { name: 'offset', options: { offset: [0, 4] } },
        ]}
        sx={{ zIndex: 'modal' }}
      >
        <ClickAwayListener
          onClickAway={(e) => {
            if (!anchor?.contains(e.target as Node)) closePicker();
          }}
        >
          <Paper elevation={8} sx={{ width: 320, maxWidth: 'calc(100vw - 32px)' }}>
            <Autocomplete
              open
              disablePortal
              autoHighlight
              disableClearable
              options={countries}
              value={selected ?? undefined}
              filterOptions={(options, { inputValue }) =>
                filterCountries(options, inputValue, language)
              }
              getOptionLabel={(o) => o.name}
              isOptionEqualToValue={(a, b) => a.code === b.code}
              onChange={(_, v) => v && selectCountry(v.code)}
              inputValue={search}
              onInputChange={(_, v, reason) => reason === 'input' && setSearch(v)}
              onClose={(_, reason) => reason === 'escape' && closePicker()}
              noOptionsText={
                search.trim().replace(/^\+/, '').length < MIN_SEARCH
                  ? t('phone.typeMore', { count: MIN_SEARCH })
                  : t('phone.noCountry')
              }
              slots={{ popper: InlinePopper }}
              slotProps={{
                paper: { elevation: 0, sx: { m: 0, borderRadius: 0 } },
                listbox: { sx: { maxHeight: listHeight, overflowY: 'auto' } },
              }}
              renderOption={({ key, ...props }, o) => (
                <Box component="li" key={key} {...props} sx={{ gap: 1.5 }}>
                  <Box component="span" aria-hidden sx={{ fontSize: '1.25rem', lineHeight: 1 }}>
                    {o.flag}
                  </Box>
                  <Typography variant="body2" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
                    {o.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    +{o.callingCode}
                  </Typography>
                </Box>
              )}
              renderInput={(params) => (
                <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                  <TextField
                    {...params}
                    autoFocus
                    size="small"
                    placeholder={t('phone.search')}
                    slotProps={{
                      ...params.slotProps,
                      input: {
                        ...params.slotProps.input,
                        startAdornment: (
                          <SearchRounded
                            fontSize="small"
                            sx={{ color: 'text.secondary', ml: 0.5 }}
                          />
                        ),
                      },
                    }}
                  />
                </Box>
              )}
            />
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
