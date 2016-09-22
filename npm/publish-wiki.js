#!/usr/bin/env node
// ----------------------------------------------------------------------------------------------------------------------
// This script is intended to publish wiki of this module
// ----------------------------------------------------------------------------------------------------------------------

require('shelljs/global');
require('colors');

// Stop on first error
set('-e');
echo('Publishing wiki...'.yellow.bold);

var publishResult,

    WIKI_URL = "https://github.com/postmanlabs/postman-collection.wiki.git",
    WIKI_GIT_PATH = ".tmp/github-wiki",
    WIKI_VERSION = "$(git describe --always)";

// build the reference MD
exec('npm run build-wiki');

// clone repository
mkdir('-p', WIKI_GIT_PATH);
rm('-rf', WIKI_GIT_PATH);
exec(`git clone ${WIKI_URL} ${WIKI_GIT_PATH} --quiet`);

// update contents of repository
exec('node ./wiki_create_content_from_reference.js');

// silence terminal output to prevent leaking sensitive information
config.silent = true;

pushd(WIKI_GIT_PATH);
exec('git add --all');
exec(`git commit -m "[auto] ${WIKI_VERSION}"`);
publishResult = exec('git push origin master');

if (publishResult.code !== 0) {
    echo('Wiki publish failed!'.red.bold);
    exit(1);
}

echo(` - wiki published ${WIKI_VERSION}`);
