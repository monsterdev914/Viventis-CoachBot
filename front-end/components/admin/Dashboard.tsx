'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Spinner,
  Divider,
  Progress
} from '@heroui/react';
import { 
  UsersIcon, 
  CreditCardIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import MetricCard from './MetricCard';
import SimpleChart from './SimpleChart';
import DashboardSkeleton from './DashboardSkeleton';
import { analyticsApi, DashboardMetrics, UserGrowthData, RevenueMetrics } from '../../app/api/analytics';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [growthData, setGrowthData] = useState<UserGrowthData[]>([]);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [metricsData, growthResponse, revenueData] = await Promise.all([
          analyticsApi.getDashboardMetrics(),
          analyticsApi.getUserGrowth('30'),
          analyticsApi.getRevenueMetrics()
        ]);

        setMetrics(metricsData);
        setGrowthData(growthResponse.growthData);
        setRevenueMetrics(revenueData);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.error || t('admin.dashboard.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardBody>
          <div className="text-center py-8">
            <p className="text-danger mb-2">{t('admin.dashboard.errorLoading')}</p>
            <p className="text-default-500 text-sm">{error}</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="w-full">
        <CardBody>
          <p className="text-center text-default-500">{t('admin.dashboard.noDataAvailable')}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-default-500">
          {t('admin.dashboard.lastUpdated')}: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('admin.dashboard.totalUsers')}
          value={metrics.totalUsers.toLocaleString()}
          change={metrics.monthlyGrowthRate}
          changeType={metrics.monthlyGrowthRate > 0 ? 'increase' : metrics.monthlyGrowthRate < 0 ? 'decrease' : 'neutral'}
          subtitle={`${metrics.usersThisMonth} ${t('admin.dashboard.newThisMonth')}`}
          icon={<UsersIcon className="w-5 h-5" />}
          color="primary"
          variant="gradient"
        />

        <MetricCard
          title={t('admin.dashboard.activeSubscriptions')}
          value={metrics.activeSubscriptions.toLocaleString()}
          subtitle={`${metrics.paidSubscriptions} ${t('admin.dashboard.paidSubscriptions')}, ${metrics.trialSubscriptions} ${t('admin.dashboard.trialSubscriptions')}`}
          icon={<CreditCardIcon className="w-5 h-5" />}
          color="secondary"
          variant="gradient"
        />

        <MetricCard
          title={t('admin.dashboard.monthlyRevenue')}
          value={`CHF ${metrics.monthlyRevenue.toFixed(2)}`}
          change={revenueMetrics?.revenueGrowthRate}
          changeType={revenueMetrics && revenueMetrics.revenueGrowthRate > 0 ? 'increase' : 'decrease'}
          subtitle={`${t('admin.dashboard.mrr')}: CHF ${revenueMetrics?.mrr.toFixed(2) || '0.00'}`}
          icon={<CurrencyDollarIcon className="w-5 h-5" />}
          color="success"
          variant="gradient"
        />

        <MetricCard
          title={t('admin.dashboard.conversionRate')}
          value={`${metrics.conversionRate.toFixed(1)}%`}
          subtitle={t('admin.dashboard.trialToPaid')}
          icon={<ArrowTrendingUpIcon className="w-5 h-5" />}
          color="warning"
          variant="gradient"
        />
      </div>

      <Divider />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <SimpleChart
          title={t('admin.dashboard.userGrowth')}
          data={growthData}
          color="#3b82f6"
        />

        {/* Subscription Distribution */}
        <Card className="w-full">
          <CardHeader>
            <h3 className="text-lg font-semibold">{t('admin.dashboard.subscriptionDistribution')}</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {Object.entries(metrics.planDistribution).map(([planName, count]) => {
                const percentage = metrics.activeSubscriptions > 0 
                  ? (count / metrics.activeSubscriptions) * 100 
                  : 0;
                
                return (
                  <div key={planName} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{planName}</span>
                      <span className="text-default-500">{count} {t('admin.dashboard.users')} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <Progress
                      value={percentage}
                      className="w-full"
                      color={percentage > 50 ? 'success' : percentage > 25 ? 'warning' : 'primary'}
                    />
                  </div>
                );
              })}
              {Object.keys(metrics.planDistribution).length === 0 && (
                <p className="text-default-500 text-center py-4">{t('admin.dashboard.noSubscriptionData')}</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Revenue Metrics Row */}
      {revenueMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title={t('admin.dashboard.averageRevenuePerUser')}
            value={`CHF ${revenueMetrics.arpu.toFixed(2)}`}
            subtitle={t('admin.dashboard.monthlyArpu')}
            icon={<ChartBarIcon className="w-5 h-5" />}
            color="success"
            variant="gradient"
          />

          <MetricCard
            title={t('admin.dashboard.revenueGrowth')}
            value={`${revenueMetrics.revenueGrowthRate.toFixed(1)}%`}
            changeType={revenueMetrics.revenueGrowthRate > 0 ? 'increase' : 'decrease'}
            subtitle={t('admin.dashboard.monthOverMonth')}
            icon={<ArrowTrendingUpIcon className="w-5 h-5" />}
            color="warning"
            variant="gradient"
          />

          <MetricCard
            title={t('admin.dashboard.monthlyRecurringRevenue')}
            value={`CHF ${revenueMetrics.mrr.toFixed(2)}`}
            subtitle={t('admin.dashboard.totalMrr')}
            icon={<CurrencyDollarIcon className="w-5 h-5" />}
            color="success"
            variant="gradient"
          />
        </div>
      )}

      {/* Recent Activity */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold">{t('admin.dashboard.recentUsers')}</h3>
          <div className="flex items-center text-sm text-default-500">
            <ClockIcon className="w-4 h-4 mr-1" />
            {t('admin.dashboard.last7Days')}
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {metrics.recentUsers.length > 0 ? (
              metrics.recentUsers.map((user, index) => {
                const displayName = user.first_name || user.last_name 
                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                  : user.email;

                return (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-default-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <UsersIcon className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{displayName}</span>
                        {(user.first_name || user.last_name) && (
                          <span className="text-xs text-default-500">{user.email}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-default-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-default-500 text-center py-4">{t('admin.dashboard.noRecentUsers')}</p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard; 