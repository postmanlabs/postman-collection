var _ = require('lodash'),
    expect = require('expect.js'),
    Basic = require('../../lib/collection/request-auth/basic'),
    Digest = require('../../lib/collection/request-auth/digest'),
    OAuth1 = require('../../lib/collection/request-auth/oauth1'),
    Awsv4 = require('../../lib/collection/request-auth/awsv4'),
    Hawk = require('../../lib/collection/request-auth/hawk'),

    Request = require('../../').Request,
    rawRequests = require('../fixtures/index').authRequests;

/* global describe, it */
describe('RequestAuth', function () {
    describe('Basic', function () {
        it('Auth header must be added', function () {
            var request = new Request(rawRequests.basic),
                authorizedReq = Basic.authorize(request),
                headers = authorizedReq.headers.all(),
                authHeader;
            expect(headers.length).to.eql(1);

            authHeader = headers[0];
            expect(authHeader.toString()).to.eql('Authorization: Basic YWJoaWppdDprYW5l');
            expect(authHeader.system).to.be(true);
        });
    });

    describe('Digest', function () {
        it('Auth header must be added', function () {
            var request = new Request(rawRequests.digest),
                authorizedReq = Digest.authorize(request),
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
    });

    describe('OAuth1', function () {
        it('Auth header must be added', function () {
            var request = new Request(rawRequests.oauth1),
                authorizedReq = OAuth1.authorize(request),
                headers = authorizedReq.headers.all(),
                authHeader;

            expect(headers.length).to.eql(1);
            authHeader = headers[0];
            // Since Nonce and Timestamp have to be generated at runtime, cannot assert anything beyond this.
            expect(authHeader.toString()).to.match(/Authorization: OAuth/);
            expect(authHeader.system).to.be(true);
        });
    });

    describe('AWSv4', function () {
        // querystring.unescape is not available in browserify's querystring module, so this goes to hell
        // TODO: fix this
        (typeof window === 'undefined' ? it : it.skip)('Required headers must be added', function () {
            var request = new Request(rawRequests.awsv4),
                authorizedReq = Awsv4.authorize(request),
                headers = authorizedReq.getHeaders({ ignoreCase: true });

            // Ensure that the required headers have been added.
            // todo stricter tests?
            expect(headers).to.have.property('authorization');
            expect(headers).to.have.property('content-type', request.getHeaders({ ignoreCase: true })['content-type']);
            expect(headers).to.have.property('x-amz-date');
        });
    });

    describe('Hawk', function () {
        it('Auth header must be added', function () {
            var request = new Request(rawRequests.hawk),
                authorizedReq = Hawk.authorize(request),
                headers = authorizedReq.getHeaders({ ignoreCase: true });

            // Ensure that the required headers have been added.
            expect(headers).to.have.property('authorization');
        });

        it('Authorized request must contain the generated timestamp and nonce', function () {
            var request = new Request(rawRequests.hawk),
                authorizedReq = Hawk.authorize(request);

            // Original request should not have the timestamp and nonce
            expect(_.get(rawRequests.hawk, 'auth.hawk.nonce')).to.not.be.ok();
            expect(_.get(rawRequests.hawk, 'auth.hawk.timestamp')).to.not.be.ok();

            expect(authorizedReq.auth).to.be.ok();
            expect(_.get(authorizedReq, 'auth.hawk.nonce')).to.be.a('string');
            expect(_.get(authorizedReq, 'auth.hawk.timestamp')).to.be.a('number');
        });
    });
});
