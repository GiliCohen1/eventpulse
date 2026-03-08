import { useQuery } from '@tanstack/react-query';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { analyticsService } from '@/services/analytics.service.js';
import { LoadingScreen } from '@/components/atoms/Spinner.js';
import { formatCurrency, formatCount, classNames } from '@/lib/utils.js';
import { t } from '@/lib/i18n.js';

interface DashboardData {
  stats: {
    totalEvents: number;
    totalAttendees: number;
    totalRevenue: number;
    conversionRate: number;
  };
  registrationTimeline: Array<{ date: string; count: number }>;
  trafficSources: Array<{ source: string; count: number }>;
}

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  icon: JSX.Element;
  trend?: 'up' | 'down';
}

function StatCard({ label, value, change, icon, trend }: StatCardProps): JSX.Element {
  return (
    <div className="card flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-secondary-500">{label}</p>
        <p className="text-2xl font-bold text-secondary-900">{value}</p>
        {change && (
          <p className={classNames(trend === 'up' ? 'stat-trend--up' : 'stat-trend--down')}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}

export function DashboardPage(): JSX.Element {
  const { data: dashboard, isLoading } = useQuery<DashboardData>({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsService.getDashboard() as Promise<DashboardData>,
  });

  if (isLoading) return <LoadingScreen message={t('dashboard.loading')} />;

  const stats = dashboard?.stats;
  const registrationTimeline = dashboard?.registrationTimeline ?? [];
  const trafficSources = dashboard?.trafficSources ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">{t('dashboard.title')}</h1>
        <p className="mt-1 text-secondary-500">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('dashboard.totalEvents')}
          value={formatCount(stats?.totalEvents ?? 0)}
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard
          label={t('dashboard.totalAttendees')}
          value={formatCount(stats?.totalAttendees ?? 0)}
          change={t('dashboard.attendeesGrowth')}
          trend="up"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          label={t('dashboard.totalRevenue')}
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          change={t('dashboard.revenueGrowth')}
          trend="up"
          icon={<DollarSign className="h-6 w-6" />}
        />
        <StatCard
          label={t('dashboard.conversionRate')}
          value={`${stats?.conversionRate ?? 0}%`}
          icon={<TrendingUp className="h-6 w-6" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Registration Timeline */}
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-secondary-900">
            {t('dashboard.registrationTrend')}
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-secondary-900">
            {t('dashboard.trafficSources')}
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSources}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ source, percent }) => `${source} (${(percent * 100).toFixed(0)}%)`}
                >
                  {trafficSources.map(
                    (_entry: { source: string; count: number }, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ),
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
