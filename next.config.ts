import type { NextConfig } from "next";
import * as path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "res.cloudinary.com", 
      "api.dicebear.com", 
      "images.unsplash.com", 
      "api.qrserver.com",
      "lh3.googleusercontent.com",
      "platform-lookaside.fbsbx.com",
      "graph.facebook.com"
    ],
  },
};

export default nextConfig;
