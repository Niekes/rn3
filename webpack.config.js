const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, options) => ({
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'src'),
        filename: 'rn3.min.js',
        library: {
            name: 'rn3',
            type: 'umd',
        },
    },
    watch: options.mode === 'development',
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                exclude: /node_modules/,
            },
            {
                test: /.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            include: /\.min\.js$/,
            parallel: true,
            extractComments: false,
        })],
    },
});
