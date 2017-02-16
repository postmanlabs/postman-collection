var expect = require('expect.js'),
    Url = require('../../lib/index.js').Url;

/* global describe, it */
describe('Url', function () {
    var rawUrl = 'https://user:pass@postman-echo.com/get?a=1&b=2#heading',
        url = new Url(rawUrl);

    it('parsed successfully', function () {
        expect(url).to.be.ok();
        expect(url).to.be.an('object');
    });

    describe('has property', function () {
        it('auth', function () {
            expect(url).to.have.property('auth');
            expect(url.auth).to.be.an('object');
            expect(url.auth).to.have.property('user', 'user');
            expect(url.auth).to.have.property('password', 'pass');
        });

        it('hash', function () {
            expect(url).to.have.property('hash', 'heading');
        });

        it('host', function () {
            expect(url).to.have.property('host');
            expect(url.host).be.an('array');
        });

        it('path', function () {
            expect(url).to.have.property('path');
            expect(url.path).to.be.an('array');
        });

        it('port', function () {
            expect(url).to.have.property('port', undefined);
        });

        it('protocol', function () {
            expect(url).to.have.property('protocol', 'https');
        });

        it('query', function () {
            expect(url).to.have.property('query');
            expect(url.query).to.be.an('object');
        });

        it('update', function () {
            expect(url.update).to.be.ok();
            expect(url.update).to.be.a('function');
        });
    });
});
