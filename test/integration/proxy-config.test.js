var expect = require('expect.js'),
    ProxyConfig = require('../../lib/index.js').ProxyConfig;

/* global describe, it */
describe('Proxy Config', function () {
    it('should initialize the values to their defaults', function () {
        var p = new ProxyConfig();

        expect(p.match.pattern).to.be('<all_urls>');
        expect(p.tunnel).to.be(false);
    });

    it('should prepopulate the values when pass through the constructor', function () {
        var p = new ProxyConfig({
            match: 'http://*.google.com/foo*bar',
            host: 'proxy.com',
            port: 8080,
            tunnel: true,
            disabled: true
        });

        expect(p.match.pattern).to.be('http://*.google.com/foo*bar');
        expect(p.test('http://mail.google.com/foo/baz/bar')).to.be(true);
        expect(p.test('http://docs.google.com/foobar')).to.be(true);
        expect(p.getProtocols()).to.be.eql(['http']);
        expect(p.host).to.be('proxy.com');
        expect(p.tunnel).to.be(true);
        expect(p.disabled).to.be(true);
    });


    it('should prepopulate the values of match to * if it is not provided', function () {
        var p = new ProxyConfig({
            host: 'http://proxy.com'
        });

        expect(p.match.pattern).to.be('<all_urls>');
        expect(p.getProtocols()).to.be.eql([]);
        expect(p.host).to.be('proxy.com');
        expect(p.tunnel).to.be(false);
        expect(p.disabled).to.not.be.ok();
    });
});
