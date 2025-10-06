// app/api/get-price/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function GET(request: NextRequest) {
  try {
    // Check if Stripe configuration is complete
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
      throw new Error("Stripe configuration is incomplete.");
    }

    // Retrieve the price from Stripe
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID);

    // Get the product details
    const product = await stripe.products.retrieve(price.product as string);

    // Format the price for display (convert from cents to dollars)
    const formattedPrice = (price.unit_amount! / 100).toFixed(2);

    // Get original price from product metadata if available
    const originalPrice = product.metadata?.original_price || null;

    return NextResponse.json({
      price: formattedPrice,
      currency: price.currency.toUpperCase(),
      productName: product.name,
      productDescription: product.description,
      originalPrice: originalPrice,
      priceId: price.id,
    });
  } catch (error: any) {
    console.error("Price fetch error:", error);

    // Return a fallback response if there's an error
    return NextResponse.json(
      {
        price: "47.00",
        currency: "USD",
        productName: "MyPurposeProfile",
        productDescription: null,
        originalPrice: "1035.00",
        priceId: null,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS for CORS if needed
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
