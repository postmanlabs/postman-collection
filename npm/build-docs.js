require('shelljs/global');
require('colors');

var path = require('path'),

    IS_WINDOWS = (/^win/).test(process.platform),
    TARGET_DIR = path.join(__dirname, '..', 'out', 'docs'),
    INFO_MESSAGE = 'Generating documentation...'.yellow.bold,
    FAILURE_MESSAGE = 'Documentation could not be generated!'.red.bold,
    SUCCESS_MESSAGE = ' - documentation can be found at ./out/docs'.green.bold,
    DOC_GENERATION_COMMAND = (IS_WINDOWS ? '' : 'node ') + path.join('node_modules', '.bin', 'jsdoc') +
        (IS_WINDOWS ? '.cmd' : '') + ' -c .jsdoc-config.json -u docs lib';

module.exports = function (done) {
    console.log(INFO_MESSAGE);
    // clean directory
    test('-d', TARGET_DIR) && rm('-rf', TARGET_DIR);

    exec(DOC_GENERATION_COMMAND, function (code) {
        console.log(code ? FAILURE_MESSAGE : SUCCESS_MESSAGE);
        done(code);
    });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
