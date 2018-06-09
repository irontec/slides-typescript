"use strict";

const webpack = require("webpack"),
  path = require("path"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  ImageminPlugin = require("imagemin-webpack-plugin").default;

const baseConfig = require("./content/config.json");

module.exports = {
  entry: "./src/index.js",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "app.js"
  },
  devServer: {
    contentBase: path.resolve(__dirname, "dist")
  },
  plugins: [
    new webpack.optimize.AggressiveMergingPlugin(),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, "content", "media"),
      to: 'media'
    }]),
    new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i }),
    new HtmlWebpackPlugin({
      template: "./src/index.tmpl",
      hash: true,
      minify: {
        collapseWhitespace: true
      },
      title: baseConfig.title
    }),
    new webpack.ProvidePlugin({
      Reveal: "reveal.js",
      hljs: "reveal.js/plugin/highlight/highlight.js"
    })
  ],
  module: {
    rules: [
      {
        test: /\.(txt)|(md)|(html?)$/,
        use: ["raw-loader"]
      },
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader: "babel-loader",
            options: {
              plugins: [],
              presets: ["env", "stage-0"]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: function() {
                return [
                  require("cssnano")({discardComments: { removeAll: true }}),
                  require("autoprefixer")
                ];


              }
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: function() {
                return [
                  require("cssnano")({discardComments: { removeAll: true }}),
                  require("autoprefixer")
                ];
              }
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|woff|woff2|eot|ttf|mp4)(\?.*)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 32 * 1024
            }
          }
        ]
      },
      {
        test: /\.(mp4|ogg|svg)(\?.*)?$/,
        use: ["file-loader"]
      }
    ]
  },
  resolve: {
    alias: {},
    extensions: [".js"],
    modules: [path.resolve(__dirname, "src"), "node_modules"]
  }
};
