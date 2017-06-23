var expect = require('expect.js'),
    ProxyConfigList = require('../../').ProxyConfigList;

/* global describe, it */
describe('Proxy Config List', function () {
    it('Assigns, <all_urls> as match pattern and resolves any url provided', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { host: 'proxy.com', tunnel: true }
                ]
            );
        expect(list.resolve('http://www.google.com/').host).to.eql('proxy.com');
        expect(list.resolve('http://example.org/foo/bar.html').host).to.eql('proxy.com');
    });

    it('Assigns, <all_urls> as match pattern and respect the disabled prop in the congfig', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { host: 'proxy.com', tunnel: true, disabled: true }
                ]
            );
        expect(list.resolve('foo://www.foo/bar')).to.eql(undefined);
    });

    it('Matches only the URLs that uses the default (http) protocol', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { match: '*/*', host: 'proxy.com' }
                ]
            );
        expect(list.resolve('http://www.google.com/').host).to.eql('proxy.com');
        expect(list.resolve('http://example.org/foo/bar.html').host).to.eql('proxy.com');
        expect(list.resolve('https://example.org/foo/bar.html')).to.eql(undefined);
    });

    it('Matches only the URLs that uses the https protocol', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { match: '*/*', host: 'proxy.com', protocols: 'https' }
                ]
            );
        expect(list.resolve('https://www.google.com/').host).to.eql('proxy.com');
        expect(list.resolve('https://example.org/foo/bar.html').host).to.eql('proxy.com');
        expect(list.resolve('http://example.org/foo/bar.html')).to.eql(undefined);
    });

    it('Matches any URL that uses the http or https protocol', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { match: '*/*', host: 'proxy.com', protocols: ['http', 'https'] }
                ]
            );
        expect(list.resolve('http://www.google.com/').host).to.eql('proxy.com');
        expect(list.resolve('https://example.org/foo/bar.html').host).to.eql('proxy.com');
    });

    it('Matches any URL that uses the http protocol, on any host, as long as the path starts with /foo', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { match: '*/foo*', host: 'proxy.com' }
                ]
            );
        expect(list.resolve('http://example.com/foo/bar.html').host).to.eql('proxy.com');
        expect(list.resolve('http://www.google.com/foo').host).to.eql('proxy.com');
    });

    it('Matches any URL that uses the https protocol, is on a google.com host', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { match: '*.google.com/foo*bar', host: 'proxy.com', protocols: 'https' }
                ]
            );
        expect(list.resolve('https://www.google.com/foo/baz/bar').host).to.eql('proxy.com');
        expect(list.resolve('https://docs.google.com/foobar').host).to.eql('proxy.com');
        expect(list.resolve('http://docs.google.com/foobar')).to.eql(undefined);
    });

    it('Matches the specified URL', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { match: 'example.org/foo/bar.html', host: 'proxy.com' }
                ]
            );
        expect(list.resolve('http://example.org/foo/bar.html').host).to.eql('proxy.com');
    });

    it('Matches any URL that uses the http protocol and is on the host 127.0.0.1', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { match: '127.0.0.1/*', host: 'proxy.com' }
                ]
            );
        expect(list.resolve('http://127.0.0.1/').host).to.eql('proxy.com');
        expect(list.resolve('http://127.0.0.1/foo/bar.html').host).to.eql('proxy.com');
        expect(list.resolve('https://127.0.0.1/')).to.eql(undefined);
    });

    it('Matches any URL that uses the http protocol and is on the host ends with 0.0.1', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { match: '*.0.0.1/', host: 'proxy.com' }
                ]
            );
        expect(list.resolve('http://127.0.0.1/').host).to.eql('proxy.com');
        expect(list.resolve('http://125.0.0.1/').host).to.eql('proxy.com');
        expect(list.resolve('https://125.0.0.1/')).to.eql(undefined);
    });

    it('Matches any URL which has host mail.google.com', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { match: 'mail.google.com/*', host: 'proxy.com', protocols: ['http', 'https'] }
                ]
            );
        expect(list.resolve('http://mail.google.com/foo/baz/bar').host).to.eql('proxy.com');
        expect(list.resolve('https://mail.google.com/foobar').host).to.eql('proxy.com');
        expect(list.resolve('https://google.com/foobar')).to.eql(undefined);
    });

    it('Bad Match pattern [No Path]', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { match: 'www.google.com', host: 'proxy.com' }
                ]
            );
        expect(list.resolve('http://www.google.com')).to.eql(undefined);
    });

    it('Bad Match pattern ["*" in the host can be followed only by a "." or "/"]', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { match: '*foo/bar', host: 'proxy.com' }
                ]
            );
        expect(list.resolve('http://www.foo/bar')).to.eql(undefined);
    });

    it('Bad Match pattern [If "*" is in the host, it must be the first character]', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { match: 'foo.*.bar/baz', host: 'proxy.com' }
                ]
            );
        expect(list.resolve('http://foo.z.bar/baz')).to.eql(undefined);
    });

    it('Bad Match pattern [Missing protocol separator ("/" should be "//")]', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { match: 'http:/bar', host: 'proxy.com' }
                ]
            );
        expect(list.resolve('http:/bar')).to.eql(undefined);
    });

    it('Bad Match pattern [Invalid protocol]', function () {
        var parent = {},
            list = new ProxyConfigList(parent,
                [
                    { match: 'www.foo/bar', host: 'proxy.com', protocol: 'foo' }
                ]
            );
        expect(list.resolve('foo://www.foo/bar')).to.eql(undefined);
    });

});
