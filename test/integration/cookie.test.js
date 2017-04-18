var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Cookie = require('../../lib/index.js').Cookie;

/* global describe, it */
describe('Cookie', function () {
    var rawCookie = fixtures.collectionV2.item[0].response[0].cookie[0],
        cookie = new Cookie(rawCookie);

    it('initializes successfully', function () {
        expect(cookie).to.be.ok();
    });

    describe('has property', function () {
        it('domain', function () {
            expect(cookie).to.have.property('domain', rawCookie.domain);
        });

        it('expires', function () {
            expect(cookie).to.have.property('expires', rawCookie.expires);
        });

        it('hostOnly', function () {
            expect(cookie).to.have.property('hostOnly', rawCookie.hostOnly);
        });

        it('httpOnly', function () {
            expect(cookie).to.have.property('httpOnly', rawCookie.httpOnly);
        });

        it.skip('maxAge', function () { // @todo: possibly delete test. seems like based on old expectations
            expect(cookie).to.have.property('maxAge', undefined);
        });

        it('path', function () {
            expect(cookie).to.have.property('path', rawCookie.path);
        });

        it('secure', function () {
            expect(cookie).to.have.property('secure', rawCookie.secure);
        });

        it('session', function () {
            expect(cookie).to.have.property('session', rawCookie.session);
        });

        it('value', function () {
            expect(cookie).to.have.property('value', rawCookie.value);
        });

        it('_', function () {
            expect(cookie).to.have.property('_');
            expect(cookie._).to.have.property('postman_storeId', rawCookie._postman_storeId);
        });

        it('update', function () {
            expect(cookie.update).to.be.ok();
            expect(cookie.update).to.be.an('function');
        });
    });
});
