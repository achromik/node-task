const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: ['./src/index.ts'],
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /.ts?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'production',
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'main.js',
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(), // run TSC on a separate thread
  ],
};
