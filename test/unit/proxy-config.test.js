var expect = require('expect.js'),
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

            expect(p.match.pattern).to.be(DEFAULT_PATTERN);
            expect(p.tunnel).to.be(false);
            expect(p.host).to.be(DEFAULT_HOST);
            expect(p.port).to.be(DEFAULT_PORT);
        });

        it('should prepopulate the values when pass through the constructor', function () {
            var p = new ProxyConfig({
                match: 'http://*.google.com/foo*bar',
                host: 'proxy.com',
                port: 9090,
                tunnel: true,
                disabled: true
            });

            expect(p.match.pattern).to.be('http://*.google.com/foo*bar');
            expect(p.test('http://mail.google.com/foo/baz/bar')).to.be(true);
            expect(p.test('http://docs.google.com/foobar')).to.be(true);
            expect(p.getProtocols()).to.be.eql(['http']);
            expect(p.getProxyUrl()).to.be.eql('http://proxy.com:9090');
            expect(p.host).to.be('proxy.com');
            expect(p.tunnel).to.be(true);
            expect(p.disabled).to.be(true);
        });


        it('should prepopulate the values of match to * if it is not provided', function () {
            var p = new ProxyConfig({
                host: 'http://proxy.com'
            });

            expect(p.match.pattern).to.be(DEFAULT_PATTERN);
            expect(p.getProtocols()).to.be.eql(ALLOWED_PROTOCOLS);
            expect(p.getProxyUrl()).to.be.eql('http://proxy.com:8080');
            expect(p.host).to.be('proxy.com');
            expect(p.tunnel).to.be(false);
            expect(p.disabled).to.not.be.ok();
        });

        it('should update the properties', function () {
            var p1 = new ProxyConfig(),
                newMatch = 'https://google.com/*',
                newHost = 'new-host',
                newPort = 9090,
                p2 = new ProxyConfig({
                    match: newMatch,
                    host: newHost,
                    port: newPort,
                    tunnel: true
                });

            expect(p1.match.pattern).to.be(DEFAULT_PATTERN);
            expect(p1.host).to.be(DEFAULT_HOST);
            expect(p1.port).to.be(DEFAULT_PORT);
            expect(p1.tunnel).to.be(false);

            expect(p2.match.pattern).to.be(newMatch);
            expect(p2.host).to.be(newHost);
            expect(p2.port).to.be(newPort);
            expect(p2.tunnel).to.be(true);

            p1.update(p2);

            expect(p1.match.pattern).to.be(newMatch);
            expect(p1.host).to.be(newHost);
            expect(p1.port).to.be(newPort);
            expect(p1.tunnel).to.be(true);
        });

        it('should update the protocols alone after filtering for valid protocols and taking unique', function () {
            var p1 = new ProxyConfig(),
                protocols = ALLOWED_PROTOCOLS,
                newProtocols = 'http',
                newProtocolsAfterUpdate = ['http'];

            expect(p1.getProtocols()).to.be.eql(protocols);
            expect(p1.match.pattern).to.be.eql(DEFAULT_PATTERN);

            p1.updateProtocols(newProtocols);
            expect(p1.getProtocols()).to.be.eql(newProtocolsAfterUpdate);
            expect(p1.match.pattern).to.be.eql('http://*/*');

            p1 = new ProxyConfig({ match: 'https://google.com/*' });
            protocols = ['https'];
            newProtocols = ['https', 'foo', 'https', 'http'];
            newProtocolsAfterUpdate = ['http', 'https'];

            expect(p1.getProtocols()).to.be.eql(protocols);
            expect(p1.match.pattern).to.be.eql('https://google.com/*');

            p1.updateProtocols(newProtocols);
            expect(p1.getProtocols()).to.be.eql(newProtocolsAfterUpdate);
            expect(p1.match.pattern).to.be.eql('http+https://google.com/*');

            p1 = new ProxyConfig({ match: 'https://google.com/*' });
            protocols = ['https'];
            newProtocols = [];
            newProtocolsAfterUpdate = ['http', 'https'];

            expect(p1.getProtocols()).to.be.eql(protocols);
            expect(p1.match.pattern).to.be.eql('https://google.com/*');

            p1.updateProtocols(newProtocols);
            expect(p1.getProtocols()).to.be.eql(newProtocolsAfterUpdate);
            expect(p1.match.pattern).to.be.eql('http+https://google.com/*');
        });

        it('should ignore falsy protocols while updating', function () {
            var pc = new ProxyConfig({ host: 'proxy.com' });

            pc.updateProtocols(['http']);
            expect(pc.match.pattern).to.be('http://*/*');

            pc.updateProtocols();
            expect(pc.match.pattern).to.be('http://*/*');
        });

        it('should ignore falsy host-path combinations whilst updating', function () {
            var pc = new ProxyConfig({ host: 'proxy.com', tunnel: true });

            pc.match.pattern = 'http://';
            pc.updateProtocols(['https']);
            expect(pc.match.pattern).to.be('http://');
        });
    });

    describe('test', function () {
        it('should match all urls provided', function () {
            var pc = new ProxyConfig({ host: 'proxy.com', tunnel: true });
            expect(pc.test('http://www.google.com/')).to.eql(true);
            expect(pc.test('foo.bar.com/')).to.eql(true);
        });

        it('should match all sdk Url provided', function () {
            var pc = new ProxyConfig({ host: 'proxy.com', tunnel: true });
            expect(pc.test(new Url('http://www.google.com/'))).to.eql(true);
            expect(pc.test(new Url('http://foo.bar.com/'))).to.eql(true);
        });

        it('should parse any URL that uses the http protocol', function () {
            var pc = new ProxyConfig({ match: 'http://*/*', host: 'proxy.com' });
            expect(pc.test('http://www.google.com/')).to.eql(true);
            expect(pc.test('foo.bar.com/')).to.eql(true);
        });

        it('should parse any URL that uses the http protocol, on any host, with path starts with /foo', function () {
            var pc = new ProxyConfig({ match: 'http://*/foo*', host: 'proxy.com' });
            expect(pc.test('http://example.com/foo/bar.html')).to.eql(true);
            expect(pc.test('http://www.google.com/foo')).to.eql(true);
        });

        it('should parse any URL that uses the https protocol, is on a google.com host', function () {
            var pc = new ProxyConfig({ match: 'http://*.google.com/foo*bar', host: 'proxy.com' });
            expect(pc.test('http://www.google.com/foo/baz/bar')).to.eql(true);
            expect(pc.test('http://docs.google.com/foobar')).to.eql(true);
        });

        it('should parse any URL that uses the http protocol and is on the host 127.0.0.1', function () {
            var pc = new ProxyConfig({ match: 'http://127.0.0.1/*', host: 'proxy.com' });
            expect(pc.test('http://127.0.0.1/')).to.eql(true);
            expect(pc.test('http://127.0.0.1/foo/bar.html')).to.eql(true);
        });

        it('should parse any URL that uses the http protocol and is on the host ends with 0.0.1', function () {
            var pc = new ProxyConfig({ match: 'http://*.0.0.1/', host: 'proxy.com' });
            expect(pc.test('http://127.0.0.1/')).to.eql(true);
            expect(pc.test('http://125.0.0.1/')).to.eql(true);
        });

        it('should parse any URL which has host mail.google.com', function () {
            var pc = new ProxyConfig({ match: '*://mail.google.com/*', host: 'proxy.com' });
            expect(pc.test('http://mail.google.com/foo/baz/bar')).to.eql(true);
            expect(pc.test('https://mail.google.com/foobar')).to.eql(true);
        });

        it('Bad Match pattern [No Path]', function () {
            var pc = new ProxyConfig({ match: 'http://www.google.com', host: 'proxy.com' });
            expect(pc.test('http://www.google.com')).to.eql(false);
        });

        it('Bad Match pattern ["*" in the host can be followed only by a "." or "/"]', function () {
            var pc = new ProxyConfig({ match: 'http://*foo/bar', host: 'proxy.com' });
            expect(pc.test('http://*foo.com')).to.eql(false);
        });

        it('Bad Match pattern [If "*" is in the host, it must be the first character]', function () {
            var pc = new ProxyConfig({ match: 'http://foo.*.bar/baz', host: 'proxy.com' });
            expect(pc.test('http://foo.z.bar/baz')).to.eql(false);
        });

        it('Bad Match pattern [Missing protocol separator ("/" should be "//")]', function () {
            var pc = new ProxyConfig({ match: 'http:/bar', host: 'proxy.com' });
            expect(pc.test('http:/bar.com')).to.eql(false);
        });

        it('Bad Match pattern [Invalid protocol', function () {
            var pc = new ProxyConfig({ match: 'foo://*', host: 'proxy.com' });
            expect(pc.test('foo://www.google.com')).to.eql(false);
        });

        it('Disallows test string with protocol not http or https', function () {
            var pc = new ProxyConfig({ match: 'http://*', host: 'proxy.com' });
            expect(pc.test('foo://www.google.com')).to.eql(false);
            expect(pc.test('file://www.google.com')).to.eql(false);
        });

        it('Disallows any test string when match protocol is not http or https', function () {
            var pc = new ProxyConfig({ match: 'ftp://*', host: 'proxy.com' });
            expect(pc.test('foo://www.google.com')).to.eql(false);
            expect(pc.test('file://www.google.com')).to.eql(false);
            expect(pc.test('http://www.google.com')).to.eql(false);
            expect(pc.test('https://www.google.com')).to.eql(false);
        });

        it('should return all the protocols in the match pattern', function () {
            var pc = new ProxyConfig({ match: 'http+https+file+ftp://*/*' });
            expect(pc.getProtocols()).to.eql(['http', 'https', 'file', 'ftp']);
        });
    });

    describe('toJSON', function () {
        it('should retain properties from original json', function () {
            var rawConfig = { match: 'http+https://*/*', host: 'proxy.com', tunnel: true, disabled: false },
                proxyConfig = new ProxyConfig(rawConfig),
                serialisedConfig = proxyConfig.toJSON();

            expect(serialisedConfig.match).to.eql({ pattern: rawConfig.match });
            expect(serialisedConfig.tunnel).to.eql(rawConfig.tunnel);
            expect(serialisedConfig.disabled).to.eql(rawConfig.disabled);
        });
    });

    describe('isProxyConfig', function () {
        it('should correctly identify ProxyConfig objects', function () {
            var rawConfig = { match: 'http://*/*', host: 'proxy.com', tunnel: true, disabled: false },
                proxyConfig = new ProxyConfig(rawConfig);

            expect(ProxyConfig.isProxyConfig(proxyConfig)).to.eql(true);
        });

        it('correctly identify non ProxyConfig objects', function () {
            expect(ProxyConfig.isProxyConfig({})).to.eql(false);
        });

        it('should return false when called without arguments', function () {
            expect(ProxyConfig.isProxyConfig()).to.eql(false);
        });
    });
});
