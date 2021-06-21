var expect = require('chai').expect,
    ProxyConfig = require('../../lib/index.js').ProxyConfig,
    Url = require('../../lib/index.js').Url,

    DEFAULT_HOST = '',
    DEFAULT_PORT = 8080,
    ALLOWED_PROTOCOLS = require('../../lib/collection/proxy-config').ALLOWED_PROTOCOLS,
    DEFAULT_PATTERN = require('../../lib/collection/proxy-config').DEFAULT_PATTERN;

describe('Proxy Config', function () {
    describe('sanity', function () {
        it('should initialize the values to their defaults', function () {
            var p = new ProxyConfig();

            expect(p.match).to.have.property('pattern', DEFAULT_PATTERN);
            expect(p).to.deep.include({
                tunnel: false,
                host: DEFAULT_HOST,
                port: DEFAULT_PORT
            });
        });

        it('should prepopulate the values when pass through the constructor', function () {
            var p = new ProxyConfig({
                match: 'http://*.google.com/foo*bar',
                host: 'proxy.com',
                port: 9090,
                tunnel: true,
                disabled: true
            });

            expect(p.match.pattern).to.equal('http://*.google.com/foo*bar');
            expect(p.test('http://mail.google.com/foo/baz/bar')).to.be.true;
            expect(p.test('http://docs.google.com/foobar')).to.be.true;
            expect(p.getProtocols()).to.eql(['http']);
            expect(p.getProxyUrl()).to.eql('http://proxy.com:9090');
            expect(p).to.deep.include({
                host: 'proxy.com',
                tunnel: true,
                disabled: true
            });
        });

        it('should prepopulate the values of match to * if it is not provided', function () {
            var p = new ProxyConfig({
                host: 'http://proxy.com'
            });

            expect(p.match.pattern).to.eql(DEFAULT_PATTERN);
            expect(p.getProtocols()).to.eql(ALLOWED_PROTOCOLS);
            expect(p.getProxyUrl()).to.eql('http://proxy.com:8080');
            expect(p.disabled).to.be.undefined;
            expect(p).to.deep.include({
                host: 'proxy.com',
                tunnel: false
            });
        });

        it('should update the properties', function () {
            var p1 = new ProxyConfig(),
                newMatch = 'https://google.com/*',
                newHost = 'new-host',
                newPort = 9090,
                newUsername = 'user',
                newPassword = 'pass',
                p2 = new ProxyConfig({
                    match: newMatch,
                    host: newHost,
                    port: newPort,
                    tunnel: true,
                    bypass: ['http://localhost/*'],
                    authenticate: true,
                    username: newUsername,
                    password: newPassword
                });

            expect(p1.match.pattern).to.equal(DEFAULT_PATTERN);
            expect(p1).to.deep.include({
                host: DEFAULT_HOST,
                port: DEFAULT_PORT,
                bypass: undefined,
                authenticate: false,
                username: undefined,
                password: undefined,
                tunnel: false
            });

            expect(p2.match.pattern).to.equal(newMatch);
            expect(p2.bypass.members[0]).to.deep.include({ pattern: 'http://localhost/*' });
            expect(p2).to.deep.include({
                host: newHost,
                port: newPort,
                authenticate: true,
                username: 'user',
                password: 'pass',
                tunnel: true
            });

            p1.update(p2);

            expect(p1.match.pattern).to.equal(newMatch);
            expect(p1.bypass.members[0]).to.deep.include({ pattern: 'http://localhost/*' });
            expect(p1).to.deep.include({
                host: newHost,
                port: newPort,
                tunnel: true
            });
        });

        it('should update the protocols alone after filtering for valid protocols and taking unique', function () {
            var p1 = new ProxyConfig(),
                protocols = ALLOWED_PROTOCOLS,
                newProtocols = 'http',
                newProtocolsAfterUpdate = ['http'];

            expect(p1.getProtocols()).to.eql(protocols);
            expect(p1.match.pattern).to.eql(DEFAULT_PATTERN);

            p1.updateProtocols(newProtocols);
            expect(p1.getProtocols()).to.eql(newProtocolsAfterUpdate);
            expect(p1.match.pattern).to.eql('http://*:*/*');

            p1 = new ProxyConfig({ match: 'https://google.com/*' });
            protocols = ['https'];
            newProtocols = ['https', 'foo', 'https', 'http'];
            newProtocolsAfterUpdate = ['http', 'https'];

            expect(p1.getProtocols()).to.eql(protocols);
            expect(p1.match.pattern).to.eql('https://google.com/*');

            p1.updateProtocols(newProtocols);
            expect(p1.getProtocols()).to.eql(newProtocolsAfterUpdate);
            expect(p1.match.pattern).to.eql('http+https://google.com/*');

            p1 = new ProxyConfig({ match: 'https://google.com/*' });
            protocols = ['https'];
            newProtocols = [];
            newProtocolsAfterUpdate = ['http', 'https'];

            expect(p1.getProtocols()).to.eql(protocols);
            expect(p1.match.pattern).to.eql('https://google.com/*');

            p1.updateProtocols(newProtocols);
            expect(p1.getProtocols()).to.eql(newProtocolsAfterUpdate);
            expect(p1.match.pattern).to.eql('http+https://google.com/*');
        });

        it('should ignore falsy protocols while updating', function () {
            var pc = new ProxyConfig({ host: 'proxy.com' });

            pc.updateProtocols(['http']);
            expect(pc.match.pattern).to.equal('http://*:*/*');

            pc.updateProtocols();
            expect(pc.match.pattern).to.equal('http://*:*/*');
        });

        it('should ignore falsy host-path combinations whilst updating', function () {
            var pc = new ProxyConfig({ host: 'proxy.com', tunnel: true });

            pc.match.pattern = 'http://';
            pc.updateProtocols(['https']);
            expect(pc.match.pattern).to.equal('http://');
        });

        it('should handle proxy authentication correctly', function () {
            var p = new ProxyConfig({
                match: 'http://*.google.com/foo*bar',
                host: 'proxy.com',
                port: 9090,
                authenticate: true,
                username: 'user',
                password: 'pass'
            });

            expect(p.getProxyUrl()).to.eql('http://user:pass@proxy.com:9090');
        });
    });

    describe('test', function () {
        it('should match all urls provided', function () {
            var pc = new ProxyConfig({ host: 'proxy.com', tunnel: true });

            expect(pc.test('http://www.google.com/')).to.be.true;
            expect(pc.test('http://www.google.com:80/')).to.be.true;
            expect(pc.test('http://www.google.com:3000/')).to.be.true;
            expect(pc.test('https://www.google.com/')).to.be.true;
            expect(pc.test('https://www.google.com:80/')).to.be.true;
            expect(pc.test('https://www.google.com:3000/')).to.be.true;
            expect(pc.test('foo.bar.com/')).to.be.true;
            expect(pc.test('foo.bar.com:80/')).to.be.true;
            expect(pc.test('foo.bar.com:3000/')).to.be.true;
        });

        it('should match all sdk Url provided', function () {
            var pc = new ProxyConfig({ host: 'proxy.com', tunnel: true });

            expect(pc.test(new Url('http://www.google.com/'))).to.be.true;
            expect(pc.test(new Url('http://foo.bar.com/'))).to.be.true;
        });

        it('should not match if URL pattern matches in bypass list', function () {
            var pc = new ProxyConfig({ host: 'proxy.com', bypass: ['http://localhost/*', '*://*/no-proxy'] });

            expect(pc.test('http://localhost')).to.be.false;
            expect(pc.test('http://localhost/proxy')).to.be.false;
            expect(pc.test('https://localhost')).to.be.true;
            expect(pc.test('https://localhost/no-proxy')).to.be.false;
            expect(pc.test('http://www.google.com/')).to.be.true;
            expect(pc.test('http://www.google.com/no-proxy')).to.be.false;
        });

        it('should parse any URL that uses the http protocol', function () {
            var pc = new ProxyConfig({ match: 'http://*:*/*', host: 'proxy.com' });

            expect(pc.test('http://www.google.com/')).to.be.true;
            expect(pc.test('http://www.google.com:80/')).to.be.true;
            expect(pc.test('http://www.google.com:3000/')).to.be.true;
            expect(pc.test('foo.bar.com/')).to.be.true;
            expect(pc.test('foo.bar.com:80/')).to.be.true;
            expect(pc.test('foo.bar.com:3000/')).to.be.true;
        });

        it('should parse any URL that uses the http protocol, on any host, with path starts with /foo', function () {
            var pc = new ProxyConfig({ match: 'http://*:*/foo*', host: 'proxy.com' });

            expect(pc.test('http://example.com/foo/bar.html')).to.be.true;
            expect(pc.test('http://www.google.com/foo')).to.be.true;
            expect(pc.test('http://www.google.com:80/foo')).to.be.true;
            expect(pc.test('http://www.google.com:3000/foo')).to.be.true;
            expect(pc.test('foo.bar.com/foo/bar.html')).to.be.true;
            expect(pc.test('foo.bar.com:80/foo/bar.html')).to.be.true;
            expect(pc.test('foo.bar.com:3000/foo/bar.html')).to.be.true;
        });

        it('should parse any URL that uses the https protocol, is on a google.com host', function () {
            var pc = new ProxyConfig({ match: 'http://*.google.com/foo*bar', host: 'proxy.com' });

            expect(pc.test('http://www.google.com/foo/baz/bar')).to.be.true;
            expect(pc.test('http://docs.google.com/foobar')).to.be.true;
        });

        it('should parse any URL that uses the http protocol and is on the host 127.0.0.1', function () {
            var pc = new ProxyConfig({ match: 'http://127.0.0.1/*', host: 'proxy.com' });

            expect(pc.test('http://127.0.0.1/')).to.be.true;
            expect(pc.test('http://127.0.0.1/foo/bar.html')).to.be.true;
        });

        it('should parse any URL that uses the http protocol and is on the host ends with 0.0.1', function () {
            var pc = new ProxyConfig({ match: 'http://*.0.0.1/', host: 'proxy.com' });

            expect(pc.test('http://127.0.0.1/')).to.be.true;
            expect(pc.test('http://125.0.0.1/')).to.be.true;
        });

        it('should parse any URL which has host mail.google.com', function () {
            var pc = new ProxyConfig({ match: '*://mail.google.com/*', host: 'proxy.com' });

            expect(pc.test('http://mail.google.com/foo/baz/bar')).to.be.true;
            expect(pc.test('https://mail.google.com/foobar')).to.be.true;
        });

        it('Bad Match pattern [No Path]', function () {
            var pc = new ProxyConfig({ match: 'http://www.google.com', host: 'proxy.com' });

            expect(pc.test('http://www.google.com')).to.be.false;
        });

        it('Bad Match pattern ["*" in the host can be followed only by a "." or "/"]', function () {
            var pc = new ProxyConfig({ match: 'http://*foo/bar', host: 'proxy.com' });

            expect(pc.test('http://*foo.com')).to.be.false;
        });

        it('Bad Match pattern [If "*" is in the host, it must be the first character]', function () {
            var pc = new ProxyConfig({ match: 'http://foo.*.bar/baz', host: 'proxy.com' });

            expect(pc.test('http://foo.z.bar/baz')).to.be.false;
        });

        it('Bad Match pattern [Missing protocol separator ("/" should be "//")]', function () {
            var pc = new ProxyConfig({ match: 'http:/bar', host: 'proxy.com' });

            expect(pc.test('http:/bar.com')).to.be.false;
        });

        it('Bad Match pattern [Invalid protocol', function () {
            var pc = new ProxyConfig({ match: 'foo://*', host: 'proxy.com' });

            expect(pc.test('foo://www.google.com')).to.be.false;
        });

        it('Disallows test string with protocol not http or https', function () {
            var pc = new ProxyConfig({ match: 'http://*', host: 'proxy.com' });

            expect(pc.test('foo://www.google.com')).to.be.false;
            expect(pc.test('file://www.google.com')).to.be.false;
        });

        it('Disallows any test string when match protocol is not http or https', function () {
            var pc = new ProxyConfig({ match: 'ftp://*', host: 'proxy.com' });

            expect(pc.test('foo://www.google.com')).to.be.false;
            expect(pc.test('file://www.google.com')).to.be.false;
            expect(pc.test('http://www.google.com')).to.be.false;
            expect(pc.test('https://www.google.com')).to.be.false;
        });

        it('should return all the protocols in the match pattern', function () {
            var pc = new ProxyConfig({ match: 'http+https+file+ftp://*/*' });

            expect(pc.getProtocols()).to.eql(['http', 'https', 'file', 'ftp']);
        });
    });

    describe('toJSON', function () {
        it('should retain properties from original json', function () {
            var rawConfig = {
                    match: 'http+https://*/*',
                    host: 'proxy.com',
                    tunnel: true,
                    disabled: false,
                    authenticate: true,
                    username: 'user',
                    password: 'pass',
                    bypass: ['http://127.0.0.1', 'http+https://localhost/*']
                },
                proxyConfig = new ProxyConfig(rawConfig),
                serialisedConfig = proxyConfig.toJSON();

            expect(serialisedConfig).to.deep.include({
                match: {
                    pattern: rawConfig.match
                },
                bypass: [
                    { pattern: 'http://127.0.0.1' },
                    { pattern: 'http+https://localhost/*' }
                ],
                tunnel: rawConfig.tunnel,
                disabled: rawConfig.disabled,
                authenticate: rawConfig.authenticate,
                username: rawConfig.username,
                password: rawConfig.password
            });
        });
    });

    describe('isProxyConfig', function () {
        it('should correctly identify ProxyConfig objects', function () {
            var rawConfig = { match: 'http://*/*', host: 'proxy.com', tunnel: true, disabled: false },
                proxyConfig = new ProxyConfig(rawConfig);

            expect(ProxyConfig.isProxyConfig(proxyConfig)).to.be.true;
        });

        it('correctly identify non ProxyConfig objects', function () {
            expect(ProxyConfig.isProxyConfig({})).to.be.false;
        });

        it('should return false when called without arguments', function () {
            expect(ProxyConfig.isProxyConfig()).to.be.false;
        });
    });

    describe('getProxyUrl', function () {
        it('should escape special characters in auth params', function () {
            var proxyConfig = new ProxyConfig({
                match: 'http+https://*/*',
                host: 'proxy.com',
                port: 9090,
                authenticate: true,
                username: '#@?:',
                password: '#@?:'
            });

            expect(proxyConfig.getProxyUrl()).to.eql('http://%23%40%3F%3A:%23%40%3F%3A@proxy.com:9090');
        });

        it('should handle empty username', function () {
            var proxyConfig = new ProxyConfig({
                match: 'http+https://*/*',
                host: 'proxy.com',
                port: 9090,
                authenticate: true,
                password: 'password'
            });

            expect(proxyConfig.getProxyUrl()).to.eql('http://:password@proxy.com:9090');
        });

        it('should handle empty password', function () {
            var proxyConfig = new ProxyConfig({
                match: 'http+https://*/*',
                host: 'proxy.com',
                port: 9090,
                authenticate: true,
                username: 'user'
            });

            expect(proxyConfig.getProxyUrl()).to.eql('http://user@proxy.com:9090');
        });

        it('should handle empty username and password with authenticate=true', function () {
            var proxyConfig = new ProxyConfig({
                match: 'http+https://*/*',
                host: 'proxy.com',
                port: 9090,
                authenticate: true
            });

            expect(proxyConfig.getProxyUrl()).to.eql('http://proxy.com:9090');
        });
    });
});
