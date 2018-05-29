var fs = require('fs'),
    _ = require('lodash'),
    expect = require('expect.js'),
    reason = require('http-reasons'),
    util = require('../../lib/util'),
    request = require('postman-request'),

    fixtures = require('../fixtures'),
    Cookie = require('../../lib/index.js').Cookie,
    Response = require('../../lib/index.js').Response,
    Header = require('../../lib/index.js').Header,
    HeaderList = require('../../lib/index.js').HeaderList;

/* global describe, it */
describe('Response', function () {
    describe('sanity', function () {
        var rawResponse = fixtures.collectionV2.item[0].response[0],
            response = new Response(rawResponse);

        it('initializes successfully', function () {
            expect(response).to.be.ok();
        });

        it('should handle the absence of Buffer gracefully', function () {
            var response,
                originalBuffer = Buffer,
                stream = new Buffer('random').toJSON();

            delete global.Buffer;
            expect(function () {
                response = new Response({ stream: stream });
            }).to.not.throwError();

            expect(response).to.be.ok();
            global.Buffer = originalBuffer;
        });

        it('should handle non atomic bodies correctly', function () {
            var response = new Response({ body: { foo: 'bar' } });

            expect(response.body).to.eql({ foo: 'bar' });
        });

        it('should provide the response reason for malformed responses as well', function () {
            var response = new Response({ code: 200 });

            delete response.status;

            expect(response.reason()).to.be('OK');
        });

        describe('has property', function () {
            it('code', function () {
                expect(response).to.have.property('code', rawResponse.code);
            });

            it('cookies', function () {
                expect(response).to.have.property('cookies');
                expect(response.cookies.all()).to.be.an('array');
            });

            it('body', function () {
                expect(response).to.have.property('body', rawResponse.body);
            });

            it('header', function () {
                expect(response).to.have.property('headers');
                expect(response.headers.all()).to.be.an('array');
            });

            it('name', function () {
                expect(response).to.have.property('name', rawResponse.name);
            });

            it('originalRequest', function () {
                expect(response).to.have.property('originalRequest');
                expect(response.originalRequest.url.getRaw()).to.eql(rawResponse.originalRequest);
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

    describe('isResponse', function () {
        it('must distinguish between responses and other objects', function () {
            var response = new Response(),
                nonResponse = {};

            expect(Response.isResponse(response)).to.be(true);
            expect(Response.isResponse({})).to.be(false);
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

            expect(util.bufferOrArrayBufferToString(reconstructedResponse.stream)).to
                .eql(util.bufferOrArrayBufferToString(rawResponse.stream));
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

    describe('.encoding', function () {
        it('should work correctly, even for blank responses', function () {
            var response = new Response();

            expect(response.encoding()).to.eql({
                format: undefined,
                source: undefined
            });
        });

        it('should respect the content-encoding value', function () {
            var response = new Response({
                header: [
                    {
                        key: 'Content-Encoding',
                        value: 'arbitrary value'
                    }
                ]
            });

            expect(response.encoding()).to.eql({
                format: 'arbitrary value',
                source: 'header'
            });
        });

        it('should fallback to the response body if no content-encoding value is available', function () {
            var response = new Response({
                body: new Buffer([31, 139, 8]) // the specifics matter here
            });

            expect(response.encoding()).to.eql({
                format: 'gzip',
                source: 'body'
            });
        });

        it('should handle malformed bodies gracefully', function () {
            var response = new Response({ body: 'random' });

            expect(response.encoding()).to.eql({
                format: undefined,
                source: undefined
            });
        });
    });

    describe('.mime', function () {
        it('should correctly handle the absence of content-type', function () {
            var response = new Response({
                header: [
                    {
                        key: 'Content-Type',
                        value: 'application/json'
                    }
                ]
            });

            expect(response.mime()).to.eql({
                type: 'text',
                format: 'json',
                name: 'response',
                ext: 'json',
                charset: 'utf8',
                _originalContentType: 'application/json',
                _sanitisedContentType: 'application/json',
                _accuratelyDetected: true,
                filename: 'response.json',
                source: 'header',
                detected: null
            });
        });

        (typeof window === 'undefined' ? it : it.skip)('should correctly detect the mime type from the stream',
            function () {
                var response = new Response({
                    body: fs.readFileSync('test/fixtures/icon.png')
                });

                expect(response.mime()).to.eql({
                    type: 'image',
                    format: 'image',
                    name: 'response',
                    ext: 'png',
                    charset: 'utf8',
                    _originalContentType: 'image/png',
                    _sanitisedContentType: 'image/png',
                    _accuratelyDetected: true,
                    filename: 'response.png',
                    source: 'body',
                    detected: {
                        type: 'image',
                        format: 'image',
                        name: 'response',
                        ext: 'png',
                        charset: 'utf8',
                        _originalContentType: 'image/png',
                        _sanitisedContentType: 'image/png',
                        _accuratelyDetected: true,
                        filename: 'response.png'
                    }
                });
            });

        it('should handle content-type overrides correctly', function () {
            var response = new Response({ body: 'random' });

            expect(response.mime('text/html')).to.eql({
                type: 'text',
                format: 'html',
                name: 'response',
                ext: 'html',
                charset: 'utf8',
                _originalContentType: 'text/html',
                _sanitisedContentType: 'text/html',
                _accuratelyDetected: true,
                filename: 'response.html',
                source: 'forced',
                detected: null
            });
        });
    });
    describe('.contentInfo', function () {
        it('should get content info from the response object with content type and disposition headers', function () {
            var response = new Response({
                header: [
                    {
                        key: 'Content-Type',
                        value: 'application/json'
                    },
                    {
                        key: 'content-disposition',
                        value: 'attachment; filename=testResponse.json'
                    }
                ], stream: Buffer.from('random').toJSON()
            });

            expect(response.contentInfo()).to.eql({
                charset: 'utf8',
                extension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: 'testResponse.json'
            });
        });

        it('Should take the content-type from the response stream if content-type headers is not present', function () {
            // data url of png image
            var img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0' +
                'NAAAAKElEQVQ4jWNgYGD4Twzu6FhFFGYYNXDUwGFpIAk2E4dHDRw1cDgaCAASFOffhEIO' +
                '3gAAAABJRU5ErkJggg==',
                // replacing the mime type and encoded format
                data = img.replace(/^data:image\/\w+;base64,/, ''),
                // creating the buffer of the image file
                response = new Response({ stream: Buffer.from(data, 'base64') });

            expect(response.contentInfo(response)).to.eql({
                charset: 'utf8',
                extension: 'png',
                fileName: 'response.png',
                mimeFormat: 'image',
                mimeType: 'image'
            });
        });
    });

    describe('.size', function () {
        it('should handle blank responses correctly', function () {
            var response = new Response();
            expect(response.size()).to.eql({
                body: 0, header: 30, total: 30
            });
        });
    });

    describe('.dataURI', function () {
        it('should work correctly for blank responses', function () {
            var response = new Response();

            expect(response.dataURI()).to.be('data:text/plain;base64, ');
        });

        it('should handle response streams correctly', function () {
            var response = new Response({ stream: new Buffer('random') });

            expect(response.dataURI()).to.be('data:text/plain;base64, cmFuZG9t');
        });

        it('should handle regular bodies correctly', function () {
            var response = new Response({ body: 'random' });

            expect(response.dataURI()).to.be('data:text/plain;base64, cmFuZG9t');
        });
    });

    describe('details', function () {
        it('should correctly accept provided details', function () {
            expect(new Response({ code: 200 }).details()).to.eql({
                name: 'OK',
                standardName: 'OK',
                detail: reason.lookup(200).detail,
                code: 200
            });
        });

        it('should correctly set a flag for server reasons', function () {
            expect(new Response({ code: 200 }).details()).to.eql({
                name: 'OK',
                standardName: 'OK',
                detail: reason.lookup(200).detail,
                code: 200
            });
        });

        it('should correctly update the reason and response code where applicable', function () {
            var response = new Response({ code: 200 });

            expect(response.details()).to.eql({
                name: 'OK',
                standardName: 'OK',
                detail: reason.lookup(200).detail,
                code: 200
            });

            response.update({ code: 201, reason: true });

            expect(response.details()).to.eql({
                name: 'Created',
                standardName: 'Created',
                detail: reason.lookup('201').detail,
                code: 201
            });
        });

        it('should correctly check for response code disparities', function () {
            var response = new Response();

            response.code = 201; // hijacked update

            expect(response.details()).to.eql({
                name: 'Created',
                standardName: 'Created',
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

        it('must use byteLength from buffer if provided', function () {
            var rawResponse = {
                    code: 200,
                    header: 'Transfer-Encoding: chunked',
                    stream: new Buffer('something nice')
                },
                response = new Response(rawResponse);
            expect(response.size().body).to.eql(14);
        });
    });

    describe('toJSON', function () {
        it('should correctly return a plain JSON response object without _details', function () {
            var response = new Response({
                    name: 'a sample response',
                    originalRequest: 'https://postman-echo.com/get',
                    code: 200,
                    body: '{"foo":"bar"}'
                }),
                responseJson = response.toJSON();

            expect(responseJson.id).to.match(/^[a-z0-9]{8}(-[a-z0-9]{4}){4}[a-z0-9]{8}$/);
            expect(_.omit(responseJson, 'id')).to.eql({
                name: 'a sample response',
                status: 'OK',
                code: 200,
                originalRequest: {
                    url: {
                        host: ['postman-echo', 'com'],
                        path: ['get'],
                        protocol: 'https',
                        query: [],
                        variable: []
                    },
                    method: 'GET'
                },
                header: [],
                body: '{"foo":"bar"}',
                cookie: []
            });
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
                    body = response.toJSON(),
                    headers = new HeaderList(null, body.header);

                expect(headers.get('bar')).to.be('foo');
                expect(headers.get('foo')).to.be('bar, bar2');

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
                        mime = response.mime(),
                        headers = new HeaderList(null, json.header);

                    expect(mime._originalContentType).to.be('application/json; charset=utf-8');
                    expect(mime._sanitisedContentType).to.be('application/json');

                    expect(body.gzipped).to.be(true);
                    expect(headers.get('content-encoding')).to.be('gzip');

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

                    expect((new HeaderList(null, json.header)).get('content-type')).to.match(/^text\/html/);
                    expect(json.body).to.match(/<html>.*/);

                    checkMime(mime);
                    validateResponse(response);
                    done();
                });
            });
        });
    });

    describe('static methods', function () {
        describe('.mimeInfo', function () {
            it('should handle incoming Header instances correctly', function () {
                expect(Response.mimeInfo(new Header({ key: 'Content-Type', value: 'random' }),
                    new Header({ key: 'Content-Disposition', value: 'attachment; filename=response' }))).to.eql({
                    type: 'unknown',
                    format: 'raw',
                    name: 'response',
                    ext: '',
                    charset: 'utf8',
                    _originalContentType: 'random',
                    _sanitisedContentType: 'random',
                    _accuratelyDetected: false,
                    filename: 'response'
                });
            });

            it('should bail out for non string content-type specifications', function () {
                expect(Response.mimeInfo(1)).to.be(undefined);
            });
        });
    });
});
