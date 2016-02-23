var expect = require('expect.js'),
    QueryParam = require('../../').QueryParam,
    rawQueryStrings = require('../fixtures/index').rawQueryStrings;

/* global describe, it */
describe('QueryParam', function () {
    rawQueryStrings.forEach(function (rawQueryString) {
        describe(rawQueryString, function () {
            var params = QueryParam.parse(rawQueryString);

            it('should be parsed properly', function () {
                expect(params.length).to.be(4);
            });

            it('should be unparsed properly', function () {
                var paramStr = QueryParam.unparse(params);
                expect(paramStr).to.eql(rawQueryString);
            });
        });
    });
});
