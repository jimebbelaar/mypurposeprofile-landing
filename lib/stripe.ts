// lib/stripe.ts
import Stripe from "stripe";

// Only initialize on server-side
let stripe: Stripe | undefined;

if (typeof window === "undefined") {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("Warning: STRIPE_SECRET_KEY is not set");
  } else {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // Remove apiVersion to use account's default version
      typescript: true,
    });
  }
}

export { stripe };
