-- Subscription System Tables for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create plans table
CREATE TABLE plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_period_months INTEGER NOT NULL, -- 1 for monthly, 3 for quarterly, 6 for semi-annual, etc.
    is_trial BOOLEAN DEFAULT FALSE, -- true for trial plans
    trial_period_days INTEGER, -- number of days for trial (e.g., 7)
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'paused', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_end TIMESTAMP WITH TIME ZONE, -- when trial ends (if applicable)
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID REFERENCES subscriptions(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CHF',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    payment_intent_id VARCHAR(255),
    receipt_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Create user_payment_methods table
CREATE TABLE user_payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_type VARCHAR(50) NOT NULL,
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_user_payment_methods_user_id ON user_payment_methods(user_id);
CREATE INDEX idx_plans_is_active ON plans(is_active);
CREATE INDEX idx_plans_is_trial ON plans(is_trial);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;

-- Plans policies (public read for active plans)
CREATE POLICY "Anyone can view active plans" ON plans
    FOR SELECT USING (is_active = true);

-- Subscriptions policies (users can only see their own)
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Payments policies (users can only see payments for their subscriptions)
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (
        subscription_id IN (
            SELECT id FROM subscriptions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert payments" ON payments
    FOR INSERT WITH CHECK (true);

-- User payment methods policies
CREATE POLICY "Users can view own payment methods" ON user_payment_methods
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods" ON user_payment_methods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods" ON user_payment_methods
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods" ON user_payment_methods
    FOR DELETE USING (auth.uid() = user_id);

-- Insert sample plans with trial option and your specific pricing
INSERT INTO plans (name, description, price, billing_period_months, is_trial, trial_period_days, features, is_active) VALUES 
(
    'Free Trial',
    'Experience the full power of our coaching system',
    0.00,
    1, -- placeholder, not used for trials
    true, -- this is a trial plan
    7, -- 7 days trial
    '["Daily coaching sessions", "Basic insights", "Progress tracking", "Full access to all features"]',
    true
),
(
    'Basic',
    'Perfect for getting started',
    15.00,
    1, -- Monthly
    false, -- not a trial
    null, -- no trial period
    '["Daily coaching sessions", "Basic insights", "Progress tracking"]',
    true
),
(
    'Pro',
    'Most popular for serious growth',
    39.00,
    3, -- Every 3 months (quarterly)
    false, -- not a trial
    null, -- no trial period
    '["Daily coaching sessions", "Advanced insights", "Progress tracking", "Goal setting", "Priority support"]',
    true
),
(
    'Premium',
    'Complete coaching experience',
    89.00,
    6, -- Every 6 months (semi-annual)
    false, -- not a trial
    null, -- no trial period
    '["Daily coaching sessions", "Advanced insights", "Progress tracking", "Goal setting", "Priority support", "Personalized coaching", "Unlimited sessions"]',
    true
);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; 