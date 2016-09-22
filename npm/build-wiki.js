#!/usr/bin/env node
// ----------------------------------------------------------------------------------------------------------------------
// This script is intended to generate wiki of this module
// ----------------------------------------------------------------------------------------------------------------------

require('shelljs/global');
require('colors');

// Stop on first error
set('-e');

console.log('Generating wiki...'.yellow.bold);
console.log('jsdoc2md'.yellow.bold);

// some variables
var OUT_DIR = 'out/wiki',
    OUT_FILE = 'REFERENCE.md',
    OUT_PATH = `${OUT_DIR}/${OUT_FILE}`;

// clean directory
test('-d', OUT_DIR) && rm('-rf', OUT_DIR);
mkdir('-p', OUT_DIR);

// execute command
exec(`node node_modules/.bin/jsdoc2md --src lib/**/*.js > ${OUT_PATH}`);

console.log(` - wiki generated at ${OUT_PATH}\n`);
