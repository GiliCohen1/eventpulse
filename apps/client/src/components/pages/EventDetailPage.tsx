import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Share2,
  Globe,
  MessageSquare,
  HelpCircle,
  Star,
  Check,
} from 'lucide-react';
import { useEvent, useEventTiers, useEventReviews } from '@/hooks/useEvents.js';
import { useAuthStore } from '@/stores/auth.store.js';
import { Button } from '@/components/atoms/Button.js';
import { Badge } from '@/components/atoms/Badge.js';
import { LoadingScreen } from '@/components/atoms/Spinner.js';
import { ErrorState } from '@/components/atoms/EmptyState.js';
import { formatDate, formatTime, formatCurrency, classNames } from '@/lib/utils.js';
import { ROUTES, QUERY_KEYS } from '@/lib/constants.js';
import { t } from '@/lib/i18n.js';
import { ticketService } from '@/services/ticket.service.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type Tab = 'about' | 'chat' | 'qa' | 'reviews';

export function EventDetailPage(): JSX.Element {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading, isError } = useEvent(eventId!);
  const { data: tiers } = useEventTiers(eventId!);
  const { data: reviews } = useEventReviews(eventId!);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('about');

  const registerMutation = useMutation({
    mutationFn: (tierId: string) => ticketService.register(eventId!, tierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENT_DETAIL(eventId!) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENT_TIERS(eventId!) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_REGISTRATIONS });
    },
  });

  const [copied, setCopied] = useState(false);
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (isLoading) return <LoadingScreen message={t('eventDetail.loading')} />;
  if (isError || !event) {
    return (
      <div className="container-app py-12">
        <ErrorState message={t('eventDetail.notFound')} />
      </div>
    );
  }

  const statusLabel = t(`eventStatus.${event.status}`);

  function getStatusVariant(
    status: string,
  ): 'primary' | 'success' | 'warning' | 'error' | 'neutral' {
    switch (status) {
      case 'published':
        return 'primary';
      case 'live':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'draft':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  const tabs: { key: Tab; label: string; icon: JSX.Element }[] = [
    { key: 'about', label: t('eventDetail.about'), icon: <Globe className="h-4 w-4" /> },
    { key: 'chat', label: t('eventDetail.chat'), icon: <MessageSquare className="h-4 w-4" /> },
    { key: 'qa', label: t('eventDetail.qa'), icon: <HelpCircle className="h-4 w-4" /> },
    { key: 'reviews', label: t('eventDetail.reviews'), icon: <Star className="h-4 w-4" /> },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 lg:h-96 bg-secondary-200">
        {event.coverImageUrl ? (
          <img src={event.coverImageUrl} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500">
            <Calendar className="h-20 w-20 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="container-app">
            <Badge variant={getStatusVariant(event.status)}>{statusLabel}</Badge>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{event.title}</h1>
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
                      : 'text-secondary-600 hover:text-secondary-900',
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
                  <h2 className="mb-4 text-lg font-semibold text-secondary-900">
                    {t('eventDetail.aboutEvent')}
                  </h2>
                  <div className="prose prose-sm max-w-none text-secondary-700">
                    {event.description}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="card">
                <p className="text-sm text-secondary-500">
                  {isAuthenticated ? t('eventDetail.chatUnavailable') : t('eventDetail.chatSignIn')}
                </p>
              </div>
            )}

            {/* Q&A Tab */}
            {activeTab === 'qa' && (
              <div className="card">
                <p className="text-sm text-secondary-500">
                  {isAuthenticated ? t('eventDetail.qaUnavailable') : t('eventDetail.qaSignIn')}
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
                        <div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={classNames(
                                  'h-3.5 w-3.5',
                                  i < review.rating
                                    ? 'fill-warning-400 text-warning-400'
                                    : 'text-secondary-300',
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
                    <p className="text-sm text-secondary-500">{t('eventDetail.noReviews')}</p>
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
                    {formatDate(event.startsAt)}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {formatTime(event.startsAt)} – {formatTime(event.endsAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-primary-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">
                    {event.venueName ?? t('common.onlineEvent')}
                  </p>
                  {event.venueAddress && (
                    <p className="text-xs text-secondary-500">{event.venueAddress}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 text-primary-600 shrink-0" />
                <p className="text-sm text-secondary-700">
                  {event.registeredCount ?? 0}
                  {event.maxCapacity ? ` / ${event.maxCapacity}` : ''} {t('common.attendees')}
                </p>
              </div>
            </div>

            {/* Ticket Tiers */}
            {tiers && tiers.length > 0 && (
              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-secondary-900">
                  {t('eventDetail.tickets')}
                </h3>
                <div className="space-y-3">
                  {tiers.map((tier) => {
                    const soldOut = tier.registeredCount >= tier.capacity;
                    return (
                      <div
                        key={tier.id}
                        className="flex items-center justify-between rounded-lg border border-secondary-200 p-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-secondary-900">{tier.name}</p>
                          <p className="text-lg font-bold text-primary-600">
                            {tier.price === 0 ? t('common.free') : formatCurrency(tier.price)}
                          </p>
                          <p className="text-xs text-secondary-500">
                            {t('common.remaining', { count: tier.capacity - tier.registeredCount })}
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={soldOut || !isAuthenticated}
                          isLoading={registerMutation.isPending}
                          onClick={() => registerMutation.mutate(tier.id)}
                        >
                          {soldOut ? t('common.soldOut') : t('common.register')}
                        </Button>
                      </div>
                    );
                  })}
                </div>
                {!isAuthenticated && (
                  <p className="mt-3 text-center text-xs text-secondary-500">
                    <Link to={ROUTES.LOGIN} className="text-primary-600 hover:underline">
                      {t('common.signIn')}
                    </Link>{' '}
                    {t('eventDetail.signInToRegister')}
                  </p>
                )}
              </div>
            )}

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-secondary-200 bg-white py-3 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-success-600" />
                  <span className="text-success-600">{t('common.copied')}</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  {t('common.shareEvent')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
