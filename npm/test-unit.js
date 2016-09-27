// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all unit tests.
// ---------------------------------------------------------------------------------------------------------------------

require('shelljs/global');
require('colors');

// set directories and files for test and coverage report
var path = require('path'),

    IS_WINDOWS = (/^win/).test(process.platform);

module.exports = function (exit) {
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
    console.log('Running unit tests using mocha on node...'.yellow.bold);

    mkdir('-p', '.tmp');
    test('-d', '.coverage') && rm('-rf', '.coverage') && mkdir('-p', '.coverage');

    // eslint-disable-next-line max-len
    exec((IS_WINDOWS ? '' : 'node ') + '"' + path.join('node_modules', '.bin', 'istanbul') + (IS_WINDOWS ? '.cmd' : '') +
        '" cover ' + istanbulReport + ' --dir .coverage --color --print both ' + path.join('node_modules', 'mocha', 'bin', '_mocha') +
        ' -- --reporter ' + mochaReporter + ' --reporter-options output=' + path.join('.tmp', 'report.xml') + path.join('test', 'unit') +
        ' --recursive --prof --colors --grep=' + (process.argv[2] || '.*'), exit);
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
