/**
 * app.js
 *
 * Use `app.js` to run your app without `sails lift`.
 * To start the server, run: `node app.js`.
 *
 * This is handy in situations where the sails CLI is not relevant or useful.
 *
 * For example:
 *   => `node app.js`
 *   => `forever start app.js`
 *   => `node debug app.js`
 *   => `modulus deploy`
 *   => `heroku scale`
 *
 *
 * The same command-line arguments are supported, e.g.:
 * `node app.js --silent --port=80 --prod`
 */

// Ensure we're in the project directory, so relative paths work as expected
// no matter where we actually lift from.

ignoreRequireCSS();

var ProgressPlugin = require('webpack/lib/ProgressPlugin');

// Ensure a "sails" can be located:
(function () {
    var sails = require('sails');
    var rc = require('rc');

    sails.lift(rc('sails'), function (err) {
        if (err) return sails.log.error(err);
        webpackTask(process.env.NODE_ENV);
    });
    sails.LIFT_TIME = Date.now();
})();

function webpackTask(env) {

	if (env !== 'development' ){
		return;
	}

    var webpack = require('webpack'),

        webpackCfg =  require('./webpack.config.dev.js');

        webpackCompiler = webpack(webpackCfg, function (err, stats) {
            if (err) throw err;
            sails.log.info('webpack: compiler loaded.');

            if (sails.config.environment !== 'production') {
                sails.log.info('webpack: watching...');
                webpackCompiler.watch({aggregateTimeout: 300, poll: true}, afterBuild);
            }
            else {
                sails.log.info('webpack: running...');
                webpackCompiler.run(afterBuild);
            }
        });

    webpackCompiler.apply(new ProgressPlugin(function (percentage, msg) {
        var lineBreak = (percentage == 1) ? '\n' : '';
        process.stdout.write('\r webpack progress: ' + ((percentage) * 100).toFixed(0) + '%' + lineBreak);
    }));

    function afterBuild(err, rawStats) {
        if (err) {
            sails.log.error('webpack watch fail');
        } else {
            var jsonStats = rawStats.toJson();
            if (jsonStats.errors.length > 0) {
                sails.log.error('wabpack compiled error:\n');
                return dealWebpackErrors(jsonStats.errors, 'error');
            }
            if (jsonStats.warnings.length > 0) {
                sails.log.warn('wabpack compiled warn:\n');
                return dealWebpackErrors(jsonStats.warnings, 'warn');
            }
            sails.log.info('webpack watch files changed and compiled success');
        }
    }
}

function ignoreRequireCSS() {
    require.extensions['.css'] = function (module, filename) {
        // Do nothing.
    };

    require.extensions['.less'] = function (module, filename) {
        // Do nothing.
    };
}

function dealWebpackErrors(errors, type) {

    errors.forEach(function (v, k) {

        sails.log[type](v);

    });

}
