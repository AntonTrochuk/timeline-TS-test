import path from 'path'
import { fileURLToPath } from 'url'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import SVGSpritemapPlugin from 'svg-spritemap-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isProduction = process.env.NODE_ENV === 'production'

export default {
  mode: isProduction ? 'production' : 'development',

  entry: path.resolve(__dirname, 'source/ts/main.ts'),

  output: {
    filename: 'js/[name].[contenthash].js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
    publicPath: '/',
  },

  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'source'),
      '@icons': path.resolve(__dirname, 'source/img/icons'),
    },
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },

      {
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          pretty: true,
        },
      },

      {
        test: /\.(scss|css)$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },

      {
        test: /\.(png|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext]',
        },
      },

      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'source/pug/pages/index.pug'),
    }),

    new SVGSpritemapPlugin(
      'source/img/icons/**/*.svg',
      {
        output: {
          filename: 'img/sprite.svg',
        },
        sprite: {
          prefix: false,
        },
      }
    ),

    ...(isProduction ? [new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
    })] : []),
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),
    },
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true,
    devMiddleware: {
      writeToDisk: true,
    },
  },

  devtool: isProduction ? 'source-map' : 'eval-source-map',
}
