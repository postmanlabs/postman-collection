#!/usr/bin/env node
require('shelljs/global');
require('colors');

var path = require('path'),

    TARGET_DIR = path.join(__dirname, '..', 'out', 'docs');

module.exports = function (exit) {
    console.log('Generating documentation...'.yellow.bold);
    // clean directory
    test('-d', TARGET_DIR) && rm('-rf', TARGET_DIR);

    exec('node node_modules/.bin/jsdoc -c .jsdoc-config.json -u docs/ lib/*');
    console.log(' - documentation can be found at ./out/docs');

    exit();
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
