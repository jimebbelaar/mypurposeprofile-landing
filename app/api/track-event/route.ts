import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

declare global {
  var _trackingCleanupInterval: NodeJS.Timeout | undefined;
}

interface TrackedEvent {
  timestamp: number;
  events: Set<string>;
}

const trackedEvents = new Map<string, TrackedEvent>();
const SESSION_EXPIRY = 30 * 60 * 1000;

function hashPII(value: string | undefined | null): string | undefined {
  if (!value || typeof value !== "string") return undefined;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;

  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function extractAndHashCustomerData(data: any): Record<string, string> {
  const hashed: Record<string, string> = {};

  if (data.customer_email || data.email || data.em) {
    const email = data.customer_email || data.email || data.em;
    const hashedEmail = hashPII(email);
    if (hashedEmail) hashed.em = hashedEmail;
  }

  if (data.customer_phone || data.phone || data.ph) {
    const cleanPhone = (data.customer_phone || data.phone || data.ph).replace(
      /\D/g,
      ""
    );
    const hashedPhone = hashPII(cleanPhone);
    if (hashedPhone) hashed.ph = hashedPhone;
  }

  if (data.first_name || data.fn) {
    const hashedFn = hashPII(data.first_name || data.fn);
    if (hashedFn) hashed.fn = hashedFn;
  }

  if (data.last_name || data.ln) {
    const hashedLn = hashPII(data.last_name || data.ln);
    if (hashedLn) hashed.ln = hashedLn;
  }

  if (data.city || data.ct) {
    const hashedCity = hashPII(data.city || data.ct);
    if (hashedCity) hashed.ct = hashedCity;
  }

  if (data.state || data.st) {
    const hashedState = hashPII(data.state || data.st);
    if (hashedState) hashed.st = hashedState;
  }

  if (data.zip || data.zp) {
    const hashedZip = hashPII(data.zip || data.zp);
    if (hashedZip) hashed.zp = hashedZip;
  }

  if (data.country || data.country_code) {
    const hashedCountry = hashPII(
      (data.country || data.country_code).substring(0, 2)
    );
    if (hashedCountry) hashed.country = hashedCountry;
  }

  return hashed;
}

export async function POST(request: NextRequest) {
  let body;
  try {
    const text = await request.text();

    if (text.startsWith("{")) {
      body = JSON.parse(text);
    } else {
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

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const sessionId = `${ip}-${userAgent.substring(0, 50)}`;

  const now = Date.now();
  for (const [key, value] of trackedEvents.entries()) {
    if (now - value.timestamp > SESSION_EXPIRY) {
      trackedEvents.delete(key);
    }
  }

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
    const cookies = request.headers.get("cookie") || "";
    const fbcMatch = cookies.match(/(?:^|;\s*)_fbc=([^;]+)/);
    const fbpMatch = cookies.match(/(?:^|;\s*)_fbp=([^;]+)/);

    const hashedCustomerData = extractAndHashCustomerData(data || {});

    const customData: any = {};

    if (data?.value) customData.value = parseFloat(data.value);
    if (data?.currency) customData.currency = data.currency;
    if (data?.content_name) customData.content_name = data.content_name;
    if (data?.content_type) customData.content_type = data.content_type;
    if (data?.content_ids) customData.content_ids = data.content_ids;
    if (data?.contents) customData.contents = data.contents;
    if (data?.num_items) customData.num_items = data.num_items;
    if (data?.session_id) customData.session_id = data.session_id;
    if (data?.payment_intent) customData.payment_intent = data.payment_intent;

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
            ...(fbcMatch && { fbc: fbcMatch[1] }),
            ...(fbpMatch && { fbp: fbpMatch[1] }),
            ...hashedCustomerData,
          },
          custom_data: customData,
        },
      ],
      access_token: process.env.META_ACCESS_TOKEN,
    };

    const isTestMode = !!process.env.META_TEST_EVENT_CODE;

    if (isTestMode) {
      eventData.test_event_code = process.env.META_TEST_EVENT_CODE;
    }

    console.log(`📤 Sending to Meta CAPI:`, {
      event,
      mode: isTestMode ? "TEST" : "LIVE",
      hasEmail: !!hashedCustomerData.em,
      hasPhone: !!hashedCustomerData.ph,
      customDataKeys: Object.keys(customData),
    });

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

if (!global._trackingCleanupInterval) {
  global._trackingCleanupInterval = setInterval(() => {
    if (trackedEvents.size > 1000) {
      trackedEvents.clear();
      console.log(`🧹 Cleared event cache`);
    }
  }, 60 * 60 * 1000);
}
