import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabaseClient';
import { createClient } from '@supabase/supabase-js';

// Example auth middleware  
export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '', {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            },
            auth: {
                persistSession: false // Important for server-side usage
            }
        });

        // 3. Verify the token and get user
        const { data: { user }, error: error2 } = await supabase.auth.getUser();
        if (error2 || !user || !token) {
            res.status(401).json({ message: 'Unauthorized' });
            throw error2
        }
        else {
            (req as any).user = {
                ...user,
                id: user.id,
                role: user.user_metadata.user_role // You can set roles dynamically  
            };
            (req as any).supabase = supabase;
        }
        next();
    } catch (err) {
        next(err);
    }
};

// Middleware to check if user has active subscription for chat access
export const requireActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const supabase = (req as any).supabase;

        if (!user) {
            return res.status(401).json({ 
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        // Get user's current subscription
        const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error fetching subscription:', error);
            return res.status(500).json({ 
                message: 'Error checking subscription status',
                code: 'SUBSCRIPTION_CHECK_ERROR'
            });
        }

        // No subscription found
        if (!subscription) {
            return res.status(403).json({ 
                message: 'Active subscription required to access chat',
                code: 'NO_SUBSCRIPTION',
                requiresSubscription: true
            });
        }

        // Check if subscription is active or trialing
        const now = new Date();
        const currentPeriodEnd = new Date(subscription.current_period_end);
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null;

        let isAccessible = false;

        switch (subscription.status) {
            case 'active':
                // Active subscription - check if not expired
                isAccessible = currentPeriodEnd > now;
                break;
            case 'trialing':
                // Trial subscription - check if trial not expired
                isAccessible = trialEnd ? trialEnd > now : false;
                break;
            case 'canceled':
                // Canceled subscription - check if still in current period
                isAccessible = currentPeriodEnd > now && !subscription.cancel_at_period_end;
                break;
            default:
                // expired, paused, etc.
                isAccessible = false;
        }

        if (!isAccessible) {
            return res.status(403).json({ 
                message: 'Your subscription has expired. Please renew to continue using the chat',
                code: 'SUBSCRIPTION_EXPIRED',
                requiresSubscription: true,
                subscription: {
                    status: subscription.status,
                    current_period_end: subscription.current_period_end,
                    trial_end: subscription.trial_end
                }
            });
        }

        // Add subscription info to request for potential use in controllers
        (req as any).subscription = subscription;
        next();
    } catch (err) {
        console.error('Error in requireActiveSubscription middleware:', err);
        return res.status(500).json({ 
            message: 'Error checking subscription status',
            code: 'SUBSCRIPTION_CHECK_ERROR'
        });
    }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (user?.role !== 'super_admin') {
        next(new Error('Unauthorized'));
    }
    next();
}; 