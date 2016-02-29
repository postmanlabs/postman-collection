var expect = require('expect.js'),
    rawRequestBody = require('../fixtures').requestData,
    RequestBody = require('../../lib/index.js').RequestBody,
    QueryParam = require('../../lib/index.js').QueryParam;

/* global describe, it */
describe('RequestBody', function () {
    it('should be jsonified properly', function () {
        var reqData = new RequestBody(rawRequestBody),
            jsonified = reqData.toJSON();
        expect(jsonified).to.eql(rawRequestBody);
    });

    it('should be stringified properly', function () {
        var reqData = new RequestBody(rawRequestBody),
            expectedQueryData = QueryParam.unparse(rawRequestBody.urlencoded);

        // Set the mode to URL encoded
        reqData.mode = 'urlencoded';
        expect(reqData.toString()).to.eql(expectedQueryData);
    });
});
