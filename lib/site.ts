// lib/site.ts
export const SITE_NAME = "Resourcin Human Capital Advisors";
export const SITE_DESCRIPTION =
  "Connecting talent with opportunity — tech-driven recruitment, EOR, and HR advisory for modern teams and ambitious professionals.";

// IMPORTANT: set this to your production URL in Vercel envs as SITE_URL (without trailing slash).
// We also default to the live domain if the env var isn't set.
export const SITE_URL =
  (process.env.SITE_URL?.replace(/\/+$/, "") as string) || "https://resourcin.com";

// Your social handle (used for Twitter cards). Change if needed.
export const SITE_TWITTER = "@resourcinhq";

// Default Open Graph image used when a page/post has no cover.
// Put a 1200x630 image at /public/og-default.jpg or change this path.
export const OG_IMAGE = "/og-default.jpg";

// Path to your logo (used in JSON-LD). Place /public/logo.svg or change this path.
export const LOGO_PATH = "/logo.svg";
