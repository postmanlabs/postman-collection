#!/usr/bin/env node
require('shelljs/global');
require('colors');

var fs = require('fs'),
    path = require('path'),

    jsdoc2md = require('jsdoc-to-markdown'),

    OUT_DIR = path.join(__dirname, '..', 'out', 'wiki'),
    OUT_PATH = path.join(OUT_DIR, 'REFERENCE.md'),

    targetStream = fs.createWriteStream(OUT_PATH);

module.exports = function (exit) {
    console.log('Generating wiki using jsdoc2md...'.yellow.bold);

    // clean directory
    test('-d', OUT_DIR) && rm('-rf', OUT_DIR);
    mkdir('-p', OUT_DIR);

    // execute command
    jsdoc2md({ src: 'lib/**/*.js' }).pipe(targetStream);

    console.log(' - wiki generated at ' + OUT_PATH);
    exit();
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
