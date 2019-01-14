var expect = require('chai').expect,
    SshAuth = require('./../../lib/collection/ssh-auth').SshAuth,
    E = '',
    DEFAULT_SSH_PORT = 22,

    authConfig = {
        host: '127.0.0.1',
        port: 23,
        username: 'ubuntu',
        password: 'someSecurepass',
        privateKeyPath: './path/to/keyFile'
    };

describe('SSH Auth', function () {
    describe('sanity', function () {
        it('should initialize the values to their defaults', function () {
            var ssha = new SshAuth();

            expect(ssha).to.deep.include({
                host: undefined,
                port: DEFAULT_SSH_PORT,
                username: E,
                password: E,
                privateKeyPath: E,
                passPhrase: E
            });
        });

        it('should prepopulate the values when pass through the constructor', function () {
            var ssha = new SshAuth(authConfig);

            expect(ssha).to.deep.include(authConfig);
        });
    });

    describe('toJSON', function () {
        it('should retain properties from original json', function () {
            var ssha = new SshAuth(authConfig),
                serialisedConfig = ssha.toJSON();

            expect(serialisedConfig).to.deep.include(authConfig);
        });
    });

    describe('isSshAuth', function () {
        it('should correctly identify SshAuth objects', function () {
            var ssha = new SshAuth(authConfig);

            expect(SshAuth.isSshAuth(ssha)).to.be.true;
        });

        it('correctly identify non SshAuth objects', function () {
            expect(SshAuth.isSshAuth({})).to.be.false;
        });

        it('should return false when called without arguments', function () {
            expect(SshAuth.isSshAuth()).to.be.false;
        });
    });
});
