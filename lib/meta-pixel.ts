declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const initTracking = () => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
};

export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, parameters);
  }

  // Also send to server for CAPI
  if (typeof window !== "undefined") {
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
