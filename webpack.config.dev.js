var webpack = require('webpack');
var path = require('path');
// var OpenBrowserPlugin = require('open-browser-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var TransferWebpackPlugin = require('transfer-webpack-plugin');

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        test: './assets/js/test.js',
    },
    output: {
        path: './.tmp/public/',
        publicPath: '/',
        filename: 'js/[name].js'
    },
    module: {
        loaders: [
            {test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader','css-loader')},
            {test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader')},
            {test: /\.js[x]?$/, loader: 'babel?compact=false'}
        ]
    },
    resolve:{
      extensions:['','.js','.json','.jsx']
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            EventProxy: 'eventproxy',
            clientServerConfig: path.join(__dirname, 'api/services/client/clientServerConfig.js'),
            kkUtils: path.join(__dirname, 'api/services/kkUtils.js'),
            profile: path.join(__dirname, 'assets/js/dependencies/profile.js'),
            jqueryCookies: path.join(__dirname, 'assets/js/dependencies/jquery.cookies.min.js'),
            heartbeat: path.join(__dirname, 'assets/js/dependencies/heartbeat.js'),
            log: path.join(__dirname, 'assets/js/dependencies/dev.log.js'),
            UA: path.join(__dirname, 'assets/js/dependencies/browser.js'),
            message: path.join(__dirname, 'assets/js/dependencies/message.js'),
            utils: path.join(__dirname, 'assets/js/dependencies/utils.js'),
            KKApiErrorCodeTranslater: path.join(__dirname, 'api/services/KKApiErrorCodeTranslater.js'),
            Client: path.join(__dirname, 'assets/js/client_api/Client.js'),
            'KKApi.Client': path.join(__dirname, 'assets/js/client_api/Client.js'),
            i18n: path.join(__dirname, 'assets/js/dependencies/jquery.i18n.js'),
            '$.i18n': path.join(__dirname, 'assets/js/dependencies/jquery.i18n.js')
        }),

        new ExtractTextPlugin("/styles/[name].css", {
            allChunks: false
        }),

        new TransferWebpackPlugin([
                {from: 'images', to: 'images'}
            ], path.join(__dirname, 'assets')
        ),



    ]
};
