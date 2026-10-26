// Karma configuration
const _ = require('lodash'),
    stdLibBrowser = require('node-stdlib-browser'),
    stdLibBrowserPlugin = require('node-stdlib-browser/helpers/esbuild/plugin'),

    // node-stdlib-browser mocks the builtins that have no browser equivalent with `null`, whereas
    // browserify used an empty object. dependencies like `forever-agent` read properties off them
    // while loading, so keep the browserify behaviour.
    nodeBuiltinShims = _.mapValues(stdLibBrowser, function (shim) {
        return (/mock[/\\]empty\.js$/).test(shim) ? require.resolve('./empty-module') : shim;
    });

module.exports = function (config) {
    var configuration = {

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha'],

        // list of files / patterns to load in the browser
        files: [
            '../index.js',
            '../test/unit/**/*.js'
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '../index.js': ['esbuild'], // Mention path as per your test js folder
            '../test/unit/**/*.js': ['esbuild'] // Mention path as per your library js folder
        },

        // the library itself needs no Node.js builtins, but tests (and their dependencies) do.
        // browserify shimmed those implicitly, esbuild needs to be told to.
        esbuild: {
            plugins: [stdLibBrowserPlugin(nodeBuiltinShims)],
            inject: [require.resolve('node-stdlib-browser/helpers/esbuild/shim')],
            define: { global: 'global', process: 'process', Buffer: 'Buffer' }
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // one of: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['ChromeHeadless'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneously
        concurrency: Infinity,

        plugins: [
            'karma-mocha',
            'karma-chrome-launcher',
            'karma-esbuild',
            'karma-mocha-reporter'
        ],

        // Pass options to the client frameworks.
        client: {
            mocha: {
                timeout: 10000 // 10 seconds
            }
        }
    };

    // Use `npm run test-browser -- --debug` to debug tests in Chrome console
    if (process.argv[2] === '--debug') {
        configuration.browsers = ['Chrome'];
        configuration.singleRun = false;
    }

    config.set(configuration);
};
