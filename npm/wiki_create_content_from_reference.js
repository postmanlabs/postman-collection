#!/usr/bin/env node
/* eslint-env node, es6 */

var SOURCE_MD = 'out/wiki/REFERENCE.md',
    HOME_MD = '.tmp/github-wiki/Home.md',
    SIDE_MD = '.tmp/github-wiki/_Sidebar.md',

    fs = require('fs'),
    source = fs.readFileSync(SOURCE_MD).toString(),
    home,
    sidebar;

module.exports = function (exit) {
    // extract sidebar from source
    sidebar = source.replace(/<a name="Collection"><\/a>[\s\S]+/g, '');

    // remove sidebar data from home
    home = source.substr(sidebar.length);

    // add timestamp to sidebar
    sidebar += '\n\n ' + (new Date()).toUTCString();

    // write the files
    fs.writeFileSync(HOME_MD, home);
    fs.writeFileSync(SIDE_MD, sidebar);
    exit();
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
