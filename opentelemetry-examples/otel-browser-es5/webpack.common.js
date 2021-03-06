const path = require('path');
const directory = path.resolve(__dirname);

module.exports = {
  entry: {
    'otel': 'www/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'www'),
    filename: 'otel.min.js',
  },
  target: ['web', 'es5'],
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          },
        },
      },
      {
        test: /\.ts$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
  resolve: {
    modules: [
      path.resolve(directory),
      'node_modules',
    ],
    extensions: ['.ts', '.js', '.jsx', '.json'],
  },
};