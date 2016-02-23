var expect = require('expect.js'),
    rawRequestData = require('../fixtures').requestData,
    RequestData = require('../../lib/index.js').RequestData,
    PropertyList = require('../../lib/index.js').PropertyList;

/* global describe, it */
describe('RequestData', function () {
    it('should be parsed properly', function () {
        var reqData = new RequestData(rawRequestData);
        expect(reqData).to.be.ok();
        expect(reqData).to.have.property('mode', rawRequestData.mode);

        // Raw Request body
        expect(reqData).to.have.property('raw', rawRequestData.raw);

        // Form data
        expect(reqData.formdata).to.be.a(PropertyList);
        expect(reqData.formdata.count()).to.eql(rawRequestData.formdata.length);

        // URL Encoded parameters
        expect(reqData.urlencoded).to.be.a(PropertyList);
        expect(reqData.urlencoded.count()).to.eql(rawRequestData.urlencoded.length);
    });
});
