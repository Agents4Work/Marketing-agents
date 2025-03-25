/**
 * Stripe Integration Module
 * 
 * This module provides integration with the Stripe API for payment processing.
 * It handles subscriptions, one-time payments, and webhooks.
 */

import { Request, Response, Router } from 'express';

// Mock Stripe for development until we can install the actual package
// In production, this should be: import Stripe from 'stripe';
class MockStripe {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  customers = {
    create: async (params: any) => {
      console.log('Creating mock Stripe customer:', params);
      return {
        id: `cus_mock_${Date.now()}`,
        email: params.email,
        name: params.name,
        metadata: params.metadata || {}
      };
    },
    retrieve: async (id: string) => {
      console.log('Retrieving mock Stripe customer:', id);
      return {
        id,
        email: 'mock@example.com',
        name: 'Mock Customer',
        metadata: {}
      };
    }
  };
  
  subscriptions = {
    create: async (params: any) => {
      console.log('Creating mock Stripe subscription:', params);
      return {
        id: `sub_mock_${Date.now()}`,
        customer: params.customer,
        status: 'active',
        items: {
          data: [{
            id: `si_mock_${Date.now()}`,
            price: params.items[0].price
          }]
        },
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        metadata: params.metadata || {}
      };
    },
    retrieve: async (id: string) => {
      console.log('Retrieving mock Stripe subscription:', id);
      return {
        id,
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      };
    },
    update: async (id: string, params: any) => {
      console.log('Updating mock Stripe subscription:', id, params);
      return {
        id,
        status: 'active',
        items: {
          data: [{
            id: `si_mock_${Date.now()}`,
            price: params.items?.[0]?.price || 'price_mock'
          }]
        }
      };
    },
    cancel: async (id: string, params?: any) => {
      console.log('Cancelling mock Stripe subscription:', id, params);
      return {
        id,
        status: 'canceled'
      };
    }
  };
  
  checkout = {
    sessions: {
      create: async (params: any) => {
        console.log('Creating mock Stripe checkout session:', params);
        return {
          id: `cs_mock_${Date.now()}`,
          url: `https://example.com/mock-checkout-session`,
          payment_status: 'unpaid',
          customer: params.customer,
          metadata: params.metadata || {}
        };
      },
      retrieve: async (id: string) => {
        console.log('Retrieving mock Stripe checkout session:', id);
        return {
          id,
          payment_status: 'paid',
          customer: `cus_mock_${Date.now()}`
        };
      }
    }
  };
  
  products = {
    create: async (params: any) => {
      console.log('Creating mock Stripe product:', params);
      return {
        id: `prod_mock_${Date.now()}`,
        name: params.name,
        description: params.description,
        metadata: params.metadata || {}
      };
    },
    list: async (params?: any) => {
      console.log('Listing mock Stripe products:', params);
      return {
        data: [
          {
            id: 'prod_mock_basic',
            name: 'Basic Plan',
            description: 'Basic AI Marketing Platform features'
          },
          {
            id: 'prod_mock_pro',
            name: 'Pro Plan',
            description: 'Advanced AI Marketing Platform features'
          },
          {
            id: 'prod_mock_enterprise',
            name: 'Enterprise Plan',
            description: 'Full AI Marketing Platform capabilities'
          }
        ]
      };
    }
  };
  
  prices = {
    create: async (params: any) => {
      console.log('Creating mock Stripe price:', params);
      return {
        id: `price_mock_${Date.now()}`,
        product: params.product,
        unit_amount: params.unit_amount,
        currency: params.currency,
        recurring: params.recurring
      };
    },
    list: async (params?: any) => {
      console.log('Listing mock Stripe prices:', params);
      return {
        data: [
          {
            id: 'price_mock_basic_monthly',
            product: 'prod_mock_basic',
            unit_amount: 1999,
            currency: 'usd',
            recurring: { interval: 'month' }
          },
          {
            id: 'price_mock_pro_monthly',
            product: 'prod_mock_pro',
            unit_amount: 4999,
            currency: 'usd',
            recurring: { interval: 'month' }
          },
          {
            id: 'price_mock_enterprise_monthly',
            product: 'prod_mock_enterprise',
            unit_amount: 9999,
            currency: 'usd',
            recurring: { interval: 'month' }
          }
        ]
      };
    }
  };
  
  webhooks = {
    constructEvent: (body: string, signature: string, secret: string) => {
      console.log('Constructing mock Stripe webhook event');
      return {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: `cs_mock_${Date.now()}`,
            customer: `cus_mock_${Date.now()}`,
            metadata: {}
          }
        }
      };
    }
  };
}

// Initialize Stripe with API key
const getStripeClient = () => {
  const stripeAPIKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
  
  // Once we've installed the Stripe package, use this:
  // return new Stripe(stripeAPIKey);
  
  // For now, use the mock
  return new MockStripe(stripeAPIKey);
};

/**
 * Safe wrapper for Stripe operations
 */
async function safeStripeRequest<T>(requestFn: () => Promise<T>): Promise<[T | null, string | null]> {
  try {
    const result = await requestFn();
    return [result, null];
  } catch (error: any) {
    console.error('Stripe operation failed:', error);
    return [null, error.message || 'Unknown error occurred'];
  }
}

/**
 * Create a Stripe customer for a user
 */
export async function createStripeCustomer(email: string, name: string, metadata: Record<string, string> = {}) {
  const stripe = getStripeClient();
  
  return safeStripeRequest(async () => {
    return stripe.customers.create({
      email,
      name,
      metadata
    });
  });
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {}
) {
  const stripe = getStripeClient();
  
  return safeStripeRequest(async () => {
    return stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata
    });
  });
}

/**
 * Handle creation of subscription checkout session
 */
async function handleCreateCheckoutSession(req: Request, res: Response) {
  const { customerId, priceId } = req.body;
  
  if (!customerId || !priceId) {
    return res.status(400).json({
      success: false,
      error: 'Customer ID and Price ID are required'
    });
  }
  
  const successUrl = `${req.headers.origin}/account/billing/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${req.headers.origin}/account/billing/canceled`;
  
  const [session, error] = await createCheckoutSession(
    customerId,
    priceId,
    successUrl,
    cancelUrl,
    { userId: req.body.userId }
  );
  
  if (error || !session) {
    return res.status(500).json({
      success: false,
      error: error || 'Failed to create checkout session'
    });
  }
  
  res.json({ success: true, sessionId: session.id, url: session.url });
}

/**
 * List available subscription plans
 */
async function handleListPlans(req: Request, res: Response) {
  const stripe = getStripeClient();
  
  const [products, productsError] = await safeStripeRequest(() => stripe.products.list());
  
  if (productsError || !products) {
    return res.status(500).json({
      success: false,
      error: productsError || 'Failed to fetch subscription plans'
    });
  }
  
  const [prices, pricesError] = await safeStripeRequest(() => stripe.prices.list());
  
  if (pricesError || !prices) {
    return res.status(500).json({
      success: false,
      error: pricesError || 'Failed to fetch subscription prices'
    });
  }
  
  // Combine products and prices
  const plans = products.data.map(product => {
    const productPrices = prices.data.filter(price => price.product === product.id);
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      prices: productPrices.map(price => ({
        id: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval
      }))
    };
  });
  
  res.json({ success: true, plans });
}

/**
 * Handle webhook events from Stripe
 */
async function handleWebhook(req: Request, res: Response) {
  const stripe = getStripeClient();
  const signature = req.headers['stripe-signature'] as string;
  
  if (!signature) {
    return res.status(400).json({
      success: false,
      error: 'Stripe signature is required'
    });
  }
  
  try {
    // Get the request body as text
    const payload = JSON.stringify(req.body);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock_secret';
    
    const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    
    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
    }
    
    res.json({ success: true, received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    res.status(400).json({
      success: false,
      error: `Webhook Error: ${error.message}`
    });
  }
}

/**
 * Handle checkout session completed event
 */
async function handleCheckoutSessionCompleted(session: any) {
  // Update user's subscription status in database
  const customerId = session.customer;
  const userId = session.metadata?.userId;
  
  if (!userId) {
    console.error('No user ID found in checkout session metadata');
    return;
  }
  
  // In a real implementation, update the user's subscription status in your database
  console.log(`Updating subscription for user ${userId} with Stripe customer ${customerId}`);
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: any) {
  // Update subscription details in database
  const customerId = subscription.customer;
  const status = subscription.status;
  
  // In a real implementation, update the subscription status in your database
  console.log(`Updating subscription status to ${status} for customer ${customerId}`);
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: any) {
  // Update subscription status in database
  const customerId = subscription.customer;
  
  // In a real implementation, mark the subscription as canceled in your database
  console.log(`Marking subscription as canceled for customer ${customerId}`);
}

/**
 * Get customer subscription status
 */
async function handleGetSubscription(req: Request, res: Response) {
  const { customerId } = req.params;
  
  if (!customerId) {
    return res.status(400).json({
      success: false,
      error: 'Customer ID is required'
    });
  }
  
  // In a real implementation, fetch the customer's subscriptions from Stripe
  // For now, return mock data
  res.json({
    success: true,
    subscription: {
      status: 'active',
      plan: 'Pro',
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
    }
  });
}

/**
 * Create Stripe router with API endpoints
 */
export function createStripeRouter() {
  const router = Router();
  
  // Billing and subscription endpoints
  router.post('/checkout-session', handleCreateCheckoutSession);
  router.get('/plans', handleListPlans);
  router.get('/customers/:customerId/subscription', handleGetSubscription);
  
  // Webhook endpoint
  router.post('/webhook', handleWebhook);
  
  return router;
}

/**
 * Initialize default subscription plans
 */
export async function initializeStripePlans() {
  const stripe = getStripeClient();
  
  // Define plans
  const plans = [
    {
      name: 'Basic Plan',
      description: 'Essential AI marketing tools for small businesses',
      prices: [
        { amount: 1999, currency: 'usd', interval: 'month' }
      ]
    },
    {
      name: 'Pro Plan',
      description: 'Advanced AI marketing capabilities for growing businesses',
      prices: [
        { amount: 4999, currency: 'usd', interval: 'month' }
      ]
    },
    {
      name: 'Enterprise Plan',
      description: 'Comprehensive AI marketing platform for large organizations',
      prices: [
        { amount: 9999, currency: 'usd', interval: 'month' }
      ]
    }
  ];
  
  for (const plan of plans) {
    // Create product
    const [product, productError] = await safeStripeRequest(() => 
      stripe.products.create({
        name: plan.name,
        description: plan.description
      })
    );
    
    if (productError || !product) {
      console.error(`Failed to create product ${plan.name}:`, productError);
      continue;
    }
    
    // Create prices for the product
    for (const price of plan.prices) {
      const [_, priceError] = await safeStripeRequest(() => 
        stripe.prices.create({
          product: product.id,
          unit_amount: price.amount,
          currency: price.currency,
          recurring: { interval: price.interval as 'month' }
        })
      );
      
      if (priceError) {
        console.error(`Failed to create price for product ${plan.name}:`, priceError);
      }
    }
  }
  
  console.log('Stripe subscription plans initialized');
}