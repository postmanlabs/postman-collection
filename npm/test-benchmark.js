#!/usr/bin/env node
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all benchmark tests.
// ---------------------------------------------------------------------------------------------------------------------

const chalk = require('chalk'),
    { exec } = require('shelljs');

module.exports = function (exit) {
    console.info(chalk.yellow.bold('Running benchmark tests'));
    exec('bipbip test/benchmark/ ' +
         '--save benchmark/benchmark-results.json ' +
         '--compare benchmark/benchmark-results.json', exit);
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(process.exit);
