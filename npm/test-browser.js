#!/usr/bin/env node
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all unit tests in the Chrome Browser.
// ---------------------------------------------------------------------------------------------------------------------

const path = require('path'),

    chalk = require('chalk'),
    KarmaServer = require('karma').Server,

    KARMA_CONFIG_PATH = path.join(__dirname, '..', 'test', 'karma.conf');

module.exports = function (exit) {
    if (process.env.TRAVIS_OS_NAME === 'windows') { // eslint-disable-line no-process-env
        return console.info(chalk.yellow.bold('Skipping browser tests on windows...'));
    }

    console.info(chalk.yellow.bold('Running unit tests within browser...'));

    (new KarmaServer({ // eslint-disable no-new
        cmd: 'start',
        configFile: KARMA_CONFIG_PATH
    }, exit)).start();
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(process.exit);
