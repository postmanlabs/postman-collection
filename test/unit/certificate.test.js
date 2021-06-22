var expect = require('chai').expect,
    sdk = require('../../lib/index.js'),
    Certificate = sdk.Certificate;

describe('Certificate', function () {
    describe('constructor', function () {
        it('should allow creating an empty Certificate', function () {
            var certificate = new Certificate();

            expect(certificate).to.not.eql(undefined);
            expect(certificate._postman_propertyName).to.not.eql('Certificate');
        });

        it('should correctly identify Certificate instances', function () {
            var certificate = new Certificate();

            expect(Certificate.isCertificate(certificate)).to.be.true;
            expect(Certificate.isCertificate({})).to.be.false;
            expect(Certificate.isCertificate({ _postman_propertyName: 'certificate' })).to.be.false;
        });
    });

    describe('canApplyTo', function () {
        it('should return false for empty target URLs', function () {
            var certificate = new Certificate({ matches: ['https://google.com/*'] });

            expect(certificate.canApplyTo('')).to.be.false;
            expect(certificate.canApplyTo(new sdk.Url())).to.be.false;
        });

        it('should return true only when tested with a match', function () {
            var certificate = new Certificate({ matches: ['https://google.com/*'] });

            expect(certificate.canApplyTo('https://www.google.com')).to.be.false;
            expect(certificate.canApplyTo('https://example.com')).to.be.false;
            expect(certificate.canApplyTo('https://google.com')).to.be.true;
        });

        it('should return true when tested with a match on any of the allowed matches', function () {
            var certificate = new Certificate({ matches: ['https://google.com/*', 'https://*.example.com/*'] });

            expect(certificate.canApplyTo('https://twitter.com')).to.be.false;
            expect(certificate.canApplyTo('https://foo.example.com')).to.be.true;
            expect(certificate.canApplyTo('https://google.com')).to.be.true;
        });

        it('should disallow test string with protocol not http or https', function () {
            var certificate = new Certificate({ matches: ['http://*'], server: 'https://proxy.com/' });

            expect(certificate.canApplyTo('foo://www.google.com')).to.be.false;
            expect(certificate.canApplyTo('file://www.google.com')).to.be.false;
        });

        it('should disallow any test string when match protocol is not http or https', function () {
            var certificate = new Certificate({ matches: ['ftp://*'], server: 'https://proxy.com/' });

            expect(certificate.canApplyTo('foo://www.google.com')).to.be.false;
            expect(certificate.canApplyTo('file://www.google.com')).to.be.false;
            expect(certificate.canApplyTo('http://www.google.com')).to.be.false;
            expect(certificate.canApplyTo('https://www.google.com')).to.be.false;
        });

        it('should match given port correctly', function () {
            var certificate = new Certificate({ matches: ['https://example.com:8080/*'] });

            expect(certificate.canApplyTo('https://example.com:443')).to.be.false;
            expect(certificate.canApplyTo('https://example.com:8080')).to.be.true;
        });

        it('should match all the ports correctly', function () {
            var certificate = new Certificate({ matches: ['https://example.com:*/*'] });

            expect(certificate.canApplyTo('https://example.com')).to.be.true;
            expect(certificate.canApplyTo('https://example.com:443')).to.be.true;
            expect(certificate.canApplyTo('https://example.com:8080')).to.be.true;
        });

        it('should implicitly match port 443 if given in Url', function () {
            var certificate = new Certificate({ matches: ['https://example.com/*'] });

            expect(certificate.canApplyTo('https://example.com')).to.be.true;
            expect(certificate.canApplyTo('https://example.com:443')).to.be.true;
            expect(certificate.canApplyTo('https://example.com:8080')).to.be.false;
        });

        it('should implicitly match port 443 if given in matches', function () {
            var certificate = new Certificate({ matches: ['https://example.com:443/*'] });

            expect(certificate.canApplyTo('https://example.com')).to.be.true;
            expect(certificate.canApplyTo('https://example.com:443')).to.be.true;
            expect(certificate.canApplyTo('https://example.com:8080')).to.be.false;
        });

        it('should match non 443 port correctly', function () {
            var certificate = new Certificate({ matches: ['https://example.com:8080/*'] });

            expect(certificate.canApplyTo('https://example.com')).to.be.false;
            expect(certificate.canApplyTo('https://example.com:443')).to.be.false;
            expect(certificate.canApplyTo('https://example.com:8080')).to.be.true;
        });
    });

    describe('toJSON', function () {
        it('should contain host property', function () {
            var rawCert = {
                    matches: ['https://postman-echo.com/*', 'https://bla.com/*'],
                    key: { src: '/Users/here' },
                    cert: { src: '/Users/here' },
                    pfx: { src: '/Users/here' },
                    passphrase: 'iamhere'
                },
                certificate = new Certificate(rawCert),
                serialisedCertificate = certificate.toJSON();

            expect(serialisedCertificate).to.deep.include({
                key: rawCert.key,
                cert: rawCert.cert,
                pfx: rawCert.pfx,
                passphrase: rawCert.passphrase
            });
        });

        it('should not contain key value', function () {
            var rawCert = {
                    matches: ['https://postman-echo.com/*', 'https://bla.com/*'],
                    key: { src: '/Users/here' },
                    cert: { src: '/Users/here' },
                    pfx: { src: '/Users/here' },
                    passphrase: 'iamhere'
                },
                certificate = new Certificate(rawCert),
                serialisedCertificate;

            certificate.key.value = 'something';
            certificate.cert.value = 'something-else';
            certificate.pfx.value = 'something-else-as-well';
            serialisedCertificate = certificate.toJSON();

            expect(serialisedCertificate.key).to.not.have.property('value');
            expect(serialisedCertificate.cert).to.not.have.property('value');
            expect(serialisedCertificate.pfx).to.not.have.property('value');
        });
    });
});
