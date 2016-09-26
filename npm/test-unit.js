// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all unit tests.
// ---------------------------------------------------------------------------------------------------------------------

require('shelljs/global');
require('colors');

// set directories and files for test and coverage report
var path = require('path'),

    COVERAGE = './.coverage',
    REPORT_DIRECTORY = '.tmp',
    REPORTER = '-- --reporter ',
    TEST_GREP_PATTERN = process.argv[2] || '.*',
    ISTANBUL = 'node node_modules/.bin/istanbul cover ',
    XUNIT_FILE = path.join(REPORT_DIRECTORY, 'report.xml'),
    REPORTER_OPTS = ' --reporter-options output=' + XUNIT_FILE,
    SPEC_SOURCE_DIR = path.join(__dirname, '..', 'test', 'unit'),
    INFO_MESSAGE = 'Running unit tests using mocha on node...'.yellow.bold,
    ISTANBUL_OPTS = ' --dir ' + COVERAGE + ' --color --print both node_modules/.bin/_mocha ',
    MOCHA_OPTS = REPORTER_OPTS + ' ' + SPEC_SOURCE_DIR + ' --recursive --prof --colors --grep=';

module.exports = function (done) {
    var mochaReporter,
        istanbulReport;

    if (process.env.CI) {
        mochaReporter = 'xunit';
        istanbulReport = '--report cobertura';
    }
    else {
        mochaReporter = 'spec';
        istanbulReport = '';
    }

    // banner line
    console.log(INFO_MESSAGE);

    mkdir('-p', REPORT_DIRECTORY);
    test('-d', COVERAGE) && rm('-rf', COVERAGE) && mkdir('-p', COVERAGE);

    // add all spec files to mocha
    exec(ISTANBUL + istanbulReport + ISTANBUL_OPTS + REPORTER + mochaReporter + MOCHA_OPTS + TEST_GREP_PATTERN, done);
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
