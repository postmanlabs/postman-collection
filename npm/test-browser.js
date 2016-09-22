#!/usr/bin/env node
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all unit tests in the Chrome Browser.
// ---------------------------------------------------------------------------------------------------------------------

require('shelljs/global');
require('colors');

var path = require('path'),
    Server = require('karma').Server,

    KARMA_CONFIG_PATH = path.join(__dirname, '..', 'karma.conf');

module.exports = function (exit) {
    console.log('Running unit tests within browser...'.yellow);
    new Server({
        cmd: 'start',
        configFile: KARMA_CONFIG_PATH
    }, exit).start();
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
