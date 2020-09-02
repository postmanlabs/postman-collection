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

    describe('valueOf', function () {
        it('should handle malformed URI sequence', function () {
            expect((new Cookie({
                name: 'blah',
                value: '%E0%A4%A'
            })).valueOf()).to.eql('%E0%A4%A');
        });
    });

    describe('unparseSingle', function () {
        var rawCookie = 'GAPS=lol;Path=/;Expires=Sun, 04-Feb-2018 14:18:27 GMT;Secure;HttpOnly;Priority=HIGH';
        it('should be unparsed properly in case of no cookie name', function () {
            var unparsedSingle = Cookie.unparseSingle(rawCookie);
            expect(unparsedSingle).equals('');
        });

        it('should be unparsed properly in case of valid cookie name', function () {
            var rawCookie = {
                    name: 'testCookie',
                    expires: 1502442248,
                    hostOnly: false,
                    httpOnly: false,
                    key: '_ga',
                    path: '/',
                    secure: false,
                    session: false,
                    value: 'GA1.2.113558537.1435817423'
                },
                unparsedSingle = Cookie.unparseSingle(rawCookie);
            expect(unparsedSingle).equals(rawCookie.name + '=' + rawCookie.value);
        });
    });

    describe('unparse', function () {
        it('should return empty string if not array of cookies', function () {
            expect(Cookie.unparse('')).to.equal('');
        });

        it('should return empty string if array of cookies', function () {
            var rawCookie = {
                    domain: '.httpbin.org',
                    expires: 1502442248,
                    hostOnly: false,
                    httpOnly: false,
                    key: '_ga',
                    path: '/',
                    secure: false,
                    session: false,
                    value: 'GA1.2.113558537.1435817423'
                },
                cookieArray = [];
            cookieArray.push(rawCookie);
            // eslint-disable-next-line one-var
            var unparse = Cookie.unparse(cookieArray);
            expect(unparse).equals(cookieArray.map(Cookie.unparseSingle).join('; '));
        });
    });

    describe('stringify', function () {
        var rawCookie = {
            domain: '.httpbin.org',
            expires: 1502442248,
            hostOnly: false,
            httpOnly: false,
            key: '_ga',
            path: '/',
            secure: false,
            session: false,
            value: 'GA1.2.113558537.1435817423'
        };

        it('should return single Set-Cookie header string', function () {
            var cookie = new Cookie(rawCookie);
            expect(Cookie.stringify(cookie))
                .equals('_ga=GA1.2.113558537.1435817423; Expires=1502442248; Domain=.httpbin.org; Path=/');
        });
    });

    describe('toString', function () {
        it('should return single Set-Cookie header string with key value', function () {
            var rawCookie = {
                    key: '_ga',
                    value: 'GA1.2.113558537.1435817423'
                },
                cookie = new Cookie(rawCookie);
            expect(cookie.toString())
                .equals('_ga=GA1.2.113558537.1435817423');
        });

        it('should return single Set-Cookie header string with expires', function () {
            var rawCookie = {
                    key: '_ga',
                    value: 'GA1.2.113558537.1435817423',
                    expires: '14 Jun 2017 00:00:00 PDT'
                },
                cookie = new Cookie(rawCookie);
            expect(cookie.toString())
                .equals('_ga=GA1.2.113558537.1435817423; Expires=Wed, 14 Jun 2017 07:00:00 GMT');
        });

        it('should return single Set-Cookie header string with secure and httpOnly set to true', function () {
            var rawCookie = {
                    key: '_ga',
                    value: 'GA1.2.113558537.1435817423',
                    httpOnly: true,
                    secure: true
                },
                cookie = new Cookie(rawCookie);
            expect(cookie.toString())
                .equals('_ga=GA1.2.113558537.1435817423; Secure; HttpOnly');
        });

        it('should return single Set-Cookie header string with maxAge value', function () {
            var rawCookie = {
                    key: '_ga',
                    value: 'GA1.2.113558537.1435817423',
                    maxAge: 1502442248
                },
                cookie = new Cookie(rawCookie);
            expect(cookie.toString())
                .equals('_ga=GA1.2.113558537.1435817423; Max-Age=1502442248');
        });

        it('should return single Set-Cookie header string with extensions', function () {
            var rawCookie = {
                    key: '_ga',
                    value: 'GA1.2.113558537.1435817423',
                    maxAge: 1502442248,
                    extensions: [{
                        key: 'Priority',
                        value: 'HIGH'
                    }]
                },
                cookie = new Cookie(rawCookie);
            expect(cookie.toString())
                .equals('_ga=GA1.2.113558537.1435817423; Max-Age=1502442248; {"key":"Priority","value":"HIGH"}');
        });

        it('should return single Set-Cookie header string without extensions if json value not valid', function () {
            var rawCookie,
                extensions,
                cookie;

            extensions = {};
            extensions.prop = extensions;
            rawCookie = {
                key: '_ga',
                value: 'GA1.2.113558537.1435817423',
                maxAge: 1502442248,
                extensions: [extensions]
            };
            cookie = new Cookie(rawCookie);
            expect(cookie.toString())
                .equals('_ga=GA1.2.113558537.1435817423; Max-Age=1502442248');
        });
    });
});
