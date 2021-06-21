#!/usr/bin/env node
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to generate type-definition for this module.
// ---------------------------------------------------------------------------------------------------------------------

const path = require('path'),
    fs = require('fs'),
    pkg = require('../package.json'),
    chalk = require('chalk'),
    { exec, rm, test } = require('shelljs'),

    IS_WINDOWS = (/^win/).test(process.platform),
    TARGET_DIR = path.join('types'),

    heading =
`// Type definitions for postman-collection ${pkg.version}
// Project: https://github.com/postmanlabs/postman-collection
// Definitions by: PostmanLabs
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.4
/// <reference types="node" />
`;

module.exports = function (exit) {
    console.info(chalk.yellow.bold('Generating type-definitions...'));

    try {
        // clean directory
        test('-d', TARGET_DIR) && rm('-rf', TARGET_DIR);
    }
    catch (e) {
        console.error(e.stack || e);

        return exit(e ? 1 : 0);
    }

    exec(`${IS_WINDOWS ? '' : 'node'} ${path.join('node_modules', '.bin', 'jsdoc')}${IS_WINDOWS ? '.cmd' : ''}` +
        ' -c .jsdoc-config-type-def.json -p', function (code) {
        if (!code) {
            fs.readFile(`${TARGET_DIR}/index.d.ts`, function (err, contents) {
                if (err) {
                    console.info(chalk.red.bold('unable to read the type-definition file'));
                    exit(1);
                }
                var source = contents.toString();

                source = source
                    // replace all declare keyword with export, as the whole typedef will be wrapped around a module
                    .replace(/^declare /gm, 'export ')
                    // replacing String[] with string[] as 'String' is not a valid data-type in Typescript
                    .replace(/String\[]/gm, 'string[]')
                    // replacing Boolean[] with boolean[] as 'Boolean' is not a valid data-type in Typescript
                    .replace(/Boolean\[]/gm, 'boolean[]')
                    // removing all occurrences html, as the these tags are not supported in Type-definitions
                    .replace(/<[^>]*>/gm, '')
                    // replacing @link tags with the object namepath to which it was linked,
                    // as these link tags are not navigable in type-definitions.
                    .replace(/\{@link (\w*)[#.]+(\w*)\}/gm, '$1.$2')
                    .replace(/\{@link (\S+)\}/gm, '$1') // remove @link tags
                    .replace(/^(.+)/gm, '    $1');

                source = `${heading}\ndeclare module "postman-collection" {\n\n${source}}\n`;

                fs.writeFile(`${TARGET_DIR}/index.d.ts`, source, function (err) {
                    if (err) {
                        console.info(chalk.red.bold('unable to write the type-definition file'));
                        exit(1);
                    }
                    console.info(chalk.green.bold(`Type-definition file saved successfully at "${TARGET_DIR}"`));
                    exit(0);
                });
            });
        }
        else {
            // output status
            console.info(chalk.red.bold('unable to generate type-definition'));
            exit(code);
        }
    });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(process.exit);
