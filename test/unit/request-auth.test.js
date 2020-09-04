var expect = require('chai').expect,

    Request = require('../../').Request,
    RequestAuth = require('../../').RequestAuth;

describe('RequestAuth', function () {
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

    it('should be able to set parent', function () {
        var auth = new RequestAuth(null, {
            fakeParent: true
        });

        expect(auth.parent()).to.eql({
            fakeParent: true
        });
    });

    describe('.update', function () {
        it('should not update auth params if type is invalid', function () {
            var auth = new RequestAuth({
                    noauth: {
                        foo: 'bar'
                    },
                    type: 'noauth'
                }),
                options = {
                    basic: {
                        username: 'u', password: 'p'
                    },
                    type: 'noauth'
                };

            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar'
            });
            auth.update(options, 'type');
            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar'
            });
        });
    });
});
