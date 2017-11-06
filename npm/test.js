#!/usr/bin/env node
/* eslint-env node, es6 */
require('shelljs/global');

var async = require('async'),
    chalk = require('chalk');

console.log(chalk.yellow.bold('  ___     _ _        _   _           ') + chalk.green.bold(' ___ ___  _  __ '));
console.log(chalk.yellow.bold(' / __|___| | |___ __| |_(_)___ _ _   ') + chalk.green.bold('/ __|   \\| |/ / '));
console.log(chalk.yellow.bold('| (__/ _ \\ | / -_) _|  _| / _ \\ \' \\  ') + chalk.green.bold('\\__ \\ |) | \' < '));
console.log(chalk.yellow.bold(' \\___\\___/_|_\\___\\__|\\__|_\\___/_||_| ') + chalk.green.bold('|___/___/|_|\\_\\'));

async.series([
    require('./test-lint'),
    require('./test-system'),
    require('./test-unit'),
    require('./test-browser')
], function (code) {
    !code && console.log(chalk.green('\npostman-collection tests: all ok!'));
    exit(code);
});
