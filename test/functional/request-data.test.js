var expect = require('expect.js'),
    rawRequestData = require('../fixtures').requestData,
    RequestData = require('../../lib/index.js').RequestData,
    QueryParam = require('../../lib/index.js').QueryParam;

/* global describe, it */
describe('RequestData', function () {
    it('should be jsonified properly', function () {
        var reqData = new RequestData(rawRequestData),
            jsonified = reqData.toJSON();
        expect(jsonified).to.eql(rawRequestData);
    });

    it('should be stringified properly', function () {
        var reqData = new RequestData(rawRequestData),
            expectedQueryData = QueryParam.unparse(rawRequestData.urlencoded);

        // Set the mode to URL encoded
        reqData.mode = 'urlencoded';
        expect(reqData.toString()).to.eql(expectedQueryData);
    });
});
