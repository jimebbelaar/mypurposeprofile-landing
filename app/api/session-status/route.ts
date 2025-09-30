import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "payment_intent", "line_items"],
    });

    console.log("Session retrieved:", {
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name,
    });

    // Type guard to check if customer is a full Customer object (not deleted)
    const customer =
      typeof session.customer === "object" &&
      session.customer &&
      !session.customer.deleted
        ? session.customer
        : null;

    return NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email:
        session.customer_details?.email || customer?.email || null,
      customer_name: session.customer_details?.name || customer?.name || null,
      customer_phone:
        session.customer_details?.phone || customer?.phone || null,
      customer_details: session.customer_details,
      amount_total: session.amount_total,
      currency: session.currency,
    });
  } catch (error: any) {
    console.error("Session retrieval error:", error);
    return NextResponse.json(
      { error: `Error retrieving session: ${error.message}` },
      { status: 500 }
    );
  }
}
