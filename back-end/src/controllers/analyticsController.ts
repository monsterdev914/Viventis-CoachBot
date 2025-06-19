import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get total users count
    const { count: totalUsers, error: totalUsersError } = await supabase
      .from('user_profile')
      .select('*', { count: 'exact', head: true });

    if (totalUsersError) {
      console.error('Error fetching total users:', totalUsersError);
      res.status(500).json({ error: 'Failed to fetch total users' });
      return;
    }

    // Get users this month
    const { count: usersThisMonth, error: usersThisMonthError } = await supabase
      .from('user_profile')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfCurrentMonth.toISOString());

    if (usersThisMonthError) {
      console.error('Error fetching users this month:', usersThisMonthError);
    }

    // Get users last month
    const { count: usersLastMonth, error: usersLastMonthError } = await supabase
      .from('user_profile')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString());

    if (usersLastMonthError) {
      console.error('Error fetching users last month:', usersLastMonthError);
    }

    // Calculate monthly growth rate
    const monthlyGrowthRate = usersLastMonth && usersLastMonth > 0 
      ? ((usersThisMonth || 0) - usersLastMonth) / usersLastMonth * 100 
      : usersThisMonth || 0 > 0 ? 100 : 0;

    // Get active subscriptions count
    const { count: activeSubscriptions, error: activeSubsError } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trialing']);

    if (activeSubsError) {
      console.error('Error fetching active subscriptions:', activeSubsError);
    }

    // Get trial subscriptions count
    const { count: trialSubscriptions, error: trialSubsError } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'trialing');

    if (trialSubsError) {
      console.error('Error fetching trial subscriptions:', trialSubsError);
    }

    // Get paid subscriptions count
    const { count: paidSubscriptions, error: paidSubsError } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .not('stripe_subscription_id', 'is', null);

    if (paidSubsError) {
      console.error('Error fetching paid subscriptions:', paidSubsError);
    }

    // Get revenue data (from payments table if it exists)
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, created_at')
      .gte('created_at', startOfCurrentMonth.toISOString());

    let monthlyRevenue = 0;
    if (!paymentsError && paymentsData) {
      monthlyRevenue = paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    }

    // Get subscription distribution by plan
    const { data: subscriptionsByPlan, error: planDistError } = await supabase
      .from('subscriptions')
      .select(`
        plan_id,
        plans (name, price)
      `)
      .in('status', ['active', 'trialing']);

    let planDistribution: { [key: string]: number } = {};
    if (!planDistError && subscriptionsByPlan) {
      subscriptionsByPlan.forEach(sub => {
        const planName = (sub.plans as any)?.name || 'Unknown';
        planDistribution[planName] = (planDistribution[planName] || 0) + 1;
      });
    }

    // Get recent activity (new users in last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const { data: recentUsers, error: recentUsersError } = await supabase
      .from('user_profile')
      .select('email, first_name, last_name, created_at')
      .gte('created_at', last7Days.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentUsersError) {
      console.error('Error fetching recent users:', recentUsersError);
    }

    // Calculate conversion rate (trial to paid)
    const conversionRate = trialSubscriptions && trialSubscriptions > 0 
      ? (paidSubscriptions || 0) / ((trialSubscriptions || 0) + (paidSubscriptions || 0)) * 100 
      : 0;

    res.json({
      totalUsers: totalUsers || 0,
      usersThisMonth: usersThisMonth || 0,
      usersLastMonth: usersLastMonth || 0,
      monthlyGrowthRate: Math.round(monthlyGrowthRate * 100) / 100,
      activeSubscriptions: activeSubscriptions || 0,
      trialSubscriptions: trialSubscriptions || 0,
      paidSubscriptions: paidSubscriptions || 0,
      monthlyRevenue: monthlyRevenue / 100, // Convert from cents to currency units
      planDistribution,
      recentUsers: recentUsers || [],
      conversionRate: Math.round(conversionRate * 100) / 100,
      metrics: {
        userGrowth: {
          current: usersThisMonth || 0,
          previous: usersLastMonth || 0,
          growthRate: monthlyGrowthRate
        },
        subscriptions: {
          total: activeSubscriptions || 0,
          trial: trialSubscriptions || 0,
          paid: paidSubscriptions || 0,
          conversionRate
        },
        revenue: {
          monthly: monthlyRevenue / 100
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
};

export const getUserGrowth = async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user registrations grouped by day
    const { data: userGrowthData, error } = await supabase
      .from('user_profile')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching user growth data:', error);
      res.status(500).json({ error: 'Failed to fetch user growth data' });
      return;
    }

    // Group by date
    const growthByDate: { [key: string]: number } = {};
    userGrowthData?.forEach(user => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      growthByDate[date] = (growthByDate[date] || 0) + 1;
    });

    // Fill in missing dates with 0
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        users: growthByDate[dateStr] || 0
      });
    }

    res.json({ growthData: result });
  } catch (error) {
    console.error('Error fetching user growth:', error);
    res.status(500).json({ error: 'Failed to fetch user growth' });
  }
};

export const getRevenueMetrics = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get current month revenue
    const { data: currentMonthPayments, error: currentError } = await supabase
      .from('payments')
      .select('amount')
      .gte('created_at', startOfCurrentMonth.toISOString());

    // Get last month revenue
    const { data: lastMonthPayments, error: lastError } = await supabase
      .from('payments')
      .select('amount')
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString());

    const currentMonthRevenue = currentMonthPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    const lastMonthRevenue = lastMonthPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    const revenueGrowthRate = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : currentMonthRevenue > 0 ? 100 : 0;

    // Get MRR (Monthly Recurring Revenue) from active subscriptions
    const { data: activeSubs, error: subsError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans (price, billing_period_months)
      `)
      .eq('status', 'active');

    let mrr = 0;
    if (!subsError && activeSubs) {
      mrr = activeSubs.reduce((sum, sub) => {
        const plan = sub.plans as any;
        if (plan?.price && plan?.billing_period_months) {
          const monthlyPrice = plan.price / plan.billing_period_months;
          return sum + monthlyPrice;
        }
        return sum;
      }, 0);
    }

    res.json({
      currentMonthRevenue: currentMonthRevenue / 100,
      lastMonthRevenue: lastMonthRevenue / 100,
      revenueGrowthRate: Math.round(revenueGrowthRate * 100) / 100,
      mrr: mrr,
      arpu: activeSubs?.length ? (mrr / activeSubs.length) : 0 // Average Revenue Per User
    });
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
    res.status(500).json({ error: 'Failed to fetch revenue metrics' });
  }
}; 