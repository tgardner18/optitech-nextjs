import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Point next-intl at our server config so getLocale() works in any
// server component or route handler without the [locale] folder pattern.
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Derive the CMS hostname from the configured URL so next/image can fetch
// media assets from that origin without relying solely on the wildcard pattern.
function cmsHostname(): string | undefined {
  const url = process.env.OPTIMIZELY_CMS_URL ?? ''
  try {
    return url ? new URL(url).hostname : undefined
  } catch {
    return undefined
  }
}

const cms = cmsHostname()

const nextConfig: NextConfig = {
  images: {
    // Use a custom loader so image delivery does NOT depend on Vercel's
    // Image Optimization quota (which returns HTTP 402 when capped). See
    // lib/imageLoader.ts. remotePatterns below are retained as documentation
    // of the expected source hosts; they are not consulted by a custom loader.
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Wildcard covers any Optimizely SaaS CMS subdomain
        protocol: "https",
        hostname: "*.cms.optimizely.com",
      },
      {
        // DAM / CDN assets that may use a non-cms. subdomain
        protocol: "https",
        hostname: "*.optimizely.com",
      },
      // Explicitly allow the exact CMS app hostname when available
      ...(cms ? [{ protocol: "https" as const, hostname: cms }] : []),
    ],
  },
  async headers() {
    return [
      {
        // Allow all Optimizely SaaS CMS instances to embed this app in the Visual Builder iframe.
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://*.cms.optimizely.com",
          },
        ],
      },
    ]
  },
};

export default withNextIntl(nextConfig);
