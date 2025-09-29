// app/api/track-event/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { event, data, url, userAgent } = body;

  // Get IP address
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "";

  try {
    // Build event data
    const eventData: any = {
      data: [
        {
          event_name: event,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: url,
          user_data: {
            client_ip_address: ip,
            client_user_agent: userAgent,
            fbc: request.headers.get("cookie")?.match(/_fbc=([^;]+)/)?.[1],
            fbp: request.headers.get("cookie")?.match(/_fbp=([^;]+)/)?.[1],
          },
          custom_data: data,
        },
      ],
      access_token: process.env.META_ACCESS_TOKEN,
    };

    // Add test event code if it exists
    if (process.env.META_TEST_EVENT_CODE) {
      eventData.test_event_code = process.env.META_TEST_EVENT_CODE;
      console.log(
        "🧪 Test mode enabled with code:",
        process.env.META_TEST_EVENT_CODE
      );
    }

    console.log("📤 Sending Meta event:", event);

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.NEXT_PUBLIC_META_PIXEL_ID}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      }
    );

    const result = await response.json();
    console.log("✅ Meta API Response:", result);

    return NextResponse.json({
      success: true,
      result,
      testMode: !!process.env.META_TEST_EVENT_CODE,
    });
  } catch (error) {
    console.error("❌ Meta tracking error:", error);
    return NextResponse.json(
      { error: "Error tracking event" },
      { status: 500 }
    );
  }
}
