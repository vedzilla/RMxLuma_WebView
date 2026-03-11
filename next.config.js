/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://prod.spline.design https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://dgzzf6k1ibya0.cloudfront.net https://redefine-me-image-bucket.s3.amazonaws.com https://*.cdninstagram.com https://images.unsplash.com https://via.placeholder.com",
              "connect-src 'self' https://redefine-me.supabase.co https://prod.spline.design https://unpkg.com",
              "frame-src 'self' https://prod.spline.design",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'dgzzf6k1ibya0.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent-man2-1.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'redefine-me-image-bucket.s3.amazonaws.com',
      },
    ],
  },
}

module.exports = nextConfig

