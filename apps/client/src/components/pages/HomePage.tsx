import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MapPin, TrendingUp } from 'lucide-react';
import { Button } from '@/components/atoms/Button.js';
import { Spinner } from '@/components/atoms/Spinner.js';
import { EventList } from '@/components/organisms/EventList.js';
import { useTrendingEvents, useCategories } from '@/hooks/useEvents.js';
import { ROUTES } from '@/lib/constants.js';
import { type ICategory } from '@eventpulse/shared-types';

function CategoryCard({ category }: { category: ICategory }): JSX.Element {
  return (
    <Link
      to={`${ROUTES.EVENTS}?category=${category.slug}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-secondary-200 bg-white p-6 transition hover:border-primary-300 hover:shadow-md"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-2xl transition group-hover:bg-primary-100">
        {category.icon ?? '🎉'}
      </div>
      <span className="text-sm font-medium text-secondary-700 group-hover:text-primary-600">
        {category.name}
      </span>
    </Link>
  );
}

export function HomePage(): JSX.Element {
  const { data: trending, isLoading: trendingLoading } = useTrendingEvents();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 py-24 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container-app relative">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Discover amazing events near you
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Your Next Great
              <br />
              Experience Awaits
            </h1>
            <p className="mt-6 text-lg text-primary-100">
              Find conferences, workshops, meetups and more. Register instantly, chat with attendees, and never miss a moment.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to={ROUTES.EVENTS}>
                <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Explore Events
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="ghost" size="lg" className="!text-white border-white/30 hover:bg-white/10">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-app py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">Browse Categories</h2>
            <p className="mt-1 text-secondary-500">Find events that match your interests</p>
          </div>
        </div>
        {categoriesLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories?.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* Trending Events */}
      <section className="bg-white py-16">
        <div className="container-app">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary-600" />
              <div>
                <h2 className="text-2xl font-bold text-secondary-900">Trending Now</h2>
                <p className="mt-1 text-secondary-500">Popular events this week</p>
              </div>
            </div>
            <Link
              to={ROUTES.EVENTS}
              className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <EventList events={trending} isLoading={trendingLoading} columns={4} />
        </div>
      </section>

      {/* CTA */}
      <section className="container-app py-16">
        <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-accent-600 p-12 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to Host Your Own Event?</h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-100">
            Create, manage, and grow your events with powerful tools for ticketing, analytics, live chat and more.
          </p>
          <Link to={ROUTES.REGISTER} className="mt-6 inline-block">
            <Button variant="secondary" size="lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
