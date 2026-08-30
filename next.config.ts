import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vinext's production image route currently redirects local assets instead
  // of resizing them. Disabling the optimiser keeps the original dimensions
  // and prevents small product thumbnails from being treated as oversized
  // `srcset` candidates and rendering as empty garment crops.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
