var expect = require('chai').expect,

    Request = require('../../').Request,
    RequestAuth = require('../../').RequestAuth;

describe('RequestAuth', function () {
    describe('.current', function () {
        it('should be properly initialised from Request', function () {
            var request = new Request({
                url: 'https://postman-echo.com/get',
                auth: {}
            });
            expect(request.auth.current()).to.be.undefined;
        });

        it('should be properly initialised when set from Request constructor', function () {
            var request = new Request({
                auth: {
                    noauth: [{
                        key: 'foo',
                        value: 'bar'
                    }],
                    type: 'noauth'
                }
            });

            expect(request.auth.current()).to.eql({ foo: 'bar' });
        });

        it('should be properly initialised when set from Request constructor in legacy format', function () {
            var request = new Request({
                auth: {
                    noauth: { foo: 'bar' },
                    type: 'noauth'
                }
            });

            expect(request.auth.current()).to.eql({ foo: 'bar' });
        });
    });

    describe('.use', function () {
        it('should be able to set a new auth using .use', function () {
            var auth = new RequestAuth({
                noauth: { foo: 'bar' },
                type: 'noauth'
            });

            expect(auth.current()).to.eql({ foo: 'bar' });

            auth.use('basic');
            expect(auth.type).to.equal('basic');
            expect(auth.basic.toJSON()).to.eql([]);
            expect(auth.current()).to.eql({});
        });

        it('should be able to construct with multiple auths', function () {
            var auth = new RequestAuth({
                noauth: {
                    foo: 'bar'
                },
                basic: {
                    username: 'u', password: 'p'
                },
                type: 'noauth'
            });

            expect(auth.current()).to.eql({
                foo: 'bar'
            });

            auth.use('basic');
            expect(auth.type).to.equal('basic');
            expect(auth.current()).to.eql({
                username: 'u', password: 'p'
            });
        });

        it('should be able to return the parameters of the selected auth type', function () {
            var auth = new RequestAuth({
                noauth: {
                    foo: 'bar'
                },
                type: 'noauth'
            });

            auth.use('noauth', {
                noauth: {
                    foo1: 'bar1'
                },
                type: 'noauth'
            });
            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar',
                noauth: {
                    'foo1': 'bar1'
                },
                type: 'noauth'
            });
        });
    });

    describe('.update', function () {
        it('should set the authentication type to be used by this item when options array is empty', function () {
            var auth = new RequestAuth({
                noauth: {
                    foo: 'bar'
                },
                type: 'noauth'
            });

            auth.use('noauth', []);
            expect(auth.type).to.equal('noauth');
            auth.update(null);
            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar'
            });
        });

        it('should bail out when non-object options are passed to update', function () {
            var auth = new RequestAuth({
                noauth: {
                    foo: 'bar'
                },
                type: 'noauth'
            });

            auth.update(null);
            auth.update({});
            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar'
            });
        });
    });

    describe('.clear', function () {
        it('should be able to clear an auth that is currently selected', function () {
            var auth = new RequestAuth({
                noauth: {
                    foo: 'bar'
                },
                basic: {
                    username: 'u', password: 'p'
                },
                type: 'noauth'
            });

            expect(auth.current()).to.eql({
                foo: 'bar'
            });

            auth.clear('noauth');
            expect(auth.current()).to.eql({});
        });

        it('should be able to clear an auth that is defined but not selected', function () {
            var auth = new RequestAuth({
                noauth: {
                    foo: 'bar'
                },
                basic: {
                    username: 'u', password: 'p'
                },
                type: 'noauth'
            });

            expect(auth.basic.toObject()).to.eql({
                username: 'u',
                password: 'p'
            });

            auth.clear('basic');
            expect(auth).to.not.have.property('basic');
        });
    });

    describe('.parent', function () {
        it('should be able to set parent', function () {
            var auth = new RequestAuth(null, {
                fakeParent: true
            });

            expect(auth.parent()).to.eql({
                fakeParent: true
            });
        });
    });
});
