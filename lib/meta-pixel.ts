declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    _fbqTracked?: {
      [key: string]: boolean;
    };
  }
}

// Generate a unique event ID for deduplication between browser and server
function generateEventId(eventName: string, parameters?: any): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(7);
  const valuePart = parameters?.session_id || parameters?.value || "";
  return `${eventName}_${valuePart}_${timestamp}_${randomPart}`;
}

export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window === "undefined" || !window.fbq) return;

  if (!window._fbqTracked) {
    window._fbqTracked = {};
  }

  // CRITICAL: Add Purchase to non-repeatable events
  const nonRepeatableEvents = [
    "PageView",
    "ScrollDepth25",
    "ScrollDepth50",
    "ScrollDepth75",
    "ScrollDepth90",
    "InitiateCheckout",
    "Purchase", // ← Added this!
  ];

  // Create tracking key with session_id for Purchase events
  const trackingKey =
    eventName === "Purchase" && parameters?.session_id
      ? `${eventName}_${parameters.session_id}`
      : `${eventName}_${parameters?.value || ""}`;

  if (nonRepeatableEvents.includes(eventName)) {
    if (window._fbqTracked[trackingKey]) {
      console.log(
        `⏭️ Skipping duplicate client event: ${eventName}`,
        trackingKey
      );
      return;
    }
    window._fbqTracked[trackingKey] = true;
  }

  // Generate event_id for Meta deduplication
  const eventId = generateEventId(eventName, parameters);

  // Track with browser pixel (with eventID)
  window.fbq("track", eventName, parameters, { eventID: eventId });
  console.log(`📊 Client tracked: ${eventName}`, { ...parameters, eventId });

  // Send to CAPI with same event_id
  const payload = JSON.stringify({
    event: eventName,
    data: parameters,
    url: window.location.href,
    userAgent: navigator.userAgent,
    eventId, // ← Include event_id
  });

  const sent = navigator.sendBeacon?.(
    "/api/track-event",
    new Blob([payload], { type: "application/json" })
  );

  if (!sent) {
    fetch("/api/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch((error) => console.error("❌ CAPI tracking error:", error));
  }
};
