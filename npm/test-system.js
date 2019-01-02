#!/usr/bin/env node
/* eslint-env node, es6 */

require('shelljs/global');

var chalk = require('chalk'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),

    expect = require('chai').expect,
    Mocha = require('mocha'),

    SPEC_SOURCE_DIR = path.join(__dirname, '..', 'test', 'system');

module.exports = function (exit) {
    // banner line
    console.log(chalk.yellow.bold('\nRunning system tests using mocha...'));

    async.series([
        // ensure all dependencies are okay
        function (next) {
            console.log(chalk.yellow('checking package dependencies...\n'));

            exec('dependency-check ./package.json --extra --no-dev --missing', next);
        },

        // run test specs using mocha
        function (next) {
            var mocha = new Mocha();

            console.log(chalk.yellow('running system specs using mocha...\n'));
            fs.readdir(SPEC_SOURCE_DIR, function (err, files) {
                if (err) { return next(err); }

                files.filter(function (file) {
                    return (file.substr(-8) === '.test.js');
                }).forEach(function (file) {
                    mocha.addFile(path.join(SPEC_SOURCE_DIR, file));
                });

                // start the mocha run
                global.expect = expect; // for easy reference

                mocha.run(function (err) {
                    // clear references and overrides
                    delete global.expect;

                    err && console.error(err.stack || err);
                    next(err ? 1 : 0);
                });
                // cleanup
                mocha = null;
            });
        }
    ], exit);
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
