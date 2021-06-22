var expect = require('chai').expect,

    Request = require('../../').Request,
    RequestAuth = require('../../').RequestAuth;

describe('RequestAuth', function () {
    describe('.current', function () {
        it('should throw error as function is discontinued', function () {
            expect(function () {
                var request = new Request({
                    url: 'https://postman-echo.com/get',
                    auth: {}
                });

                request.auth.current();
            }).to.throw('`Request#current` has been discontinued, use `Request#parameters` instead.');
        });
    });

    describe('.use', function () {
        it('should be able to set a new auth using .use', function () {
            var auth = new RequestAuth({
                noauth: { foo: 'bar' },
                type: 'noauth'
            });

            expect(auth.parameters().get('foo')).to.equal('bar');

            auth.use('basic');
            expect(auth.type).to.equal('basic');
            expect(auth.basic.toJSON()).to.eql([]);
            expect(auth.parameters().count()).to.equal(0);
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

            expect(auth.parameters().get('foo')).to.equal('bar');

            auth.use('basic');
            expect(auth.type).to.equal('basic');
            expect(auth.parameters().get('username')).to.equal('u');
            expect(auth.parameters().get('password')).to.equal('p');
        });

        it('should be able to update the parameters to the passed auth type in options', function () {
            var auth = new RequestAuth({
                noauth: {
                    foo: 'bar'
                },
                type: 'noauth'
            });

            auth.use('noauth', { foo1: 'bar1' });
            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar',
                foo1: 'bar1'
            });
        });

        it('should set the authentication type to be used by this item when options array is empty', function () {
            var auth = new RequestAuth({
                noauth: {
                    foo: 'bar'
                },
                type: 'noauth'
            });

            auth.use('noauth', []);
            expect(auth.type).to.equal('noauth');
            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar'
            });
        });
    });

    describe('.update', function () {
        it('should update the parameters of a specific authentication type', function () {
            var auth = new RequestAuth({
                    noauth: {
                        foo: 'bar'
                    },
                    type: 'noauth'
                }),
                options = {
                    foo1: 'bar1'
                };

            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar'
            });
            auth.update(options, 'noauth');
            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar',
                foo1: 'bar1'
            });
        });

        it('should update the parameters of the existing type if not specified explicitly', function () {
            var auth = new RequestAuth({
                    noauth: {
                        foo: 'bar'
                    },
                    type: 'noauth'
                }),
                options = {
                    foo1: 'bar1'
                };

            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar'
            });
            auth.update(options);
            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar',
                foo1: 'bar1'
            });
        });

        it('should update the parameters of the existing type param if set to null', function () {
            var auth = new RequestAuth({
                    noauth: {
                        foo: 'bar'
                    },
                    type: 'noauth'
                }),
                options = {
                    foo1: 'bar1'
                };

            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar'
            });
            auth.update(options, null);
            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar',
                foo1: 'bar1'
            });
        });

        it('should bail out if invalid auth type is provided', function () {
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

        it('should bail out when options passed as null to update', function () {
            var auth = new RequestAuth({
                noauth: {
                    foo: 'bar'
                },
                type: 'noauth'
            });

            auth.update(null);
            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar'
            });
        });

        it('should bail out when options passed as empty json object to update', function () {
            var auth = new RequestAuth({
                noauth: {
                    foo: 'bar'
                },
                type: 'noauth'
            });

            auth.update({});
            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar'
            });
        });

        it('should bail out when options passed as string to update', function () {
            var auth = new RequestAuth({
                noauth: {
                    foo: 'bar'
                },
                type: 'noauth'
            });

            auth.update('options');
            expect(auth.parameters().toObject()).to.eql({
                foo: 'bar'
            });
        });

        it('should bail out when options passed as boolean to update', function () {
            var auth = new RequestAuth({
                noauth: {
                    foo: 'bar'
                },
                type: 'noauth'
            });

            auth.update(true);
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

            expect(auth.parameters().get('foo')).to.equal('bar');

            auth.clear('noauth');
            expect(auth.parameters().count()).to.equal(0);
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
