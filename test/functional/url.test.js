var expect = require('expect.js'),
    _ = require('lodash'),
    Url = require('../../').Url,
    rawUrls = require('../fixtures/').rawUrls;

/* global describe, it */
describe('Url', function () {
    describe('unparsing', function () {
        rawUrls.forEach(function (rawUrl) {
            _.isString(rawUrl) && describe(rawUrl, function () {
                var url = new Url(rawUrl);
                it('should be unparsed properly', function () {
                    expect(url.getRaw()).to.eql(rawUrl);
                });
            });
        });
    });

    describe('OAuth1 Base Url', function () {
        it('should be generated properly', function () {
            var rawUrl = rawUrls[8],
                url = new Url(rawUrl);
            expect(url.getOAuth1BaseUrl()).to.eql('http://example.com/resource');
        });
    });

    describe('JSON representation', function () {
        it('should be generated properly', function () {
            var rawUrl = rawUrls[9],
                url = new Url(rawUrl),
                jsonified = url.toJSON();
            expect(jsonified.protocol).to.eql(rawUrl.protocol);
            expect(jsonified.host).to.eql(rawUrl.host);
            expect(jsonified.port).to.eql(rawUrl.port);
            expect(jsonified.path).to.eql(rawUrl.path);
            expect(jsonified.query).to.eql(rawUrl.query);
            expect(jsonified.hash).to.eql(rawUrl.hash);
            // Since _.compact only accepts and returns an Array, the easiest way to get rid of
            // keys with value "undefined" is to use JSON.*
            expect(JSON.parse(JSON.stringify(jsonified.variable))).to.eql(rawUrl.variable);
        });
    });

    describe('Path Variables', function () {
        it('should be processed and resolved', function () {
            var rawUrl = rawUrls[10],
                url = new Url(rawUrl);
            expect(url.getPath()).to.eql('/get');
        });
    });
});
