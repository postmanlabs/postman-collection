#!/usr/bin/env node
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all unit tests.
// ---------------------------------------------------------------------------------------------------------------------
/* eslint-env node, es6 */

require('shelljs/global');
require('colors');

// set directories and files for test and coverage report
var path = require('path'),
    recursive = require('recursive-readdir'),

    SPEC_SOURCE_DIR = path.join(__dirname, '..', 'test', 'integration');

module.exports = function (exit) {
    // banner line
    console.log('Running integration tests using mocha on node...'.yellow.bold);

    var Mocha = require('mocha');

    // add all spec files to mocha
    recursive(SPEC_SOURCE_DIR, function (err, files) {
        if (err) { console.error(err); return exit(1); }

        var mocha = new Mocha({ timeout: 1000 * 60 });

        files.filter(function (file) { // extract all test files
            return (file.substr(-8) === '.test.js');
        }).forEach(mocha.addFile.bind(mocha));

        mocha.run(function (err) {
            err && console.error(err.stack || err);
            exit(err ? 1 : 0);
        });
    });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
