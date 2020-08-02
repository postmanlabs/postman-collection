#!/usr/bin/env node
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to generate type-definition for this module
// ---------------------------------------------------------------------------------------------------------------------

/* eslint-env node, es6 */
require('shelljs/global');

var path = require('path'),
    fs = require('fs'),
    pkg = require('../package.json'),
    chalk = require('chalk'),


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
    console.log(chalk.yellow.bold('Generating type-definitions...'));

    try {
        // clean directory
        test('-d', TARGET_DIR) && rm('-rf', TARGET_DIR);
    }
    catch (e) {
        console.error(e.stack || e);
        return exit(e ? 1 : 0);
    }

    exec(`${IS_WINDOWS ? '' : 'node'} ${path.join('node_modules', '.bin', 'jsdoc')}${IS_WINDOWS ? '.cmd' : ''}` +
        ' -c .jsdoc-config-collection.json -p', function (code) {

        if (!code) {
            fs.readFile(`${TARGET_DIR}/index.d.ts`, function (err, contents) {
                if (err) {
                    console.log(chalk.red.bold('unable to read the type-definition file'));
                    exit(1);
                }
                var source = contents.toString();
                source = source.replace(/Integer/gm, 'number')
                    .replace(/String\[]/gm, 'string[]')
                    .replace(/Boolean\[]/gm, 'boolean[]')
                    .replace(/<[^>]*>/gm, '') // remove all html tags
                    .replace(/\{@link (\w*)[#.]+(\w*)\}/gm, '$1.$2') // remove @link tags
                    .replace(/\{@link (\S+)\}/gm, '$1'); // remove @link tags

                source = `${heading} \n ${source}`;

                fs.writeFile(`${TARGET_DIR}/index.d.ts`, source, function (err) {
                    if (err) {
                        console.log(chalk.red.bold('unable to write the type-definition file'));
                        exit(1);
                    }
                    console.log(chalk.green.bold(`Type-definition file saved successfully at "${TARGET_DIR}"`));
                    exit(0);
                });
            });
        }
        else {
            // output status
            console.log(chalk.red.bold('unable to generate type-definition'));
            exit(code);
        }
    });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
