const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: path.resolve(__dirname, "src/main.jsx"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "assets/[name].[contenthash].js",
    clean: true,
    publicPath: "/"
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
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html")
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, "public"), to: path.resolve(__dirname, "dist") }]
    }),
    new webpack.DefinePlugin({
      "process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL || "http://localhost:4000/api")
    })
  ],
  devServer: {
    port: 5173,
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, "public")
    },
    hot: true
  }
};
