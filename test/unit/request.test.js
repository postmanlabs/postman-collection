var expect = require('chai').expect,
    fixtures = require('../fixtures'),
    sdk = require('../../lib/index.js'),
    PropertyList = sdk.PropertyList,
    Url = sdk.Url,
    Request = sdk.Request;

describe('Request', function () {
    var rawRequest = fixtures.collectionV2.item[1].request,
        request = new Request(rawRequest);

    describe('constructor', function () {
        it('should handle all properties', function () {
            var requestDefinition = {
                    method: 'GET',
                    url: {
                        host: ['postman-echo', 'com'],
                        'protocol': 'http',
                        'query': [],
                        'variable': []
                    },
                    auth: {
                        type: 'basic',
                        basic: [{
                            key: 'username',
                            type: 'string',
                            value: 'postman'
                        }, {
                            key: 'password',
                            type: 'string',
                            value: 'password'
                        }]
                    }
                },
                request = new Request(requestDefinition);

            expect(request).to.have.property('url').that.eql(new sdk.Url(requestDefinition.url));
            expect(request).to.have.property('auth').that.eql(new sdk.RequestAuth(requestDefinition.auth));
        });

        it('should not create auth if auth is falsy', function () {
            var requestDefinition = {
                    method: 'GET',
                    url: {
                        host: ['postman-echo', 'com'],
                        'protocol': 'http',
                        'query': [],
                        'variable': []
                    },
                    auth: null
                },
                request = new Request(requestDefinition);

            expect(request).to.not.have.property('auth');
            expect(request.toJSON()).to.not.have.property('auth');
        });
    });

    describe('sanity', function () {
        var rawRequest = fixtures.collectionV2.item[1],
            request = new Request(rawRequest.request);

        it('initializes successfully', function () {
            expect(request).to.be.ok;
        });

        it('should handle arbitrary options correctly', function () {
            var req = new Request({
                url: {
                    raw: 'https://postman-echo.com/:path',
                    protocol: 'https',
                    host: ['postman-echo', 'com'],
                    path: [':path'],
                    variable: [
                        {
                            key: 'path',
                            value: 'get'
                        }
                    ]
                },
                proxy: {},
                certificate: {}
            });

            expect(req).to.have.property('method', 'GET');
            expect(sdk.ProxyConfig.isProxyConfig(req.proxy)).to.be.true;
            expect(sdk.Certificate.isCertificate(req.certificate)).to.be.true;

            req.update({ method: 'POST' });

            expect(req).to.have.property('method', 'POST');
            expect(req.toJSON()).to.have.keys(['certificate', 'method', 'proxy', 'url']);
        });

        describe('request method', function () {
            it('should default to GET', function () {
                expect(new Request()).to.have.property('method', 'GET');
            });

            it('should handle null & undefined correctly', function () {
                var req = new Request({
                    method: null,
                    url: 'https://postman-echo.com/:path'
                });

                expect(req).to.have.property('method', 'GET');

                req.update({ method: undefined });
                expect(req).to.have.property('method', 'GET');
            });

            it('should handle non-string correctly', function () {
                var req = new Request({
                    method: 12345,
                    url: 'https://postman-echo.com/:path'
                });

                expect(req).to.have.property('method', '12345');

                req.update({ method: false });
                expect(req).to.have.property('method', 'FALSE');
            });

            it('should handle object & function correctly', function () {
                var req = new Request({
                    method: { name: 'GET' },
                    url: 'https://postman-echo.com/:path'
                });

                expect(req).to.have.property('method', '[OBJECT OBJECT]');

                req.update({ method: function () { return 0; } });
                expect(req).to.have.property('method', 'FUNCTION () { RETURN 0; }');

                req.update({ method: [1, 2, 3] });
                expect(req).to.have.property('method', '1,2,3');
            });
        });

        describe('has property', function () {
            it('headers', function () {
                expect(request).to.have.property('headers');
                expect(request.headers.all()).to.be.an('array').that.has.lengthOf(1);
            });

            it('body', function () {
                expect(request).to.have.property('body');
            });

            it('method', function () {
                expect(request).to.have.property('method').that.is.a('string');
            });

            describe('url', function () {
                it('an object', function () {
                    expect(request).to.have.property('url').that.is.an('object');
                    expect(request.url).to.not.be.empty;
                });

                describe('has property', function () {
                    describe('auth', function () {
                        it('is undefined', function () {
                            expect(request.url).to.have.property('auth', undefined);
                        });
                    });

                    it('protocol', function () {
                        expect(request.url).to.have.property('protocol', 'http');
                    });

                    it('port', function () {
                        expect(request.url).to.have.property('port', undefined);
                    });

                    it('path', function () {
                        expect(request.url).to.have.property('path').that.is.an('array');
                        expect(request.url.path).to.not.be.empty;
                    });

                    it('hash', function () {
                        expect(request.url).to.have.property('hash', undefined);
                    });

                    it('host', function () {
                        expect(request.url).to.have.property('host').that.is.an('array');
                        expect(request.url.host).to.not.be.empty;
                    });

                    it('query', function () {
                        expect(request.url).to.have.property('query');
                    });
                });
            });
        });

        describe('has function', function () {
            it('getHeaders', function () {
                expect(request.getHeaders).to.be.ok;
                expect(request.getHeaders).to.be.a('function');
            });

            it('forEachHeader', function () {
                expect(request.forEachHeader).to.be.ok;
                expect(request.forEachHeader).to.be.a('function');
            });
        });
    });

    describe('isRequest', function () {
        it('should distinguish between requests and other objects', function () {
            var request = new Request(),
                nonRequest = {};

            expect(Request.isRequest(request)).to.be.true;
            expect(Request.isRequest(nonRequest)).to.be.false;
            expect(Request.isRequest()).to.be.false;
        });
    });

    describe('json representation', function () {
        it('should match what the request was initialized with', function () {
            var jsonified = request.toJSON();

            expect(jsonified.method).to.eql(rawRequest.method);
            expect(jsonified.url).to.eql({
                protocol: 'http',
                path: ['post'],
                host: ['echo', 'getpostman', 'com'],
                query: [],
                variable: []
            });
            expect(jsonified).to.deep.include({
                header: rawRequest.header,
                body: rawRequest.body,
                description: rawRequest.description
            });
            expect(jsonified.proxy).to.eql(rawRequest.proxy);
        });
    });

    describe('addQueryParams', function () {
        it('should add query parameters to the request', function () {
            var testReq = request.clone(),
                addedParams = fixtures.queryParams;

            testReq.addQueryParams(addedParams);
            expect(testReq.url.query.count()).to.equal(2);
            testReq.url.query.each(function (param, index) {
                var expectedParam = addedParams[index];
                expect(param).to.deep.include({
                    key: expectedParam.key,
                    value: expectedParam.value
                });
            });
        });
    });

    describe('getHeaders', function () {
        it('should get only enabled headers', function () {
            var rawRequest = {
                    url: 'postman-echo.com',
                    method: 'GET',
                    header: [
                        {
                            key: 'some',
                            value: 'header'
                        },
                        {
                            key: 'other',
                            value: 'otherheader',
                            disabled: true
                        }
                    ]
                },
                request = new Request(rawRequest);
            expect(request.getHeaders({ enabled: true })).to.eql({
                some: 'header'
            });
        });

        it('should return an empty object for empty requests', function () {
            var request = new Request();
            expect(request.getHeaders()).to.eql({});
        });
    });

    describe('upsertHeader', function () {
        it('should add a header if it does not exist', function () {
            var rawRequest = {
                    url: 'postman-echo.com',
                    method: 'GET',
                    header: [
                        {
                            key: 'some',
                            value: 'header'
                        },
                        {
                            key: 'other',
                            value: 'otherheader',
                            disabled: true
                        }
                    ]
                },
                request = new Request(rawRequest);
            request.upsertHeader({ key: 'third', value: 'header' });
            expect(request.headers.toJSON()).to.eql([
                {
                    key: 'some',
                    value: 'header'
                },
                {
                    key: 'other',
                    value: 'otherheader',
                    disabled: true
                },
                {
                    key: 'third',
                    value: 'header'
                }
            ]);
        });
        it('should replace the header value if it exists', function () {
            var rawRequest = {
                    url: 'postman-echo.com',
                    method: 'GET',
                    header: [
                        {
                            key: 'some',
                            value: 'header'
                        },
                        {
                            key: 'other',
                            value: 'otherheader',
                            disabled: true
                        }
                    ]
                },
                request = new Request(rawRequest);
            request.upsertHeader({ key: 'other', value: 'changedvalue' });
            expect(request.headers.toJSON()).to.eql([
                {
                    key: 'some',
                    value: 'header'
                },
                {
                    key: 'other',
                    value: 'changedvalue',
                    disabled: true
                }
            ]);
        });
        it('should do nothing if no header is given', function () {
            var rawRequest = {
                    url: 'postman-echo.com',
                    method: 'GET',
                    header: [
                        {
                            key: 'some',
                            value: 'header'
                        },
                        {
                            key: 'other',
                            value: 'otherheader',
                            disabled: true
                        }
                    ]
                },
                request = new Request(rawRequest);
            request.upsertHeader();
            expect(request.headers.toJSON()).to.eql([
                {
                    key: 'some',
                    value: 'header'
                },
                {
                    key: 'other',
                    value: 'otherheader',
                    disabled: true
                }
            ]);
        });
    });

    describe('removeQueryParams', function () {
        it('should remove query parameters from the request', function () {
            var testReq = request.clone(),
                firstParam = fixtures.queryParams[0],
                secondParam = fixtures.queryParams[1];

            // Add two params
            testReq.addQueryParams([firstParam, secondParam]);

            // Remove one
            testReq.removeQueryParams(firstParam.key);

            // Ensure only one is left
            expect(testReq.url.query.count()).to.equal(1);

            // Ensure that the remaining param is the one that was not removed.
            testReq.url.query.each(function (param) {
                // Ideally, only one param should be left, so this runs only once.
                expect(param).to.deep.include({
                    key: secondParam.key,
                    value: secondParam.value
                });
            });
        });
    });

    describe('.removeHeader', function () {
        it('should bail out for invalid parameters', function () {
            var request = new Request({
                header: [
                    { key: 'foo', value: 'bar' }
                ]
            });

            request.removeHeader({});
            expect(request.headers.toJSON()).to.eql([{
                key: 'foo',
                value: 'bar'
            }]);
        });
    });

    describe('.forEachHeader', function () {
        it('should traverse the set of headers correctly', function () {
            var request = new Request({
                    header: [{ key: 'foo', value: 'bar' }]
                }),
                result = [];

            request.forEachHeader(function (header) {
                result.push(header.key);
            });
            expect(result).to.eql(['foo']);
        });
    });

    describe('.authoriseUsing', function () {
        it('should be able to set an authentication property using a specific type', function () {
            var request = new Request();

            request.authorizeUsing('noauth', {
                foo: 'bar'
            });

            request.authorizeUsing('basic', {
                username: 'foo',
                password: 'bar'
            });

            expect(request.auth.toJSON()).to.eql({
                type: 'basic',
                noauth: [
                    { type: 'any', value: 'bar', key: 'foo' }
                ],
                basic: [
                    { type: 'any', value: 'foo', key: 'username' },
                    { type: 'any', value: 'bar', key: 'password' }
                ]
            });
        });
    });

    describe('empty requests', function () {

        it('should have a url', function () {
            var r = new Request();

            expect(r).to.have.property('url').that.is.an.instanceOf(Url);
        });

        it('should have a method', function () {
            var r = new Request();

            expect(r).to.have.property('method');
            expect(r.method).to.equal('GET');
        });

        it('should have an empty property-list of headers', function () {
            var r = new Request();

            expect(r).to.have.property('headers').that.is.an.instanceOf(PropertyList);
            expect(r.headers.count()).to.equal(0);
        });
    });

    describe('custom http method', function () {
        it('should handle custom HTTP method correctly', function () {
            var request = new Request({
                method: 'POSTMAN',
                url: {
                    host: ['postman-echo', 'com'],
                    'protocol': 'http',
                    'query': [],
                    'variable': []
                }
            });

            expect(request).to.have.property('method', 'POSTMAN');
            expect(request.toJSON()).to.have.property('method', 'POSTMAN');
        });
    });
});
