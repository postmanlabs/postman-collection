#!/usr/bin/env node
/* eslint-env node, es6 */

// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to contain all actions pertaining to code style checking, linting and normalisation.
// ---------------------------------------------------------------------------------------------------------------------

require('shelljs/global');

var chalk = require('chalk'),
    async = require('async'),
    LINT_SOURCE_DIRS = [
        './test/**/*.js',
        './index.js',
        './lib/**/*.js',
        './npm/**/*.js'
    ];

module.exports = function (exit) {
    var ESLintCLIEngine = require('eslint').CLIEngine;

    // banner line
    console.log(chalk.yellow.bold('\nLinting files using eslint...'));

    async.waterfall([
        // execute the CLI engine
        function (next) {
            next(null, (new ESLintCLIEngine()).executeOnFiles(LINT_SOURCE_DIRS));
        },

        // output results
        function (report, next) {
            var errorReport = ESLintCLIEngine.getErrorResults(report.results);
            // log the result to CLI
            console.log(ESLintCLIEngine.getFormatter()(report.results));
            // log the success of the parser if it has no errors
            (errorReport && !errorReport.length) && console.log(chalk.green('eslint ok!'));
            // ensure that the exit code is non zero in case there was an error
            next(Number(errorReport && errorReport.length) || 0);
        }
    ], exit);
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
