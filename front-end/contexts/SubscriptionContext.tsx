"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import api from '@/utiles/axiosConfig';
import { Plan, Subscription, CreateSubscriptionRequest, Payment, UserPaymentMethod } from '@/types/subscription';
import { useAuth } from '@/contexts/AuthContext';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionResponse {
  url?: string;
  subscription: Subscription;
  message?: string;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  plans: Plan[];
  payments: Payment[];
  paymentMethods: UserPaymentMethod[];
  loading: boolean;
  error: string | null;
  createSubscription: (planId: string) => Promise<SubscriptionResponse>;
  cancelSubscription: (subscriptionId: string, immediate?: boolean) => Promise<void>;
  updateSubscription: (subscriptionId: string, data: any) => Promise<void>;
  upgradeSubscription: (planId: string) => Promise<SubscriptionResponse>;
  convertTrialToPaid: (planId: string) => Promise<SubscriptionResponse>;
  refreshSubscription: () => Promise<void>;
  refreshPlans: () => Promise<void>;
  refreshPayments: () => Promise<void>;
  refreshPaymentMethods: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<UserPaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = async () => {
    if (!user) {
      console.log('User not authenticated, skipping subscription fetch');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get(`/subscriptions/current`);
      setSubscription(response.data.subscription);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  const refreshPlans = async () => {
    try {
      // Plans are public, can be fetched without authentication
      const response = await api.get(`/subscriptions/plans`);
      setPlans(response.data.plans);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to fetch plans');
    }
  };

  const refreshPayments = async () => {
    if (!user) {
      console.log('User not authenticated, skipping payments fetch');
      return;
    }

    try {
      const response = await api.get(`/subscriptions/payments`);
      setPayments(response.data.payments);
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError('Failed to fetch payment history');
    }
  };

  const refreshPaymentMethods = async () => {
    if (!user) {
      console.log('User not authenticated, skipping payment methods fetch');
      return;
    }

    try {
      const response = await api.get(`/subscriptions/payment-methods`);
      setPaymentMethods(response.data.paymentMethods);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError('Failed to fetch payment methods');
    }
  };

  const createSubscription = async (planId: string): Promise<SubscriptionResponse> => {
    if (!user) {
      throw new Error('User must be authenticated to create subscription');
    }

    console.log('Creating subscription for plan:', planId);
    try {
      setLoading(true);
      const response = await api.post(`/subscriptions`, {
        plan_id: planId,
      });
      console.log('Create subscription response:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('Create subscription error:', err);
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (subscriptionId: string, data: any) => {
    if (!user) {
      throw new Error('User must be authenticated to update subscription');
    }

    try {
      setLoading(true);
      await api.put(`/subscriptions/${subscriptionId}`, data);
      await refreshSubscription();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string, immediate?: boolean) => {
    console.log('Cancelling subscription:', subscriptionId, immediate);
    if (!user) {
      throw new Error('User must be authenticated to cancel subscription');
    }

    try {
      setLoading(true);
      await api.delete(`/subscriptions/${subscriptionId}`, {
        data: { immediate }
      });
      await refreshSubscription();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const upgradeSubscription = async (planId: string): Promise<SubscriptionResponse> => {
    if (!user) {
      throw new Error('User must be authenticated to upgrade subscription');
    }

    console.log('Upgrading subscription to plan:', planId);
    try {
      setLoading(true);
      const response = await api.post(`/stripe/upgrade`, {
        plan_id: planId,
      });
      console.log('Upgrade subscription response:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('Upgrade subscription error:', err);
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const convertTrialToPaid = async (planId: string): Promise<SubscriptionResponse> => {
    if (!user) {
      throw new Error('User must be authenticated to convert trial');
    }

    console.log('Converting trial to paid for plan:', planId);
    try {
      setLoading(true);
      const response = await api.post(`/subscriptions/convert-trial`, {
        plan_id: planId,
      });
      console.log('Convert trial response:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('Convert trial error:', err);
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset subscription data when user logs out
  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setPayments([]);
      setPaymentMethods([]);
      setError(null);
    }
  }, [user]);

  // Load data when auth state is ready
  useEffect(() => {
    if (!authLoading) {
      // Always load plans (public data)
      refreshPlans();
      
      // Only load user-specific data if authenticated
      if (user) {
        refreshSubscription();
        refreshPayments();
        refreshPaymentMethods();
      }
    }
  }, [user, authLoading]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plans,
        payments,
        paymentMethods,
        loading,
        error,
        createSubscription,
        cancelSubscription,
        updateSubscription,
        upgradeSubscription,
        convertTrialToPaid,
        refreshSubscription,
        refreshPlans,
        refreshPayments,
        refreshPaymentMethods,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 