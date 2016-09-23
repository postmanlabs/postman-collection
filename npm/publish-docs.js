#!/usr/bin/env node
require('shelljs/global');

module.exports = function (exit) {
    // generate project documentation
    requie('./build-docs');

    // go to the out directory and create a *new* Git repo
    cd('out/docs');
    exec('git init');

    // inside this git repo we'll pretend to be a new user
    exec('git config user.name "Doc Publisher"');
    exec('git config user.email "autocommit@postmanlabs.com"');

    // The first and only commit to this new Git repo contains all the
    // files present with the commit message "Deploy to GitHub Pages".
    exec('git add .');
    exec('git commit -m "Deploy to GitHub Pages"');

    // Force push from the current repo's master branch to the remote
    // repo's gh-pages branch. (All previous history on the gh-pages branch
    // will be lost, since we are overwriting it.) We silence any output to
    // hide any sensitive credential data that might otherwise be exposed.
    config.silent = true;
    exec('git push --force "git@github.com:postmanlabs/postman-collection.git" master:gh-pages');
    exit();
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
