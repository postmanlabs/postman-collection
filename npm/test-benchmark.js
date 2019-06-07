#!/usr/bin/env node
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all benchmark tests
// ---------------------------------------------------------------------------------------------------------------------
/* eslint-env node, es6 */

require('shelljs/global');

var chalk = require('chalk');

module.exports = function (exit) {
    console.log(chalk.yellow.bold('Running benchmark tests'));
    exec('bipbip test/benchmark/ ' +
         '--save benchmark/benchmark-results.json ' +
         '--compare benchmark/benchmark-results.json', exit);
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
