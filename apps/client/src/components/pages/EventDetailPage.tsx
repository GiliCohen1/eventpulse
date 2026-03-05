import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  Globe,
  MessageSquare,
  HelpCircle,
  Star,
} from 'lucide-react';
import { useEvent, useEventTiers, useEventReviews } from '@/hooks/useEvents.js';
import { useAuthStore } from '@/stores/auth.store.js';
import { Button } from '@/components/atoms/Button.js';
import { Badge } from '@/components/atoms/Badge.js';
import { Spinner, LoadingScreen } from '@/components/atoms/Spinner.js';
import { Avatar } from '@/components/atoms/Avatar.js';
import { ErrorState } from '@/components/atoms/EmptyState.js';
import { formatDate, formatTime, formatCurrency, classNames } from '@/lib/utils.js';
import { EVENT_STATUS_LABELS, EVENT_STATUS_COLORS, ROUTES } from '@/lib/constants.js';
import { ticketService } from '@/services/ticket.service.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type Tab = 'about' | 'chat' | 'qa' | 'reviews';

export function EventDetailPage(): JSX.Element {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading, isError } = useEvent(eventId!);
  const { data: tiers } = useEventTiers(eventId!);
  const { data: reviews } = useEventReviews(eventId!);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('about');

  const registerMutation = useMutation({
    mutationFn: (tierId: string) =>
      ticketService.register({ eventId: eventId!, ticketTierId: tierId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });

  if (isLoading) return <LoadingScreen message="Loading event..." />;
  if (isError || !event) {
    return (
      <div className="container-app py-12">
        <ErrorState message="Event not found or failed to load." />
      </div>
    );
  }

  const statusColor = EVENT_STATUS_COLORS[event.status] ?? 'neutral';
  const statusLabel = EVENT_STATUS_LABELS[event.status] ?? event.status;

  const tabs: { key: Tab; label: string; icon: JSX.Element }[] = [
    { key: 'about', label: 'About', icon: <Globe className="h-4 w-4" /> },
    { key: 'chat', label: 'Chat', icon: <MessageSquare className="h-4 w-4" /> },
    { key: 'qa', label: 'Q&A', icon: <HelpCircle className="h-4 w-4" /> },
    { key: 'reviews', label: 'Reviews', icon: <Star className="h-4 w-4" /> },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 lg:h-96 bg-secondary-200">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500">
            <Calendar className="h-20 w-20 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="container-app">
            <Badge variant={statusColor as 'primary' | 'success' | 'warning' | 'error' | 'neutral'}>
              {statusLabel}
            </Badge>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{event.title}</h1>
            <p className="mt-1 text-sm text-white/80">
              Organized by {event.organizer?.firstName} {event.organizer?.lastName}
            </p>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-6 flex gap-1 rounded-xl bg-secondary-100 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={classNames(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition',
                    activeTab === tab.key
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-secondary-600 hover:text-secondary-900'
                  )}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="card">
                  <h2 className="mb-4 text-lg font-semibold text-secondary-900">About This Event</h2>
                  <div className="prose prose-sm max-w-none text-secondary-700">
                    {event.description}
                  </div>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div className="card">
                    <h3 className="mb-3 text-sm font-semibold text-secondary-700">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="neutral">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="card">
                <p className="text-sm text-secondary-500">
                  {isAuthenticated
                    ? 'Live chat will be available when the event goes live.'
                    : 'Sign in to participate in the event chat.'}
                </p>
              </div>
            )}

            {/* Q&A Tab */}
            {activeTab === 'qa' && (
              <div className="card">
                <p className="text-sm text-secondary-500">
                  {isAuthenticated
                    ? 'Q&A will be available when the event goes live.'
                    : 'Sign in to ask questions.'}
                </p>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="card">
                      <div className="mb-2 flex items-center gap-3">
                        <Avatar
                          firstName={review.user?.firstName ?? ''}
                          lastName={review.user?.lastName ?? ''}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium text-secondary-900">
                            {review.user?.firstName} {review.user?.lastName}
                          </p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={classNames(
                                  'h-3.5 w-3.5',
                                  i < review.rating
                                    ? 'fill-warning-400 text-warning-400'
                                    : 'text-secondary-300'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-secondary-700">{review.comment}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="card text-center">
                    <p className="text-sm text-secondary-500">No reviews yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="card space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-primary-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">
                    {formatDate(event.startDate)}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {formatTime(event.startDate)} – {formatTime(event.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-primary-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">
                    {event.venue ?? 'Online Event'}
                  </p>
                  {event.address && (
                    <p className="text-xs text-secondary-500">{event.address}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 text-primary-600 shrink-0" />
                <p className="text-sm text-secondary-700">
                  {event.currentAttendees ?? 0}
                  {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} attendees
                </p>
              </div>
            </div>

            {/* Ticket Tiers */}
            {tiers && tiers.length > 0 && (
              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-secondary-900">Tickets</h3>
                <div className="space-y-3">
                  {tiers.map((tier) => {
                    const soldOut = tier.quantitySold >= tier.quantity;
                    return (
                      <div
                        key={tier.id}
                        className="flex items-center justify-between rounded-lg border border-secondary-200 p-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-secondary-900">{tier.name}</p>
                          <p className="text-lg font-bold text-primary-600">
                            {tier.price === 0 ? 'Free' : formatCurrency(tier.price)}
                          </p>
                          <p className="text-xs text-secondary-500">
                            {tier.quantity - tier.quantitySold} remaining
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={soldOut || !isAuthenticated}
                          isLoading={registerMutation.isPending}
                          onClick={() => registerMutation.mutate(tier.id)}
                        >
                          {soldOut ? 'Sold Out' : 'Register'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
                {!isAuthenticated && (
                  <p className="mt-3 text-center text-xs text-secondary-500">
                    <Link to={ROUTES.LOGIN} className="text-primary-600 hover:underline">
                      Sign in
                    </Link>{' '}
                    to register for this event.
                  </p>
                )}
              </div>
            )}

            {/* Share */}
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-secondary-200 bg-white py-3 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
            >
              <Share2 className="h-4 w-4" />
              Share Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
