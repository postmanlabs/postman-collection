// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all unit tests.
// ---------------------------------------------------------------------------------------------------------------------

require('shelljs/global');
require('colors');

// set directories and files for test and coverage report
var path = require('path'),

    Mocha = require('mocha'),
    recursive = require('recursive-readdir'),

    SPEC_SOURCE_DIR = path.join(__dirname, '..', 'test', 'integration'),
    INFO_MESSAGE = '\nRunning integration tests using mocha on node...'.yellow.bold;

module.exports = function (done) {
    // banner line
    console.log(INFO_MESSAGE);

    // add all spec files to mocha
    recursive(SPEC_SOURCE_DIR, function (err, files) {
        if (err) { console.error(err); return done(1); }

        var mocha = new Mocha({ timeout: 1000 * 60 });

        files.filter(function (file) { // extract all test files
            return (file.substr(-8) === '.test.js');
        }).forEach(mocha.addFile.bind(mocha));

        mocha.run(function (err) {
            done(err ? 1 : 0);
        });
    });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
