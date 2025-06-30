// controllers/webhookController.ts  
import { Request, Response } from "express";
import { supabase } from "../supabaseClient"; // Import your Supabase client  
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

// Helper function to store payment method in database
const storePaymentMethod = async (stripeCustomerId: string, paymentMethodId: string) => {
  try {
    // Get payment method details from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    
    // Find user by stripe customer ID
    const { data: userData, error: userError } = await supabase
      .from('user_profile')
      .select('user_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (userError || !userData) {
      console.error('Error finding user for payment method storage:', userError);
      return;
    }

    // Check if payment method already exists
    const { data: existingPM, error: checkError } = await supabase
      .from('user_payment_methods')
      .select('id')
      .eq('user_id', userData.user_id)
      .eq('stripe_payment_method_id', paymentMethodId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing payment method:', checkError);
      return;
    }

    // If payment method already exists, don't create duplicate
    if (existingPM) {
      console.log('Payment method already exists:', paymentMethodId);
      return;
    }

    // Determine if this should be the default payment method
    const { data: existingMethods, error: countError } = await supabase
      .from('user_payment_methods')
      .select('id')
      .eq('user_id', userData.user_id);

    const isFirstMethod = !existingMethods || existingMethods.length === 0;

    // Prepare payment method data
    let paymentMethodData: any = {
      user_id: userData.user_id,
      stripe_payment_method_id: paymentMethodId,
      payment_type: paymentMethod.type,
      is_default: isFirstMethod, // First payment method is default
      created_at: new Date().toISOString()
    };

    // Add card-specific details if it's a card payment method
    if (paymentMethod.type === 'card' && paymentMethod.card) {
      paymentMethodData.card_last_four = paymentMethod.card.last4;
      paymentMethodData.card_brand = paymentMethod.card.brand;
      paymentMethodData.card_exp_month = paymentMethod.card.exp_month;
      paymentMethodData.card_exp_year = paymentMethod.card.exp_year;
    }

    // Insert payment method into database
    const { error: insertError } = await supabase
      .from('user_payment_methods')
      .insert(paymentMethodData);

    if (insertError) {
      console.error('Error storing payment method:', insertError);
    } else {
      console.log('Payment method stored successfully:', paymentMethodId);
    }
  } catch (error) {
    console.error('Error in storePaymentMethod:', error);
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    res.status(500).json({ error: 'Webhook secret not configured' });
    return;
  }
  if (!sig) {
    console.error('Missing stripe-signature header');
    res.status(400).json({ error: 'No signature found' });
    return;
  }

  let event: Stripe.Event;

  try {
    const rawBody = req.body;
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    console.log('Event constructed successfully:', event.type);
  } catch (err: any) {
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Processing checkout.session.completed:', session.id);

        const subscriptionId = session.metadata?.subscription_id;
        const isConvertingTrial = session.metadata?.converting_trial === 'true';
        const isUpgrading = session.metadata?.upgrading_subscription === 'true';

        if (!subscriptionId) {
          console.error('No subscription ID in session metadata');
          res.json({ received: true });
          return;
        }

        if (isConvertingTrial) {
          // Handle trial conversion - update existing subscription to paid
          const planId = session.metadata?.plan_id;
          const updateData: any = {
            status: 'active',
            updated_at: new Date().toISOString(),
            trial_end: null, // Clear trial end date
          };
          
          // Update plan_id if provided
          if (planId) {
            updateData.plan_id = planId;
          }

          const { error } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('id', subscriptionId);

          if (error) {
            console.error('Error converting trial subscription:', error);
          }
        } else if (isUpgrading) {
          // Handle subscription upgrade - update plan and status
          const planId = session.metadata?.plan_id;
          const updateData: any = {
            status: 'active',
            updated_at: new Date().toISOString()
          };
          
          // Update plan_id if provided
          if (planId) {
            updateData.plan_id = planId;
          }

          const { error } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('id', subscriptionId);

          if (error) {
            console.error('Error upgrading subscription:', error);
          }
        } else {
          // Update subscription status to active for new subscriptions
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', subscriptionId);

          if (error) {
            console.error('Error updating subscription after checkout:', error);
          }
        }

        // Create initial payment record for paid subscriptions
        if (session.amount_total && session.amount_total > 0 && session.subscription) {
          await supabase
            .from('payments')
            .insert({
              subscription_id: subscriptionId,
              amount: session.amount_total / 100, // Convert from cents
              currency: session.currency || 'chf',
              status: 'paid',
              payment_method: 'stripe_checkout',
              payment_intent_id: session.payment_intent as string,
              paid_at: new Date().toISOString()
            });
        }

        // Store payment method if available
        if (session.customer && session.setup_intent) {
          try {
            const setupIntent = await stripe.setupIntents.retrieve(session.setup_intent as string);
            if (setupIntent.payment_method) {
              await storePaymentMethod(session.customer as string, setupIntent.payment_method as string);
            }
          } catch (error) {
            console.error('Error retrieving setup intent for payment method:', error);
          }
        }

        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Processing customer.subscription.created:', subscription.id);

        // Find user by stripe customer ID
        const { data: userData, error: userError } = await supabase
          .from('user_profile')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .maybeSingle();

        if (userError || !userData) {
          console.error('Error finding user:', userError);
          res.json({ received: true });
          return;
        }

        // Update subscription with Stripe subscription ID and status
        const updateData: any = {
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          updated_at: new Date().toISOString()
        };

        // Only add period dates if they exist
        if (subscription.current_period_start) {
          updateData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString();
        }
        if (subscription.current_period_end) {
          updateData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
        }

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('user_id', userData.user_id)
          .eq('status', 'pending');

        if (updateError) {
          console.error('Error updating subscription:', updateError);
        }

        // Also update user profile for backward compatibility
        await supabase
          .from('user_profile')
          .update({
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
          })
          .eq('stripe_customer_id', subscription.customer);

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Processing customer.subscription.updated:', subscription.id);

        // Update subscription in our database
        const updateData: any = {
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString()
        };

        // Only add period dates if they exist
        if (subscription.current_period_start) {
          updateData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString();
        }
        if (subscription.current_period_end) {
          updateData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
        }

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
        }

        // Also update user profile for backward compatibility
        await supabase
          .from('user_profile')
          .update({
            subscription_status: subscription.status,
          })
          .eq('stripe_subscription_id', subscription.id);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Processing customer.subscription.deleted:', subscription.id);

        // Update subscription status to canceled and clear stripe_subscription_id
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            stripe_subscription_id: null, // Clear the stripe subscription ID
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
        }

        // Also update user profile for backward compatibility and clear stripe_subscription_id
        await supabase
          .from('user_profile')
          .update({
            subscription_status: 'canceled',
            stripe_subscription_id: null, // Clear the stripe subscription ID
          })
          .eq('stripe_subscription_id', subscription.id);

        console.log('Successfully canceled subscription and cleared stripe_subscription_id:', subscription.id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Processing invoice.payment_succeeded:', invoice.id);

        if (!invoice.subscription) {
          res.json({ received: true });
          return;
        }

        // Find subscription in our database by customer ID
        const { data: userProfile, error: userError } = await supabase
          .from('user_profile')
          .select('user_id')
          .eq('stripe_customer_id', invoice.customer as string)
          .single();

        if (userError || !userProfile) {
          console.error('Could not find user for invoice:', invoice.id);
          res.json({ received: true });
          return;
        }

        const { data: subscription, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', userProfile.user_id)
          .in('status', ['active', 'trialing'])
          .single();

        if (subscriptionError || !subscription) {
          console.error('Could not find subscription for invoice:', invoice.id);
          res.json({ received: true });
          return;
        }

        // Create payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            subscription_id: subscription.id,
            amount: (invoice.amount_paid || 0) / 100, // Convert from cents
            currency: invoice.currency,
            status: 'paid',
            payment_method: 'stripe_subscription',
            payment_intent_id: invoice.payment_intent as string,
            paid_at: invoice.status_transitions.paid_at 
              ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
              : new Date().toISOString()
          });

        if (paymentError) {
          console.error('Error creating payment record:', paymentError);
        }

        // Store payment method if available
        if (invoice.customer && invoice.charge) {
          try {
            const charge = await stripe.charges.retrieve(invoice.charge as string);
            if (charge.payment_method) {
              await storePaymentMethod(invoice.customer as string, charge.payment_method as string);
            }
          } catch (error) {
            console.error('Error retrieving charge for payment method:', error);
          }
        }

        // Update subscription period
        if (invoice.lines.data[0]?.period) {
          const period = invoice.lines.data[0].period;
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              current_period_start: new Date(period.start * 1000).toISOString(),
              current_period_end: new Date(period.end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id);

          if (updateError) {
            console.error('Error updating subscription period:', updateError);
          }
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
          res.json({ received: true });
          return;
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
          res.json({ received: true });
          return;
        }

        break;
      }

      case 'setup_intent.succeeded': {
        const setupIntent = event.data.object as Stripe.SetupIntent;
        console.log('Processing setup_intent.succeeded:', setupIntent.id);

        if (setupIntent.payment_method && setupIntent.customer) {
          await storePaymentMethod(setupIntent.customer as string, setupIntent.payment_method as string);
        }
        break;
      }

      case 'payment_method.attached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        console.log('Processing payment_method.attached:', paymentMethod.id);

        if (paymentMethod.customer) {
          await storePaymentMethod(paymentMethod.customer as string, paymentMethod.id);
        }
        break;
      }

      case 'payment_method.detached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        console.log('Processing payment_method.detached:', paymentMethod.id);

        // Remove payment method from database
        const { error } = await supabase
          .from('user_payment_methods')
          .delete()
          .eq('stripe_payment_method_id', paymentMethod.id);

        if (error) {
          console.error('Error removing payment method:', error);
        } else {
          console.log('Payment method removed successfully:', paymentMethod.id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response immediately
    console.log("Webhook received and processed successfully");
    res.json({ received: true });
    return;
  } catch (error) {
    console.log("Webhook error during processing");
    console.error('Error processing webhook:', error);
    // Still return 200 to acknowledge receipt
    res.json({ received: true });
    return;
  }
};  