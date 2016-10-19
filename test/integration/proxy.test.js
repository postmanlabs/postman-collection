var expect = require('expect.js'),
    Proxy = require('../../lib/index.js').Proxy;

/* global describe, it */
describe.only('Proxy', function () {
    it('should initialize the values to their defaults', function () {
        var p = new Proxy();
        expect(p.url).to.be('*');
        expect(p.protocol).to.be('http');
        expect(p.direct).to.be(false);
    });

    it('should prepopulate the values when pass through the constructor', function () {
        var p = new Proxy({
            url: 'http://example.com',
            protocol: 'http',
            host: 'proxy.com',
            port: '8080'
        });

        expect(p.url).to.be('http://example.com');
        expect(p.protocol).to.be('http');
        expect(p.host).to.be('proxy.com');
        expect(p.port).to.be('8080');
        expect(p.direct).to.be(false);
    });

    it('Should parse the proxy string provided', function () {
        var p = new Proxy('PROXY http://proxy.com:8080', 'http://example.com');

        expect(p.url).to.be('http://example.com');
        expect(p.protocol).to.be('http');
        expect(p.host).to.be('proxy.com');
        expect(p.port).to.be('8080');
        expect(p.direct).to.be(false);
    });

    it('Should parse the proxy string provided With DIRECT value where the host must be empty', function () {
        var p = new Proxy('DIRECT', 'http://example.com');

        expect(p.host).to.be('');
        expect(p.direct).to.be(true);
        expect(p.tunnel).to.be(false);
    });


    it('If the url is not provided it should take the * wildcard', function () {
        var p = new Proxy('PROXY http://proxy.com:8080');

        expect(p.url).to.be('*');
    });
});
