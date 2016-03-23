#!/usr/bin/env node

var SOURCE_MD = 'out/wiki/REFERENCE.md',
    HOME_MD = '.tmp/github-wiki/Home.md',
    SIDE_MD = '.tmp/github-wiki/_Sidebar.md',

    fs = require('fs'),
    source = fs.readFileSync(SOURCE_MD).toString(),
    home,
    sidebar;

// extract sidebar from source
sidebar = source.replace(/<a name="Collection"><\/a>[\s\S]+/g, '');

// remove sidebar data from home
home = source.substr(sidebar.length);

// add timestamp to sidebar
sidebar += '\n\n ' + (new Date()).toUTCString();

// write the files
fs.writeFileSync(HOME_MD, home);
fs.writeFileSync(SIDE_MD, sidebar);
