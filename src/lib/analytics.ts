type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

function normalizeEventName(eventName: string) {
  return `clinicnav_${eventName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")}`;
}

export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;

  const event = { event: normalizeEventName(eventName), ...payload };
  const dataLayer = (window as Window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer;

  if (Array.isArray(dataLayer)) {
    dataLayer.push(event);
  }

  if (process.env.NODE_ENV !== "production") {
    // Keeps analytics instrumentation transparent during local demos.
    console.info("[analytics]", event);
  }
}
