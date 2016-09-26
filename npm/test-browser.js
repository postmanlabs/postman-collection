// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all unit tests in the Chrome Browser.
// ---------------------------------------------------------------------------------------------------------------------

require('shelljs/global');
require('colors');

var path = require('path'),
    Server = require('karma').Server,

    INFO_MESSAGE = 'Running unit tests within browser'.yellow,
    KARMA_CONFIG_PATH = path.join(__dirname, '..', 'karma.conf');

module.exports = function (done) {
    console.log(INFO_MESSAGE);

    new Server({
        cmd: 'start',
        configFile: KARMA_CONFIG_PATH
    }, done).start();
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
