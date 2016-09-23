require('shelljs/global');
require('colors');

console.log('   ___     _ _        _   _           '.yellow.bold + ' ___ ___  _  __ '.green.bold);
console.log('  / __|___| | |___ __| |_(_)___ _ _   '.yellow.bold + '/ __|   \\| |/ / '.green.bold);
console.log(' | (__/ _ \\ | / -_) _|  _| / _ \\ \' \\  '.yellow.bold + '\\__ \\ |) | \' <  '.green.bold);
console.log('  \\___\\___/_|_\\___\\__|\\__|_\\___/_||_| '.yellow.bold + '|___/___/|_|\\_\\ '.green.bold);

require('async').series([
    require('./test-lint'),
    require('./test-system'),
    require('./test-integration'),
    process.env.CI ? function (done) { done(); } : require('./test-browser')
], function (code) {
    !code && console.log('\npostman-collection tests: all ok!'.green);
    exit(code);
});
