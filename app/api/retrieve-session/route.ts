// app/api/retrieve-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment Intent ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: ["customer", "payment_method"],
      }
    );

    // Get customer email from various sources
    let customerEmail = null;
    let customerName = null;

    // Priority 1: Customer object email
    if (paymentIntent.customer && typeof paymentIntent.customer === "object") {
      customerEmail = paymentIntent.customer.email;
      customerName = paymentIntent.customer.name;
    }

    // Priority 2: Payment method billing details
    if (
      !customerEmail &&
      paymentIntent.payment_method &&
      typeof paymentIntent.payment_method === "object"
    ) {
      const billingDetails = paymentIntent.payment_method.billing_details;
      if (billingDetails) {
        customerEmail = customerEmail || billingDetails.email;
        customerName = customerName || billingDetails.name;
      }
    }

    // Priority 3: Receipt email
    if (!customerEmail && paymentIntent.receipt_email) {
      customerEmail = paymentIntent.receipt_email;
    }

    // If we still don't have an email, try to get it from charges
    if (!customerEmail && paymentIntent.latest_charge) {
      const charge = await stripe.charges.retrieve(
        paymentIntent.latest_charge as string,
        {
          expand: ["billing_details"],
        }
      );
      
      if (charge.billing_details) {
        customerEmail = customerEmail || charge.billing_details.email;
        customerName = customerName || charge.billing_details.name;
      }
    }

    // Get product information from metadata
    const productInfo = {
      productName: paymentIntent.metadata.product_name || "ADHD Identity Method",
      priceId: paymentIntent.metadata.price_id,
      productId: paymentIntent.metadata.product_id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };

    // Create or update customer if we have an email but no customer record
    if (customerEmail && !paymentIntent.customer) {
      try {
        // Check if customer exists
        const customers = await stripe.customers.list({
          email: customerEmail,
          limit: 1,
        });

        let customer;
        if (customers.data.length > 0) {
          customer = customers.data[0];
        } else {
          // Create new customer
          customer = await stripe.customers.create({
            email: customerEmail,
            name: customerName || undefined,
            metadata: {
              first_purchase: productInfo.productName,
              purchase_date: new Date().toISOString(),
            },
          });
        }

        // Attach the payment method to the customer for future use
        if (paymentIntent.payment_method && typeof paymentIntent.payment_method === "string") {
          await stripe.paymentMethods.attach(paymentIntent.payment_method, {
            customer: customer.id,
          });
        }

        // Update the payment intent with the customer
        await stripe.paymentIntents.update(paymentIntentId, {
          customer: customer.id,
        });
      } catch (error) {
        console.error("Error creating/updating customer:", error);
        // Don't fail the whole request if customer creation fails
      }
    }

    return NextResponse.json({
      success: true,
      customerEmail: customerEmail,
      customerName: customerName,
      productInfo: productInfo,
      paymentStatus: paymentIntent.status,
      requiresEmailCollection: !customerEmail, // Flag to show email collection form
    });
  } catch (error: any) {
    console.error("Session retrieval error:", error);
    return NextResponse.json(
      { error: `Error retrieving session: ${error.message}` },
      { status: 500 }
    );
  }
}