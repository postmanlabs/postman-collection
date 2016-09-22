#!/usr/bin/env node
// ----------------------------------------------------------------------------------------------------------------------
// This script is intended to generate schema of this module
// ----------------------------------------------------------------------------------------------------------------------

require('shelljs/global');
require('colors');

// Stop on first error
set('-e');

echo('Generating schema...'.yellow.bold);

var OUTPUT_FOLDER = './out/schema',
    OUTPUT_FILE = `${OUTPUT_FOLDER}/collection.json`;

// clean directory
test('-d', OUTPUT_FOLDER) && test('-f', OUTPUT_FILE) && rm('-f', OUTPUT_FILE);
mkdir('-p', OUTPUT_FOLDER);

exec(`node node_modules/.bin/json-schema-compiler json-schema-compiler --dir "lib/schema" --root "lib/schema/collection.json" --output ${OUTPUT_FILE}`);

echo(` - schema can be found at ${OUTPUT_FILE}`);
