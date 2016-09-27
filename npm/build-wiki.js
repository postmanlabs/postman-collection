#!/usr/bin/env node
/* eslint-env node, es6 */
require('shelljs/global');

var fs = require('fs'),
    colors = require('colors/safe'),
    path = require('path'),
    jsdoc2md = require('jsdoc-to-markdown'),

    OUT_DIR = path.join('out', 'wiki'),
    INP_DIR = path.join('lib', '**', '*.js'),
    OUT_PATH = path.join(OUT_DIR, 'REFERENCE.md');

module.exports = function (exit) {
    var errored;

    console.log(colors.yellow.bold('Generating wiki using jsdoc2md...'));

    try {
        // clean directory
        test('-d', OUT_DIR) && rm('-rf', OUT_DIR);
        mkdir('-p', OUT_DIR);

        // execute command
        jsdoc2md({ src: INP_DIR })
            .on('finish', function () {
                if (errored) { return; }
                console.log(` - wiki generated at "${OUT_PATH}"`);
                exit();
            })
            .on('error', function (e) {
                errored = true;
                console.error(e && e.stack || e);
                exit(1);
            })
            .pipe(fs.createWriteStream(OUT_PATH));
    }
    catch (e) {
        console.error(e.stack || e);
        return exit(e ? 1 : 0);
    }
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
