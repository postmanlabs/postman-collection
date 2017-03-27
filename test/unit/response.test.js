var fs = require('fs'),
    _ = require('lodash'),
    expect = require('expect.js'),
    reason = require('http-reasons'),
    util = require('../../lib/util'),
    request = require('postman-request'),

    fixtures = require('../fixtures'),
    Cookie = require('../../lib/index.js').Cookie,
    Response = require('../../lib/index.js').Response,
    Header = require('../../lib/index.js').Header;

/* global describe, it */
describe('Response', function () {
    describe('isResponse', function () {
        it('must distinguish between responses and other objects', function () {
            var response = new Response(),
                nonResponse = {};

            expect(Response.isResponse(response)).to.be(true);
            expect(Response.isResponse(nonResponse)).to.be(false);
        });
    });

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

        it('must retain Buffer nature on stream property after new Response(response.toJSON())', function () {
            var rawResponse = {
                    body: 'response body',
                    stream: new Buffer([114, 101, 115, 112, 111, 110, 115, 101, 32, 98, 111, 100, 121])
                },
                response = new Response(rawResponse),
                jsonified = response.toJSON(),
                reconstructedResponse = new Response(jsonified);
            expect(util.bufferOrArrayBufferToString(reconstructedResponse.stream)).to.eql(util.bufferOrArrayBufferToString(rawResponse.stream));
        });
        it('must infer the http response reason phrase from the status code', function () {
            var rawResponse = {
                    name: 'a sample response',
                    originalRequest: 'http://postman-echo.com/status/200',
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

    describe('details', function () {
        it('should correctly accept provided details', function () {
            expect(new Response({ code: 200 }).details()).to.eql({
                name: '200 OK',
                detail: reason.lookup(200).detail,
                code: 200
            });
        });

        it('should correctly set a flag for server reasons', function () {
            expect(new Response({ code: 200, _reasonFromServer: true }).details()).to.eql({
                name: '200 OK',
                detail: reason.lookup(200).detail,
                code: 200,
                fromServer: true
            });
        });

        it('should correctly update the reason and response code where applicable', function () {
            var response = new Response({ code: 200 });

            expect(response.details()).to.eql({
                name: '200 OK',
                detail: reason.lookup(200).detail,
                code: 200,
                fromServer: true
            });

            response.update({ code: 201, _reasonFromServer: true });

            expect(response.details()).to.eql({
                name: 'Created',
                detail: reason.lookup('201').detail,
                code: 201,
                fromServer: true
            });
        });

        it('should correctly check for response code disparities', function () {
            var response = new Response();

            // hijacked update
            response.code = 201;
            response.status = '201 Created';

            expect(response.details()).to.eql({
                name: '201 Created',
                detail: reason.lookup(201).detail,
                code: 201
            });
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

    // skip this test sub-suite in the browser
    ((typeof window === 'undefined') ? describe : describe.skip)('createFromNode', function () {
        var isNode4 = (/^v4\./).test(process.version),
            baseUrl = 'https://postman-echo.com',
            isHeader = Header.isHeader.bind(Header),
            isCookie = Cookie.isCookie.bind(Cookie),

            getBuffer = function (array) {
                return isNode4 ? new Buffer(array) : Buffer.from(new Uint32Array(array));
            },

            validateResponse = function (response) {
                var json = response.toJSON(),
                    buffer = getBuffer(json.stream.data);

                expect(json.code).to.be.a('number');
                expect(json.status).to.be.a('string');
                expect(json.responseSize).to.be.a('number');

                expect(json.stream).to.be.an('object');
                expect(json.stream.type).to.be('Buffer');
                expect(json.stream.data).to.be.an('array');
                expect(buffer.toString()).to.be(response.body);

                expect(json.header).to.be.an('array');
                expect(json.cookie).to.be.an('array');

                expect(_.every(response.headers.members, isHeader)).to.be(true);
                expect(_.every(response.cookies.members, isCookie)).to.be(true);
            };

        it('should correctly return a GET response', function (done) {
            request.get({
                url: baseUrl + '/get',
                encoding: null
            }, function (err, res) {
                if (err) {
                    return done(err);
                }

                var response = Response.createFromNode(res);
                validateResponse(response);
                done();
            });
        });

        describe('Should decode the response stream as text based on header charset', function () {
            it('charset(Shift_JIS) - Japanese', function () {
                expect((new Response({
                    header: [{
                        key: 'content-type',
                        value: 'text/html; charset=Shift_JIS'
                    }],
                    stream: fs.readFileSync('test/fixtures/japaneseCharacters.txt')
                })).text()).to.be('ハローポストマン\n'); // Harōposutoman
            });

            it('charset(windows-1251)- Cyrillic', function () {
                expect((new Response({
                    header: [{
                        key: 'content-type',
                        value: 'text/html; charset=windows-1251'
                    }],
                    stream: fs.readFileSync('test/fixtures/russianCharacters.txt')
                })).text()).to.be('Привет почтальон\n'); // Privet pochtal'on
            });

            it('Fallback to utf8, if it is not supported by iconvlite, say (ISO-8859-1)', function () {
                expect((new Response({
                    header: [{
                        key: 'content-type',
                        value: 'text/html; charset=ISO-8859-1'
                    }],
                    stream: new Buffer([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])
                })).text()).to.be('buffer');
            });
        });

        describe('POST', function () {
            it('should correctly return a response for form-data', function (done) {
                var sampleArray = [1, 2, 3];

                request.post({
                    url: baseUrl + '/post',
                    encoding: null,
                    form: {
                        alpha: 'foo',
                        beta: 'bar',
                        buffer: getBuffer(sampleArray)
                    }
                }, function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    var response = Response.createFromNode(res),
                        body = JSON.parse(response.toJSON().body);

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
                        url: baseUrl + '/post',
                        encoding: null
                    }, function (err, res) {
                        if (err) {
                            return done(err);
                        }

                        var response = Response.createFromNode(res),
                            body = JSON.parse(response.toJSON().body);

                        expect(body.files['icon.png']).to.match(/^data:application\/octet-stream;base64,/);

                        validateResponse(response);
                        done();
                    }),
                    form = req.form();

                form.append('file', file);
            });
        });

        it('should correctly return response headers', function (done) {
            request.get({
                url: baseUrl + '/response-headers?foo=bar&foo=bar2&bar=foo',
                encoding: null
            }, function (err, res) {
                if (err) {
                    return done(err);
                }

                var response = Response.createFromNode(res),
                    body = response.toJSON();

                expect(Header.headerValue(body.header, 'bar')).to.be('foo');
                expect(Header.headerValue(body.header, 'foo')).to.be('bar, bar2');

                validateResponse(response);
                done();
            });
        });

        // @todo: Supply cookie information to the createFromNode method to make these tests meaningful
        describe.skip('cookies', function () {
            var cookieUrl = baseUrl + '/cookies',
                stringify = function (cookies) {
                    return _.reduce(cookies, function (result, value, key) {
                        return result + key + '=' + value + ';';
                    }, '');
                };

            it('should correctly provide all cookies', function (done) {
                request.get({
                    url: cookieUrl,
                    jar: true,
                    encoding: null
                }, function (err, res, body) {
                    if (err) {
                        return done(err);
                    }

                    var cookieObject = JSON.parse(body).cookies,
                        stringifiedCookies = stringify(cookieObject),
                        response = Response.createFromNode(res, stringifiedCookies).toJSON();

                    expect(response.cookie).to.eql([]);
                    validateResponse(response);
                    done();
                });
            });

            it('should correctly set a cookie', function (done) {
                request.get({
                    url: cookieUrl + '/set?foo=bar',
                    jar: true,
                    encoding: null
                }, function (err, res, body) {
                    if (err) {
                        return done(err);
                    }

                    var cookieObject = JSON.parse(body).cookies,
                        stringifiedCookies = stringify(cookieObject),
                        response = Response.createFromNode(res, stringifiedCookies).toJSON();

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
                    jar: true,
                    encoding: null
                }, function (err, res, body) {
                    if (err) {
                        return done(err);
                    }

                    var cookieObject = JSON.parse(body).cookies,
                        stringifiedCookies = stringify(cookieObject),
                        response = Response.createFromNode(res, stringifiedCookies).toJSON();

                    expect(response.cookie).to.eql([]);
                    validateResponse(response);
                    done();
                });
            });
        });

        describe('miscellaneous requests', function () {
            var checkMime = function (mime) {
                expect(mime.type).to.be('text');
                expect(mime.name).to.be('response');
                expect(mime.filename).to.be('response.' + mime.format);
                expect(mime._accuratelyDetected).to.be(true);
                expect(mime.source).to.be('header');
                expect(mime.detected).to.be(null);
            };

            it('should return a valid gzipped response', function (done) {
                request.get({
                    uri: baseUrl + '/gzip',
                    gzip: true,
                    encoding: null
                }, function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    var response = Response.createFromNode(res),
                        json = response.toJSON(),
                        body = JSON.parse(json.body),
                        mime = response.mime();

                    expect(mime._originalContentType).to.be('application/json');
                    expect(mime._sanitisedContentType).to.be('application/json');

                    expect(body.gzipped).to.be(true);
                    expect(Header.headerValue(json.header, 'content-encoding')).to.be('gzip');

                    checkMime(mime);
                    validateResponse(response);
                    done();
                });
            });

            it('should return a valid deflated response', function (done) {
                request.get({
                    uri: baseUrl + '/deflate',
                    gzip: true,
                    encoding: null
                }, function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    var response = Response.createFromNode(res),
                        body = JSON.parse(response.toJSON().body);

                    expect(body.deflated).to.be(true);

                    validateResponse(response);
                    done();
                });
            });

            it('should return a valid utf-8 encoded response', function (done) {
                request.get({
                    uri: baseUrl + '/encoding/utf8',
                    encoding: null
                }, function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    var response = Response.createFromNode(res),
                        json = response.toJSON(),
                        mime = response.mime();

                    expect(mime._originalContentType).to.be('text/html; charset=utf-8');
                    expect(mime._sanitisedContentType).to.be('text/html');

                    expect(Header.headerValue(json.header, 'content-type')).to.match(/^text\/html/);
                    expect(json.body).to.match(/<html>.*/);

                    checkMime(mime);
                    validateResponse(response);
                    done();
                });
            });
        });
    });
});
