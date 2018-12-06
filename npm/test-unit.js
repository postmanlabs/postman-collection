#!/usr/bin/env node
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all unit tests.
// ---------------------------------------------------------------------------------------------------------------------
/* eslint-env node, es6 */

require('shelljs/global');

// set directories and files for test and coverage report
var path = require('path'),

    chalk = require('chalk'),
    expect = require('chai').expect,

    IS_WINDOWS = (/^win/).test(process.platform),
    COV_REPORT_PATH = '.coverage',
    REPORT_PATH = path.join('.tmp', 'report.xml'),
    SPEC_SOURCES = path.join('test', 'unit');

module.exports = function (exit) {
    var specPattern = (process.argv[2] || '.*'),
        mochaReporter = 'spec',
        istanbulReport = '';

    // for CI, we use simple xunit reporter (not on Travis since it does not parse results)
    // if (process.env.CI) {
    //     mochaReporter = 'xunit';
    //     istanbulReport = '--report cobertura';
    // }

    // banner line
    console.log(chalk.yellow.bold('Running unit tests using mocha on node...'));

    mkdir('-p', '.tmp');
    test('-d', COV_REPORT_PATH) && rm('-rf', COV_REPORT_PATH) && mkdir('-p', COV_REPORT_PATH);

    global.expect = expect;

    // windows istanbul and mocha commands need some special attention.
    if (IS_WINDOWS) {
        // sample command in case you're confused
        // node_modules\.bin\istanbul.cmd cover  --dir .coverage --color --print both
        //      node_modules\mocha\bin\_mocha -- --reporter spec --reporter-options output=
        //      .tmp\report.xml test\unit --recursive --prof --colors --grep=.*
        exec(`node_modules\\.bin\\istanbul.cmd cover ${istanbulReport} --dir ${COV_REPORT_PATH} --colors ` +
            // eslint-disable-next-line max-len
            `--print both node_modules\\mocha\\bin\\_mocha -- ${SPEC_SOURCES} --reporter ${mochaReporter} --timeout 10000 ` +
            `--reporter-options output=${REPORT_PATH} --recursive --prof --colors --grep=${specPattern}`, exit);
    }
    else {
        exec(`./node_modules/.bin/istanbul cover ${istanbulReport} --dir ${COV_REPORT_PATH} --colors ` +
            // eslint-disable-next-line max-len
            `--print both node_modules/mocha/bin/_mocha -- ${SPEC_SOURCES} --reporter ${mochaReporter} --timeout 10000 ` +
            `--reporter-options output=${REPORT_PATH} --recursive --prof --colors --grep=${specPattern}`, exit);
    }
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
