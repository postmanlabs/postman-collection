var _ = require('lodash'),
    expect = require('expect.js'),
    aws4 = require('aws4'),

    Request = require('../../').Request,
    RequestAuth = require('../../').RequestAuth,
    Url = require('../../').Url,
    rawRequests = require('../fixtures/index').authRequests;

/* global describe, it */
describe('RequestAuth', function () {
    describe('noauth', function () {
        it('should work correctly', function () {
            var request = new Request({ auth: { noauth: {}, type: 'noauth' } });

            expect(request.auth.noauth.authorize(request)).to.eql(request);

            request.auth.noauth.update({ foo: 'bar' });
            expect(request.auth.noauth).to.eql({ noauth: { foo: 'bar' } });
        });
    });

    describe('basic', function () {
        it('Auth header must be added', function () {
            var request = new Request(rawRequests.basic),
                authorizedReq = request.auth.basic.authorize(request),
                headers = authorizedReq.headers.all(),
                authHeader;
            expect(headers.length).to.eql(1);

            authHeader = headers[0];
            expect(authHeader.toString()).to.eql('Authorization: Basic YWJoaWppdDprYW5l');
            expect(authHeader.system).to.be(true);
        });

        it('should bail out if username is missing', function () {
            var sansUserReq = _.omit(rawRequests.basic, 'auth.basic.username'),
                request = new Request(sansUserReq),
                authorizedReq = request.auth.basic.authorize(request);

            expect(authorizedReq.headers.all()).to.be.empty();
            expect(authorizedReq.toJSON()).to.eql({
                auth: {
                    basic: {
                        password: 'kane'
                    },
                    type: 'basic'
                },
                body: undefined,
                certificate: undefined,
                description: {
                    content: '',
                    type: 'text/plain'
                },
                header: undefined,
                method: 'GET',
                proxy: undefined,
                url: 'httpbin.org/get'
            });
        });
    });

    describe('digest', function () {
        it('Auth header must be added', function () {
            var request = new Request(rawRequests.digest),
                authorizedReq = request.auth.digest.authorize(request),
                headers = authorizedReq.headers.all(),
                expectedHeader = 'Authorization: Digest username="postman", realm="Users", ' +
                    'nonce="bcgEc5RPU1ANglyT2I0ShU0oxqPB5jXp", uri="/digest-auth", ' +
                    'response="63db383a0f03744cfd45fe15de8dbe9d", opaque=""',
                authHeader;

            expect(headers.length).to.eql(1);
            authHeader = headers[0];

            expect(authHeader.toString()).to.eql(expectedHeader);
            expect(authHeader.system).to.be(true);
        });

        it('should throw an error if qop is auth-int', function () {
            var request = new Request(rawRequests.digest),
                authorizedReq = request.auth.digest.authorize(request),
                headers = authorizedReq.headers.all(),
                expectedHeader = 'Authorization: Digest username="postman", realm="Users", ' +
                    'nonce="bcgEc5RPU1ANglyT2I0ShU0oxqPB5jXp", uri="/digest-auth", ' +
                    'response="63db383a0f03744cfd45fe15de8dbe9d", opaque=""',
                authHeader;

            expect(headers.length).to.eql(1);
            authHeader = headers[0];

            expect(authHeader.toString()).to.eql(expectedHeader);
            expect(authHeader.system).to.be(true);

            expect(function () {
                request.auth.digest.sign({
                    algorithm: 'MD5-sess',
                    qop: 'auth-int'
                });
            }).to.throwError('Digest Auth with "qop": "auth-int" is not supported.');
        });

        it('should sign requests correctly', function () {
            var request = new Request(rawRequests.digest),
                authorizedReq = request.auth.digest.authorize(request),
                headers = authorizedReq.headers.all(),
                expectedHeader = 'Authorization: Digest username="postman", realm="Users", ' +
                    'nonce="bcgEc5RPU1ANglyT2I0ShU0oxqPB5jXp", uri="/digest-auth", ' +
                    'response="63db383a0f03744cfd45fe15de8dbe9d", opaque=""',
                authHeader,
                signedReq;

            expect(headers.length).to.eql(1);
            authHeader = headers[0];

            expect(authHeader.toString()).to.eql(expectedHeader);
            expect(authHeader.system).to.be(true);

            signedReq = request.auth.digest.sign({
                username: 'postman',
                password: 'secret',
                method: '',
                nonce: 'bcgEc5RPU1ANglyT2I0ShU0oxqPB5jXp',
                realm: 'arbitrary',
                algorithm: 'MD5-sess',
                opaque: 'yes',
                cnonce: '12345',
                uri: 'digest.com',
                qop: 'auth'
            });

            // eslint-disable-next-line max-len
            expect(signedReq).to.be('Digest username="postman", realm="arbitrary", nonce="bcgEc5RPU1ANglyT2I0ShU0oxqPB5jXp", uri="digest.com", qop=auth, nc=undefined, cnonce="undefined", response="0e6c5da057faa597580568bcd490a369", opaque="yes"');
        });

        it('Auth header must have uri with query params in case of request with the same', function () {
            var request = new Request(rawRequests.digestWithQueryParams),
                authorizedReq = request.auth.digest.authorize(request),
                authHeader = authorizedReq.headers.one('Authorization'),
                expectedHeader = 'Authorization: Digest username="postman", realm="Users", ' +
                    'nonce="bcgEc5RPU1ANglyT2I0ShU0oxqPB5jXp", uri="/digest-auth?key=value", ' +
                    'response="24dfb8851ee27e4b00252a13b1fd8ec3", opaque=""';

            expect(authHeader.toString()).to.eql(expectedHeader);
        });

        it('should bail out for invalid requests', function () {
            var request = new Request(_.omit(rawRequests.digest, 'auth.digest.username')),
                authorizedReq = request.auth.digest.authorize(request);

            expect(authorizedReq.headers.all()).to.be.empty();
            // Since Nonce and Timestamp have to be generated at runtime, cannot assert anything beyond this.
            expect(authorizedReq.toJSON()).to.eql({
                url: 'https://postman-echo.com/digest-auth',
                method: 'GET',
                header: undefined,
                certificate: undefined,
                proxy: undefined,
                body: undefined,
                description: undefined,
                auth: {
                    type: 'digest',
                    digest: {
                        realm: 'Users',
                        password: 'password',
                        nonce: 'bcgEc5RPU1ANglyT2I0ShU0oxqPB5jXp',
                        nonceCount: '',
                        algorithm: 'MD5',
                        qop: '',
                        clientNonce: '',
                        opaque: ''
                    }
                }
            });
        });
    });

    describe('oauth1', function () {
        it('Auth header must be added', function () {
            var request = new Request(rawRequests.oauth1),
                authorizedReq = request.auth.oauth1.authorize(request),
                headers = authorizedReq.headers.all(),
                authHeader;

            expect(headers.length).to.eql(1);
            authHeader = headers[0];
            // Since Nonce and Timestamp have to be generated at runtime, cannot assert anything beyond this.
            expect(authHeader.toString()).to.match(/Authorization: OAuth/);
            expect(authHeader.system).to.be(true);
        });

        it('should support the camelCased timeStamp option as well', function () {
            var request = new Request(_(rawRequests.oauth1).omit('auth.oauth1.timestamp').merge({
                    auth: {
                        oauth1: {
                            timeStamp: 1234
                        }
                    }
                }).value()),
                authorizedReq = request.auth.oauth1.authorize(request),
                headers = authorizedReq.headers.all(),
                authHeader;

            expect(headers.length).to.eql(1);
            authHeader = headers[0];
            // Since Nonce and Timestamp have to be generated at runtime, cannot assert anything beyond this.
            expect(authHeader.toString()).to.match(/Authorization: OAuth/);
            expect(authHeader.system).to.be(true);
            expect(authorizedReq.auth.oauth1.timestamp).to.be(1234);
        });

        it('should bail out if the auth params are invalid', function () {
            var request = new Request(_.omit(rawRequests.oauth1, 'auth.oauth1.consumerKey')),
                authorizedReq = request.auth.oauth1.authorize(request);

            expect(authorizedReq.headers.all()).to.have.length(1);
            expect(_.omit(authorizedReq.toJSON(), ['header'])).to.eql({
                auth: {
                    type: 'oauth1',
                    oauth1: {
                        consumerSecret: 'D+EdQ-gs$-%@2Nu7',
                        token: '',
                        tokenSecret: '',
                        signatureMethod: 'HMAC-SHA1',
                        timestamp: '1453890475',
                        nonce: 'yly1UR',
                        version: '1.0',
                        realm: 'oauthrealm',
                        addParamsToHeader: true,
                        autoAddParam: true,
                        addEmptyParamsToSign: false
                    }
                },
                body: undefined,
                certificate: undefined,
                description: undefined,
                proxy: undefined,
                url: 'https://postman-echo.com/oauth1?hi=hello&yo=true',
                method: 'POST'
            });
        });

        it('should apply sensible defaults where applicable', function () {
            var rawReq = _(rawRequests.oauth1).omit(['auth.oauth1.nonce', 'auth.oauth1.timestamp']).merge({
                    url: 'https://postman-echo.com/auth/oauth1',
                    auth: { oauth1: { addEmptyParamsToSign: true, addParamsToHeader: false } },
                    body: {
                        mode: 'urlencoded',
                        urlencoded: [{ key: 'oauth_token', value: 'secret' }, { key: 'foo', value: 'bar' }]
                    }
                }).value(),
                request = new Request(rawReq),
                authorizedReq = request.auth.oauth1.authorize(request);

            expect(authorizedReq.headers.all()).to.be.empty();

            expect(_.omit(authorizedReq.toJSON(),
                ['header', 'auth.oauth1.timestamp', 'auth.oauth1.nonce', 'url', 'body'])).to
                .eql({
                    auth: {
                        type: 'oauth1',
                        oauth1: {
                            consumerKey: 'RKCGzna7bv9YD57c',
                            consumerSecret: 'D+EdQ-gs$-%@2Nu7',
                            token: '',
                            tokenSecret: '',
                            signatureMethod: 'HMAC-SHA1',
                            version: '1.0',
                            realm: 'oauthrealm',
                            addParamsToHeader: false,
                            autoAddParam: true,
                            addEmptyParamsToSign: true
                        }
                    },
                    certificate: undefined,
                    description: undefined,
                    proxy: undefined,
                    method: 'POST'
                });
        });

        it('should correctly handle the GET request method', function () {
            var rawReq = _(rawRequests.oauth1).omit(['auth.oauth1.nonce', 'auth.oauth1.timestamp']).merge({
                    method: 'GET',
                    url: 'https://postman-echo.com/auth/oauth1',
                    auth: { oauth1: { addEmptyParamsToSign: true, addParamsToHeader: false } },
                    body: {
                        mode: 'urlencoded',
                        urlencoded: [{ key: 'oauth_token', value: 'secret' }, { key: 'foo', value: 'bar' }]
                    }
                }).value(),
                request = new Request(rawReq),
                authorizedReq = request.auth.oauth1.authorize(request);

            expect(authorizedReq.headers.all()).to.be.empty();
            expect(authorizedReq.url.query.reference).to.have.keys([
                'oauth_consumer_key', 'oauth_token', 'oauth_signature_method', 'oauth_timestamp', 'oauth_nonce',
                'oauth_version', 'oauth_signature'
            ]);
            expect(_.omit(authorizedReq.toJSON(), ['header', 'auth.oauth1.timestamp', 'auth.oauth1.nonce', 'url'])).to
                .eql({
                    auth: {
                        type: 'oauth1',
                        oauth1: {
                            consumerKey: 'RKCGzna7bv9YD57c',
                            consumerSecret: 'D+EdQ-gs$-%@2Nu7',
                            token: '',
                            tokenSecret: '',
                            signatureMethod: 'HMAC-SHA1',
                            version: '1.0',
                            realm: 'oauthrealm',
                            addParamsToHeader: false,
                            autoAddParam: true,
                            addEmptyParamsToSign: true
                        }
                    },
                    body: {
                        mode: 'urlencoded',
                        urlencoded: [
                            { key: 'foo', value: 'bar' }
                        ]
                    },
                    certificate: undefined,
                    description: undefined,
                    proxy: undefined,
                    method: 'GET'
                });
        });

        it('should handle edge signature generation cases correctly', function () {
            var request = new Request(rawRequests.oauth1),
                signature = request.auth.oauth1.sign({
                    url: 'https://postman-echo.com/auth/oauth1',
                    method: 'POST',
                    queryParams: [],
                    bodyParams: [],
                    signatureParams: [],
                    helperParams: {
                        encodeOAuthSign: true,
                        tokenSecret: 'tokenSecret'
                    }
                });

            expect(signature).to.eql([{ key: 'oauth_signature', value: 'LwEFfTAx85Verq05JF5b%2FpVjTOo%3D' }]);
        });
    });

    describe('oauth2', function () {
        it('should work correctly', function () {
            var request = new Request(rawRequests.oauth2),
                authorizedReq = request.auth.oauth2.authorize(request);

            expect(authorizedReq.headers.all()).to.be.empty();
            expect(request.auth.oauth2.authorize(request).toJSON()).to.eql({
                auth: {
                    type: 'oauth2',
                    oauth2: {
                        addTokenTo: 'RKCGzna7bv9YD57c',
                        callBackUrl: 'D+EdQ-gs$-%@2Nu7',
                        authUrl: '',
                        accessTokenUrl: '',
                        clientId: 'HMAC-SHA1',
                        clientSecret: '1453890475',
                        scope: 'yly1UR',
                        requestAccessTokenLocally: '1.0'
                    }
                },
                body: undefined,
                certificate: undefined,
                description: undefined,
                header: undefined,
                proxy: undefined,
                url: 'https://postman-echo.com/oauth2?hi=hello&yo=true',
                method: 'POST'
            });
        });
    });

    // querystring.unescape is not available in browserify's querystring module, so this goes to hell
    // TODO: fix this
    (typeof window === 'undefined' ? describe : describe.skip)('awsv4', function () {
        it('should add the required headers', function () {
            var awsv4Data = rawRequests.awsv4,
                auth = awsv4Data.auth.awsv4,
                request = new Request(rawRequests.awsv4),
                authorizedReq = request.auth.awsv4.authorize(request),
                parsedUrl = new Url(awsv4Data.url),
                headers = authorizedReq.getHeaders({ ignoreCase: true }),
                expectedSignedReq = aws4.sign({
                    headers: {
                        'X-Amz-Date': headers['x-amz-date'],
                        'content-type': 'application/json'
                    },
                    host: parsedUrl.getRemote(),
                    path: parsedUrl.getPathWithQuery(),
                    service: auth.serviceName,
                    region: auth.region,
                    method: awsv4Data.method,
                    body: undefined
                }, {
                    accessKeyId: auth.accessKey,
                    secretAccessKey: auth.secretKey,
                    sessionToken: auth.sessionToken
                });

            // Ensure that the required headers have been added.
            // todo stricter tests?
            expect(headers).to.have.property('authorization', expectedSignedReq.headers.Authorization);
            expect(headers).to.have.property('content-type', request.getHeaders({ ignoreCase: true })['content-type']);
            expect(headers).to.have.property('x-amz-date');
            expect(headers).to.have.property('x-amz-security-token');
        });

        it('should use sensible defaults where applicable', function () {
            var headers,
                authorizedReq,
                rawReq = _.defaults(rawRequests.awsv4, { body: { foo: 'bar' } }),
                request = new Request(_.omit(rawReq, ['header.0', 'auth.awsv4.sessionToken', 'region']));

            delete request.auth.awsv4.region;

            request.headers.add({ key: 'postman-token', value: 'random-token' });
            authorizedReq = request.auth.awsv4.authorize(request);
            headers = authorizedReq.getHeaders({ ignoreCase: true });

            expect(headers).to.have.property('authorization');
            expect(headers).to.have.property('content-type', request.getHeaders({ ignoreCase: true })['content-type']);
            expect(headers).to.have.property('x-amz-date');
            expect(_.omit(authorizedReq.toJSON(), ['header', 'auth.awsv4.time'])).to.eql({
                auth: {
                    type: 'awsv4',
                    awsv4: {
                        // Fake Credentials
                        service: '',
                        accessKey: 'AKIAI53QRL',
                        secretKey: 'cr2RAfsY4IIVweutTBoBzR'
                    }
                },
                certificate: undefined,
                proxy: undefined,
                body: { mode: 'raw', raw: { foo: 'bar' } },
                url: 'https://the2yl2ege.execute-api.eu-west-1.amazonaws.com/{{stagename}}/item',
                method: 'POST',
                description: {
                    content: '',
                    type: 'text/plain'
                }
            });
        });

        it('should handle formdata bodies correctly', function () {
            var rawReq = _.merge({}, rawRequests.awsv4, { body: { mode: 'formdata', formdata: [] } }),
                request = new Request(_.omit(rawReq, 'header')),
                authorizedReq = request.auth.awsv4.authorize(request),
                headers = authorizedReq.getHeaders({ ignoreCase: true });

            expect(headers).to.have.property('authorization');
            expect(headers).to.have.property('content-type', request.getHeaders({ ignoreCase: true })['content-type']);
            expect(headers).to.have.property('x-amz-date');
            expect(_.omit(authorizedReq.toJSON(), ['header', 'auth.awsv4.time', 'auth.awsv4.sessionToken'])).to.eql({
                auth: {
                    type: 'awsv4',
                    awsv4: {
                        // Fake Credentials
                        service: '',
                        region: 'eu-west-1',
                        accessKey: 'AKIAI53QRL',
                        secretKey: 'cr2RAfsY4IIVweutTBoBzR'
                    }
                },
                certificate: undefined,
                proxy: undefined,
                body: {
                    mode: 'formdata',
                    formdata: []
                },
                url: 'https://the2yl2ege.execute-api.eu-west-1.amazonaws.com/{{stagename}}/item',
                method: 'POST',
                description: {
                    content: '',
                    type: 'text/plain'
                }
            });
        });
    });

    describe('hawk', function () {
        it('Auth header must be added', function () {
            var request = new Request(rawRequests.hawk),
                authorizedReq = request.auth.hawk.authorize(request),
                headers = authorizedReq.getHeaders({ ignoreCase: true });

            // Ensure that the required headers have been added.
            expect(headers).to.have.property('authorization');
        });

        it('Authorized request must contain the generated timestamp and nonce', function () {
            var request = new Request(rawRequests.hawk),
                authorizedReq = request.auth.hawk.authorize(request);

            // Original request should not have the timestamp and nonce
            expect(_.get(rawRequests.hawk, 'auth.hawk.nonce')).to.not.be.ok();
            expect(_.get(rawRequests.hawk, 'auth.hawk.timestamp')).to.not.be.ok();

            expect(authorizedReq.auth).to.be.ok();
            expect(_.get(authorizedReq, 'auth.hawk.nonce')).to.be.a('string');
            expect(_.get(authorizedReq, 'auth.hawk.timestamp')).to.be.a('number');
        });

        it('should bail out the original request if auth key is missing', function () {
            var request = new Request(_.omit(rawRequests.hawk, 'auth.hawk.authKey')),
                authorizedReq = request.auth.hawk.authorize(request);

            // Original request should not have the timestamp and nonce
            expect(_.get(rawRequests.hawk, 'auth.hawk.nonce')).to.not.be.ok();
            expect(_.get(rawRequests.hawk, 'auth.hawk.timestamp')).to.not.be.ok();

            expect(authorizedReq.auth).to.be.ok();
            expect(_.get(authorizedReq, 'auth.hawk.nonce')).to.not.be.ok();
            expect(_.get(authorizedReq, 'auth.hawk.timestamp')).to.not.be.ok();
        });
    });

    describe('ntlm', function () {
        it('should be able to load all parameters from a request', function () {
            var data = {
                    auth: {
                        type: 'ntlm',
                        ntlm: {
                            username: 'testuser',
                            password: 'testpass',
                            domain: 'testdomain',
                            workstation: 'sample.work'
                        }
                    },
                    url: 'httpbin.org/get'
                },
                ntlmRequest = new Request(data);

            expect(ntlmRequest.auth).to.have.property('type', 'ntlm');
            expect(ntlmRequest.auth.ntlm).to.be.a(RequestAuth.types.ntlm);
            expect(ntlmRequest.auth.toJSON()).to.eql(data.auth);
            expect(ntlmRequest.auth.ntlm.authorize(ntlmRequest)).to.eql(ntlmRequest);
        });
    });

    describe('.current()', function () {
        it('must return the auth which is currently selected', function () {
            var requestAuth = new RequestAuth(rawRequests.hawk.auth);

            expect(requestAuth.current()).to.be(requestAuth.hawk);
        });

        it('must undefined if no auth method is selected', function () {
            var requestAuth = new RequestAuth();
            expect(requestAuth.current()).to.be(undefined);
        });
    });

    describe('.authorize (Static function)', function () {
        it('must return the auth which is currently selected', function () {
            var request = new Request(rawRequests.basic);

            // Should not contain the auth header to being with
            expect(request.headers.one('authorization')).to.not.be.ok();

            RequestAuth.authorize(request); // This mutates the request.

            // Should contain the auth header after authorizing
            expect(request.headers.one('authorization')).to.be.ok();
        });
    });
});
