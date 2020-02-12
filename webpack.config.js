const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
  {
    mode: 'development',
    entry: './src/main.ts',
    target: 'electron-main',
    resolve: {
      extensions: ['.js', '.json', '.ts', '.tsx'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: /src/,
          use: [{ loader: 'ts-loader' }],
        },
      ],
    },
    output: {
      path: __dirname + '/build',
      filename: 'main.js',
    },
  },
  {
    mode: 'development',
    entry: './src/render.tsx',
    target: 'electron-renderer',
    devtool: 'source-map',
    resolve: {
      extensions: ['.js', '.json', '.ts', '.tsx'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: /src/,
          use: [{ loader: 'ts-loader' }],
        },
      ],
    },
    output: {
      path: __dirname + '/build',
      filename: 'render.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
      }),
    ],
  },
];
