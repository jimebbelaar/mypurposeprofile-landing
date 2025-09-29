// app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with proper error handling
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe configuration is complete
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        "STRIPE_SECRET_KEY is not configured in environment variables."
      );
    }

    if (!process.env.STRIPE_PRICE_ID) {
      throw new Error(
        "STRIPE_PRICE_ID is not configured in environment variables."
      );
    }

    const body = await request.json();
    const { email, name } = body;

    // Retrieve the price from Stripe to get the amount
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID);

    // Get the product details for metadata
    const product = price.product as string;
    const productDetails = await stripe.products.retrieve(product);

    // Create a PaymentIntent with the price from Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount!, // Amount in cents from the Stripe Price
      currency: price.currency,
      automatic_payment_methods: {
        enabled: true, // This enables all payment methods including Apple Pay
      },
      metadata: {
        product_name: productDetails.name,
        price_id: price.id,
        product_id: productDetails.id,
      },
      // Add customer email if provided
      ...(email && { receipt_email: email }),

      // Add description from product
      description: productDetails.description || productDetails.name,

      // Add statement descriptor for better merchant identification
      statement_descriptor_suffix: "ADHD Method",

      // Add merchant display name for Apple Pay
      payment_method_options: {
        card: {
          request_three_d_secure: "automatic",
        },
      },
    });

    // Return client secret and price information for the frontend
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      priceInfo: {
        amount: price.unit_amount,
        currency: price.currency,
        productName: productDetails.name,
        // Include original price if it's in metadata
        originalAmount: productDetails.metadata?.original_price || null,
      },
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
