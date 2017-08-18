var _ = require('lodash'),
    expect = require('expect.js'),

    Request = require('../../').Request,
    RequestAuth = require('../../').RequestAuth,
    rawRequests = require('../fixtures/index').authRequests;

/* global describe, it */
describe('RequestAuthBase', function () {
    it('must be able to correctly serialize auth parameters', function () {
        var reqData = rawRequests.oauth1,
            sdkRequest = new Request(reqData),
            request = sdkRequest.toJSON();

        expect(request).to.have.property('auth');
        expect(request.auth).to.have.property('oauth1');

        expect(request.auth.oauth1).to.eql(reqData.auth.oauth1);
    });

    describe('.update', function () {
        it('should not update the auth type if one is not provided', function () {
            var auth = new RequestAuth({
                type: 'basic',
                basic: {
                    username: 'postman',
                    password: 'admin'
                }
            });

            expect(auth.type).to.be('basic');
            expect(auth.basic.username).to.be('postman');
            expect(auth.basic.password).to.be('admin');

            auth.update({
                username: 'newUser',
                password: 'newPass'
            });
            expect(auth.type).to.be('basic');
            expect(auth.basic.username).to.be('newUser');
            expect(auth.basic.password).to.be('newPass');
        });
    });

    describe('.use', function () {
        it('should bail out for a type value of `type`', function () {
            var auth = new RequestAuth({
                type: 'basic',
                basic: {
                    username: 'user',
                    password: 'pass'
                }
            });

            expect(auth.use.bind(auth)).withArgs('type').to.not.throwError();
        });

        it('should create a blank slate auth manifest if none exists', function () {
            var auth = new RequestAuth({
                type: 'basic'
            });

            auth.use('basic');
            expect(auth.basic).to.eql({});
        });
    });

    describe('static methods', function () {
        describe('.addType', function () {
            it('should throw for an invalid handler name', function () {
                expect(RequestAuth.addType).withArgs({}).to.throwError();
            });

            it('should throw for an invalid handler update method', function () {
                expect(RequestAuth.addType).withArgs({}, 'fake').to.throwError();
            });
        });

        describe('.authorize', function () {
            it('should bail out for an invalid request auth', function () {
                expect(RequestAuth.authorize({})).to.eql({});
            });

            it('should bail out for an invalid handler authorize method', function () {
                expect(RequestAuth.authorize({
                    auth: {
                        current: _.noop
                    }
                })).to.eql({
                    auth: {
                        current: _.noop
                    }
                });
            });
        });
    });
});
