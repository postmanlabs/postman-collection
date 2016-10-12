#!/usr/bin/env node
/* eslint-env node, es6 */
require('shelljs/global');

var fs = require('fs'),
    colors = require('colors/safe'),
    path = require('path'),
    jsdoc2md = require('jsdoc-to-markdown'),

    OUT_DIR = path.join('out', 'wiki'),
    INP_DIR = path.join('lib', '**', '*.js'),
    OUT_PATH = path.join(OUT_DIR, 'REFERENCE.md'),
    SUCCESS_MESSAGE = colors.green.bold(`- wiki generated at "${OUT_PATH}"`);

module.exports = function (exit) {
    console.log(colors.yellow.bold('Generating wiki using jsdoc2md...'));

    // clean directory
    test('-d', OUT_DIR) && rm('-rf', OUT_DIR);
    mkdir('-p', OUT_DIR);

    // execute command
    jsdoc2md.render({ files: INP_DIR })
        .then(function (markdown) {
            fs.writeFile(OUT_PATH, markdown, function (err) {
                console.info(err ? err : SUCCESS_MESSAGE);
                exit(err ? 1 : 0);
            });
        })
        .catch(function (err) {
            console.error(err);
            exit(1);
        });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
