const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

function normalizePublicPath(value) {
  if (!value || value === "/") {
    return "/";
  }

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

const publicPath = normalizePublicPath(process.env.VITE_PUBLIC_PATH || "/");
const outputPath = process.env.BUILD_OUTPUT_DIR
  ? path.resolve(process.env.BUILD_OUTPUT_DIR)
  : path.resolve(__dirname, "dist");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: path.resolve(__dirname, "src/main.jsx"),
  output: {
    path: outputPath,
    filename: "assets/[name].[contenthash].js",
    clean: true,
    publicPath
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", ["@babel/preset-react", { runtime: "automatic" }]]
          }
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", { loader: "css-loader", options: { url: false } }]
      },
      {
        test: /\.(png|jpe?g|gif|webp|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/images/[name][ext]"
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html")
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public"),
          to: outputPath,
          globOptions: { dot: true }
        }
      ]
    }),
    new webpack.DefinePlugin({
      "process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL || "http://localhost:4000/api"),
      "process.env.VITE_PUBLIC_PATH": JSON.stringify(publicPath)
    })
  ],
  devServer: {
    port: 5174,
    historyApiFallback: true,
    hot: true
  }
};
