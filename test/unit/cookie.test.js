var expect = require('chai').expect,
    fixtures = require('../fixtures'),
    Cookie = require('../../lib/index.js').Cookie;

describe('Cookie', function () {
    describe('sanity', function () {
        var rawCookie = fixtures.collectionV2.item[0].response[0].cookie[0],
            cookie = new Cookie(rawCookie);

        it('initializes successfully', function () {
            expect(cookie).to.be.ok;
        });

        it('should work correctly with a raw cookie string as well', function () {
            var strCookie = new Cookie('foo=bar;');

            expect(strCookie).to.deep.include({
                name: 'foo',
                value: 'bar'
            });
        });

        it('should work correctly with specific options and value defaults', function () {
            var expires = 'Sat, 02 May 2020 23:38:25 GMT',
                strCookie = new Cookie({
                    name: 'foo',
                    expires: expires, // just a test, these options won't usually appear together
                    maxAge: 1234
                });

            expect(strCookie.value).to.be.undefined;
            expect(strCookie).to.deep.include({
                name: 'foo',
                maxAge: 1234
            });
            expect(strCookie.expires).to.be.ok;
        });

        it('should handle malformed values', function () {
            var strCookie = new Cookie('foo=%E0%A4%A');

            expect(strCookie).to.deep.include({
                name: 'foo',
                value: '%25E0%25A4%25A'
            });
            expect(strCookie.valueOf()).to.equal('%E0%A4%A');
        });

        describe('has property', function () {
            it('domain', function () {
                expect(cookie).to.have.property('domain', rawCookie.domain);
            });

            it('expires', function () {
                expect(cookie).to.have.property('expires', rawCookie.expires);
            });

            it('hostOnly', function () {
                expect(cookie).to.have.property('hostOnly', rawCookie.hostOnly);
            });

            it('httpOnly', function () {
                expect(cookie).to.have.property('httpOnly', rawCookie.httpOnly);
            });

            it.skip('maxAge', function () { // @todo: possibly delete test. seems like based on old expectations
                expect(cookie).to.have.property('maxAge', undefined);
            });

            it('path', function () {
                expect(cookie).to.have.property('path', rawCookie.path);
            });

            it('secure', function () {
                expect(cookie).to.have.property('secure', rawCookie.secure);
            });

            it('session', function () {
                expect(cookie).to.have.property('session', rawCookie.session);
            });

            it('value', function () {
                expect(cookie).to.have.property('value', rawCookie.value);
            });

            it('_', function () {
                expect(cookie).to.have.property('_');
                expect(cookie._).to.have.property('postman_storeId', rawCookie._postman_storeId);
            });

            it('update', function () {
                expect(cookie.update).to.be.ok;
                expect(cookie.update).to.be.a('function');
            });
        });
    });

    describe('json representation', function () {
        it('must match what it was initialized with', function () {
            var rawCookie = fixtures.collectionV2.item[0].response[0].cookie[0],
                cookie = new Cookie(rawCookie),
                jsonified = cookie.toJSON();
            expect(jsonified).to.deep.include({
                domain: rawCookie.domain,
                httpOnly: rawCookie.httpOnly,
                hostOnly: rawCookie.hostOnly,
                name: rawCookie.key,
                path: rawCookie.path,
                expires: rawCookie.expires,
                secure: rawCookie.secure,
                session: rawCookie.session,
                value: rawCookie.value
            });
        });
    });

    describe('parsing', function () {
        var rawCookie = fixtures.rawCookie;
        it('should be parsed properly', function () {
            var parsed = Cookie.parse(rawCookie),
                ext;
            expect(parsed).to.deep.include({
                key: 'GAPS',
                value: 'lol',
                expires: 'Sun, 04-Feb-2018 14:18:27 GMT',
                secure: true,
                httpOnly: true
            });
            expect(parsed.extensions).to.be.an('array').that.has.lengthOf(1);

            ext = parsed.extensions[0];
            expect(ext).to.deep.include({
                key: 'Priority',
                value: 'HIGH'
            });
        });
    });

    describe('isCookie', function () {
        var rawCookie = {
            domain: '.httpbin.org',
            expires: 1502442248,
            hostOnly: false,
            httpOnly: false,
            key: '_ga',
            path: '/',
            secure: false,
            session: false,
            _postman_storeId: '0',
            value: 'GA1.2.113558537.1435817423'
        };

        it('should return true for a cookie instance', function () {
            expect(Cookie.isCookie(new Cookie(rawCookie))).to.be.true;
        });

        it('should return false for a raw cookie object', function () {
            expect(Cookie.isCookie(rawCookie)).to.be.false;
        });

        it('should return false when called without arguments', function () {
            expect(Cookie.isCookie()).to.be.false;
        });
    });

    describe('.parse', function () {
        it('should bail out for non string input', function () {
            expect(Cookie.parse(['random'])).to.eql(['random']);
        });

        it('should correctly handle valid input', function () {
            expect(Cookie.parse('foo=bar;domain=postman-echo.com')).to.eql({
                domain: 'postman-echo.com',
                key: 'foo',
                value: 'bar'
            });
        });
    });

    describe('.splitParam', function () {
        it('should correctly split string cookie values into their components', function () {
            expect(Cookie.splitParam('foo="bar"')).to.eql({
                key: 'foo',
                value: 'bar'
            });
        });
    });

    describe('value', function () {
        it('should be returned by valueOf function', function () {
            expect((new Cookie({
                name: 'blah',
                value: 'this is a cookie value'
            })).valueOf()).to.eql('this is a cookie value');
        });
    });

    describe('.unparseSingle', function () {
        it('should return empty string for non object arguments', function () {
            expect(Cookie.unparseSingle()).to.eql('');
            expect(Cookie.unparseSingle([])).to.eql('');
        });

        it('should return cookie value', function () {
            expect(Cookie.unparseSingle({
                name: '',
                value: 'this is a cookie value'
            })).to.eql('this is a cookie value');
        });

        it('should return unparsed string for the cookie object', function () {
            expect(Cookie.unparseSingle({
                name: 'foo',
                value: 'bar'
            })).to.eql('foo=bar');
        });
    });

    describe('.stringify', function () {
        var rawCookie = {
            name: 'postman',
            value: 'collection',
            expires: 1502442248,
            domain: 'postman-echo.com',
            maxAge: '300',
            path: '/',
            httpOnly: true,
            secure: true
        };

        it('should return a single Set-Cookie header string', function () {
            expect(Cookie.stringify(rawCookie))
                .to.eql('postman=collection; Expires=1502442248; Max-Age=300; ' +
                'Domain=postman-echo.com; Path=/; Secure; HttpOnly');
        });

        it('should handle and check for valid date instance', function () {
            rawCookie.expires = new Date('Mon, 17 Feb 2020 07:29:40 GMT');
            expect(Cookie.stringify(rawCookie))
                .to.eql('postman=collection; Expires=Mon, 17 Feb 2020 07:29:40 GMT; ' +
                'Max-Age=300; Domain=postman-echo.com; Path=/; Secure; HttpOnly');
        });
    });

    describe('.unparse', function () {
        it('should return a string of cookies array or property list', function () {
            expect(Cookie.unparse([new Cookie({
                name: 'postman',
                value: 'collection'
            }),
            new Cookie({
                name: 'postman_2',
                value: 'collection_2'
            })])).to.eql('postman=collection; postman_2=collection_2');
        });

        it('should return empty string if array or property list is not passed', function () {
            expect(Cookie.unparse([])).to.eql('');
        });
    });
});
