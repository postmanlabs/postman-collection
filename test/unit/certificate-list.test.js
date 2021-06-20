var expect = require('chai').expect,
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

        it('should return a certificate instance when matched, and undefined instead', function () {
            var matchedCertificate = certificateList.resolveOne('https://www.google.com');

            expect(matchedCertificate).to.be.an.instanceof(Certificate);

            matchedCertificate = certificateList.resolveOne('https://www.google.com:443');
            expect(matchedCertificate).to.be.an.instanceof(Certificate);

            matchedCertificate = certificateList.resolveOne('https://www.bla.com');
            expect(matchedCertificate).to.be.undefined;
        });

        it('should return the matched certificate', function () {
            var matchedCertificate = certificateList.resolveOne('https://www.google.com');

            expect(matchedCertificate.id).to.eql(1);
        });

        it('should return undefined when no certificate is matched', function () {
            var matchedCertificate = certificateList.resolveOne('https://www.twitter.com');

            expect(matchedCertificate).to.be.undefined;
        });

        it('should exit safely when called with url which is not a string or a Url', function () {
            var matchedCertificate = certificateList.resolveOne({});

            expect(matchedCertificate).to.be.undefined;

            matchedCertificate = certificateList.resolveOne(['bla']);

            expect(matchedCertificate).to.be.undefined;
        });
    });

    describe('isCertificateList', function () {
        it('should return true for CertificateList instance', function () {
            var certificateList = new CertificateList({}, [{ matches: [] }]);

            expect(CertificateList.isCertificateList()).to.be.false;
            expect(CertificateList.isCertificateList(certificateList)).to.be.true;
            expect(CertificateList.isCertificateList({})).to.be.false;
            expect(CertificateList.isCertificateList({ _postman_propertyName: 'CertificateList' })).to.be.false;
        });
    });
});
