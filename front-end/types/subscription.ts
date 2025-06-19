export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billing_period_months: number; // 1 for monthly, 3 for quarterly, 6 for semi-annual
  is_trial: boolean; // true for trial plans
  trial_period_days?: number; // number of days for trial (e.g., 7)
  stripe_price_id?: string; // Stripe price ID for existing prices
  features?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired' | 'paused' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string; // when trial ends (if applicable)
  cancel_at_period_end: boolean;
  canceled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  payment_intent_id?: string;
  receipt_url?: string;
  created_at: string;
  paid_at?: string;
}

export interface UserPaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  payment_type: string;
  card_last_four?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  is_default: boolean;
  created_at: string;
}

export interface CreateSubscriptionRequest {
  plan_id: string;
}

export interface UpdateSubscriptionRequest {
  plan_id?: string;
  status?: 'active' | 'canceled' | 'expired' | 'paused' | 'trialing';
  cancel_at_period_end?: boolean;
} 