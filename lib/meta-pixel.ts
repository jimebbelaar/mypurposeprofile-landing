declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    _fbqTracked?: {
      pageView?: boolean;
      [key: string]: boolean | undefined;
    };
  }
}

export const initTracking = () => {
  if (typeof window !== "undefined" && window.fbq) {
    // Initialize tracking object to prevent duplicates
    if (!window._fbqTracked) {
      window._fbqTracked = {};
    }

    // Only track PageView once
    if (!window._fbqTracked.pageView) {
      window.fbq("track", "PageView");
      window._fbqTracked.pageView = true;
      console.log("📊 Tracked: PageView");
    }
  }
};

export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== "undefined" && window.fbq) {
    // For non-repeatable events, check if already tracked
    const nonRepeatableEvents = [
      "PageView",
      "ScrollDepth25",
      "ScrollDepth50",
      "ScrollDepth75",
      "ScrollDepth90",
    ];

    if (nonRepeatableEvents.includes(eventName)) {
      if (!window._fbqTracked) {
        window._fbqTracked = {};
      }

      if (window._fbqTracked[eventName]) {
        console.log(`⏭️ Skipping duplicate event: ${eventName}`);
        return;
      }

      window._fbqTracked[eventName] = true;
    }

    // Track client-side
    window.fbq("track", eventName, parameters);

    // Also send to server for CAPI
    fetch("/api/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: eventName,
        data: parameters,
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch((error) => console.error("Error tracking event:", error));
  }
};
