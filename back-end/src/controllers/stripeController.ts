import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../supabaseClient';
import { Plan, CreateSubscriptionRequest, UpdateSubscriptionRequest } from '../types/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

// Get all active plans from database
export const getPlans = async (req: Request, res: Response) => {
  try {
    const { data: plans, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ error: 'Failed to fetch plans' });
      return;
    }

    res.json({ plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
};

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { plan_id }: CreateSubscriptionRequest = req.body;
    const userId = (req as any).user.id;

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    // Check if user already has an active subscription or trial
    const { data: existingSubscription, error: existingError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing']);

    if (existingError) {
      console.error('Error checking existing subscription:', existingError);
    }

    console.log('Existing subscriptions for user:', userId, existingSubscription);

    if (existingSubscription && existingSubscription.length > 0) {
      console.log('User already has subscription:', existingSubscription[0]);
      res.status(400).json({ 
        error: 'User already has an active subscription or trial',
        existingSubscription: existingSubscription[0]
      });
      return;
    }

    // Handle trial plans differently
    if (plan.is_trial) {
      return await createTrialSubscription(req, res, plan, userId);
    }

    // Get or create Stripe customer for paid plans
    const { data: userData, error: userError } = await supabase
      .from('user_profile')
      .select('stripe_customer_id, email')
      .eq('user_id', userId)
      .single();

    if (userError) {
      res.status(500).json({ error: 'Failed to fetch user data' });
      return;
    }

    let customerId = userData?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;

      await supabase
        .from('user_profile')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);
    }

    // Calculate period dates based on plan's billing period
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + plan.billing_period_months);

    // Create subscription in database first with pending status
    const { data: newSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: plan_id,
        status: 'pending',
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        cancel_at_period_end: false
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      res.status(500).json({ error: 'Failed to create subscription' });
      return;
    }

    // Determine Stripe interval based on billing period
    let interval: 'month' | 'year';
    let intervalCount: number;
    
    if (plan.billing_period_months === 1) {
      interval = 'month';
      intervalCount = 1;
    } else if (plan.billing_period_months === 12) {
      interval = 'year';
      intervalCount = 1;
    } else {
      interval = 'month';
      intervalCount = plan.billing_period_months;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: Math.round(plan.price * 100), // Convert to cents
            recurring: {
              interval: interval,
              interval_count: intervalCount,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: {
        subscription_id: newSubscription.id,
        user_id: userId,
        plan_id: plan_id,
      },
    });

    res.json({
      url: session.url,
      subscription: newSubscription
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

// Create trial subscription (no payment required)
const createTrialSubscription = async (req: Request, res: Response, plan: Plan, userId: string) => {
  try {
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + (plan.trial_period_days || 7));

    // Create trial subscription in database
    const { data: trialSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: plan.id,
        status: 'trialing',
        current_period_start: trialStart.toISOString(),
        current_period_end: trialEnd.toISOString(),
        trial_end: trialEnd.toISOString(),
        cancel_at_period_end: false
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Error creating trial subscription:', subscriptionError);
      res.status(500).json({ error: 'Failed to create trial subscription' });
      return;
    }

    // No payment URL needed for trials - return subscription data for toast display
    res.json({
      subscription: trialSubscription,
      message: `Trial started successfully! You have ${plan.trial_period_days || 7} days to explore ${plan.name}.`
    });
  } catch (error) {
    console.error('Error creating trial subscription:', error);
    res.status(500).json({ error: 'Failed to create trial subscription' });
  }
};

// Convert trial to paid subscription
export const convertTrialToPaid = async (req: Request, res: Response) => {
  try {
    const { plan_id } = req.body;
    const userId = (req as any).user.id;

    // Get current subscription (trial status or trial plan with active status)
    const { data: allSubscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans (*)
      `)
      .eq('user_id', userId)
      .in('status', ['trialing', 'active']);

    console.log('Trial conversion - userId:', userId, 'allSubscriptions:', allSubscriptions, 'error:', subsError);

    if (subsError || !allSubscriptions || allSubscriptions.length === 0) {
      res.status(404).json({ 
        error: 'No active subscription found',
        subsError: subsError
      });
      return;
    }

    // Find trial subscription (either status = 'trialing' or plan.is_trial = true)
    const trialSubscription = allSubscriptions.find(sub => 
      sub.status === 'trialing' || (sub.plans as any)?.is_trial === true
    );

    if (!trialSubscription) {
      res.status(404).json({ 
        error: 'No active trial found',
        userSubscriptions: allSubscriptions
      });
      return;
    }

    // Get target plan
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_active', true)
      .eq('is_trial', false)
      .single();

    if (planError || !plan) {
      res.status(404).json({ error: 'Plan not found or is not a paid plan' });
      return;
    }

    // Get or create Stripe customer
    const { data: userData, error: userError } = await supabase
      .from('user_profile')
      .select('stripe_customer_id, email')
      .eq('user_id', userId)
      .single();

    if (userError) {
      res.status(500).json({ error: 'Failed to fetch user data' });
      return;
    }

    let customerId = userData?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;

      await supabase
        .from('user_profile')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);
    }

    // Determine Stripe interval
    let interval: 'month' | 'year';
    let intervalCount: number;
    
    if (plan.billing_period_months === 1) {
      interval = 'month';
      intervalCount = 1;
    } else if (plan.billing_period_months === 12) {
      interval = 'year';
      intervalCount = 1;
    } else {
      interval = 'month';
      intervalCount = plan.billing_period_months;
    }

    // Create Stripe checkout session for conversion
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: Math.round(plan.price * 100),
            recurring: {
              interval: interval,
              interval_count: intervalCount,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/#pricing`,
      metadata: {
        subscription_id: trialSubscription.id,
        user_id: userId,
        plan_id: plan_id,
        converting_trial: 'true',
      },
    });

    res.json({
      url: session.url,
      subscription: trialSubscription
    });
  } catch (error) {
    console.error('Error converting trial to paid:', error);
    res.status(500).json({ error: 'Failed to convert trial to paid subscription' });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  console.log('Cancelling subscription:', req.params, req.body);
  try {
    const { subscriptionId } = req.params;
    const userId = (req as any).user.id;
    const { immediate = false } = req.body;

    // Verify subscription belongs to user
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, user_profile:user_id(stripe_customer_id)')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !subscription) {
      console.log('Subscription not found:', fetchError, subscription);
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    let stripeSubscriptionId = subscription.stripe_subscription_id;
    
    // If we don't have the Stripe subscription ID stored, try to find it
    if (!stripeSubscriptionId && subscription.user_profile?.stripe_customer_id) {
      console.log('Looking up Stripe subscription for customer:', subscription.user_profile.stripe_customer_id);
      try {
        const stripeSubscriptions = await stripe.subscriptions.list({
          customer: subscription.user_profile.stripe_customer_id,
          status: 'all',
          limit: 10
        });
        
        // Find active subscription (there should only be one)
        const activeStripeSubscription = stripeSubscriptions.data.find(
          sub => sub.status === 'active' || sub.status === 'trialing'
        );
        
        if (activeStripeSubscription) {
          stripeSubscriptionId = activeStripeSubscription.id;
          // Update our database with the Stripe subscription ID for future reference
          await supabase
            .from('subscriptions')
            .update({ stripe_subscription_id: stripeSubscriptionId })
            .eq('id', subscriptionId);
        }
      } catch (stripeError) {
        console.error('Error looking up Stripe subscription:', stripeError);
      }
    }

    // Handle trial subscriptions (no Stripe subscription to cancel)
    if (subscription.status === 'trialing' && !stripeSubscriptionId) {
      console.log('Canceling trial subscription:', subscriptionId);
      const updateData = {
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        cancel_at_period_end: false,
        updated_at: new Date().toISOString()
      };

      const { data: updatedSubscription, error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscriptionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error canceling trial subscription:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
        return;
      }

      res.json({ subscription: updatedSubscription });
      return;
    }

    // Cancel Stripe subscription if it exists
    if (stripeSubscriptionId) {
      console.log('Canceling Stripe subscription:', stripeSubscriptionId, 'immediate:', immediate);
      try {
        if (immediate) {
          // Cancel immediately
          await stripe.subscriptions.cancel(stripeSubscriptionId);
        } else {
          // Cancel at period end
          await stripe.subscriptions.update(stripeSubscriptionId, {
            cancel_at_period_end: true
          });
        }
        console.log('Successfully canceled Stripe subscription');
      } catch (stripeError: any) {
        console.error('Error canceling Stripe subscription:', stripeError);
        // If Stripe cancellation fails, we still want to update our database
        // but we should log this for manual investigation
        console.error('URGENT: Stripe subscription cancellation failed but proceeding with database update. Manual intervention may be required.');
      }
    } else {
      console.warn('No Stripe subscription ID found for subscription:', subscriptionId);
    }

    // Update database
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (immediate) {
      updateData.status = 'canceled';
      updateData.canceled_at = new Date().toISOString();
      updateData.cancel_at_period_end = false;
    } else {
      updateData.cancel_at_period_end = true;
    }

    const { data: updatedSubscription, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription in database:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
      return;
    }

    console.log('Subscription canceled successfully:', updatedSubscription);
    res.json({ 
      subscription: updatedSubscription,
      message: immediate ? 'Subscription canceled immediately' : 'Subscription will be canceled at the end of the billing period'
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;
    const updateData: UpdateSubscriptionRequest = req.body;
    const userId = (req as any).user.id;

    // Verify subscription belongs to user
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    const { data: updatedSubscription, error } = await supabase
      .from('subscriptions')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      res.status(500).json({ error: 'Failed to update subscription' });
      return;
    }

    res.json({ subscription: updatedSubscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

export const getCurrentSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans (*)
      `)
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
      return;
    }

    res.json({ subscription: subscription || null });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
};

export const getSubscription = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data: userData, error: userError } = await supabase
      .from('user_profile')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user:', userError);
      res.status(500).json({ error: 'Failed to fetch user data' });
      return;
    }

    if (!userData) {
      res.json({ subscription: null });
      return;
    }

    if (!userData.stripe_customer_id) {
      res.json({ subscription: null });
      return;
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: 'active',
      expand: ['data.default_payment_method'],
    });

    res.json({ subscription: subscriptions.data[0] || null });
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
};

export const getPrices = async (req: Request, res: Response) => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    res.json({ prices: prices.data });
  } catch (error) {
    console.error('Error getting prices:', error);
    res.status(500).json({ error: 'Failed to get prices' });
  }
};

export const upgradeSubscription = async (req: Request, res: Response) => {
  try {
    const { plan_id } = req.body;
    const userId = (req as any).user.id;

    console.log('Upgrading subscription for user:', userId, 'to plan:', plan_id);

    // Get current subscription with plan details
    const { data: currentSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans (*)
      `)
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single();

    if (subscriptionError || !currentSubscription) {
      console.log('No active subscription found:', subscriptionError);
      res.status(400).json({ error: 'No active subscription found.' });
      return;
    }

    // Get new plan
    const { data: newPlan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_active', true)
      .single();

    if (planError || !newPlan) {
      console.error('Plan not found:', planError);
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    const currentPlan = currentSubscription.plans as any;

    console.log('Upgrade details:', {
      currentPlan: currentPlan?.name,
      currentPlanIsTrial: currentPlan?.is_trial,
      currentStatus: currentSubscription.status,
      newPlan: newPlan.name,
      newPlanIsTrial: newPlan.is_trial
    });

    // Case 1: User is on trial (either status='trialing' or trial plan) and wants to upgrade to paid
    const isCurrentlyTrial = currentSubscription.status === 'trialing' || currentPlan?.is_trial;
    if (isCurrentlyTrial && !newPlan.is_trial) {
      console.log('Converting trial to paid subscription');
      return await convertTrialToPaid(req, res);
    }

    // Case 2: Both current and new plans are paid - update existing Stripe subscription
    if (!currentPlan?.is_trial && !newPlan.is_trial) {
      console.log('Upgrading between paid plans - updating existing subscription');
      
      // Check if plan has Stripe price ID
      if (!newPlan.stripe_price_id) {
        console.error('Plan missing Stripe price ID:', newPlan.name);
        res.status(500).json({ 
          error: 'Plan configuration error - missing Stripe price ID',
          details: 'Please add stripe_price_id to the plan in database'
        });
        return;
      }

      // Get user data to find Stripe customer and subscription
      const { data: userData, error: userError } = await supabase
        .from('user_profile')
        .select('stripe_customer_id, email')
        .eq('user_id', userId)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user profile:', userError);
        res.status(500).json({ error: 'Failed to fetch user profile' });
        return;
      }

      let stripeSubscriptionId = currentSubscription.stripe_subscription_id;

      // If no Stripe subscription ID in database, try to find it from Stripe
      if (!stripeSubscriptionId && userData.stripe_customer_id) {
        console.log('Searching for Stripe subscription for customer:', userData.stripe_customer_id);
        
        try {
          const customerSubscriptions = await stripe.subscriptions.list({
            customer: userData.stripe_customer_id,
            status: 'active',
            limit: 10
          });

          if (customerSubscriptions.data.length > 0) {
            stripeSubscriptionId = customerSubscriptions.data[0].id;
            console.log('Found Stripe subscription:', stripeSubscriptionId);

            // Update our database with the found subscription ID
            await supabase
              .from('subscriptions')
              .update({ stripe_subscription_id: stripeSubscriptionId })
              .eq('id', currentSubscription.id);
          }
        } catch (findError) {
          console.error('Error finding Stripe subscription:', findError);
        }
      }

      // Still no Stripe subscription ID found
      if (!stripeSubscriptionId) {
        console.error('No Stripe subscription ID found - will redirect to checkout for new subscription');
        
        // Redirect to checkout to create a new subscription
        const session = await stripe.checkout.sessions.create({
          customer: userData.stripe_customer_id,
          mode: 'subscription',
          line_items: [
            {
              price: newPlan.stripe_price_id,
              quantity: 1,
            },
          ],
          success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}`,
          metadata: {
            subscription_id: currentSubscription.id,
            user_id: userId,
            plan_id: plan_id,
            upgrading_subscription: 'true',
          },
        });

        res.json({
          url: session.url,
          subscription: currentSubscription,
          message: 'Redirecting to checkout to create new subscription'
        });
        return;
      }

      try {
        // Get the current Stripe subscription
        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        
        if (stripeSubscription.status === 'canceled') {
          console.error('Cannot update a canceled subscription');
          res.status(400).json({ 
            error: 'Cannot upgrade a canceled subscription',
            details: 'Please create a new subscription instead'
          });
          return;
        }

        // Update the subscription item with the new price
        const subscriptionItem = stripeSubscription.items.data[0];
        
        const updatedSubscription = await stripe.subscriptions.update(
          stripeSubscriptionId,
          {
            items: [{
              id: subscriptionItem.id,
              price: newPlan.stripe_price_id,
            }],
            proration_behavior: 'always_invoice', // This will prorate and charge immediately
          }
        );

        console.log('Stripe subscription updated successfully:', updatedSubscription.id);

        // Update our database
        const { data: updatedDbSubscription, error: updateError } = await supabase
          .from('subscriptions')
          .update({
            plan_id: plan_id,
            status: updatedSubscription.status,
            stripe_subscription_id: stripeSubscriptionId,
            current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', currentSubscription.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating subscription in database:', updateError);
          res.status(500).json({ error: 'Failed to update subscription in database' });
          return;
        }

        res.json({ 
          subscription: updatedDbSubscription,
          message: 'Subscription upgraded successfully. You have been charged the prorated amount.'
        });
        return;

      } catch (stripeError: any) {
        console.error('Error updating Stripe subscription:', stripeError);
        res.status(500).json({ 
          error: 'Failed to update Stripe subscription',
          details: stripeError.message 
        });
        return;
      }
    }

    // Case 3: Simple plan update (e.g., between trial plans or no payment required)
    console.log('Simple subscription plan update');
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan_id: plan_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentSubscription.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error upgrading subscription:', updateError);
      res.status(500).json({ error: 'Failed to upgrade subscription' });
      return;
    }

    res.json({ subscription: updatedSubscription });
  } catch (error: any) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ 
      error: 'Failed to upgrade subscription',
      details: error.message 
    });
  }
};

// Get user's payment history
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        subscriptions!inner (
          user_id,
          plans (name)
        )
      `)
      .eq('subscriptions.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({ error: 'Failed to fetch payment history' });
      return;
    }

    res.json({ payments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};

// Get user's payment methods
export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data: paymentMethods, error } = await supabase
      .from('user_payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ error: 'Failed to fetch payment methods' });
      return;
    }

    res.json({ paymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
};

// Helper endpoint to list all Stripe prices (for setup purposes)
export const listStripePrices = async (req: Request, res: Response) => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 100
    });

    // Filter and format the prices for easy identification
    const formattedPrices = prices.data.map(price => ({
      id: price.id,
      product_name: (price.product as any)?.name,
      amount: price.unit_amount ? price.unit_amount / 100 : 0,
      currency: price.currency.toUpperCase(),
      interval: price.recurring?.interval,
      interval_count: price.recurring?.interval_count,
      full_description: `${(price.product as any)?.name} - ${price.currency.toUpperCase()} ${price.unit_amount ? price.unit_amount / 100 : 0} ${price.recurring ? `every ${price.recurring.interval_count || 1} ${price.recurring.interval}(s)` : 'one-time'}`
    }));

    res.json({ 
      prices: formattedPrices,
      total: prices.data.length
    });
  } catch (error: any) {
    console.error('Error listing Stripe prices:', error);
    res.status(500).json({ 
      error: 'Failed to list Stripe prices',
      details: error.message 
    });
  }
};

// Sync payment methods for current user from Stripe
export const syncPaymentMethods = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get user's Stripe customer ID
    const { data: userData, error: userError } = await supabase
      .from('user_profile')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (userError || !userData?.stripe_customer_id) {
      console.error('Error fetching user stripe customer ID:', userError);
      res.status(400).json({ error: 'No Stripe customer found for user' });
      return;
    }

    // Get payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: userData.stripe_customer_id,
      type: 'card', // Focus on card payment methods for now
    });

    let syncedCount = 0;
    let skippedCount = 0;

    for (const pm of paymentMethods.data) {
      // Check if payment method already exists
      const { data: existingPM } = await supabase
        .from('user_payment_methods')
        .select('id')
        .eq('user_id', userId)
        .eq('stripe_payment_method_id', pm.id)
        .single();

      if (existingPM) {
        skippedCount++;
        continue;
      }

      // Determine if this should be the default payment method
      const { data: existingMethods } = await supabase
        .from('user_payment_methods')
        .select('id')
        .eq('user_id', userId);

      const isFirstMethod = !existingMethods || existingMethods.length === 0;

      // Store payment method
      const paymentMethodData: any = {
        user_id: userId,
        stripe_payment_method_id: pm.id,
        payment_type: pm.type,
        is_default: isFirstMethod,
        created_at: new Date().toISOString()
      };

      // Add card-specific details
      if (pm.type === 'card' && pm.card) {
        paymentMethodData.card_last_four = pm.card.last4;
        paymentMethodData.card_brand = pm.card.brand;
        paymentMethodData.card_exp_month = pm.card.exp_month;
        paymentMethodData.card_exp_year = pm.card.exp_year;
      }

      const { error: insertError } = await supabase
        .from('user_payment_methods')
        .insert(paymentMethodData);

      if (!insertError) {
        syncedCount++;
      } else {
        console.error('Error syncing payment method:', insertError);
      }
    }

    res.json({
      message: 'Payment methods synced successfully',
      synced: syncedCount,
      skipped: skippedCount,
      total: paymentMethods.data.length
    });
  } catch (error: any) {
    console.error('Error syncing payment methods:', error);
    res.status(500).json({ 
      error: 'Failed to sync payment methods',
      details: error.message 
    });
  }
}; 