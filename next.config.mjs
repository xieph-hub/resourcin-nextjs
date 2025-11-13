/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove this line if you don't use any other experimental flags
  },
  images: {
    remotePatterns: [
      // Notion file/CDN hosts (add others you see in your broken URLs if needed)
      { protocol: 'https', hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com' },
      { protocol: 'https', hostname: 's3.us-west-2.amazonaws.com' },
      { protocol: 'https', hostname: 's3.us-east-1.amazonaws.com' },
      { protocol: 'https', hostname: 'images.notion.so' },
      { protocol: 'https', hostname: 'www.notion.so' },

      // Common stock image/CDN (optional)
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
