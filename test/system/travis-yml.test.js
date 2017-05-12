/* global describe, it */
/* eslint-env node, es6 */
var expect = require('expect.js');

describe('travis.yml', function () {
    var fs = require('fs'),
        yaml = require('js-yaml'),
        travisYAML,
        travisYAMLError;

    try {
        travisYAML = yaml.safeLoad(fs.readFileSync('.travis.yml').toString());
    }
    catch (e) {
        travisYAMLError = e;
    }

    it('must exist', function (done) {
        fs.stat('.travis.yml', done);
    });

    it('must be a valid yml', function () {
        expect(travisYAMLError && travisYAMLError.message || travisYAMLError).to.not.be.ok();
    });

    describe('structure', function () {
        it('should use the trusty Ubuntu distribution', function () {
            expect(travisYAML.dist).to.be('trusty');
        });

        it('language must be set to node', function () {
            expect(travisYAML.language).to.be('node_js');
            expect(travisYAML.node_js).to.eql(['4', '6']);
        });

        it('should have a valid before_install sequence', function () {
            expect(travisYAML.before_install).to.have.property(0, 'export CHROME_BIN=google-chrome');
            expect(travisYAML.before_install).to.have.property(1, 'export DISPLAY=:99.0');
            expect(travisYAML.before_install).to.have.property(2, 'sh -e /etc/init.d/xvfb start');
            expect(travisYAML.before_install).to.have.property(3, 'sleep 3');
        });

        it('should use the stable google chrome package', function () {
            expect(travisYAML.addons).to.eql({ apt: { packages: ['google-chrome-stable'] } });
        });
    });
});
