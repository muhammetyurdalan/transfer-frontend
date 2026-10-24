import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { useApolloClient, useSubscription } from '@apollo/client/react';
import {
  EventsDocument,
  NotificationsDocument,
  UnseenNotificationCountDocument,
  type Action,
  type EventsSubscription,
} from '@/graphql/generated/graphql';
import { useAuth } from './AuthProvider';

export type AppEvent = EventsSubscription['subscribe'];
type Listener = (event: AppEvent) => void;

const ListenersContext = createContext<Set<Listener> | null>(null);

/**
 * Giriş yapılınca tek bir `subscribe` aboneliği açar ve olayları dağıtır (§9).
 * Genel tepkiler (bildirim sayısı, kullanıcı güncelleme, devre dışı) burada,
 * sayfaya özel tepkiler `useAppEvent` ile ilgili component'lerde ele alınır.
 */
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [listeners] = useState(() => new Set<Listener>());
  const { isAuthenticated, logout } = useAuth();
  const client = useApolloClient();

  useSubscription(EventsDocument, {
    skip: !isAuthenticated,
    onData: ({ data }) => {
      const event = data.data?.subscribe;
      if (!event) return;
      switch (event.action) {
        case 'NOTIFICATION':
        case 'REFUND':
          void client.refetchQueries({ include: [UnseenNotificationCountDocument, NotificationsDocument] });
          break;
        case 'USER_UPDATED':
          void client.refetchQueries({ include: ['CurrentUser'] });
          break;
        case 'USER_DEACTIVATED':
          void logout('deactivated');
          return;
        case 'TRANSFER_PAID':
        case 'TRANSFER_ASSIGNED':
        case 'TRANSFER_STATUS_UPDATED':
        case 'TRANSFER_CANCELLED':
        case 'PAYMENT_SUCCESS':
        case 'PAYMENT_FAILED':
        case 'TIP_PAYMENT_SUCCESS':
        case 'TIP_PAYMENT_FAILED':
          void client.refetchQueries({ include: ['Transfers', 'Transfer'] });
          break;
        default:
          break;
      }
      listeners.forEach((fn) => fn(event));
    },
  });

  return <ListenersContext value={listeners}>{children}</ListenersContext>;
}

/** Belirli WebSocket olaylarını dinler. `handler` her render'da değişebilir. */
export function useAppEvent(actions: Action[] | 'all', handler: Listener) {
  const listeners = use(ListenersContext);
  const handlerRef = useRef(handler);
  const actionsKey = actions === 'all' ? 'all' : actions.join(',');

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!listeners) return;
    const allowed = actionsKey === 'all' ? null : new Set(actionsKey.split(','));
    const fn: Listener = (event) => {
      if (!allowed || allowed.has(event.action)) handlerRef.current(event);
    };
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, [listeners, actionsKey]);
}
