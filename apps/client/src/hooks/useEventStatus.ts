import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket.js';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants.js';

interface EventStatusChange {
  eventId: string;
  status: string;
  timestamp: string;
}

/**
 * Subscribe to real-time event status changes via WebSocket.
 *
 * When an event goes live, ends, or is cancelled, the server
 * pushes `event:status_change` through the WS-Kafka bridge.
 * This hook listens globally and/or for a specific event.
 *
 * @param eventId - Optional: only react to changes for this event
 */
export function useEventStatus(eventId?: string) {
  const { on, off } = useSocket();
  const queryClient = useQueryClient();
  const [latestChange, setLatestChange] = useState<EventStatusChange | null>(null);

  const handleStatusChange = useCallback(
    (data: unknown) => {
      const change = data as EventStatusChange;

      // If scoped to an eventId, filter out other events
      if (eventId && change.eventId !== eventId) return;

      setLatestChange(change);

      // Invalidate relevant queries so the UI auto-updates
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRENDING_EVENTS });

      if (change.eventId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.EVENT_DETAIL(change.eventId),
        });
      }
    },
    [eventId, queryClient],
  );

  useEffect(() => {
    on('event:status_change', handleStatusChange);
    return () => {
      off('event:status_change', handleStatusChange);
    };
  }, [on, off, handleStatusChange]);

  return { latestChange };
}

interface RegistrationCountUpdate {
  eventId: string;
  registeredCount: number;
}

/**
 * Subscribe to real-time registration count updates for an event.
 * Triggered when someone registers or cancels.
 */
export function useRegistrationCount(eventId: string) {
  const { on, off } = useSocket();
  const queryClient = useQueryClient();
  const [count, setCount] = useState<number | null>(null);

  const handleUpdate = useCallback(
    (data: unknown) => {
      const update = data as RegistrationCountUpdate;
      if (update.eventId !== eventId) return;

      setCount(update.registeredCount);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EVENT_DETAIL(eventId),
      });
    },
    [eventId, queryClient],
  );

  useEffect(() => {
    on('event:registration_count', handleUpdate);
    return () => {
      off('event:registration_count', handleUpdate);
    };
  }, [on, off, handleUpdate]);

  return { registeredCount: count };
}
