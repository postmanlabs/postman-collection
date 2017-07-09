var expect = require('expect.js'),
    Certificate = require('../../lib/index.js').Certificate;

describe('Certificate', function () {
    describe('constructor', function () {
        it('should allow creating an empty Certificate', function () {
            var certificate = new Certificate();
            expect(certificate).to.not.eql(undefined);
            expect(certificate._postman_propertyName).to.not.eql('Certificate');
        });
    });

    describe('canApplyTo', function () {
        it('should return true only when tested with a match', function () {
            var certificate = new Certificate({ matches: ['https://google.com/*'] });
            expect(certificate.canApplyTo('https://www.google.com')).to.eql(false);
            expect(certificate.canApplyTo('https://example.com')).to.eql(false);
            expect(certificate.canApplyTo('https://google.com')).to.eql(true);
        });
        it('should return true when tested with a match on any of the allowed matches', function () {
            var certificate = new Certificate({ matches: ['https://google.com/*', 'https://*.example.com/*'] });
            expect(certificate.canApplyTo('https://twitter.com')).to.eql(false);
            expect(certificate.canApplyTo('https://foo.example.com')).to.eql(true);
            expect(certificate.canApplyTo('https://google.com')).to.eql(true);
        });
        it('should disallow test string with protocol not http or https', function () {
            var certificate = new Certificate({ matches: ['http://*'], server: 'https://proxy.com/' });
            expect(certificate.canApplyTo('foo://www.google.com')).to.eql(false);
            expect(certificate.canApplyTo('file://www.google.com')).to.eql(false);
        });

        it('should disallow any test string when match protocol is not http or https', function () {
            var certificate = new Certificate({ matches: ['ftp://*'], server: 'https://proxy.com/' });
            expect(certificate.canApplyTo('foo://www.google.com')).to.eql(false);
            expect(certificate.canApplyTo('file://www.google.com')).to.eql(false);
            expect(certificate.canApplyTo('http://www.google.com')).to.eql(false);
            expect(certificate.canApplyTo('https://www.google.com')).to.eql(false);
        });
    });

    describe('toJSON', function () {
        it('should contain host property', function () {
            var rawCert = {
                    matches: ['https://postman-echo.com/*', 'https://bla.com/*'],
                    key: { src: '/Users/here' },
                    cert: { src: '/Users/here' },
                    passphrase: 'iamhere'
                },
                certificate = new Certificate(rawCert),
                serialisedCertificate = certificate.toJSON();
            expect(serialisedCertificate.key).to.eql(rawCert.key);
            expect(serialisedCertificate.cert).to.eql(rawCert.cert);
            expect(serialisedCertificate.passphrase).to.eql(rawCert.passphrase);
        });

        it('should not contain key value', function () {
            var rawCert = {
                    matches: ['https://postman-echo.com/*', 'https://bla.com/*'],
                    key: { src: '/Users/here' },
                    cert: { src: '/Users/here' },
                    passphrase: 'iamhere'
                },
                certificate = new Certificate(rawCert),
                serialisedCertificate;

            certificate.key.value = 'something';
            certificate.cert.value = 'something-else';
            serialisedCertificate = certificate.toJSON();

            expect(serialisedCertificate.key).to.not.have.property('value');
            expect(serialisedCertificate.cert).to.not.have.property('value');
        });
    });
});
