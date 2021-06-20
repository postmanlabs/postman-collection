var expect = require('chai').expect,
    ProxyConfigList = require('../../').ProxyConfigList,
    Url = require('../../').Url;

describe('Proxy Config List', function () {
    describe('sanity', function () {
        it('Assigns, <all_urls> as match pattern and resolves any url provided', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve('http://www.google.com/').host).to.eql('proxy.com');
            expect(list.resolve('http://example.org/foo/bar.html').host).to.eql('proxy.com');
        });

        it('Assigns, <all_urls> as match pattern and respect the disabled prop in the congfig', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { host: 'proxy.com', tunnel: true, disabled: true }
                    ]);

            expect(list.resolve('foo://www.foo/bar')).to.be.undefined;
        });

        it('Do not matches URLs that does not have any valid protocol', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: '://*/*', host: 'proxy.com' }
                    ]);

            expect(list.resolve('example.org')).to.be.undefined;
            expect(list.resolve('http://example.org')).to.be.undefined;

            list = new ProxyConfigList(parent,
                [
                    { match: 'http://*/*', host: 'proxy.com' }
                ]);
            expect(list.resolve('foo://example.org')).to.be.undefined;
        });

        it('Matches only the URLs that uses the https protocol', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'https://*/*', host: 'proxy.com' }
                    ]);

            expect(list.resolve('https://www.google.com/').host).to.eql('proxy.com');
            expect(list.resolve('https://example.org/foo/bar.html').host).to.eql('proxy.com');
            expect(list.resolve('http://example.org/foo/bar.html')).to.be.undefined;
        });

        it('Matches any URL that uses the http or https protocol', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http+https://*/*', host: 'proxy.com' }
                    ]);

            expect(list.resolve('http://www.google.com/').host).to.eql('proxy.com');
            expect(list.resolve('https://example.org/foo/bar.html').host).to.eql('proxy.com');
        });

        it('Matches any URL using the http protocol, on any host, as long as the path starts with /foo', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*/foo*', host: 'proxy.com' }
                    ]);

            expect(list.resolve('http://example.com/foo/bar.html').host).to.eql('proxy.com');
            expect(list.resolve('http://www.google.com/foo').host).to.eql('proxy.com');
        });

        it('Matches any URL that uses the https protocol, is on a google.com host', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'https://*.google.com/foo*bar', host: 'proxy.com' }
                    ]);

            expect(list.resolve('https://www.google.com/foo/baz/bar').host).to.eql('proxy.com');
            expect(list.resolve('https://docs.google.com/foobar').host).to.eql('proxy.com');
            expect(list.resolve('http://docs.google.com/foobar')).to.be.undefined;
        });

        it('Matches the specified URL', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://example.org/foo/bar.html', host: 'proxy.com' }
                    ]);

            expect(list.resolve('http://example.org/foo/bar.html').host).to.eql('proxy.com');
        });

        it('Matches any URL that uses the http protocol and is on the host 127.0.0.1', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://127.0.0.1/*', host: 'proxy.com' }
                    ]);

            expect(list.resolve('http://127.0.0.1/').host).to.eql('proxy.com');
            expect(list.resolve('http://127.0.0.1/foo/bar.html').host).to.eql('proxy.com');
            expect(list.resolve('https://127.0.0.1/')).to.be.undefined;
        });

        it('Matches any URL that uses the http protocol and is on the host ends with 0.0.1', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*.0.0.1/', host: 'proxy.com' }
                    ]);

            expect(list.resolve('http://127.0.0.1/').host).to.eql('proxy.com');
            expect(list.resolve('http://125.0.0.1/').host).to.eql('proxy.com');
            expect(list.resolve('https://125.0.0.1/')).to.be.undefined;
        });

        it('Matches any URL which has host mail.google.com', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http+https://mail.google.com/*', host: 'proxy.com' }
                    ]);

            expect(list.resolve('http://mail.google.com/foo/baz/bar').host).to.eql('proxy.com');
            expect(list.resolve('https://mail.google.com/foobar').host).to.eql('proxy.com');
            expect(list.resolve('https://google.com/foobar')).to.be.undefined;
        });

        it('Bad Match pattern [No Path]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'www.google.com', host: 'proxy.com' }
                    ]);

            expect(list.resolve('http://www.google.com')).to.be.undefined;
        });

        it('Bad Match pattern ["*" in the host can be followed only by a "." or "/"]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: '*foo/bar', host: 'proxy.com' }
                    ]);

            expect(list.resolve('http://www.foo/bar')).to.be.undefined;
        });

        it('Bad Match pattern [If "*" is in the host, it must be the first character]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'foo.*.bar/baz', host: 'proxy.com' }
                    ]);

            expect(list.resolve('http://foo.z.bar/baz')).to.be.undefined;
        });

        it('Bad Match pattern [Missing protocol separator ("/" should be "//")]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http:/bar', host: 'proxy.com' }
                    ]);

            expect(list.resolve('http:/bar')).to.be.undefined;
        });

        it('Bad Match pattern [Invalid protocol]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'foo://www.foo.com/bar', host: 'proxy.com' }
                    ]);

            expect(list.resolve('foo://www.foo.com/bar')).to.be.undefined;
        });

        it('should not match if URL pattern matches in bypass list', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http+https://*/*', host: 'proxy.com', bypass: ['*://localhost/*'] }
                    ]);

            expect(list.resolve('http://localhost')).to.be.undefined;
            expect(list.resolve('http://foo.com').host).to.eql('proxy.com');
        });

        it('should lookup all the config list until one resolves', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http+https://*/*', host: 'proxy.com', bypass: ['*://localhost/*'] },
                        { match: 'http+https://*/*', host: 'localhost-proxy.com', bypass: ['*://foo.com/*'] }
                    ]);

            expect(list.resolve('http://localhost').host).to.eql('localhost-proxy.com');
            expect(list.resolve('http://foo.com').host).to.eql('proxy.com');
        });
    });

    describe('resolve', function () {
        it('Assigns, <all_urls> as match pattern and resolves any url provided', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve('http://www.google.com/').host).to.eql('proxy.com');
            expect(list.resolve('http://example.org/foo/bar.html').host).to.eql('proxy.com');
        });

        it('Matches any URL that uses the http protocol', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*/*', host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve('http://www.google.com/').host).to.eql('proxy.com');
            expect(list.resolve(new Url('http://example.org/foo/bar.html')).host).to.eql('proxy.com');
        });

        it('Matches any URL using the http protocol, on any host, as long as the path starts with /foo', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*/foo*', host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve('http://example.com/foo/bar.html').host).to.eql('proxy.com');
            expect(list.resolve('http://www.google.com/foo').host).to.eql('proxy.com');
        });

        it('Matches any URL that uses the https protocol, is on a google.com host', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*.google.com/foo*bar', host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve('http://www.google.com/foo/baz/bar').host).to.eql('proxy.com');
            expect(list.resolve('http://docs.google.com/foobar').host).to.eql('proxy.com');
        });

        it('Matches the specified URL', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://example.org/foo/bar.html', host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve('http://example.org/foo/bar.html').host).to.eql('proxy.com');
        });

        it('Matches any URL that uses the http protocol and is on the host 127.0.0.1', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://127.0.0.1/*', host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve('http://127.0.0.1/').host).to.eql('proxy.com');
            expect(list.resolve('http://127.0.0.1/foo/bar.html').host).to.eql('proxy.com');
        });

        it('Matches any URL that uses the http protocol and is on the host ends with 0.0.1', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*.0.0.1/', host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve('http://127.0.0.1/').host).to.eql('proxy.com');
            expect(list.resolve('http://125.0.0.1/').host).to.eql('proxy.com');
        });

        it('Matches any URL which has host mail.google.com', function () {
            var parent = {},
                list = new ProxyConfigList(parent, [{
                    match: '*://mail.google.com/*', host: 'proxy.com', protocols: ['http', 'https'], tunnel: true
                }]);

            expect(list.resolve('http://mail.google.com/foo/baz/bar').host).to.eql('proxy.com');
            expect(list.resolve('https://mail.google.com/foobar').host).to.eql('proxy.com');
        });

        it('Bad Match pattern [No Path]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://www.google.com', host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve('http://www.google.com')).to.be.undefined;
        });

        it('Bad Match pattern ["*" in the host can be followed only by a "." or "/"]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*foo/bar', host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve('http://www.foo/bar')).to.be.undefined;
        });

        it('Bad Match pattern [If "*" is in the host, it must be the first character]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://foo.*.bar/baz', host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve('http://foo.z.bar/baz')).to.be.undefined;
        });

        it('Bad Match pattern [Missing protocol separator ("/" should be "//")]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http:/bar', host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve('http:/bar')).to.be.undefined;
        });

        it('Bad Match pattern [Invalid protocol]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'foo://*', host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve('foo://www.foo/bar')).to.be.undefined;
        });

        it('Bad url for the match [Empty url]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'foo://*', host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve('')).to.be.undefined;
        });

        it('Bad url for the match [Non String url]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'foo://*', host: 'proxy.com', tunnel: true }
                    ]);

            expect(list.resolve({ remote: 'random remote' })).to.be.undefined;
        });
    });

    describe('isProxyConfigList', function () {
        it('Should return true for the ProxyConfigList constructor', function () {
            var list = new ProxyConfigList({}, []);

            expect(ProxyConfigList.isProxyConfigList(list)).to.be.true;
        });

        it('Should return false for the invalid ProxyConfigList', function () {
            var list = { _postman_propertyName: 'ProxyConfigList' };

            expect(ProxyConfigList.isProxyConfigList(list)).to.be.false;
        });

        it('should return false when called witohut arguments', function () {
            expect(ProxyConfigList.isProxyConfigList()).to.be.false;
        });
    });
});
