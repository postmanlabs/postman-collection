var expect = require('expect.js'),
    ProxyConfig = require('../../lib/collection/proxy-config').ProxyConfig,
    AllOWED_PROTOCOLS = require('../../lib/collection/proxy-config').AllOWED_PROTOCOLS,
    DEFAULT_PATTERN = require('../../lib/collection/proxy-config').DEFAULT_PATTERN,
    DEFAULT_HOST = '',
    DEFAULT_PORT = 8080;

/* global describe, it */
describe('Proxy Config', function () {
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
        expect(p.getProtocols()).to.be.eql(AllOWED_PROTOCOLS);
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
            protocols = AllOWED_PROTOCOLS,
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
    });
});
