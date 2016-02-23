var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Response = require('../../lib/index.js').Response,
    Header = require('../../lib/index.js').Header;

/* global describe, it */
describe('Response', function () {
    var rawResponse = fixtures.collectionV2.item[0].response[0],
        response = new Response(rawResponse);

    describe('json representation', function () {
        it('must match what the response was initialized with', function () {
            var jsonified = response.toJSON();

            expect(jsonified.status).to.eql(rawResponse.status);
            expect(jsonified.code).to.eql(rawResponse.code);
            expect(jsonified.data).to.eql(rawResponse.data);
            expect(Header.unparse(jsonified.header).trim()).to.eql(rawResponse.header.trim());
            // Skip cookie tests, because cookies are tested independantly.
            expect(jsonified).to.have.property('cookie');
        });
    });
});
