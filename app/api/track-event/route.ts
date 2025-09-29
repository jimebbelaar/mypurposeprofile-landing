import { NextRequest, NextResponse } from "next/server";

// Declare global type for cleanup interval
declare global {
  var _trackingCleanupInterval: NodeJS.Timeout | undefined;
}

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

    // Check if we're in test mode or live mode
    const isTestMode = !!process.env.META_TEST_EVENT_CODE;

    if (isTestMode) {
      // Test mode - add test event code
      eventData.test_event_code = process.env.META_TEST_EVENT_CODE;
      console.log(`🧪 TEST MODE - Event: ${event}`, {
        testCode: process.env.META_TEST_EVENT_CODE,
        data: data,
      });
    } else {
      // Live mode - no test event code
      console.log(`🔴 LIVE MODE - Event: ${event}`, {
        data: data,
      });
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

    // Log success with mode indicator
    console.log(`✅ Meta event sent: ${event}`, {
      mode: isTestMode ? "TEST" : "LIVE",
      eventsReceived: result.events_received,
      fbTraceId: result.fbtrace_id,
    });

    return NextResponse.json({
      success: true,
      result,
      testMode: isTestMode,
      mode: isTestMode ? "test" : "live",
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
// Note: This only works in long-running Node processes, not in serverless
if (!global._trackingCleanupInterval) {
  global._trackingCleanupInterval = setInterval(() => {
    if (trackedEvents.size > 1000) {
      const oldSize = trackedEvents.size;
      trackedEvents.clear();
      console.log(`🧹 Cleared tracked events cache (was ${oldSize} sessions)`);
    }
  }, 60 * 60 * 1000);
}
