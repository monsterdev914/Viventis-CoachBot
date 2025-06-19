-- Add stripe_payment_method_id column to user_payment_methods table
-- This stores the Stripe payment method ID for linking with Stripe

ALTER TABLE user_payment_methods 
ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT;

-- Add unique constraint to prevent duplicate payment methods
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_payment_methods_stripe_pm_id 
ON user_payment_methods(stripe_payment_method_id);

-- Add composite unique constraint for user_id + stripe_payment_method_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_payment_methods_user_stripe_pm 
ON user_payment_methods(user_id, stripe_payment_method_id);

-- Update existing rows to have a placeholder value (if any exist)
-- Note: In production, you might want to fetch actual payment method IDs from Stripe
UPDATE user_payment_methods 
SET stripe_payment_method_id = 'placeholder_' || id::text 
WHERE stripe_payment_method_id IS NULL;

-- Make the column NOT NULL after setting placeholder values
ALTER TABLE user_payment_methods 
ALTER COLUMN stripe_payment_method_id SET NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN user_payment_methods.stripe_payment_method_id IS 'Stripe payment method ID for linking with Stripe API'; 