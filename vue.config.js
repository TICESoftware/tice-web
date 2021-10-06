const HtmlWebpackPlugin = require('html-webpack-plugin');

process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
    indexPath: 'en/index.html',
    lintOnSave: false,
    configureWebpack: {
        plugins: [
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: 'public/en/index.html',
            }),
            new HtmlWebpackPlugin({
                filename: 'de/index.html',
                template: 'public/de/index.html',
            }),
            new HtmlWebpackPlugin({
                filename: 'en/index.html',
                template: 'public/en/index.html',
            }),
        ],
    },
};
