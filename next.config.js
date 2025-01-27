// // import type { NextConfig } from "next";

// const nextConfig = {
//   /* config options here */
// };

// export default nextConfig;

module.exports = {
  trailingSlash: true,
  transpilePackages: [],
  async headers() {
    return [];
  },
  async redirects() {
    return [];
  },
  async rewrites() {
    return [];
  },
  env: {},
  publicRuntimeConfig: {},
};
