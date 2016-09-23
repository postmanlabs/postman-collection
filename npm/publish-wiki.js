#!/usr/bin/env node
require('shelljs/global');
require('colors');

var path = require('path'),

    publishResult,

    WIKI_URL = 'https://github.com/postmanlabs/postman-collection.wiki.git',
    WIKI_GIT_PATH = path.join(__dirname, '..', '.tmp', 'github-wiki'),
    WIKI_VERSION = exec('git describe --always').stdout;

module.exports = function (exit) {
    console.log('Publishing wiki...'.yellow.bold);

    // build the reference MD
    require('./build-wiki');

    // clone repository
    mkdir('-p', WIKI_GIT_PATH);
    rm('-rf', WIKI_GIT_PATH);
    exec('git clone ' + WIKI_URL + ' ' + WIKI_GIT_PATH + ' --quiet');

    // update contents of repository
    require('./wiki_create_content_from_reference');

    // silence terminal output to prevent leaking sensitive information
    config.silent = true;

    pushd(WIKI_GIT_PATH);
    exec('git add --all');
    exec('git commit -m "[auto] ' + WIKI_VERSION + '"');
    publishResult = exec('git push origin master');
    popd();

    if (publishResult.code) {
        console.log('Wiki publish failed!'.red.bold);
        exit(1);
    }

    console.log(' - wiki published ' + WIKI_VERSION);
    exit();
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
