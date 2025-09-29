import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    // Check if stripe is initialized
    if (!stripe) {
      throw new Error(
        "Stripe is not configured. Please check your environment variables."
      );
    }

    const body = await request.json();
    const { amount } = body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 2700, // Default to $27.00
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        product: "ADHD Identity Method",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { error: `Error creating payment intent: ${error.message}` },
      { status: 500 }
    );
  }
}
