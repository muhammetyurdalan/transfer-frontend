import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import {
  CurrentUserDocument,
  DeleteFcmTokenDocument,
  type CurrentUserFragment,
  type Role,
} from '@/graphql/generated/graphql';
import { apolloEvents, resetWsClient } from '@/lib/apollo';
import { errorKey } from '@/lib/errors';
import { readStorage, STORAGE_KEYS, tokenStore, writeStorage } from '@/lib/storage';
import { fromBackendLanguage, hasStoredLanguage } from '@/i18n';

type AuthContextValue = {
  user: CurrentUserFragment | null;
  /** Token var ve `user` query'si henüz dönmedi */
  initializing: boolean;
  isAuthenticated: boolean;
  hasRole: (...roles: Role[]) => boolean;
  login: (token: string, user: CurrentUserFragment) => void;
  logout: (reason?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [token, setToken] = useState(() => tokenStore.get());
  const [deleteFcmToken] = useMutation(DeleteFcmTokenDocument);

  const { data, loading } = useQuery(CurrentUserDocument, {
    skip: !token,
    fetchPolicy: 'cache-first',
  });
  const user = token ? (data?.user ?? null) : null;

  // Kullanıcı daha önce dil seçmediyse backend'deki dili uygula.
  useEffect(() => {
    if (user?.language && !hasStoredLanguage()) {
      void i18n.changeLanguage(fromBackendLanguage(user.language));
    }
  }, [user?.language, i18n]);

  const login = useCallback(
    (nextToken: string, nextUser: CurrentUserFragment) => {
      tokenStore.set(nextToken);
      resetWsClient();
      client.writeQuery({ query: CurrentUserDocument, data: { user: nextUser } });
      setToken(nextToken);
    },
    [client],
  );

  const logout = useCallback(
    async (reason?: string) => {
      const fcmToken = readStorage(STORAGE_KEYS.fcmToken);
      if (fcmToken && tokenStore.get()) {
        await deleteFcmToken({ variables: { registrationId: fcmToken } }).catch(() => undefined);
        writeStorage(STORAGE_KEYS.fcmToken, null);
      }
      tokenStore.set(null);
      setToken(null);
      resetWsClient();
      await client.clearStore();
      if (reason) enqueueSnackbar(t(errorKey(reason)), { variant: 'warning' });
      void navigate('/login', { replace: true });
    },
    [client, deleteFcmToken, enqueueSnackbar, navigate, t],
  );

  useEffect(() => {
    apolloEvents.onLogout = (code) => void logout(code);
    apolloEvents.onError = (code) => enqueueSnackbar(t(errorKey(code)), { variant: 'error' });
    apolloEvents.onReconnect = () => void client.refetchQueries({ include: 'active' });
  }, [logout, enqueueSnackbar, t, client]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing: !!token && !user && loading,
      isAuthenticated: !!user,
      hasRole: (...roles) => !!user?.role && roles.includes(user.role),
      login,
      logout,
    }),
    [user, token, loading, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/** Giriş yapılmış sayfalarda kullanıcıyı non-null döner. */
export function useCurrentUser() {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser requires an authenticated user');
  return user;
}
