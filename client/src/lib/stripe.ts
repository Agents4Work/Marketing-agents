/**
 * Client-side Stripe Integration
 * 
 * This module provides functionality for interacting with the Stripe API
 * from the client-side.
 */

import { apiRequest } from './queryClient';

export interface PriceData {
  id: string;
  amount: number;
  currency: string;
  interval: string;
}

export interface PlanData {
  id: string;
  name: string;
  description: string;
  prices: PriceData[];
}

/**
 * Fetch available subscription plans from the API
 */
export async function fetchSubscriptionPlans(): Promise<PlanData[]> {
  try {
    const response = await apiRequest('/api/billing/plans', {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch subscription plans');
    }
    
    return response.plans;
  } catch (error: any) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(customerId: string, priceId: string, userId: string): Promise<{ sessionId: string; url: string } | null> {
  try {
    const response = await apiRequest('/api/billing/checkout-session', {
      method: 'POST',
      body: JSON.stringify({
        customerId,
        priceId,
        userId
      })
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to create checkout session');
    }
    
    return {
      sessionId: response.sessionId,
      url: response.url
    };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return null;
  }
}

/**
 * Get a customer's subscription status
 */
export async function getSubscriptionStatus(customerId: string): Promise<any> {
  try {
    const response = await apiRequest(`/api/billing/customers/${customerId}/subscription`, {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch subscription status');
    }
    
    return response.subscription;
  } catch (error: any) {
    console.error('Error fetching subscription status:', error);
    return null;
  }
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

/**
 * Format subscription interval for display
 */
export function formatInterval(interval: string): string {
  switch (interval) {
    case 'month':
      return 'monthly';
    case 'year':
      return 'yearly';
    case 'week':
      return 'weekly';
    case 'day':
      return 'daily';
    default:
      return interval;
  }
}