var fs = require('fs'),
    yaml = require('js-yaml');

describe('travis.yml', function () {
    var travisYAML,
        travisYAMLError;

    try {
        travisYAML = yaml.safeLoad(fs.readFileSync('.travis.yml').toString());
    }
    catch (e) {
        travisYAMLError = e;
    }

    it('should exist', function (done) {
        fs.stat('.travis.yml', done);
    });

    it('should be a valid yml', function () {
        expect(travisYAMLError && travisYAMLError.message || travisYAMLError).to.be.undefined;
    });

    describe('strucure', function () {
        it('should use the trusty Ubuntu distribution', function () {
            expect(travisYAML).to.have.property('dist').that.equal('trusty');
        });

        it('should have the language set to node', function () {
            expect(travisYAML).to.have.property('language').that.equal('node_js');
            expect(travisYAML).to.have.property('node_js').that.eql(['4', '6', '8']);
        });

        it('should have a valid before_install sequence', function () {
            expect(travisYAML).to.have.property('before_install').that.include.ordered.members([
                'export CHROME_BIN=google-chrome', 'export DISPLAY=:99.0', 'sh -e /etc/init.d/xvfb start', 'sleep 3'
            ]);
        });

        it('should use the stable google chrome package', function () {
            expect(travisYAML).to.have.property('addons').that.eql({ apt: { packages: ['google-chrome-stable'] } });
        });
    });
});
