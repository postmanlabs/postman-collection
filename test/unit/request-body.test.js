var expect = require('expect.js'),
    rawRequestBody = require('../fixtures').requestData,
    RequestBody = require('../../lib/index.js').RequestBody,
    PropertyList = require('../../lib/index.js').PropertyList;

/* global describe, it */
describe('RequestBody', function () {
    it('should be parsed properly', function () {
        var reqData = new RequestBody(rawRequestBody);
        expect(reqData).to.be.ok();
        expect(reqData).to.have.property('mode', rawRequestBody.mode);

        // Raw Request body
        expect(reqData).to.have.property('raw', rawRequestBody.raw);

        // Form data
        expect(reqData.formdata).to.be.a(PropertyList);
        expect(reqData.formdata.count()).to.eql(rawRequestBody.formdata.length);

        // URL Encoded parameters
        expect(reqData.urlencoded).to.be.a(PropertyList);
        expect(reqData.urlencoded.count()).to.eql(rawRequestBody.urlencoded.length);
    });
});
