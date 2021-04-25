#!/usr/bin/env node
/* eslint-disable require-jsdoc */
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to publish coverage reports to Codecov.
//
// It verifies the Codecov's bash uploader checksum before execution.
// Usage: npm run codecov -- <bash uploader arguments>
// Refer: https://about.codecov.io/security-update/
// ---------------------------------------------------------------------------------------------------------------------

const https = require('https'),
    crypto = require('crypto'),
    promisify = require('util').promisify,

    // eslint-disable-next-line security/detect-child-process
    exec = promisify(require('child_process').exec),
    writeFile = promisify(require('fs').writeFile),

    chalk = require('chalk'),

    CODECOV_PATH = '.coverage/codecov.sh',
    BASH_UPLOADER_URL = 'https://codecov.io/bash',
    BASH_UPLOADER_BASE = 'https://raw.githubusercontent.com/codecov/codecov-bash';

function wget (url) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error('non-200 response'));
            }

            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(data);
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

function getVersion (script) {
    const match = script.match(/VERSION="([0-9.]*)"/);

    return match ? match[1] : null;
}

async function getPublicChecksum (version, encryption) {
    const url = `${BASH_UPLOADER_BASE}/${version}/SHA${encryption}SUM`,
        checksumResponse = await wget(url);

    // return codecov checksum only
    return checksumResponse.split('\n')[0];
}

function calculateChecksum (script, encryption) {
    const shasum = crypto.createHash(`sha${encryption}`);

    shasum.update(script);

    return `${shasum.digest('hex')}  codecov`;
}

async function validateScript (script) {
    const version = getVersion(script);

    if (!version) {
        throw new Error('Missing bash uploader version');
    }

    for (const encryption of [1, 256, 512]) {
        // eslint-disable-next-line no-await-in-loop
        const publicChecksum = await getPublicChecksum(version, encryption),
            uploaderChecksum = calculateChecksum(script, encryption);

        if (uploaderChecksum !== publicChecksum) {
            throw new Error(`SHA${encryption} checksum mismatch`);
        }
    }
}

module.exports = async function () {
    // banner line
    console.info(chalk.yellow.bold('Publishing coverage reports...'));

    const args = process.argv.slice(2),
        script = await wget(BASH_UPLOADER_URL);

    await validateScript(script);
    await writeFile(CODECOV_PATH, script);

    return exec(`bash ${CODECOV_PATH} ${args.join(' ')}`);
};

// ensure we run this script exports if this is a direct stdin.tty run
if (!module.parent) {
    module.exports()
        .then(({ stdout, stderr }) => {
            console.info(stdout);
            console.info(stderr);
        })
        .catch(({ message, stack, stdout, stderr }) => {
            console.error(stack || message);
            stdout && console.info(stdout);
            stderr && console.info(stderr);

            process.exit(1);
        });
}
