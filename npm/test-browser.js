#!/usr/bin/env node
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all unit tests in the Chrome Browser.
// ---------------------------------------------------------------------------------------------------------------------
/* eslint-env node, es6 */

require('shelljs/global');

var colors = require('colors/safe'),
    path = require('path'),

    KARMA_CONFIG_PATH = path.join(__dirname, '..', 'karma.conf');

module.exports = function (exit) {
    console.log(colors.yellow.bold('Running unit tests within browser...'));

    var KarmaServer = require('karma').Server;
    (new KarmaServer({ // eslint-disable no-new
        cmd: 'start',
        configFile: KARMA_CONFIG_PATH
    }, exit)).start();
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
