var fs = require('fs'),
    os = require('os'),
    _ = require('lodash'),
    expect = require('chai').expect,
    reason = require('http-reasons'),
    util = require('../../lib/util'),
    request = require('postman-request'),

    fixtures = require('../fixtures'),
    Cookie = require('../../lib/index.js').Cookie,
    Response = require('../../lib/index.js').Response,
    Header = require('../../lib/index.js').Header,
    HeaderList = require('../../lib/index.js').HeaderList;

describe('Response', function () {
    describe('sanity', function () {
        var rawResponse = fixtures.collectionV2.item[0].response[0],
            response = new Response(rawResponse);

        it('initializes successfully', function () {
            expect(response).to.be.ok;
        });

        it('should handle the absence of Buffer gracefully', function () {
            var response,
                originalBuffer = Buffer,
                stream = Buffer.from('random').toJSON();

            delete global.Buffer;
            expect(function () {
                response = new Response({ stream });
            }).to.not.throw();

            expect(response).to.be.ok;
            global.Buffer = originalBuffer;
        });

        it('should handle base64 response stream', function () {
            var buffer = Buffer.from('Postman'),
                response = new Response({
                    stream: {
                        type: 'Base64',
                        data: buffer.toString('base64')
                    }
                });

            expect(response.toJSON()).to.have.property('stream')
                .that.eql(buffer.toJSON());
            expect(response.text()).to.equal('Postman');
        });

        it('should handle non atomic bodies correctly', function () {
            var response = new Response({ body: { foo: 'bar' } });

            expect(response.body).to.eql({ foo: 'bar' });
        });

        it('should provide the response reason for malformed responses as well', function () {
            var response = new Response({ code: 200 });

            delete response.status;

            expect(response.reason()).to.equal('OK');
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
                expect(response.originalRequest.url.toString()).to.eql(rawResponse.originalRequest);
            });

            it('status', function () {
                expect(response).to.have.property('status', rawResponse.status);
            });
        });

        describe('has function', function () {
            it('update', function () {
                expect(response.update).to.be.ok;
                expect(response.update).to.be.a('function');
            });
        });
    });

    describe('isResponse', function () {
        it('must distinguish between responses and other objects', function () {
            var response = new Response(),
                nonResponse = {};

            expect(Response.isResponse(response)).to.be.true;
            expect(Response.isResponse({})).to.be.false;
            expect(Response.isResponse(nonResponse)).to.be.false;
        });
    });

    describe('json representation', function () {
        it('must match what the response was initialized with', function () {
            var rawResponse = fixtures.collectionV2.item[0].response[0],
                response = new Response(rawResponse),
                jsonified = response.toJSON();

            expect(jsonified).to.deep.include({
                status: rawResponse.status,
                code: rawResponse.code,
                body: rawResponse.body
            });
            expect(Header.unparse(jsonified.header).trim()).to.eql(rawResponse.header.trim());
            // Skip cookie tests, because cookies are tested independently.
            expect(jsonified).to.have.property('cookie');
        });

        it('must retain Buffer nature on stream property after new Response(response.toJSON())', function () {
            var rawResponse = {
                    body: 'response body',
                    stream: Buffer.from([114, 101, 115, 112, 111, 110, 115, 101, 32, 98, 111, 100, 121])
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
            expect(jsonified).to.deep.include({
                code: rawResponse.code,
                body: rawResponse.body
            });

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
                body: Buffer.from([31, 139, 8]) // the specifics matter here
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
        it('should throw error as function is discontinued', function () {
            expect(function () {
                var response = new Response({ body: 'random' });

                response.mime('text/html');
            }).to.throw('`Response#mime` has been discontinued, use `Response#contentInfo` instead.');
        });
    });

    describe('.contentInfo', function () {
        it('should get content info from the response object with content type and disposition headers', function () {
            var response = new Response({
                header: [
                    {
                        key: 'Content-Type',
                        value: 'application/JSON'
                    },
                    {
                        key: 'content-disposition',
                        value: 'attachment; filename=testResponse.json'
                    }
                ], stream: Buffer.from('random').toJSON()
            });

            expect(response.contentInfo()).to.eql({
                charset: 'utf8',
                contentType: 'application/json',
                fileExtension: 'json',
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
                contentType: 'image/png',
                fileExtension: 'png',
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
                body: 0, header: 32, total: 32
            });
        });
    });

    describe('.dataURI', function () {
        it('should work correctly for blank responses', function () {
            var response = new Response();

            expect(response.dataURI()).to.equal('data:text/plain;base64, ');
        });

        it('should handle response streams correctly', function () {
            var response = new Response({ stream: Buffer.from('random') });

            expect(response.dataURI()).to.equal('data:text/plain;base64, cmFuZG9t');
        });

        it('should handle regular bodies correctly', function () {
            var response = new Response({ body: 'random' });

            expect(response.dataURI()).to.equal('data:text/plain;base64, cmFuZG9t');
        });

        it('should respect the content-type header', function () {
            var response = new Response({
                body: '{"foo":"bar"}',
                header: [{ key: 'content-type', value: 'application/json' }]
            });

            expect(response.dataURI()).to.equal('data:application/json;base64, eyJmb28iOiJiYXIifQ==');
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
                stream: Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])
            })).text()).to.equal('buffer');
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

            expect(json).to.be.undefined;
            expect(error).to.be.an('error');
            expect(error.toString()).to.equal('JSONError: Unexpected token \'w\' at 1:12\n' +
                '{ "hello: "world" }\n' +
                '           ^');
        });

        it('should parse response as JSONP', function () {
            expect((new Response({
                body: 'adsgfd({"hello":"world"})'
            })).jsonp()).to.eql({
                hello: 'world'
            });
        });

        it('should parse response as JSONP even when sent as JSON', function () {
            expect((new Response({
                body: '{"hello":"world"}'
            })).jsonp()).to.eql({
                hello: 'world'
            });
        });

        it('should parse response as JSONP with comment prefix', function () {
            expect((new Response({
                body: '/**/adsgfd({"hello":"world"})'
            })).jsonp()).to.eql({
                hello: 'world'
            });
        });

        it('should parse response as JSONP with array content', function () {
            expect((new Response({
                body: '/**/adsgfd([{"hello":"world"}])'
            })).jsonp()).to.eql([{
                hello: 'world'
            }]);
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

            expect(response.size().body).to.equal(10);
        });

        it('must match the content-length of the response if deflate encoded', function () {
            var rawResponse = {
                    code: 200,
                    body: 'gzipped content xyzxyzxyzxyzxyzxyz',
                    header: 'Content-Encoding: deflate\nContent-Length: 20'
                },
                response = new Response(rawResponse);

            expect(response.size().body).to.equal(20);
        });

        it('must use byteLength from buffer if provided', function () {
            var rawResponse = {
                    code: 200,
                    header: 'Transfer-Encoding: chunked',
                    stream: Buffer.from('something nice')
                },
                response = new Response(rawResponse);

            expect(response.size().body).to.equal(14);
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

            // eslint-disable-next-line security/detect-unsafe-regex
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

    describe('timingPhases', function () {
        it('should correctly calculate timing phases from provided timings', function () {
            var timings = {
                    start: 1550571957689,
                    offset: {
                        request: 42,
                        socket: 60.32290899999998,
                        lookup: 886.8630629999998,
                        connect: 1124.8914719999998,
                        secureConnect: 1581.137341,
                        response: 1840.1438239999998,
                        end: 1845.5300419999999,
                        done: 1864
                    }
                },
                timingPhases = {
                    prepare: 42,
                    wait: 18.32290899999998,
                    dns: 826.5401539999998,
                    tcp: 238.028409,
                    firstByte: 259.00648299999966,
                    download: 5.386218000000099,
                    process: 18.469958000000133,
                    total: 1864,
                    secureHandshake: 456.2458690000003
                };

            expect(Response.timingPhases(timings)).to.eql(timingPhases);
        });

        it('should calculate timing phases without secureConnect', function () {
            var timings = {
                    start: 1550571957689,
                    offset: {
                        request: 42,
                        socket: 60.32290899999998,
                        lookup: 886.8630629999998,
                        connect: 1124.8914719999998,
                        response: 1840.1438239999998,
                        end: 1845.5300419999999,
                        done: 1864
                    }
                },
                timingPhases = {
                    prepare: 42,
                    wait: 18.32290899999998,
                    dns: 826.5401539999998,
                    tcp: 238.028409,
                    firstByte: 715.252352,
                    download: 5.386218000000099,
                    process: 18.469958000000133,
                    total: 1864
                };

            expect(Response.timingPhases(timings)).to.eql(timingPhases);
        });

        it('should return if timings are not provided', function () {
            expect(Response.timingPhases()).to.be.undefined;
        });
    });

    // skip this test sub-suite in the browser
    ((typeof window === 'undefined') ? describe : describe.skip)('createFromNode', function () {
        var baseUrl = 'https://postman-echo.com',
            isHeader = Header.isHeader.bind(Header),
            isCookie = Cookie.isCookie.bind(Cookie),

            getBuffer = function (array) {
                return Buffer.from(new Uint32Array(array));
            },

            validateResponse = function (response) {
                var json = response.toJSON(),
                    buffer = getBuffer(json.stream.data);

                expect(json.code).to.be.a('number');
                expect(json.status).to.be.a('string');
                expect(json.responseSize).to.be.a('number');

                expect(json.stream).to.be.an('object');
                expect(json.stream.type).to.equal('Buffer');
                expect(json.stream.data).to.be.an('array');
                expect(buffer.toString()).to.equal(response.body);

                expect(json.header).to.be.an('array');
                expect(json.cookie).to.be.an('array');

                expect(_.every(response.headers.members, isHeader)).to.be.true;
                expect(_.every(response.cookies.members, isCookie)).to.be.true;
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
                })).text()).to.equal(`ハローポストマン${os.EOL}`); // Harōposutoman
            });

            it('charset(windows-1251)- Cyrillic', function () {
                expect((new Response({
                    header: [{
                        key: 'content-type',
                        value: 'text/html; charset=windows-1251'
                    }],
                    stream: fs.readFileSync('test/fixtures/russianCharacters.txt')
                })).text()).to.equal(`Привет почтальон${os.EOL}`); // Privet pochtal'on
            });

            it('Fallback to utf8, if it is not supported by iconvlite, say (ISO-8859-1)', function () {
                expect((new Response({
                    header: [{
                        key: 'content-type',
                        value: 'text/html; charset=ISO-8859-1'
                    }],
                    stream: Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])
                })).text()).to.equal('buffer');
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

                    expect(body.form).to.deep.include({
                        alpha: 'foo',
                        beta: 'bar',
                        buffer: '\u0001\u0002\u0003'
                    });

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

                expect(headers.get('bar')).to.equal('foo');
                expect(headers.get('foo')).to.equal('bar, bar2');

                validateResponse(response);
                done();
            });
        });

        describe('miscellaneous requests', function () {
            var checkMime = function (mime) {
                expect(mime).to.deep.include({
                    mimeType: 'text',
                    charset: 'utf8',
                    fileName: 'response.' + mime.mimeFormat
                });
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
                        mime = response.contentInfo(),
                        headers = new HeaderList(null, json.header);

                    expect(body.gzipped).to.be.true;
                    expect(headers.get('content-encoding')).to.equal('gzip');

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

                    expect(body.deflated).to.be.true;

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
                        mime = response.contentInfo();

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
            it('should throw error as function is discontinued', function () {
                expect(function () {
                    Response.mimeInfo();
                }).to.throw('`Response.mimeInfo` has been discontinued, use `Response#contentInfo` instead.');
            });
        });
    });
});
