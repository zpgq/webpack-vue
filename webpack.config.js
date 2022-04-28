const HtmlWebpackPlugin = require('html-webpack-plugin')
const { resolve } = require('path')
const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    // contentBase: path.join(__dirname, 'dist'),
    static: resolve(__dirname, "build"),
    port: '9000',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      clean: true,
    })
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    usedExports: true,
  },
}