// controllers/webhookController.ts  
import { Request, Response } from "express";
import { supabase } from "../supabaseClient"; // Import your Supabase client  
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export const handleWebhook = async (req: Request, res: Response) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  if (!sig) {
    console.error('Missing stripe-signature header');
    return res.status(400).json({ error: 'No signature found' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = req.body;
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    console.log('Event constructed successfully:', event.type);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Processing checkout.session.completed:', session.id);

        // First check if user exists
        const { data: userData, error: userError } = await supabase
          .from('user_profile')
          .select('user_id')
          .eq('user_id', session.client_reference_id)
          .maybeSingle();

        if (userError) {
          console.error('Error finding user:', userError);
          // Still return 200 to acknowledge receipt
          return res.json({ received: true });
        }

        // Update user's subscription status
        const { error: updateError } = await supabase
          .from('user_profile')
          .update({
            subscription_status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('user_id', session.client_reference_id);

        if (updateError) {
          console.error('Error updating user subscription:', updateError);
          // Still return 200 to acknowledge receipt
          return res.json({ received: true });
        }

        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Processing customer.subscription.created:', subscription.id);

        // First check if user exists
        const { data: userData, error: userError } = await supabase
          .from('user_profile')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .maybeSingle();

        if (userError) {
          console.error('Error finding user:', userError);
          // Still return 200 to acknowledge receipt
          return res.json({ received: true });
        }

        // Update user's subscription status
        const { error: updateError } = await supabase
          .from('user_profile')
          .update({
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
          })
          .eq('stripe_customer_id', subscription.customer);

        if (updateError) {
          console.error('Error updating user subscription:', updateError);
          // Still return 200 to acknowledge receipt
          return res.json({ received: true });
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Processing customer.subscription.updated:', subscription.id);

        // First check if user exists
        const { data: userData, error: userError } = await supabase
          .from('user_profile')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        if (userError) {
          console.error('Error finding user:', userError);
          // Still return 200 to acknowledge receipt
          return res.json({ received: true });
        }

        // Update user's subscription status
        const { error: updateError } = await supabase
          .from('user_profile')
          .update({
            subscription_status: subscription.status,
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Error updating user subscription:', updateError);
          // Still return 200 to acknowledge receipt
          return res.json({ received: true });
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Processing customer.subscription.deleted:', subscription.id);

        // First check if user exists
        const { data: userData, error: userError } = await supabase
          .from('user_profile')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        if (userError) {
          console.error('Error finding user:', userError);
          // Still return 200 to acknowledge receipt
          return res.json({ received: true });
        }

        // Update user's subscription status
        const { error: updateError } = await supabase
          .from('user_profile')
          .update({
            subscription_status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Error updating user subscription:', updateError);
          // Still return 200 to acknowledge receipt
          return res.json({ received: true });
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Processing invoice.payment_succeeded:', invoice.id);

        // First check if user exists
        const { data: userData, error: userError } = await supabase
          .from('user_profile')
          .select('id')
          .eq('stripe_customer_id', invoice.customer)
          .maybeSingle();

        if (userError) {
          console.error('Error finding user:', userError);
          // Still return 200 to acknowledge receipt
          return res.json({ received: true });
        }

        // Update user's subscription status
        const { error: updateError } = await supabase
          .from('user_profile')
          .update({
            subscription_status: 'active',
          })
          .eq('stripe_customer_id', invoice.customer);

        if (updateError) {
          console.error('Error updating user subscription:', updateError);
          // Still return 200 to acknowledge receipt
          return res.json({ received: true });
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Processing invoice.payment_failed:', invoice.id);

        // First check if user exists
        const { data: userData, error: userError } = await supabase
          .from('user_profile')
          .select('id')
          .eq('stripe_customer_id', invoice.customer)
          .maybeSingle();

        if (userError) {
          console.error('Error finding user:', userError);
          // Still return 200 to acknowledge receipt
          return res.json({ received: true });
        }

        // Update user's subscription status
        const { error: updateError } = await supabase
          .from('user_profile')
          .update({
            subscription_status: 'past_due'
          })
          .eq('stripe_customer_id', invoice.customer);

        if (updateError) {
          console.error('Error updating user subscription:', updateError);
          // Still return 200 to acknowledge receipt
          return res.json({ received: true });
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response immediately
    console.log("Webhook received and processed successfully");
    res.json({ received: true });
  } catch (error) {
    console.log("Webhook error during processing");
    console.error('Error processing webhook:', error);
    // Still return 200 to acknowledge receipt
    res.json({ received: true });
  }
};  