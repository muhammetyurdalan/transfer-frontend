import { Avatar } from '@mui/material';
import { initials } from '@/lib/format';
import { mediaUrl } from '@/lib/media';

type AvatarUser = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  profileImage?: string | null;
};

/** Profil görseli yoksa baş harfler (altın zemin, siyah yazı). `ring` koyu zeminde altın halka çizer. */
export function UserAvatar({ user, size = 40, ring }: { user?: AvatarUser | null; size?: number; ring?: boolean }) {
  return (
    <Avatar
      src={mediaUrl(user?.profileImage)}
      alt={user?.name ?? ''}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 600,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        ...(ring && { outline: 2, outlineColor: 'inverse.accent', outlineOffset: 2 }),
      }}
    >
      {initials(user?.firstName, user?.lastName, user?.name)}
    </Avatar>
  );
}
