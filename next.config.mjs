const noIndexRoutes = [
  "/api/:path*",
  "/account",
  "/dashboard/:path*",
  "/history/:path*",
  "/results/:path*",
  "/report/:path*",
  "/checkout/:path*",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/check-email",
  "/resend-verification",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000",
          },
        ],
      },
      ...noIndexRoutes.map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      })),
    ];
  },
};
export default nextConfig;
