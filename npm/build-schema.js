#!/usr/bin/env node
/* eslint-env node, es6 */
require('shelljs/global');
require('colors');

var fs = require('fs'),
    path = require('path'),

    IN_FOLDER = path.join('lib', 'schema'),
    IN_FOLDER_ROOT = path.join(IN_FOLDER, 'collection.json'),
    OUTPUT_FOLDER = path.join('out', 'schema'),
    OUTPUT_FILE = path.join(OUTPUT_FOLDER, 'collection.json');

module.exports = function (exit) {
    var compiler = require('schema-compiler');

    console.log('Generating schema...'.yellow.bold);

    // clean directory
    try {
        test('-d', OUTPUT_FOLDER) && test('-f', OUTPUT_FILE) && rm('-f', OUTPUT_FILE);
        mkdir('-p', OUTPUT_FOLDER);
    }
    catch (e) {
        console.error(e.stack || e);
        return exit(e ? 1 : 0);
    }

    fs.writeFile(OUTPUT_FILE, JSON.stringify(compiler.compile(IN_FOLDER_ROOT, IN_FOLDER), 0, 2), function (err) {
        if (err) {
            console.error(err.stack || err);
            return exit(err ? 1 : 0);
        }

        console.log(' - schema can be found at ' + OUTPUT_FILE);
        exit();
    });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
