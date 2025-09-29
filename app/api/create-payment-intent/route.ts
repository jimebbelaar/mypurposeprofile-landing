// app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with proper error handling
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        "STRIPE_SECRET_KEY is not configured in environment variables."
      );
    }

    const body = await request.json();
    const { amount = 1 } = body; // Default to $27.00

    // Create a PaymentIntent with proper configuration
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true, // This enables all payment methods including Apple Pay
      },
      metadata: {
        product: "ADHD Identity Method",
        price: "$27.00",
      },
      // Optional: Add customer email if you have it
      // receipt_email: email,

      // Optional: Add a description for your records
      description: "ADHD Identity Method - Digital Product",

      // Optional: Set up for saving payment method
      // setup_future_usage: 'off_session',
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Payment intent creation error:", error);

    // Return more specific error messages for debugging
    if (error.type === "StripeAuthenticationError") {
      return NextResponse.json(
        { error: "Authentication with Stripe failed. Check your API key." },
        { status: 401 }
      );
    } else if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: `Invalid request: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Error creating payment intent: ${error.message}` },
      { status: 500 }
    );
  }
}

// Optional: Add OPTIONS method for CORS if needed
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
