var _ = require('lodash'),
    expect = require('expect.js'),
    request = require('postman-request'),

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

    describe('body', function () {
        it('should parse response stream as text', function () {
            expect((new Response({
                stream: new Buffer([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])
            })).text()).to.be('buffer');
        });

        it('should parse response as JSON', function () {
            expect((new Response({
                body: '{ "hello": "world" }'
            })).json()).to.eql({
                hello: 'world'
            });
        });

        it('should strip BOM from response while parsing JSON', function () {
            expect((new Response({
                body: String.fromCharCode(0xFEFF) + '{ "hello": "world" }'
            })).json()).to.eql({
                hello: 'world'
            });

            expect((new Response({
                body: String.fromCharCode(0xEFBBBF) + '{ "hello": "world" }'
            })).json()).to.eql({
                hello: 'world'
            });
        });

        it('should throw friendly error while failing to parse json body', function () {
            var response = new Response({
                    body: '{ "hello: "world" }'
                }),
                json,
                error;

            try {
                json = response.json();
            }
            catch (e) {
                error = e;
            }

            expect(json).not.be.ok();
            expect(error).be.ok();
            expect(error.toString()).be(
                'JSONError: Unexpected token \'w\' at 1:12\n' +
                '{ "hello: "world" }\n' +
                '           ^'
            );
        });
    });

    describe('size', function () {
        it('must match the total size of the response', function () {
            var rawResponse1 = fixtures.responseData1,
                rawResponse2 = fixtures.responseData2,
                response1 = new Response(rawResponse1),
                response2 = new Response(rawResponse2),
                size1 = response1.size(),
                size2 = response2.size();
            expect(size1.body + size1.header).to.eql(rawResponse1.header.length + rawResponse1.body.length);
            expect(size2.body + size2.header).to.eql(rawResponse1.header.length + rawResponse1.body.length);
        });

        it('must match the content-length of the response if gzip encoded', function () {
            var rawResponse = {
                    code: 200,
                    body: 'gzipped content xyzxyzxyzxyzxyzxyz',
                    header: 'Content-Encoding: gzip\nContent-Length: 10'
                },
                response = new Response(rawResponse);
            expect(response.size().body).to.eql(10);
        });

        it('must match the content-length of the response if deflate encoded', function () {
            var rawResponse = {
                    code: 200,
                    body: 'gzipped content xyzxyzxyzxyzxyzxyz',
                    header: 'Content-Encoding: deflate\nContent-Length: 20'
                },
                response = new Response(rawResponse);
            expect(response.size().body).to.eql(20);
        });
    });

    ((typeof window === 'undefined') ? describe : describe.skip)('fromModule helper', function () {
        var response;

        before(function (done) {
            request.get('https://echo.getpostman.com/get', function (err, res) {
                if (err) {
                    return done(err);
                }

                response = new Response(Response.fromModule(res)).toJSON();
                done();
            });
        });

        it('should correctly return the processed response', function () {
            var body = JSON.parse(response.body);

            expect(response.status).to.be('OK');
            expect(response.code).to.be(200);

            expect(body).to.be.an(Object);
            expect(body.args).to.be.an(Object);
            expect(body.headers).to.be.an(Object);
            expect(body.url).to.be.a('string');

            expect(response.header).to.be.an(Array);
            _.forEach(response.header, function (header) {
                expect(header.key).to.be.a('string');
                expect(header.value).to.be.a('string');
            });

            expect(response.cookie).to.be.an(Array);
            _.forEach(response.cookie, function (cookie) {
                expect(cookie.key).to.be.a('string');
                expect(cookie.value).to.be.a('string');
            });
        });
    });
});
