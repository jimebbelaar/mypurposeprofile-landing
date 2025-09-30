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

  if (!window._fbqTracked) {
    window._fbqTracked = {};
  }

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

  window.fbq("track", eventName, parameters);
  console.log(`📊 Client tracked: ${eventName}`, parameters);

  const payload = JSON.stringify({
    event: eventName,
    data: parameters,
    url: window.location.href,
    userAgent: navigator.userAgent,
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
