var expect = require('expect.js'),
    CertificateList = require('../../lib/index.js').CertificateList,
    Certificate = require('../../lib/index.js').Certificate;

describe('CertificateList', function () {
    describe('resolve', function () {
        var certificateList = new CertificateList({}, [{
            id: 1,

            matches: ['https://*.google.com/*', 'https://*.youtube.com']
        }, {
            id: 2,

            matches: ['https://example.com', 'https://*.foo.com']
        }]);

        it('should return a certificate instance when matched, and undefined instead', function() {
            var matchedCertificate = certificateList.resolveOne('https://www.google.com');
            expect(matchedCertificate instanceof Certificate).to.be.ok();

            matchedCertificate = certificateList.resolveOne('https://www.bla.com');
            expect(matchedCertificate).to.eql(undefined);
        });

        it('should return the matched certificate', function() {
            var matchedCertificate = certificateList.resolveOne('https://www.google.com');

            expect(matchedCertificate.id).to.eql(1);
        });

        it('should return undefined when no certificate is matched', function() {
            var matchedCertificate = certificateList.resolveOne('https://www.twitter.com');

            expect(matchedCertificate).to.eql(undefined);
        });

        it('should exit safely when called with url which is not a string or a Url', function() {
            var matchedCertificate = certificateList.resolveOne({});

            expect(matchedCertificate).to.eql(undefined);

            matchedCertificate = certificateList.resolveOne(['bla']);

            expect(matchedCertificate).to.eql(undefined);
        });
    });

    describe('isCertificateList', function() {
        it('should return true for CertificateList instance', function() {
            var certificateList = new CertificateList({}, [{ matches: [] }]);

            expect(CertificateList.isCertificateList(certificateList)).to.eql(true);
            expect(CertificateList.isCertificateList({})).to.eql(false);
            expect(CertificateList.isCertificateList({ _postman_propertyName: 'CertificateList' })).to.eql(false);
        });
    });
});
