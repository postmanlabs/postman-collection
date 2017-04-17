var _ = require('lodash'),
    expect = require('expect.js'),

    Request = require('../../').Request,
    rawRequests = require('../fixtures/index').authRequests;

/* global describe, it */
describe('RequestAuthBase', function () {
    it('must be able to correctly serialize auth parameters', function () {
        var reqData = rawRequests.oauth1,
            sdkRequest = new Request(reqData),
            request = sdkRequest.toJSON();

        expect(request).to.have.property('auth');
        expect(request.auth).to.have.property('oauth1');

        expect(request.auth.oauth1).to.eql(reqData.auth.oauth1);
    });

    it('must not serialize meta parameters set in the `_` meta holder', function () {
        var reqData = rawRequests.oauth1,
            sdkRequest = new Request(reqData),
            request;

        _.set(sdkRequest._, 'postman_auth_metaProperty', 'some-random-stuff');

        request = sdkRequest.toJSON();

        expect(request).to.have.property('auth');
        expect(request.auth).to.have.property('oauth1');
        expect(request.auth.oauth1).to.not.have.property('_');
        expect(request.auth.oauth1).to.eql(reqData.auth.oauth1);
    });
});
