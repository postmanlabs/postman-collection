#!/usr/bin/env node
// ----------------------------------------------------------------------------------------------------------------------
// This script is intended to generate documentation of this module
// ----------------------------------------------------------------------------------------------------------------------

require('shelljs/global');
require('colors');

// Stop on first error
set('-e');

console.log('Generating documentation...'.yellow.bold);

// clean directory
test('-d', './out/docs') && rm('-rf', './out/docs');

exec('node node_modules/.bin/jsdoc -c .jsdoc-config.json -u docs/ lib/*');
console.log(' - documentation can be found at ./out/docs');
