#!/usr/bin/env node
/* eslint-env node, es6 */
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all unit tests.
// ---------------------------------------------------------------------------------------------------------------------

// set directories and files for test and coverage report
var path = require('path'),

    NYC = require('nyc'),
    sh = require('shelljs'),
    chalk = require('chalk'),
    recursive = require('recursive-readdir'),

    COV_REPORT_PATH = '.coverage',
    SPEC_SOURCE_DIR = path.join(__dirname, '..', 'test', 'unit');

module.exports = function (exit) {
    // for CI, we use simple xunit reporter (not on Travis since it does not parse results)
    // if (process.env.CI) {
    //     mochaReporter = 'xunit';
    //     istanbulReport = '--report cobertura';
    // }

    // banner line
    console.info(chalk.yellow.bold('Running unit tests using mocha on node...'));

    sh.test('-d', COV_REPORT_PATH) && sh.rm('-rf', COV_REPORT_PATH);
    sh.mkdir('-p', COV_REPORT_PATH);

    var Mocha = require('mocha'),
        nyc = new NYC({
            hookRequire: true,
            reporter: ['text', 'lcov', 'text-summary', 'json'],
            reportDir: COV_REPORT_PATH,
            tempDirectory: COV_REPORT_PATH
        });

    nyc.reset();
    nyc.wrap();

    // add all spec files to mocha
    recursive(SPEC_SOURCE_DIR, function (err, files) {
        if (err) { console.error(err); return exit(1); }

        var mocha = new Mocha({ timeout: 1000 * 60 });

        files.filter(function (file) { // extract all test files
            return (file.substr(-8) === '.test.js');
        }).forEach(mocha.addFile.bind(mocha));

        mocha.run(function (runError) {
            runError && console.error(runError.stack || runError);

            nyc.writeCoverageFile();
            nyc.report();
            nyc.checkCoverage({
                statements: 95,
                branches: 90,
                functions: 95,
                lines: 95
            });

            exit(process.exitCode || runError ? 1 : 0);
        });
    });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(process.exit);
