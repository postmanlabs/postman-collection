#!/usr/bin/env node
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to automate the versioning and changelog generation process for a release.
// ---------------------------------------------------------------------------------------------------------------------

const shipit = require('@postman/shipit'),

    // npm run release [true] [beta]
    [pushToOrigin, preReleaseSuffix] = process.argv.splice(2);

// only support `beta` suffix
if (preReleaseSuffix && preReleaseSuffix !== 'beta') {
    throw new Error(`Can't prerelease with \`${preReleaseSuffix}\` suffix.`);
}

// 🚢 Just Ship It!
shipit({
    mainBranch: 'main',
    // don't push to origin unless explicitly set
    pushToOrigin: pushToOrigin === 'true',
    // prerelease suffix, if any
    preReleaseSuffix: preReleaseSuffix,
    // make sure that following dependencies are up to date
    dependencyList: [
        'http-reasons', 'liquid-json', 'mime-format', 'postman-url-encoder'
    ]
}).then((version) => {
    console.info('🚀', version);
}).catch((err) => {
    console.error('🔥', err);
    process.exit(1);
});
