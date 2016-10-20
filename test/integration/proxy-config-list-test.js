var expect = require('expect.js'),
    ProxyConfigList = require('../../').ProxyConfigList;

/* global describe, it */
describe('ProxyConfigList', function () {
    var parent = {},
        list = new ProxyConfigList(parent,
            [
                { match: 'https://example.com*', server: 'https://proxy.com', tunnel: true },
                { match: 'https://example[0-9]+.com', server: 'http://proxydigit.com' },
                { match: 'https://example2*.com', server: 'http://proxyintermediate.com' }
            ]
        );

    it('should resolve the match from the list', function () {
        expect(list.resolve('https://example.com').server.getHost()).to.eql('proxy.com');
    });

    it('should resolve the match from the list having the wildcard in between the match', function () {
        expect(list.resolve('https://example2456s.com').server.getHost()).to.eql('proxyintermediate.com');
    });

    it('should resolve the match from the list having the digits wildcard', function () {
        expect(list.resolve('https://example2.com').server.getHost()).to.eql('proxydigit.com');
    });

    list.add({ server: 'http://proxymatchall.com' });

    it('should resolve the default wildcard match of all other urls', function () {
        console.log(list.toJSON());
        expect(list.resolve('https://any.com').server.getHost()).to.eql('proxymatchall.com');
    });
});
