const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "os": require.resolve("os-browserify/browser"),
        "path": require.resolve("path-browserify"),
        "util": require.resolve("util"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer"),
        "process": require.resolve("process/browser"),
        "fs": false,
        "net": false,
        "tls": false,
        "child_process": false,
        "http": false,
        "https": false,
        "url": false,
        "querystring": false
      };

      // Add plugins for polyfills
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ];

      // Suppress warnings about source maps for ignored modules
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /Critical dependency/,
      ];

      return webpackConfig;
    },
  },
}; 