var fs = require('fs'),
    _ = require('lodash'),
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

    ((typeof window === 'undefined') ? describe : describe.skip)('createFromRequest', function () {
        var baseUrl = 'https://echo.getpostman.com',
            validateResponse = function (response) {
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
            };

        it('should correctly return a GET response', function (done) {
            request.get(baseUrl + '/get', function (err, res) {
                if (err) {
                    return done(err);
                }

                var response = Response.createFromRequest(res).toJSON();
                validateResponse(response);
                done();
            });
        });

        describe('POST', function () {
            it('should correctly return a response for form-data', function (done) {
                var sampleArray = [1, 2, 3],
                    isNode4 = (/^v4\./).test(process.version);

                request.post({
                    url: baseUrl + '/post',
                    form: {
                        alpha: 'foo',
                        beta: 'bar',
                        buffer: isNode4 ? new Buffer(sampleArray) : Buffer.from(new Uint32Array(sampleArray))
                    }
                }, function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    var response = Response.createFromRequest(res).toJSON(),
                        body = JSON.parse(response.body);

                    expect(body.form.alpha).to.be('foo');
                    expect(body.form.beta).to.be('bar');
                    expect(body.form.buffer).to.be('\u0001\u0002\u0003');

                    validateResponse(response);
                    done();
                });
            });

            it('should correctly return a response for file uploads', function (done) {
                var file = fs.createReadStream('test/fixtures/icon.png'),
                    req = request.post({
                        url: baseUrl + '/post'
                    }, function (err, res) {
                        if (err) {
                            return done(err);
                        }

                        var response = Response.createFromRequest(res).toJSON(),
                            body = JSON.parse(response.body);

                        expect(body.files['icon.png']).to.match(/^data:application\/octet-stream;base64,/);

                        validateResponse(response);
                        done();
                    }),
                    form = req.form();

                form.append('file', file);
            });
        });

        it('should correctly return response headers', function (done) {
            request.get(baseUrl + '/response-headers?foo=bar&foo=bar2&bar=foo', function (err, res) {
                if (err) {
                    return done(err);
                }

                var response = Response.createFromRequest(res).toJSON();

                expect(Header.headerValue(response.header, 'bar')).to.be('foo');
                expect(Header.headerValue(response.header, 'foo')).to.be('bar, bar2');

                validateResponse(response);
                done();
            });
        });

        describe('cookies', function () {
            var cookieUrl = baseUrl + '/cookies',
                stringify = function (cookies) {
                    return _.reduce(cookies, function (result, value, key) {
                        return result + key + '=' + value + ';';
                    }, '');
                };

            it('should correctly provide all cookies', function (done) {
                request.get({
                    url: cookieUrl,
                    jar: true
                }, function (err, res, body) {
                    if (err) {
                        return done(err);
                    }

                    var cookieObject = JSON.parse(body).cookies,
                        stringifiedCookies = stringify(cookieObject),
                        response = Response.createFromRequest(res, stringifiedCookies).toJSON();

                    expect(response.cookie).to.eql([]);
                    validateResponse(response);
                    done();
                });
            });

            it('should correctly set a cookie', function (done) {
                request.get({
                    url: cookieUrl + '/set?foo=bar',
                    jar: true
                }, function (err, res, body) {
                    if (err) {
                        return done(err);
                    }

                    var cookieObject = JSON.parse(body).cookies,
                        stringifiedCookies = stringify(cookieObject),
                        response = Response.createFromRequest(res, stringifiedCookies).toJSON();

                    expect(response.cookie).to.eql([{
                        key: 'foo',
                        hostOnly: true,
                        value: 'bar',
                        extensions: [{ key: '', value: true }]
                    }]);
                    validateResponse(response);
                    done();
                });
            });

            it('should correctly delete a previously set cookie', function (done) {
                request.get({
                    url: cookieUrl + '/delete?foo',
                    jar: true
                }, function (err, res, body) {
                    if (err) {
                        return done(err);
                    }

                    var cookieObject = JSON.parse(body).cookies,
                        stringifiedCookies = stringify(cookieObject),
                        response = Response.createFromRequest(res, stringifiedCookies).toJSON();

                    expect(response.cookie).to.eql([]);
                    validateResponse(response);
                    done();
                });
            });
        });

        describe('miscellaneous requests', function () {
            it('should return a valid gzipped response', function (done) {
                request.get({
                    uri: baseUrl + '/gzip',
                    gzip: true
                }, function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    var response = Response.createFromRequest(res).toJSON(),
                        body = JSON.parse(response.body);

                    expect(body.gzipped).to.be(true);
                    expect(Header.headerValue(response.header, 'content-encoding')).to.be('gzip');

                    validateResponse(response);
                    done();
                });
            });

            it('should return a valid deflated response', function (done) {
                request.get({
                    uri: baseUrl + '/deflate',
                    gzip: true
                }, function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    var response = Response.createFromRequest(res).toJSON(),
                        body = JSON.parse(response.body);

                    expect(body.deflated).to.be(true);

                    validateResponse(response);
                    done();
                });
            });

            it('should return a valid utf-8 encoded response', function (done) {
                request.get({
                    uri: baseUrl + '/encoding/utf8'
                }, function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    var response = Response.createFromRequest(res).toJSON();

                    expect(Header.headerValue(response.header, 'content-type')).to.match(/^text\/html/);
                    expect(response.body).to.match(/<html>.*/);

                    validateResponse(response);
                    done();
                });
            });
        });
    });
});
