const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 244 * 1024, // 244KB
    };
    return config;
  },
};

module.exports = nextConfig;