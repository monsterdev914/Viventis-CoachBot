"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import api from '@/utiles/axiosConfig';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionResponse {
  url: string;
}

interface SubscriptionContextType {
  subscription: any;
  prices: any[];
  loading: boolean;
  error: string | null;
  createSubscription: (priceId: string) => Promise<SubscriptionResponse>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/stripe/subscriptions/current`);
      setSubscription(response.data.subscription);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (priceId: string): Promise<SubscriptionResponse> => {
    try {
      setLoading(true);
      const response = await api.post(
        `/stripe/subscriptions`,
        { priceId }
      );
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      setLoading(true);
      await api.delete(`/stripe/subscriptions/${subscriptionId}`);
      await refreshSubscription();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await api.get(`/stripe/prices`);
        console.log(response.data.prices);
        setPrices(response.data.prices);
      } catch (err) {
        console.error('Error fetching prices:', err);
        setError('Failed to fetch subscription prices');
      }
    };

    fetchPrices();
    refreshSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        prices,
        loading,
        error,
        createSubscription,
        cancelSubscription,
        refreshSubscription,
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