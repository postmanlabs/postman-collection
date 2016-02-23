var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Header = require('../../lib/index.js').Header,
    PropertyList = require('../../lib/index.js').PropertyList;

/* global describe, it */
describe('Headers', function () {
    var rawHeaders = fixtures.collectionV2.item[0].response[0].header,
        headers = (new PropertyList(Header, undefined, rawHeaders)).all();

    it('initialize successfully', function () {
        expect(headers).to.be.ok();
        expect(headers).to.be.an('array');
    });

    describe('each contain property', function () {
        var header = headers[0];

        it('key', function () {
            expect(header).to.have.property('key', 'Content-Type');
        });

        it('value', function () {
            expect(header).to.have.property('value', 'application/json');
        });
    });
});
