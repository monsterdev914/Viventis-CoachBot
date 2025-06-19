-- Migration: Add stripe_subscription_id to subscriptions table
-- Run this SQL in your Supabase SQL Editor

-- Add the stripe_subscription_id column to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN stripe_subscription_id VARCHAR(255);

-- Create an index for better performance when looking up by Stripe subscription ID
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Add stripe_price_id to plans table to link with Stripe prices
ALTER TABLE plans
ADD COLUMN stripe_price_id VARCHAR(255);

-- Create an index for better performance when looking up by Stripe price ID
CREATE INDEX idx_plans_stripe_price_id ON plans(stripe_price_id);

-- Add stripe_customer_id to user_profile table if it doesn't exist
-- First check if the column exists (this is safe to run multiple times)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profile' 
        AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE user_profile ADD COLUMN stripe_customer_id VARCHAR(255);
        CREATE INDEX idx_user_profile_stripe_customer_id ON user_profile(stripe_customer_id);
    END IF;
END $$;

-- Add a comment to document the schema
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe subscription ID for paid subscriptions (null for trial subscriptions)';
COMMENT ON COLUMN plans.stripe_price_id IS 'Stripe price ID for this plan (null for trial plans)';
COMMENT ON COLUMN user_profile.stripe_customer_id IS 'Stripe customer ID for payment processing'; 