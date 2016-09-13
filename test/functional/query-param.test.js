var expect = require('expect.js'),
    QueryParam = require('../../').QueryParam,
    rawQueryStrings = require('../fixtures/index').rawQueryStrings;

/* global describe, it */
describe('QueryParam', function () {
    rawQueryStrings.forEach(function (rawQueryString) {
        describe(rawQueryString, function () {
            it('should be parsed properly', function () {
                var params = QueryParam.parse(rawQueryString);
                expect(params.length).to.be(4);
            });

            it('should be unparsed properly', function () {
                var params = QueryParam.parse(rawQueryString),
                    paramStr = QueryParam.unparse(params);
                expect(paramStr).to.eql(rawQueryString);
            });
        });
    });

    it('should not url encode by default', function () {
        var rawQueryString = 'x=y%z',
            params = QueryParam.parse(rawQueryString),
            paramStr = QueryParam.unparse(params);
        expect(paramStr).to.eql(rawQueryString);
    });

    it('should url encode if explicitly asked to', function () {
        var rawQueryString = 'x=y%z',
            params = QueryParam.parse(rawQueryString),
            paramStr = QueryParam.unparse(params, {encode: true});
        expect(paramStr).to.eql('x=y%25z');
    });
});
