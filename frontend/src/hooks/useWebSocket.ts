'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { Notification, WsMessage } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8080/api/ws';
const RECONNECT_DELAY = 3000;
const MAX_RETRIES     = 5;

interface UseWebSocketReturn {
  isConnected: boolean;
  send:        (message: unknown) => void;
  disconnect:  () => void;
}

export function useWebSocket(
  onMessage?: (msg: WsMessage) => void
): UseWebSocketReturn {
  const ws                   = useRef<WebSocket | null>(null);
  const retries              = useRef(0);
  const reconnectTimer       = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const token               = useAuthStore((s) => s.token);
  const isAuthenticated     = useAuthStore((s) => s.isAuthenticated);
  const addNotification     = useNotificationStore((s) => s.addRealTimeNotification);
  const setWsConnected      = useNotificationStore((s) => s.setWsConnected);

  const connect = useCallback(() => {
    if (!isAuthenticated || !token) return;
    if (ws.current?.readyState === WebSocket.OPEN) return;

    try {
      const url = `${WS_URL}?token=${token}`;
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setIsConnected(true);
        setWsConnected(true);
        retries.current = 0;
      };

      ws.current.onmessage = (event: MessageEvent) => {
        try {
          const msg = JSON.parse(event.data as string) as WsMessage;

          // Handle notifications automatically
          if (msg.type === 'NOTIFICATION') {
            addNotification(msg.payload as Notification);
          }

          onMessage?.(msg);
        } catch {
          // ignore malformed messages
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        setWsConnected(false);

        if (retries.current < MAX_RETRIES && isAuthenticated) {
          retries.current += 1;
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };

      ws.current.onerror = () => {
        ws.current?.close();
      };
    } catch {
      // WebSocket unavailable (e.g. SSR)
    }
  }, [isAuthenticated, token, onMessage, addNotification, setWsConnected]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    retries.current = MAX_RETRIES; // prevent reconnect
    ws.current?.close();
    setIsConnected(false);
    setWsConnected(false);
  }, [setWsConnected]);

  const send = useCallback((message: unknown) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect]);

  return { isConnected, send, disconnect };
}
