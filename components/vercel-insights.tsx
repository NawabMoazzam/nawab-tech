"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Vercel Analytics + Speed Insights with admin routes filtered out so internal
 * dashboard traffic is never reported.
 *
 * This MUST be a Client Component. `SpeedInsights` and `Analytics` are client
 * components and their `beforeSend` prop is a function — functions cannot be
 * passed from a Server Component (such as the root `app/layout.tsx`). Defining
 * the callbacks here, inside a client component, is allowed.
 */
export function VercelInsights() {
  return (
    <>
      <SpeedInsights
        beforeSend={(event) => (event.url.includes("/admin") ? null : event)}
      />
      <Analytics
        beforeSend={(event) => (event.url.includes("/admin") ? null : event)}
      />
    </>
  );
}
