import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer && config && Array.isArray(config.plugins)) {
      config.plugins = config.plugins.filter((p: any) => p.constructor?.name !== "HotModuleReplacementPlugin");
    }
    return config;
  },
    // Provide an explicit empty Turbopack config so Next doesn't error when
    // a custom webpack config is present. This keeps Turbopack enabled but
    // silences the runtime check that would otherwise throw.
    turbopack: {},
};

export default nextConfig;
