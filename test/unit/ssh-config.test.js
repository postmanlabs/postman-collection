var expect = require('chai').expect,
    SshConfig = require('./../../lib/collection/ssh-config').SshConfig,

    E = '',
    DEFAULT_SSH_PORT = 22,
    DEFAULT_SSH_FORWARD_PORT = 22,
    DEFAULT_KEEP_ALIVE_INTERVAL = 0,
    DEFAULT_KEEP_ALIVE_COUNT_MAX = 3,
    DEFAULT_SSH_TIMEOUT = 20000,

    rawSshConfig = {
        enablePortForwarding: true,
        forwardPort: 3128,
        auth: {
            host: '127.0.0.1',
            port: 23,
            username: 'ubuntu',
            password: 'someSecurepass',
            privateKeyPath: './path/to/keyFile'
        },
        keepAliveInterval: 21000,
        keepAliveCountMax: 4,
        readyTimeOut: 1
    };

describe('SSH Config', function () {
    describe('sanity', function () {
        it('should initialize the values to their defaults', function () {
            var sshc = new SshConfig();

            expect(sshc).to.deep.include({
                enablePortForwarding: false,
                forwardPort: DEFAULT_SSH_FORWARD_PORT,
                keepAliveInterval: DEFAULT_KEEP_ALIVE_INTERVAL,
                keepAliveCountMax: DEFAULT_KEEP_ALIVE_COUNT_MAX,
                readyTimeOut: DEFAULT_SSH_TIMEOUT
            });

            expect(sshc.auth).to.deep.include({
                host: undefined,
                port: DEFAULT_SSH_PORT,
                username: E,
                password: E,
                privateKeyPath: E,
                passPhrase: E
            });
        });

        it('should prepopulate the values when pass through the constructor', function () {
            var sshc = new SshConfig(rawSshConfig);

            expect(sshc).to.deep.include({
                enablePortForwarding: true,
                forwardPort: 3128,
                keepAliveInterval: 21000,
                keepAliveCountMax: 4,
                readyTimeOut: 1
            });

            expect(sshc.auth).to.deep.include({
                host: '127.0.0.1',
                port: 23,
                username: 'ubuntu',
                password: 'someSecurepass',
                privateKeyPath: './path/to/keyFile'
            });
        });
    });

    describe('toJSON', function () {
        it('should retain properties from original json', function () {
            var sshc = new SshConfig(rawSshConfig),
                serialisedConfig = sshc.toJSON();

            expect(serialisedConfig.auth).to.deep.include(rawSshConfig.auth);
            expect(serialisedConfig).to.deep.include({
                enablePortForwarding: true,
                forwardPort: 3128,
                keepAliveInterval: 21000,
                keepAliveCountMax: 4,
                readyTimeOut: 1
            });

        });
    });

    describe('isSshConfig', function () {
        it('should correctly identify SshConfig objects', function () {
            var sshc = new SshConfig(rawSshConfig);

            expect(SshConfig.isSshConfig(sshc)).to.be.true;
        });

        it('correctly identify non SshConfig objects', function () {
            expect(SshConfig.isSshConfig({})).to.be.false;
        });

        it('should return false when called without arguments', function () {
            expect(SshConfig.isSshConfig()).to.be.false;
        });
    });
});
