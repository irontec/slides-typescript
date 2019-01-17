"use strict";

const webpack = require("webpack"),
  path = require("path"),
  cheerio = require("cheerio"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  CleanWebpackPlugin = require('clean-webpack-plugin'),
  BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin,
  UglifyJsPlugin = require("uglifyjs-webpack-plugin"),
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  ImageminPlugin = require("imagemin-webpack-plugin").default,
  GenerateSW = require('workbox-webpack-plugin').GenerateSW;

const globSync = require('glob').sync;
const { lstatSync, readdirSync, readFileSync } = require('fs')
const baseConfig = require("./content/config.json");

const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source => readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)

const DIST = path.resolve(__dirname, "dist");
const optsIfDef = {
  plugins: baseConfig.plugins,
  serviceWorker: baseConfig.serviceWorker
};

module.exports = {
  entry: {
    app: "./src/index.js"
  },
  devtool: "source-map",
  output: {
    path: DIST,
    filename: "[name].js"
  },
  devServer: {
    contentBase: DIST
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new CleanWebpackPlugin(DIST, { verbose:  true}),
    new webpack.optimize.AggressiveMergingPlugin(),
    // Make every directoy on /content/assets available directly on the slides
    // /content/assets/pics/im.png >> pics/im.png
    new CopyWebpackPlugin(
      getDirectories(path.join(__dirname, "content", "assets"))
        .map(directory => {
          return {
            from: directory,
            to: path.basename(directory)
          }
        })
    ),
    new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i }),
    new HtmlWebpackPlugin({
      template: "./src/index.tmpl",
      filename: "index.html",
      chunks: ["app"],
      hash: true,
      minify: {
        collapseWhitespace: true
      },
      title: baseConfig.title || '',
      og_url: baseConfig.og_url || '',
      og_image: baseConfig.og_image || ''
    }),
    ...(baseConfig.plugins.notes ?
      [
        new HtmlWebpackPlugin({
          excludeChunks: ["app"],
          template: "node_modules/reveal.js/plugin/notes/notes.html",
          filename: "notes.html",
          minify: {
            collapseWhitespace: true
          }
        })
      ] : []
    ),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new webpack.ProvidePlugin({
      "window.Reveal": "reveal.js/",
      Reveal: "reveal.js"
    }),
    ...(baseConfig.serviceWorker?
      [
        new GenerateSW({
          clientsClaim: true,
          skipWaiting: true
        })
      ] : []
    ),
    new webpack.ContextReplacementPlugin(
      /highlight\.js\/lib\/languages$/,
      new RegExp(`${resolveUsedLanguages('./content/slides/**/*.{md,html,htm}').join('|')}`)
    )
  ],
  module: {
    rules: [
      {
        test: /highlight\.js\/lib\/languages\/.*\.js$/,
        loader: "bundle-loader",
        options: {
          name: "hljs-langs/[name]"
        }
      },
      {
        test: /\.(txt)|(md)|(html?)$/,
        use: ["raw-loader"]
      },
      {
        test: /config\.json$/,
        use: [
          {
            loader: "json-glob-loader",
            options: {
              baseDir: path.join(__dirname, "content", "slides/")
            }
          }
        ]
      },
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                /*
                  To get tree shaking working, we need the `modules: false` below.
                  https://goo.gl/4vZBSr - 2ality blog mentions that the issue is caused
                  by under-the-hood usage of `transform-es2015-modules-commonjs`.
                  https://goo.gl/sBmiwZ - A comment on the above post shows that we
                  can use `modules: false`.
                  https://goo.gl/aAxYAq - `babel-preset-env` documentation.
                */
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      browsers: ["last 2 versions"]
                    },
                    modules: false // Needed for tree shaking to work.
                  }
                ]
              ],

              // https://goo.gl/N9gaqc - List of Babel plugins.
              plugins: [
                "@babel/plugin-proposal-object-rest-spread", // https://goo.gl/LCHWnP
                "@babel/plugin-proposal-class-properties" // https://goo.gl/TE6TyG
              ]
            }
          },
          { loader: "condition-loader", options: optsIfDef }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: function() {
                return [
                  require("cssnano")({ discardComments: { removeAll: true } }),
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
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: function() {
                return [
                  require("cssnano")({ discardComments: { removeAll: true } }),
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
  optimization: {
    moduleIds: "size",
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          warnings: false,
          mangle: true, // Note `mangle.properties` is `false` by default.
          ie8: false,
          keep_fnames: false
        },
        extractComments: {
          condition: /^\**!|@preserve|Copyright|@license|@cc_on/i,
          filename(file) {
            return `3rd.party.LICENSES`;
          },
          banner(licenseFile) {
            return `Licenses found in ${licenseFile}`;
          }
        }
      })
    ]
  },
  resolve: {
    alias: {},
    extensions: [".js"],
    modules: [path.resolve(__dirname, "src"), "node_modules"]
  }
};


/**
 * returns an array with every language used on md|html for highlight.js
 * @param {*} path
 */
function resolveUsedLanguages(path) {
  return [...new Set(
    globSync(path).reduce((acc, file) => {
      const contents = readFileSync(file, 'utf8');
      if (file.match(/\.md$/)) {
        acc.push(...(contents.match(/(```([^\s]+))/gm) || []).map(s=>s.replace('```','')));
      } else if (file.match(/\.html$/)) {
        const $ = cheerio.load(contents);
        $('code').each((ix, item) => {
          const lang = $(item).attr("class").split(' ').map(c=>c.match(/(lang|language)-(.+)/)).filter(Boolean).map(m=>m[2]).shift();
          lang && acc.push(lang);
        });
      }
      return acc;
    }, [])
  )];
}