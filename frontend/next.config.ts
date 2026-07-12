import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Lock the workspace root to the frontend folder
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
