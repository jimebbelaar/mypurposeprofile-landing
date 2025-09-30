declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    _fbqTracked?: {
      [key: string]: boolean;
    };
  }
}

export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window === "undefined" || !window.fbq) return;

  // Initialize tracking object
  if (!window._fbqTracked) {
    window._fbqTracked = {};
  }

  // For non-repeatable events, check if already tracked CLIENT-SIDE
  const nonRepeatableEvents = [
    "PageView",
    "ScrollDepth25",
    "ScrollDepth50",
    "ScrollDepth75",
    "ScrollDepth90",
  ];

  const trackingKey = `${eventName}_${parameters?.value || ""}`;

  if (nonRepeatableEvents.includes(eventName)) {
    if (window._fbqTracked[trackingKey]) {
      console.log(`⏭️ Skipping duplicate client event: ${eventName}`);
      return;
    }
    window._fbqTracked[trackingKey] = true;
  }

  // Track client-side (browser pixel)
  window.fbq("track", eventName, parameters);
  console.log(`📊 Client tracked: ${eventName}`, parameters);

  // Send to server for CAPI (Conversions API)
  // Use sendBeacon for reliability, especially on page unload
  const payload = JSON.stringify({
    event: eventName,
    data: parameters,
    url: window.location.href,
    userAgent: navigator.userAgent,
  });

  // Try sendBeacon first (more reliable), fallback to fetch
  const sent = navigator.sendBeacon?.(
    "/api/track-event",
    new Blob([payload], { type: "application/json" })
  );

  if (!sent) {
    // Fallback to fetch if sendBeacon not supported
    fetch("/api/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true, // Important for beforeunload events
    }).catch((error) => console.error("❌ CAPI tracking error:", error));
  }
};
