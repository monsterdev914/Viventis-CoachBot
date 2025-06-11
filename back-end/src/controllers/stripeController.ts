import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { priceId } = req.body;
    const userId = (req as any).user.id;
    console.log("userId", userId);
    const { data: userData, error: userError } = await supabase
      .from('user_profile')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      res.status(500).json({ error: 'Failed to fetch user data' });
      return;
    }

    let customerId = userData?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;
      console.log("customerId", customerId);
      const { error } = await supabase
        .from('user_profile')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);
      console.log(error);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:3000/subscription/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/pricing',
      client_reference_id: userId,
    });

    res.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    res.json({ subscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

export const getCurrentSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

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

    if (!userData?.stripe_customer_id) {
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