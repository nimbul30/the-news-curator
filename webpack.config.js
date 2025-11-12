const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      // Main application entry points
      main: './public/js/main.js',
      admin: './public/js/admin.js',
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
      clean: true, // Clean the output directory before emit
      publicPath: '/',
    },

    module: {
      rules: [
        // CSS processing
        {
          test: /\.css$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },

        // Image processing
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[hash][ext]',
          },
        },

        // Font processing
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash][ext]',
          },
        },
      ],
    },

    plugins: [
      // HTML templates
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        chunks: ['main'],
        minify: isProduction,
      }),

      new HtmlWebpackPlugin({
        template: './public/article.html',
        filename: 'article.html',
        chunks: ['main'],
        minify: isProduction,
      }),

      new HtmlWebpackPlugin({
        template: './public/category.html',
        filename: 'category.html',
        chunks: ['main'],
        minify: isProduction,
      }),

      new HtmlWebpackPlugin({
        template: './public/admin/dashboard.html',
        filename: 'admin/dashboard.html',
        chunks: ['admin'],
        minify: isProduction,
      }),

      new HtmlWebpackPlugin({
        template: './public/admin/editor.html',
        filename: 'admin/editor.html',
        chunks: ['admin'],
        minify: isProduction,
      }),

      // Extract CSS in production
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: 'css/[name].[contenthash].css',
            }),
          ]
        : []),
    ],

    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 8080,
      hot: true,
      open: true,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },

    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },

    devtool: isProduction ? 'source-map' : 'eval-source-map',

    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'public'),
      },
    },
  };
};
