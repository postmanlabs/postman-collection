#!/usr/bin/env node
// ----------------------------------------------------------------------------------------------------------------------
// This script is intended to generate documentation of this module
// ----------------------------------------------------------------------------------------------------------------------

require('shelljs/global');
require('colors');

// Stop on first error
set('-e');

echo('Generating documentation...'.yellow.bold);

// clean directory
test('-d', './out/docs') && rm('-rf', './out/docs');

exec('node node_modules/.bin/jsdoc -c .jsdoc-config.json -u docs/ lib/*');
echo(' - documentation can be found at ./out/docs');
