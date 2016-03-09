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
            expect(jsonified.host).to.eql(rawUrl.host.split('.'));
            expect(jsonified.port).to.eql(rawUrl.port);
            expect(jsonified.path).to.eql(rawUrl.path.split('/'));
            expect(jsonified.query).to.eql(rawUrl.query);
            expect(jsonified.hash).to.eql(rawUrl.hash);

            // Can't use normal comparisons, because variables are by default assigned
            // type = "any" and deep comparison fails because of that.
            _.each(rawUrl.variable, function (variable, index) {
                var jsonifiedVar = jsonified.variable[index];
                _.forOwn(variable, function (value, attribute) {
                    expect(jsonifiedVar[attribute]).to.eql(value);
                });
            });
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
