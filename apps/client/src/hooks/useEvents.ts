import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/event.service.js';
import { QUERY_KEYS } from '@/lib/constants.js';
import type { EventFilters } from '@/types';

export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, filters],
    queryFn: () => eventService.list(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.EVENT_DETAIL(id),
    queryFn: () => eventService.getById(id),
    enabled: !!id,
  });
}

export function useTrendingEvents() {
  return useQuery({
    queryKey: QUERY_KEYS.TRENDING_EVENTS,
    queryFn: () => eventService.getTrending(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: () => eventService.getCategories(),
    staleTime: 1000 * 60 * 60,
  });
}

export function useEventTiers(eventId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.EVENT_TIERS(eventId),
    queryFn: () => eventService.getTiers(eventId),
    enabled: !!eventId,
  });
}

export function useEventReviews(eventId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.EVENT_REVIEWS(eventId),
    queryFn: () => eventService.getReviews(eventId),
    enabled: !!eventId,
  });
}

export function useMyOrganizedEvents() {
  return useQuery({
    queryKey: QUERY_KEYS.MY_ORGANIZED_EVENTS,
    queryFn: () => eventService.getMyOrganized(),
  });
}

export function useMyAttendingEvents() {
  return useQuery({
    queryKey: QUERY_KEYS.MY_ATTENDING_EVENTS,
    queryFn: () => eventService.getMyAttending(),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_ORGANIZED_EVENTS });
    },
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventService.publish(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENT_DETAIL(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS });
    },
  });
}
