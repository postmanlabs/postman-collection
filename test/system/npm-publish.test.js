const expect = require('chai').expect,
    // eslint-disable-next-line security/detect-child-process
    exec = require('child_process').execSync;

describe('npm publish', function () {
    const packageInfo = JSON.parse(exec('npm pack --dry-run --json'))[0],
        packagedFiles = packageInfo.files.map(({ path }) => { return path; });

    it('should have a valid package name', function () {
        expect(packageInfo.name).to.equal('postman-collection');
    });

    it('should not publish unnecessary files', function () {
        const allowedFiles = ['index.js', 'package.json', 'LICENSE.md', 'README.md', 'CHANGELOG.yaml'];

        packagedFiles.forEach(function (path) {
            expect(allowedFiles.includes(path) ||
                path.startsWith('lib/') ||
                path.startsWith('types/')).to.be.true;
        });
    });
});
