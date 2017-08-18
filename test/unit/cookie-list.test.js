var expect = require('expect.js'),
    CookieList = require('../../lib/index.js').CookieList;

/* global describe, it */
describe('CookieList', function () {
    describe('.isCookieList', function () {
        it('should correctly identify a CookieList instance', function () {
            var cookieList = new CookieList({}, [{
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
            }]);

            expect(CookieList.isCookieList()).to.eql(false);
            expect(CookieList.isCookieList(cookieList)).to.eql(true);
            expect(CookieList.isCookieList({})).to.eql(false);
            expect(CookieList.isCookieList({ _postman_propertyName: 'CookieList' })).to.eql(false);
        });
    });
});
