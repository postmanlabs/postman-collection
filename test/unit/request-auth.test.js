var _ = require('lodash'),
    expect = require('expect.js'),
    aws4 = require('aws4'),

    Request = require('../../').Request,
    RequestAuth = require('../../').RequestAuth,
    Url = require('../../').Url,
    rawRequests = require('../fixtures/index').authRequests;

/* global describe, it */
describe('RequestAuth', function () {
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

        it('Auth header must have uri with query params in case of request with the same', function () {
            var request = new Request(rawRequests.digestWithQueryParams),
                authorizedReq = request.auth.digest.authorize(request),
                authHeader = authorizedReq.headers.one('Authorization'),
                expectedHeader = 'Authorization: Digest username="postman", realm="Users", ' +
                    'nonce="bcgEc5RPU1ANglyT2I0ShU0oxqPB5jXp", uri="/digest-auth?key=value", ' +
                    'response="24dfb8851ee27e4b00252a13b1fd8ec3", opaque=""';

            expect(authHeader.toString()).to.eql(expectedHeader);
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
    });

    describe('awsv4', function () {
        // querystring.unescape is not available in browserify's querystring module, so this goes to hell
        // TODO: fix this
        (typeof window === 'undefined' ? it : it.skip)('Required headers must be added', function () {
            var awsv4Data = rawRequests.awsv4,
                auth = awsv4Data.auth.awsv4,
                request = new Request(awsv4Data),
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
