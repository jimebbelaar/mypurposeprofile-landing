// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(request: NextRequest) {
  console.log("=== STRIPE CHECKOUT SESSION REQUEST ===");

  try {
    // Check if Stripe configuration is complete
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    if (!process.env.STRIPE_PRICE_ID) {
      throw new Error("STRIPE_PRICE_ID is not configured");
    }

    const body = await request.json();
    const { priceId, mode = "payment" } = body;

    console.log("Creating checkout session with:");
    console.log("Price ID:", priceId || process.env.STRIPE_PRICE_ID);
    console.log("Mode:", mode);

    // Create the checkout session with embedded UI
    const session = await stripe.checkout.sessions.create({
      mode: mode,
      line_items: [
        {
          price: priceId || process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      ui_mode: "embedded",
      // This is crucial - embedded checkout returns here after payment
      return_url: `${
        process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin")
      }/success?session_id={CHECKOUT_SESSION_ID}`,

      // Optional: collect phone number
      phone_number_collection: {
        enabled: false,
      },

      // Customer creation for better email tracking
      customer_creation: "always",

      // Automatic tax calculation (optional)
      automatic_tax: {
        enabled: false,
      },

      // Add metadata for tracking
      metadata: {
        product_name: "ADHD Identity Method",
        source: "embedded_checkout",
      },

      // Invoice creation for better record keeping
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: "ADHD Identity Method - Digital Product",
          metadata: {
            product: "ADHD Identity Method",
          },
        },
      },
    });

    console.log("✅ Checkout session created:", session.id);

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("❌ Stripe error:", error.message);
    console.error("Error type:", error.type);

    // Return more specific error messages
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
      {
        error: error.message,
        type: error.type,
      },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS if needed
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
