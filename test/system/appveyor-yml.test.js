var fs = require('fs'),
    yaml = require('js-yaml');

describe('.appveyor.yml', function () {
    var appveyorYAML,
        appveyorYAMLError;

    try {
        appveyorYAML = yaml.safeLoad(fs.readFileSync('.appveyor.yml').toString());
    }
    catch (e) {
        appveyorYAMLError = e;
    }

    it('should exist', function (done) {
        fs.stat('.appveyor.yml', done);
    });

    it('should be a valid yml', function () {
        expect(appveyorYAMLError && appveyorYAMLError.message || appveyorYAMLError).to.be.undefined;
    });

    describe('structure', function () {
        it('should have an init script', function () {
            expect(appveyorYAML).to.have.property('init').that.eql(['git config --global core.autocrlf input']);
        });

        it('should match the Travis environment matrix', function () {
            var travisYAML,
                travisYAMLError,
                appveyorNodeVersions = appveyorYAML.environment.matrix.map(function (member) {
                    return member.nodejs_version;
                });

            try {
                travisYAML = yaml.safeLoad(fs.readFileSync('.travis.yml').toString());
            }
            catch (e) {
                travisYAMLError = e;
            }

            !travisYAMLError && expect(travisYAML.node_js).to.eql(appveyorNodeVersions);
        });

        it('should have correct install scripts', function () {
            expect(appveyorYAML).to.have.property('install').that.eql([
                {
                    ps: 'Install-Product node $env:nodejs_version'
                },
                'npm cache clean --force',
                'appveyor-retry npm install'
            ]);
        });

        it('should have the MS build script and deploy to be turned off', function () {
            expect(appveyorYAML).to.include.keys({
                build: 'off',
                deploy: 'off'
            });
        });

        it('should have notifications configured correctly', function () {
            expect(appveyorYAML).to.have.property('notifications').that.eql([{
                incoming_webhook: {
                    // eslint-disable-next-line max-len
                    secure: 'PRDZ1nhG/cQrwMgCLXsWvTDJtYxv78GJrSlVYpMzpUploVWDzBlpMqmFr9WxZQkY/lxsqCSpGX4zgTYzlte1WMWnghqTIFE8u7svlXHa/tk='
                },
                provider: 'Slack'
            }]);
        });
    });
});
