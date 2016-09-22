#!/usr/bin/env node
require('shelljs/global');
require('colors');

require('async').series([
    require('./test-lint'),
    require('./test-system'),
    require('./test-integration'),
    process.env.CI ? function (done) { done(); } : require('./test-browser')
], function (code) {
    !code && console.log('\npostman-collection tests: all ok!'.green);
    exit(code);
});
