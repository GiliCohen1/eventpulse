import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '@/lib/constants.js';
import { useAuthStore } from '@/stores/auth.store.js';

interface UseSocketOptions {
  autoConnect?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data: unknown) => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler?: (...args: unknown[]) => void) => void;
  joinRoom: (eventId: string, roomType: string) => void;
  leaveRoom: (eventId: string, roomType: string) => void;
}

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { autoConnect = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const tokens = useAuthStore((state) => state.tokens);

  useEffect(() => {
    if (!autoConnect || !tokens?.accessToken) return;

    const socket = io(WS_URL, {
      auth: { token: tokens.accessToken },
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.info('[WS] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.info('[WS] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[WS] Connection error:', error.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [autoConnect, tokens?.accessToken]);

  const emit = useCallback((event: string, data: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event: string, handler?: (...args: unknown[]) => void) => {
    if (handler) {
      socketRef.current?.off(event, handler);
    } else {
      socketRef.current?.off(event);
    }
  }, []);

  const joinRoom = useCallback((eventId: string, roomType: string) => {
    socketRef.current?.emit('room:join', { eventId, roomType });
  }, []);

  const leaveRoom = useCallback((eventId: string, roomType: string) => {
    socketRef.current?.emit('room:leave', { eventId, roomType });
  }, []);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
  };
}
