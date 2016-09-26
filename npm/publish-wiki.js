require('shelljs/global');
require('colors');

var path = require('path'),

    WIKI_URL = 'https://github.com/postmanlabs/postman-collection.wiki.git',
    WIKI_GIT_PATH = path.join(__dirname, '..', '.tmp', 'github-wiki'),
    WIKI_VERSION = exec('git describe --always').stdout,
    INFO_MESSAGE = 'Publishing wiki...'.yellow.bold,
    SUCCESS_MESSAGE = (' - wiki published ' + WIKI_VERSION).green.bold,
    FAILURE_MESSAGE = 'Wiki publish failed!'.red.bold;

module.exports = function (done) {
    process.on('exit', function (code) {
        code && console.log(FAILURE_MESSAGE);
        done(code);
    });

    console.log(INFO_MESSAGE);

    // build the reference MD
    require('./build-wiki');

    // clone repository
    mkdir('-p', WIKI_GIT_PATH);
    rm('-rf', WIKI_GIT_PATH);
    // @todo: Consider navigating to WIKI_GIT_PATH, setting up a new git repo there, point the remote to WIKI_GIT_URL,
    // @todo: and push
    exec('git clone ' + WIKI_URL + ' ' + WIKI_GIT_PATH + ' --quiet');

    // update contents of repository
    require('./wiki_create_content_from_reference');

    // silence terminal output to prevent leaking sensitive information
    config.silent = true;

    pushd(WIKI_GIT_PATH);
    exec('git add --all');
    exec('git commit -m "[auto] ' + WIKI_VERSION + '"');
    exec('git push origin master', function (code) {
        console.log(code ? FAILURE_MESSAGE : SUCCESS_MESSAGE);
        popd();
        done(code);
    });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
