var expect = require('expect.js'),

    Request = require('../../').Request,
    RequestAuth = require('../../').RequestAuth;

/* global describe, it */
describe('RequestAuth', function () {
    it('should be properly initialised from Request', function () {
        var request = new Request({
            url: 'https://postman-echo.com/get',
            auth: {}
        });
        expect(request.auth.current()).to.eql(undefined);
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
        expect(auth.type).to.eql('basic');
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
        expect(auth.type).to.eql('basic');
        expect(auth.current()).to.eql({
            username: 'u', password: 'p'
        });
    });
});
