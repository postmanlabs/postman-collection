var _ = require('lodash'),
    expect = require('expect.js'),

    Request = require('../../').Request,
    RequestAuthBase = require('../../').RequestAuthBase,
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

        _.set(sdkRequest, 'auth.oauth1._.postman_auth_metaProperty', 'some-random-stuff');
        _.set(sdkRequest, 'auth.oauth1._.other_metaProperty', 'some-random-stuff2');

        request = sdkRequest.toJSON();

        expect(request).to.have.property('auth');
        expect(request.auth).to.have.property('oauth1');
        expect(request.auth.oauth1._).to.not.have.property('postman_auth_metaProperty');
        expect(request.auth.oauth1._).to.eql({ other_metaProperty: 'some-random-stuff2' });
    });

    describe('.setMeta', function () {
        it('must set a meta property with the correct prefix', function () {
            var r = new RequestAuthBase();

            r.setMeta('abc', 123);

            expect(r.meta()).to.have.property(RequestAuthBase.AUTH_META_PREFIX + 'abc', 123);
        });
    });

    describe('.get', function () {
        it('must get a meta property with the correct prefix', function () {
            var r = new RequestAuthBase();

            r.setMeta('abc', 123);

            expect(r.getMeta('abc')).to.be(123);
        });
    });

    describe('.clearMeta', function () {
        it('must get a meta property with the correct prefix', function () {
            var r = new RequestAuthBase();

            r.setMeta('abc', 123);
            r.clearMeta('abc');
            expect(r.meta()).to.eql({});
        });
    });
});
