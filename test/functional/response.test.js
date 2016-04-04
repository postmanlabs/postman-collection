var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Response = require('../../lib/index.js').Response,
    Header = require('../../lib/index.js').Header;

/* global describe, it */
describe('Response', function () {
    describe('json representation', function () {
        it('must match what the response was initialized with', function () {
            var rawResponse = fixtures.collectionV2.item[0].response[0],
                response = new Response(rawResponse),
                jsonified = response.toJSON();
            expect(jsonified.status).to.eql(rawResponse.status);
            expect(jsonified.code).to.eql(rawResponse.code);
            expect(jsonified.body).to.eql(rawResponse.body);
            expect(Header.unparse(jsonified.header).trim()).to.eql(rawResponse.header.trim());
            // Skip cookie tests, because cookies are tested independently.
            expect(jsonified).to.have.property('cookie');
        });

        it('must infer the http response reason phrase from the status code', function () {
            var rawResponse = {
                    name: 'a sample response',
                    originalRequest: 'http://echo.getpostman.com/status/200',
                    code: 410,
                    body: 'response body'
                },
                response = new Response(rawResponse),
                jsonified = response.toJSON();
            expect(jsonified.status.toLowerCase()).to.eql('gone');
            expect(jsonified.code).to.eql(rawResponse.code);
            expect(jsonified.body).to.eql(rawResponse.body);

            // Skip cookie tests, because cookies are tested independently.
            expect(jsonified).to.have.property('cookie');
        });
    });
});
