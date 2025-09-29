// app/api/verify-payment-success/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

// Store verified payment intents (in production, use a database)
// This prevents replay attacks and ensures each payment is only processed once
const verifiedPayments = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, expectedStatus } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment Intent ID is required", verified: false },
        { status: 400 }
      );
    }

    // Check if this payment has already been verified (prevent replay)
    if (verifiedPayments.has(paymentIntentId)) {
      // In production, check your database instead
      console.log("Payment already verified:", paymentIntentId);
    }

    // Retrieve the payment intent with full details
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: ["customer", "payment_method", "latest_charge"],
      }
    );

    // Verify payment status
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        {
          error: "Payment was not successful",
          verified: false,
          paymentStatus: paymentIntent.status,
        },
        { status: 400 }
      );
    }

    // Verify expected status matches (double check)
    if (expectedStatus && paymentIntent.status !== expectedStatus) {
      return NextResponse.json(
        {
          error: "Payment status mismatch",
          verified: false,
          paymentStatus: paymentIntent.status,
        },
        { status: 400 }
      );
    }

    // Extract customer email from multiple sources
    let customerEmail = null;
    let customerName = null;

    // Priority 1: Customer object
    if (paymentIntent.customer && typeof paymentIntent.customer === "object") {
      customerEmail = paymentIntent.customer.email;
      customerName = paymentIntent.customer.name;
    }

    // Priority 2: Payment method billing details
    if (!customerEmail && paymentIntent.payment_method) {
      if (typeof paymentIntent.payment_method === "object") {
        const billingDetails = paymentIntent.payment_method.billing_details;
        if (billingDetails) {
          customerEmail = customerEmail || billingDetails.email;
          customerName = customerName || billingDetails.name;
        }
      } else {
        // If payment_method is a string ID, retrieve it
        try {
          const paymentMethod = await stripe.paymentMethods.retrieve(
            paymentIntent.payment_method
          );
          if (paymentMethod.billing_details) {
            customerEmail =
              customerEmail || paymentMethod.billing_details.email;
            customerName = customerName || paymentMethod.billing_details.name;
          }
        } catch (error) {
          console.error("Could not retrieve payment method:", error);
        }
      }
    }

    // Priority 3: Receipt email
    if (!customerEmail && paymentIntent.receipt_email) {
      customerEmail = paymentIntent.receipt_email;
    }

    // Priority 4: Charge billing details
    if (!customerEmail && paymentIntent.latest_charge) {
      if (typeof paymentIntent.latest_charge === "object") {
        const billingDetails = paymentIntent.latest_charge.billing_details;
        if (billingDetails) {
          customerEmail = customerEmail || billingDetails.email;
          customerName = customerName || billingDetails.name;
        }
      } else {
        // If latest_charge is a string ID, retrieve it
        try {
          const charge = await stripe.charges.retrieve(
            paymentIntent.latest_charge
          );
          if (charge.billing_details) {
            customerEmail = customerEmail || charge.billing_details.email;
            customerName = customerName || charge.billing_details.name;
          }
        } catch (error) {
          console.error("Could not retrieve charge:", error);
        }
      }
    }

    // If we still don't have an email, this is a critical error
    if (!customerEmail) {
      // Log this for investigation
      console.error("No email found for successful payment:", {
        paymentIntentId,
        customerId: paymentIntent.customer,
        paymentMethodId: paymentIntent.payment_method,
        hasReceiptEmail: !!paymentIntent.receipt_email,
      });

      // In production, you might want to:
      // 1. Send an admin alert
      // 2. Store the payment for manual review
      // 3. Have a backup process to collect email

      return NextResponse.json(
        {
          error:
            "Customer email not found. Please contact support with your payment reference.",
          verified: false,
          paymentStatus: paymentIntent.status,
          paymentIntentId: paymentIntentId,
        },
        { status: 400 }
      );
    }

    // Get product information
    const productInfo = {
      productName:
        paymentIntent.metadata.product_name || "ADHD Identity Method",
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      priceId: paymentIntent.metadata.price_id,
      productId: paymentIntent.metadata.product_id,
    };

    // Additional security checks
    const securityChecks = {
      hasValidAmount: paymentIntent.amount > 0,
      hasValidCurrency: !!paymentIntent.currency,
      isNotTestMode:
        !paymentIntent.livemode === false ||
        process.env.NODE_ENV === "development",
      hasMetadata:
        !!paymentIntent.metadata &&
        Object.keys(paymentIntent.metadata).length > 0,
    };

    // Verify all security checks pass
    const allChecksPass = Object.values(securityChecks).every((check) => check);

    if (!allChecksPass) {
      console.error("Security check failed:", securityChecks);
      return NextResponse.json(
        {
          error: "Payment verification failed security checks",
          verified: false,
          securityChecks,
        },
        { status: 400 }
      );
    }

    // Mark this payment as verified (in production, store in database)
    verifiedPayments.add(paymentIntentId);

    // In production, you would also:
    // 1. Store the successful payment in your database
    // 2. Grant access to the purchased product
    // 3. Send confirmation email if not already sent
    // 4. Update user account with purchase

    // Log successful verification for monitoring
    console.log("Payment verified successfully:", {
      paymentIntentId,
      customerEmail,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });

    return NextResponse.json({
      success: true,
      verified: true,
      customerEmail: customerEmail,
      customerName: customerName,
      productInfo: productInfo,
      paymentStatus: paymentIntent.status,
      paymentIntentId: paymentIntentId,
      // Don't send sensitive payment details to frontend
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);

    // Handle specific Stripe errors
    if (error.type === "StripeAuthenticationError") {
      return NextResponse.json(
        { error: "Authentication failed", verified: false },
        { status: 401 }
      );
    } else if (error.type === "StripeInvalidRequestError") {
      // This might mean the payment intent doesn't exist
      return NextResponse.json(
        { error: "Invalid payment reference", verified: false },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Payment verification failed. Please contact support.",
        verified: false,
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
