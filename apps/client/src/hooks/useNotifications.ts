import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service.js';
import { QUERY_KEYS } from '@/lib/constants.js';
import { useSocket } from './useSocket.js';

export function useNotifications(params: { isRead?: boolean; page?: number } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.NOTIFICATIONS, params],
    queryFn: () => notificationService.list(params),
  });
}

export function useUnreadCount() {
  const queryClient = useQueryClient();
  const { on, off } = useSocket();

  // When a new notification arrives via WS, bump the unread count
  const handleNewNotification = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UNREAD_COUNT });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
  }, [queryClient]);

  useEffect(() => {
    on('notification:new', handleNewNotification);
    return () => {
      off('notification:new', handleNewNotification);
    };
  }, [on, off, handleNewNotification]);

  return useQuery({
    queryKey: QUERY_KEYS.UNREAD_COUNT,
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UNREAD_COUNT });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UNREAD_COUNT });
    },
  });
}
