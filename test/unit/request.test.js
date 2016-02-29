var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Request = require('../../lib/index.js').Request;

/* global describe, it */
describe('Request', function () {
    var rawRequest = fixtures.collectionV2.item[1],
        request = new Request(rawRequest.request);

    it('initializes successfully', function () {
        expect(request).to.be.ok();
    });

    describe('has property', function () {
        it('headers', function () {
            expect(request).to.have.property('headers');
            expect(request.headers.all()).to.be.an('array');
            expect(request.headers.all()).to.not.be.empty();
        });

        it('body', function () {
            expect(request).to.have.property('body');
        });

        it('method', function () {
            expect(request).to.have.property('method');
            expect(request.method).to.be.a('string');
        });

        describe('url', function () {
            it('an object', function () {
                expect(request).to.have.property('url');
                expect(request.url).to.be.an('object');
                expect(request.url).to.not.be.empty();
            });

            describe('has property', function () {
                describe('auth', function () {
                    it('an object', function () {
                        expect(request.url).to.have.property('auth');
                        expect(request.url.auth).to.be.an('object');
                        expect(request.url.auth).to.not.be.empty();
                    });

                    describe('has property', function () {
                        it('user', function () {
                            expect(request.url.auth).to.have.property('user', undefined);
                        });

                        it('password', function () {
                            expect(request.url.auth).to.have.property('password', undefined);
                        });
                    });
                });

                it('protocol', function () {
                    expect(request.url).to.have.property('protocol', 'http');
                });

                it('port', function () {
                    expect(request.url).to.have.property('port', undefined);
                });

                it('path', function () {
                    expect(request.url).to.have.property('path');
                    expect(request.url.path).to.be.an('array');
                    expect(request.url.path).to.not.be.empty();
                });

                it('hash', function () {
                    expect(request.url).to.have.property('hash', undefined);
                });

                it('host', function () {
                    expect(request.url).to.have.property('host');
                    expect(request.url.host).to.be.an('array');
                    expect(request.url.host).to.not.be.empty();
                });

                it('query', function () {
                    expect(request.url).to.have.property('query');
                });
            });
        });
    });

    describe('has function', function () {
        it('getHeaders', function () {
            expect(request.getHeaders).to.be.ok();
            expect(request.getHeaders).to.be.a('function');
        });

        it('forEachHeader', function () {
            expect(request.forEachHeader).to.be.ok();
            expect(request.forEachHeader).to.be.a('function');
        });
    });
});
