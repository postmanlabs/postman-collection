#!/usr/bin/env node
/* eslint-env node, es6 */
var resolve = require('path').resolve,

    loadJSON = function (file) {
        return JSON.parse(require('fs').readFileSync(file).toString());
    },

    dependencySources = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies',
        'bundledDependencies'],

    packagePath,
    packageData,
    nsprc,
    fakePackage = {
        name: 'nsp-fake'
    };

module.exports = function (exit) {
    // extract the current source path
    process.argv[2] && (packagePath = process.argv[2].replace(/\/?package\.json$/, ''));
    !packagePath && (packagePath = '.');

    // extract data from package and nsprc
    packageData = loadJSON(resolve(packagePath + '/package.json'));

    try {
        nsprc = loadJSON(resolve(packagePath + '/.nsprc'));
    }
    catch (e) {
        nsprc = {};
    }

    !Array.isArray(nsprc.exclusions) && (nsprc.exclusions = []);

    // copy all dependencies to fake data and exclude exceptions
    dependencySources.forEach(function (src) {
        packageData[src] && (fakePackage[src] = {}) && Object.keys(packageData[src]).forEach(function (dep) {
            nsprc.exclusions.indexOf(dep) === -1 && (fakePackage[src][dep] = packageData[src][dep]);
        });
    });

    process.stdout.write(JSON.stringify(fakePackage, null, 2) + '\n');

    exit();
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
