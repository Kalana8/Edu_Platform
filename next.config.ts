import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    ".local",
    "192.168.*",
    "10.0.*",
    "172.16.*",
  ],
};

export default nextConfig;
