import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
// eslint-disable-next-line import/no-extraneous-dependencies
import TerserPlugin from 'terser-webpack-plugin';
// eslint-disable-next-line import/no-extraneous-dependencies
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
// eslint-disable-next-line import/no-extraneous-dependencies
import ESLintPlugin from 'eslint-webpack-plugin';

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));

export default (env, options) => ({
    entry: [
        './index.scss',
        './index.js',
    ],
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
                test: /.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'rn3.min.css',
                        },
                    },
                    {
                        loader: 'extract-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'postcss-loader',
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                indentWidth: 4,
                                sourceMap: true,
                            },
                        },
                    },
                ],
            },
        ],
    },
    plugins: [new ESLintPlugin()],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                include: /\.min\.js$/,
                parallel: true,
                extractComments: false,
            }),
            new CssMinimizerPlugin(),
        ],
    },
});
