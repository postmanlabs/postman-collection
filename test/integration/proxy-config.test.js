var expect = require('expect.js'),
    ProxyConfig = require('../../lib/index.js').ProxyConfig;

/* global describe, it */
describe('Proxy Config', function () {
    it('should initialize the values to their defaults', function () {
        var p = new ProxyConfig();
        
        expect(p.match).to.be('*');
        expect(p.tunnel).to.be(false);
    });

    it('should prepopulate the values when pass through the constructor', function () {
        var p = new ProxyConfig({
            match: 'http://example.com',
            server: 'http://proxy.com',
            tunnel: true,
            disabled: true
        });

        expect(p.match).to.be('http://example.com');
        expect(p.server.protocol).to.be('http');
        expect(p.server.getHost()).to.be('proxy.com');
        expect(p.tunnel).to.be(true);
        expect(p.disabled).to.be(true);
    });


    it('should prepopulate the values of match to * if it is not provided', function () {
        var p = new ProxyConfig({
            server: 'http://proxy.com'
        });

        expect(p.match).to.be('*');
    });
});
