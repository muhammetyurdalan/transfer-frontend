import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { createClient, type Client } from 'graphql-ws';
import { OperationTypeNode } from 'graphql';
import { env } from './env';
import { LOGOUT_CODES, parseErrorCode } from './errors';
import { tokenStore } from './storage';

/**
 * Uygulama seviyesindeki tepkiler (logout, snackbar) AuthProvider/SnackbarProvider tarafından
 * kaydedilir. Apollo modülü React'e bağımlı olmasın diye olaylar buradan yayılır.
 */
type ApolloEvents = {
  onLogout: (code: string) => void;
  onError: (code: string | null) => void;
  onReconnect: () => void;
};

export const apolloEvents: ApolloEvents = {
  onLogout: () => {},
  onError: () => {},
  onReconnect: () => {},
};

/**
 * Operasyon context'inde `skipErrorToast: true` verilirse hata snackbar'da gösterilmez.
 * Hatayı form alanında kendisi gösteren component'ler bunu kullanır.
 */
export type AppOperationContext = { skipErrorToast?: boolean };

const httpLink = new UploadHttpLink({ uri: env.API_URL });

// Backend ham JWT bekler, `Bearer` öneki yok.
const authLink = new SetContextLink((prev) => {
  const token = tokenStore.get();
  return token ? { headers: { ...prev.headers, authorization: token } } : {};
});

const errorLink = new ErrorLink(({ error, operation }) => {
  const context = operation.getContext() as AppOperationContext;
  if (CombinedGraphQLErrors.is(error)) {
    const codes = error.errors.map((e) => parseErrorCode(e.message));
    const logoutCode = codes.find((c) => c && LOGOUT_CODES.has(c));
    // Giriş formunda ERR010 alan hatasıdır, oturum kapatma değil.
    if (logoutCode && tokenStore.get()) {
      apolloEvents.onLogout(logoutCode);
      return;
    }
    if (!context.skipErrorToast) apolloEvents.onError(codes.find(Boolean) ?? null);
    return;
  }
  if (!context.skipErrorToast) apolloEvents.onError('network');
});

let wsClient: Client = createWsClient();
let wsLink = new GraphQLWsLink(wsClient);

function createWsClient() {
  let connectedBefore = false;
  return createClient({
    url: env.WS_URL,
    connectionParams: () => ({ authorization: tokenStore.get() ?? '' }),
    lazy: true,
    retryAttempts: Infinity,
    shouldRetry: () => true,
    on: {
      connected: () => {
        if (connectedBefore) apolloEvents.onReconnect();
        connectedBefore = true;
      },
    },
  });
}

/** Login/logout sonrası WS bağlantısı yeni token ile yeniden kurulur. */
export function resetWsClient() {
  void wsClient.dispose();
  wsClient = createWsClient();
  wsLink = new GraphQLWsLink(wsClient);
}

const dynamicWsLink = new ApolloLink((operation) => wsLink.request(operation));

const splitLink = ApolloLink.split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === OperationTypeNode.SUBSCRIPTION;
  },
  dynamicWsLink,
  ApolloLink.from([authLink, httpLink]),
);

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, splitLink]),
  cache: new InMemoryCache({
    typePolicies: {
      // Sayfalı listeler argümanlarıyla ayrı cache'lenir (varsayılan davranış), bu tipler id'sizdir.
      TransfersPaginated: { keyFields: false },
      NotificationsPaginated: { keyFields: false },
      TransactionsPaginated: { keyFields: false },
      UsersPaginated: { keyFields: false },
      VehiclesPaginated: { keyFields: false },
      VehicleCategoriesPaginated: { keyFields: false },
      VehicleOption: { keyFields: false },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});
