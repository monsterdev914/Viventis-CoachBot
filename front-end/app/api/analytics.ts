import { AxiosResponse } from 'axios';
import api from '../../utiles/axiosConfig';

export interface DashboardMetrics {
  totalUsers: number;
  usersThisMonth: number;
  usersLastMonth: number;
  monthlyGrowthRate: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  paidSubscriptions: number;
  monthlyRevenue: number;
  planDistribution: { [key: string]: number };
  recentUsers: Array<{ email: string; first_name: string; last_name: string; created_at: string }>;
  conversionRate: number;
  metrics: {
    userGrowth: {
      current: number;
      previous: number;
      growthRate: number;
    };
    subscriptions: {
      total: number;
      trial: number;
      paid: number;
      conversionRate: number;
    };
    revenue: {
      monthly: number;
    };
  };
}

export interface UserGrowthData {
  date: string;
  users: number;
}

export interface RevenueMetrics {
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowthRate: number;
  mrr: number;
  arpu: number;
}

export const analyticsApi = {
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response: AxiosResponse<DashboardMetrics> = await api.get('/analytics/dashboard');
    return response.data;
  },

  getUserGrowth: async (period: string = '30'): Promise<{ growthData: UserGrowthData[] }> => {
    const response = await api.get(`/analytics/user-growth?period=${period}`);
    return response.data;
  },

  getRevenueMetrics: async (): Promise<RevenueMetrics> => {
    const response: AxiosResponse<RevenueMetrics> = await api.get('/analytics/revenue');
    return response.data;
  },
}; 