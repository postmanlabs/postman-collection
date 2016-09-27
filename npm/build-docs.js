#!/usr/bin/env node
/* eslint-env node, es6 */
require('shelljs/global');

var path = require('path'),
    colors = require('colors/safe'),

    IS_WINDOWS = (/^win/).test(process.platform),
    TARGET_DIR = path.join('out', 'docs');

module.exports = function (exit) {
    console.log(colors.yellow.bold('Generating documentation...'));

    try {
        // clean directory
        test('-d', TARGET_DIR) && rm('-rf', TARGET_DIR);
    }
    catch (e) {
        console.error(e.stack || e);
        return exit(e ? 1 : 0);
    }

    exec(`${IS_WINDOWS ? '' : 'node'} ${path.join('node_modules', '.bin', 'jsdoc')}${IS_WINDOWS ? '.cmd' : ''}` +
        ' -c .jsdoc-config.json -u docs lib', function (code) {
        // output status
        console.log(code ?
            colors.red.bold('unable to genereate documentation') :
            ` - documentation created at "${TARGET_DIR}"`);
        exit(code);
    });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
