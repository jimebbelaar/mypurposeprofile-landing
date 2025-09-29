import { NextRequest, NextResponse } from "next/server";

// Store tracked events in memory (resets on server restart)
const trackedEvents = new Map<string, Set<string>>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { event, data, url, userAgent } = body;

  // Get IP address
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "";

  // Create session identifier (based on IP + User Agent)
  const sessionId = `${ip}-${userAgent}`;

  // Check for duplicate non-repeatable events
  const nonRepeatableEvents = [
    "PageView",
    "ScrollDepth25",
    "ScrollDepth50",
    "ScrollDepth75",
    "ScrollDepth90",
  ];
  if (nonRepeatableEvents.includes(event)) {
    if (!trackedEvents.has(sessionId)) {
      trackedEvents.set(sessionId, new Set());
    }

    const sessionEvents = trackedEvents.get(sessionId)!;
    if (sessionEvents.has(event)) {
      console.log(
        `⏭️ Skipping duplicate server event: ${event} for session ${sessionId.substring(
          0,
          20
        )}...`
      );
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Duplicate event",
      });
    }

    sessionEvents.add(event);
  }

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

    // ALWAYS use test mode for now
    if (process.env.META_TEST_EVENT_CODE) {
      eventData.test_event_code = process.env.META_TEST_EVENT_CODE;
      console.log("🧪 Test mode - Event:", event);
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.NEXT_PUBLIC_META_PIXEL_ID}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      }
    );

    const result = await response.json();

    if (result.error) {
      console.error("❌ Meta API Error:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    console.log(`✅ Meta event sent: ${event}`, {
      testMode: true,
      eventsReceived: result.events_received,
      fbTraceId: result.fbtrace_id,
    });

    return NextResponse.json({
      success: true,
      result,
      testMode: true,
    });
  } catch (error: any) {
    console.error("❌ Meta tracking error:", error);
    return NextResponse.json(
      { error: "Error tracking event", message: error.message },
      { status: 500 }
    );
  }
}

// Clean up old sessions periodically (every hour)
setInterval(() => {
  if (trackedEvents.size > 1000) {
    trackedEvents.clear();
    console.log("🧹 Cleared tracked events cache");
  }
}, 60 * 60 * 1000);
