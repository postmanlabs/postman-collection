var expect = require('expect.js'),
    ProxyConfig = require('../../lib/index.js').ProxyConfig,
    Url = require('../../lib/index.js').Url;

describe('Proxy Config', function () {
    describe('sanity', function () {
        it('should initialize the values to their defaults', function () {
            var p = new ProxyConfig();

            expect(p.match.pattern).to.be('<all_urls>');
            expect(p.tunnel).to.be(false);
        });

        it('should prepopulate the values when pass through the constructor', function () {
            var p = new ProxyConfig({
                match: 'http://example.com',
                server: 'http://proxy.com',
                tunnel: true,
                disabled: true
            });

            expect(p.match.pattern).to.be('http://example.com');
            expect(p.server.protocol).to.be('http');
            expect(p.server.getHost()).to.be('proxy.com');
            expect(p.tunnel).to.be(true);
            expect(p.disabled).to.be(true);
        });


        it('should prepopulate the values of match to * if it is not provided', function () {
            var p = new ProxyConfig({
                server: 'http://proxy.com'
            });

            expect(p.match.pattern).to.be('<all_urls>');
        });
    });

    describe('test', function () {
        it('should match all urls provided', function () {
            var pc = new ProxyConfig({ server: 'https://proxy.com/', tunnel: true });
            expect(pc.test('http://www.google.com/')).to.eql(true);
            expect(pc.test('http://foo.bar.com/')).to.eql(true);
        });

        it('should match all sdk Url provided', function () {
            var pc = new ProxyConfig({ server: 'https://proxy.com/', tunnel: true });
            expect(pc.test(new Url('http://www.google.com/'))).to.eql(true);
            expect(pc.test(new Url('http://foo.bar.com/'))).to.eql(true);
        });

        it('should parse any URL that uses the http protocol', function () {
            var pc = new ProxyConfig({ match: 'http://*/*', server: 'https://proxy.com/' });
            expect(pc.test('http://www.google.com/')).to.eql(true);
            expect(pc.test('http://foo.bar.com/')).to.eql(true);
        });

        it('should parse any URL that uses the http protocol, on any host, with path starts with /foo', function () {
            var pc = new ProxyConfig({ match: 'http://*/foo*', server: 'https://proxy.com/' });
            expect(pc.test('http://example.com/foo/bar.html')).to.eql(true);
            expect(pc.test('http://www.google.com/foo')).to.eql(true);
        });

        it('should parse any URL that uses the https protocol, is on a google.com host', function () {
            var pc = new ProxyConfig({ match: 'http://*.google.com/foo*bar', server: 'https://proxy.com/' });
            expect(pc.test('http://www.google.com/foo/baz/bar')).to.eql(true);
            expect(pc.test('http://docs.google.com/foobar')).to.eql(true);
        });

        it('should parse any URL that uses the http protocol and is on the host 127.0.0.1', function () {
            var pc = new ProxyConfig({ match: 'http://127.0.0.1/*', server: 'https://proxy.com/' });
            expect(pc.test('http://127.0.0.1/')).to.eql(true);
            expect(pc.test('http://127.0.0.1/foo/bar.html')).to.eql(true);
        });

        it('should parse any URL that uses the http protocol and is on the host ends with 0.0.1', function () {
            var pc = new ProxyConfig({ match: 'http://*.0.0.1/', server: 'https://proxy.com/' });
            expect(pc.test('http://127.0.0.1/')).to.eql(true);
            expect(pc.test('http://125.0.0.1/')).to.eql(true);
        });

        it('should parse any URL which has host mail.google.com', function () {
            var pc = new ProxyConfig({ match: '*://mail.google.com/*', server: 'https://proxy.com/' });
            expect(pc.test('http://mail.google.com/foo/baz/bar')).to.eql(true);
            expect(pc.test('https://mail.google.com/foobar')).to.eql(true);
        });

        it('Bad Match pattern [No Path]', function () {
            var pc = new ProxyConfig({ match: 'http://www.google.com', server: 'https://proxy.com/' });
            expect(pc.test('http://www.google.com')).to.eql(false);
        });

        it('Bad Match pattern ["*" in the host can be followed only by a "." or "/"]', function () {
            var pc = new ProxyConfig({ match: 'http://*foo/bar', server: 'https://proxy.com/' });
            expect(pc.test('http://*foo.com')).to.eql(false);
        });

        it('Bad Match pattern [If "*" is in the host, it must be the first character]', function () {
            var pc = new ProxyConfig({ match: 'http://foo.*.bar/baz', server: 'https://proxy.com/' });
            expect(pc.test('http://foo.z.bar/baz')).to.eql(false);
        });

        it('Bad Match pattern [Missing protocol separator ("/" should be "//")]', function () {
            var pc = new ProxyConfig({ match: 'http:/bar', server: 'https://proxy.com/' });
            expect(pc.test('http:/bar.com')).to.eql(false);
        });

        it('Bad Match pattern [Invalid protocol', function () {
            var pc = new ProxyConfig({ match: 'foo://*', server: 'https://proxy.com/' });
            expect(pc.test('foo://www.google.com')).to.eql(false);
        });

        it('Disallows test string with protocol not http or https', function () {
            var pc = new ProxyConfig({ match: 'http://*', server: 'https://proxy.com/' });
            expect(pc.test('foo://www.google.com')).to.eql(false);
            expect(pc.test('file://www.google.com')).to.eql(false);
        });

        it('Disallows any test string when match protocol is not http or https', function () {
            var pc = new ProxyConfig({ match: 'ftp://*', server: 'https://proxy.com/' });
            expect(pc.test('foo://www.google.com')).to.eql(false);
            expect(pc.test('file://www.google.com')).to.eql(false);
            expect(pc.test('http://www.google.com')).to.eql(false);
            expect(pc.test('https://www.google.com')).to.eql(false);
        });
    });

    describe('toJSON', function() {
        it('should retain properties from original json', function() {
            var rawConfig = { match: 'http://*/*', server: 'https://proxy.com/', tunnel: true, disabled: false },
                proxyConfig = new ProxyConfig(rawConfig),
                serialisedConfig = proxyConfig.toJSON();

            expect(serialisedConfig.match).to.eql({ pattern: rawConfig.match });
            expect(serialisedConfig.tunnel).to.eql(rawConfig.tunnel);
            expect(serialisedConfig.disabled).to.eql(rawConfig.disabled);
        });
    });

    describe('isProxyConfig', function() {
        it('should correctly identify ProxyConfig objects', function() {
            var rawConfig = { match: 'http://*/*', server: 'https://proxy.com/', tunnel: true, disabled: false },
                proxyConfig = new ProxyConfig(rawConfig);

            expect(ProxyConfig.isProxyConfig(proxyConfig)).to.eql(true);
        });

        it('correctly identify non ProxyConfig objects', function() {
            expect(ProxyConfig.isProxyConfig({})).to.eql(false);
        });

        it('should return false when called without arguments', function() {
            expect(ProxyConfig.isProxyConfig()).to.eql(false);
        });
    });
});
