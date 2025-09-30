import { NextRequest, NextResponse } from "next/server";

declare global {
  var _trackingCleanupInterval: NodeJS.Timeout | undefined;
}

// Use a more sophisticated cache with timestamps
interface TrackedEvent {
  timestamp: number;
  events: Set<string>;
}

const trackedEvents = new Map<string, TrackedEvent>();
const SESSION_EXPIRY = 30 * 60 * 1000; // 30 minutes

export async function POST(request: NextRequest) {
  let body;
  try {
    const text = await request.text();

    // Handle sendBeacon blob format
    if (text.startsWith("{")) {
      body = JSON.parse(text);
    } else {
      // Invalid format
      return NextResponse.json(
        { success: false, error: "Invalid request format" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ Invalid JSON body:", error);
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { event, data, url, userAgent } = body;

  if (!event || !url || !userAgent) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required fields",
        message: "event, url, and userAgent are required",
      },
      { status: 400 }
    );
  }

  // Get IP address
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Create session identifier
  const sessionId = `${ip}-${userAgent.substring(0, 50)}`;

  // Clean up expired sessions
  const now = Date.now();
  for (const [key, value] of trackedEvents.entries()) {
    if (now - value.timestamp > SESSION_EXPIRY) {
      trackedEvents.delete(key);
    }
  }

  // Check for duplicate non-repeatable events
  const nonRepeatableEvents = [
    "PageView",
    "ScrollDepth25",
    "ScrollDepth50",
    "ScrollDepth75",
    "ScrollDepth90",
  ];

  if (nonRepeatableEvents.includes(event)) {
    const sessionData = trackedEvents.get(sessionId);

    if (sessionData?.events.has(event)) {
      console.log(
        `⏭️ Skipping duplicate: ${event} for ${sessionId.substring(0, 20)}...`
      );
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Duplicate event",
      });
    }

    // Track the event
    if (!sessionData) {
      trackedEvents.set(sessionId, {
        timestamp: now,
        events: new Set([event]),
      });
    } else {
      sessionData.events.add(event);
      sessionData.timestamp = now;
    }
  }

  try {
    // Parse cookies properly
    const cookies = request.headers.get("cookie") || "";
    const fbcMatch = cookies.match(/(?:^|;\s*)_fbc=([^;]+)/);
    const fbpMatch = cookies.match(/(?:^|;\s*)_fbp=([^;]+)/);

    const eventData = {
      data: [
        {
          event_name: event,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: url,
          user_data: {
            client_ip_address: ip,
            client_user_agent: userAgent,
            ...(fbcMatch && { fbc: fbcMatch[1] }),
            ...(fbpMatch && { fbp: fbpMatch[1] }),
          },
          custom_data: data || {},
        },
      ],
      access_token: process.env.META_ACCESS_TOKEN,
    };

    const isTestMode = !!process.env.META_TEST_EVENT_CODE;

    if (isTestMode) {
      eventData.test_event_code = process.env.META_TEST_EVENT_CODE;
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
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    console.log(`✅ CAPI sent: ${event} [${isTestMode ? "TEST" : "LIVE"}]`, {
      eventsReceived: result.events_received,
    });

    return NextResponse.json({
      success: true,
      result,
      mode: isTestMode ? "test" : "live",
    });
  } catch (error: any) {
    console.error("❌ CAPI error:", error);
    return NextResponse.json(
      { error: "Error tracking event", message: error.message },
      { status: 500 }
    );
  }
}

// Periodic cleanup
if (!global._trackingCleanupInterval) {
  global._trackingCleanupInterval = setInterval(() => {
    if (trackedEvents.size > 1000) {
      trackedEvents.clear();
      console.log(`🧹 Cleared event cache`);
    }
  }, 60 * 60 * 1000);
}
