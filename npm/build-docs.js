#!/usr/bin/env node
/* eslint-env node, es6 */
require('shelljs/global');
require('colors');

var path = require('path'),

    IS_WINDOWS = (/^win/).test(process.platform),
    TARGET_DIR = path.join(__dirname, '..', 'out', 'docs'),
    SUCCESS_MESSAGE = ' - documentation can be found at ./out/docs',
    FAILURE_MESSAGE = 'Documentation could not be generated!'.red.bold,
    DOC_GENERATION_COMMAND = (IS_WINDOWS ? '' : 'node ') + path.join('node_modules', '.bin', 'jsdoc') +
        (IS_WINDOWS ? '.cmd' : '') + ' -c .jsdoc-config.json -u docs lib';

module.exports = function (exit) {
    console.log('Generating documentation...'.yellow.bold);
    // clean directory
    test('-d', TARGET_DIR) && rm('-rf', TARGET_DIR);

    exec(DOC_GENERATION_COMMAND, function (code) {
        console.log(code ? FAILURE_MESSAGE : SUCCESS_MESSAGE);
        exit(code);
    });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
