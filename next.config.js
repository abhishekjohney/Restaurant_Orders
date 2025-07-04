/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "./build",
  reactStrictMode: false,
  images: {
    domains: ["elsabo.cypherinfosolution.com", "shopbotest.srstrades.in", "skerbelive.magnussoftech.in", "skerbe.magnussoftech.in"],
  },
  webpack: (config, { isServer }) => {
    // Only apply this on the server-side (because .node files are server-side)
    if (isServer) {
      // Add a rule for handling .node files
      config.module.rules.push({
        test: /\.node$/, // Target .node files
        use: "node-loader", // Use the node-loader to handle them
      });
    }

    return config;
  },
};

module.exports = nextConfig;
