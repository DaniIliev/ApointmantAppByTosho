import type { NextConfig } from "next";
import * as path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: path.join(__dirname, "../.."),
  images: {
    domains: ["res.cloudinary.com"],
  },
};

export default nextConfig;
