var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Response = require('../../lib/index.js').Response;

/* global describe, it */
describe('Response', function () {
    var rawResponse = fixtures.collectionV2.item[0].response[0],
        response = new Response(rawResponse);

    it('initializes successfully', function () {
        expect(response).to.be.ok();
    });

    describe('has property', function () {
        it('code', function () {
            expect(response).to.have.property('code', rawResponse.code);
        });

        it('cookies', function () {
            expect(response).to.have.property('cookies');
            expect(response.cookies.all()).to.be.an('array');
        });

        it('data', function () {
            expect(response).to.have.property('data', rawResponse.data);
        });

        it('header', function () {
            expect(response).to.have.property('headers');
            expect(response.headers.all()).to.be.an('array');
        });

        it('name', function () {
            expect(response).to.have.property('name', rawResponse.name);
        });

        // TODO: Fix
        it('request', function () {
            expect(response).to.have.property('request');
            expect(response.request.url.getRaw()).to.eql(rawResponse.originalRequest);
        });

        it('status', function () {
            expect(response).to.have.property('status', rawResponse.status);
        });
    });

    describe('has function', function () {
        it('update', function () {
            expect(response.update).to.be.ok();
            expect(response.update).to.be.a('function');
        });
    });
});
