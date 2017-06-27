var expect = require('expect.js'),
    ProxyConfigList = require('../../').ProxyConfigList,
    Url = require('../../').Url;

/* global describe, it */
describe('Proxy Config List', function () {
    describe('sanity', function () {
        it('Assigns, <all_urls> as match pattern and resolves any url provided', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://www.google.com/').server.getHost()).to.eql('proxy.com');
            expect(list.resolve('http://example.org/foo/bar.html').server.getHost()).to.eql('proxy.com');
        });

        it('Assigns, <all_urls> as match pattern and respect the disabled prop in the congfig', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { server: 'https://proxy.com/', tunnel: true, disabled: true }
                    ]
                );
            expect(list.resolve('foo://www.foo/bar')).to.eql(undefined);
        });

        it('Matches any URL that uses the http protocol', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*/*', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://www.google.com/').server.getHost()).to.eql('proxy.com');
            expect(list.resolve('http://example.org/foo/bar.html').server.getHost()).to.eql('proxy.com');
        });

        it('Matches any URL that uses the http protocol, on any host, as long as the path starts with /foo', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*/foo*', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://example.com/foo/bar.html').server.getHost()).to.eql('proxy.com');
            expect(list.resolve('http://www.google.com/foo').server.getHost()).to.eql('proxy.com');
        });

        it('Matches any URL that uses the https protocol, is on a google.com host', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*.google.com/foo*bar', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://www.google.com/foo/baz/bar').server.getHost()).to.eql('proxy.com');
            expect(list.resolve('http://docs.google.com/foobar').server.getHost()).to.eql('proxy.com');
        });

        it('Matches the specified URL', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://example.org/foo/bar.html', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://example.org/foo/bar.html').server.getHost()).to.eql('proxy.com');
        });

        it('Matches any URL that uses the http protocol and is on the host 127.0.0.1', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://127.0.0.1/*', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://127.0.0.1/').server.getHost()).to.eql('proxy.com');
            expect(list.resolve('http://127.0.0.1/foo/bar.html').server.getHost()).to.eql('proxy.com');
        });

        it('Matches any URL that uses the http protocol and is on the host ends with 0.0.1', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*.0.0.1/', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://127.0.0.1/').server.getHost()).to.eql('proxy.com');
            expect(list.resolve('http://125.0.0.1/').server.getHost()).to.eql('proxy.com');
        });

        it('Matches any URL which has host mail.google.com', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: '*://mail.google.com/*', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://mail.google.com/foo/baz/bar').server.getHost()).to.eql('proxy.com');
            expect(list.resolve('https://mail.google.com/foobar').server.getHost()).to.eql('proxy.com');
        });

        it('Bad Match pattern [No Path]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://www.google.com', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://www.google.com')).to.eql(undefined);
        });

        it('Bad Match pattern ["*" in the host can be followed only by a "." or "/"]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*foo/bar', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://www.foo/bar')).to.eql(undefined);
        });

        it('Bad Match pattern [If "*" is in the host, it must be the first character]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://foo.*.bar/baz', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://foo.z.bar/baz')).to.eql(undefined);
        });

        it('Bad Match pattern [Missing protocol separator ("/" should be "//")]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http:/bar', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http:/bar')).to.eql(undefined);
        });

        it('Bad Match pattern [Invalid protocol]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'foo://*', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('foo://www.foo/bar')).to.eql(undefined);
        });

    });

    describe('resolve', function () {
        it('Assigns, <all_urls> as match pattern and resolves any url provided', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://www.google.com/').server.getHost()).to.eql('proxy.com');
            expect(list.resolve('http://example.org/foo/bar.html').server.getHost()).to.eql('proxy.com');
        });

        it('Matches any URL that uses the http protocol', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*/*', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://www.google.com/').server.getHost()).to.eql('proxy.com');
            expect(list.resolve(new Url('http://example.org/foo/bar.html')).server.getHost()).to.eql('proxy.com');
        });

        it('Matches any URL that uses the http protocol, on any host, as long as the path starts with /foo', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*/foo*', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://example.com/foo/bar.html').server.getHost()).to.eql('proxy.com');
            expect(list.resolve('http://www.google.com/foo').server.getHost()).to.eql('proxy.com');
        });

        it('Matches any URL that uses the https protocol, is on a google.com host', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*.google.com/foo*bar', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://www.google.com/foo/baz/bar').server.getHost()).to.eql('proxy.com');
            expect(list.resolve('http://docs.google.com/foobar').server.getHost()).to.eql('proxy.com');
        });

        it('Matches the specified URL', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://example.org/foo/bar.html', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://example.org/foo/bar.html').server.getHost()).to.eql('proxy.com');
        });

        it('Matches any URL that uses the http protocol and is on the host 127.0.0.1', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://127.0.0.1/*', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://127.0.0.1/').server.getHost()).to.eql('proxy.com');
            expect(list.resolve('http://127.0.0.1/foo/bar.html').server.getHost()).to.eql('proxy.com');
        });

        it('Matches any URL that uses the http protocol and is on the host ends with 0.0.1', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*.0.0.1/', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://127.0.0.1/').server.getHost()).to.eql('proxy.com');
            expect(list.resolve('http://125.0.0.1/').server.getHost()).to.eql('proxy.com');
        });

        it('Matches any URL which has host mail.google.com', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: '*://mail.google.com/*', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://mail.google.com/foo/baz/bar').server.getHost()).to.eql('proxy.com');
            expect(list.resolve('https://mail.google.com/foobar').server.getHost()).to.eql('proxy.com');
        });

        it('Bad Match pattern [No Path]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://www.google.com', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://www.google.com')).to.eql(undefined);
        });

        it('Bad Match pattern ["*" in the host can be followed only by a "." or "/"]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://*foo/bar', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://www.foo/bar')).to.eql(undefined);
        });

        it('Bad Match pattern [If "*" is in the host, it must be the first character]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http://foo.*.bar/baz', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http://foo.z.bar/baz')).to.eql(undefined);
        });

        it('Bad Match pattern [Missing protocol separator ("/" should be "//")]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'http:/bar', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('http:/bar')).to.eql(undefined);
        });

        it('Bad Match pattern [Invalid protocol]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'foo://*', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('foo://www.foo/bar')).to.eql(undefined);
        });

        it('Bad url for the match [Empty url]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'foo://*', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve('')).to.eql(undefined);
        });

        it('Bad url for the match [Non String url]', function () {
            var parent = {},
                list = new ProxyConfigList(parent,
                    [
                        { match: 'foo://*', server: 'https://proxy.com/', tunnel: true }
                    ]
                );
            expect(list.resolve({ remote: 'random remote' })).to.eql(undefined);
        });
    });

    describe('isProxyConfigList', function () {
        it('Should return true for the ProxyConfigList constructor', function () {
            var list = new ProxyConfigList({}, []);
            expect(ProxyConfigList.isProxyConfigList(list)).to.eql(true);
        });

        it('Should return false for the invalid ProxyConfigList', function () {
            var list = { _postman_propertyName: 'ProxyConfigList' };
            expect(ProxyConfigList.isProxyConfigList(list)).to.eql(false);
        });

        it('should return false when called witohut arguments', function () {
            expect(ProxyConfigList.isProxyConfigList()).to.eql(false);
        });
    });
});
