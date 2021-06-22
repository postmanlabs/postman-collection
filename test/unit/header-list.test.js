var expect = require('chai').expect,
    sdk = require('../../lib/index.js'),

    HeaderList = sdk.HeaderList;

describe('HeaderList', function () {
    it('should be a working constructor', function () {
        expect(new HeaderList()).to.be.an.instanceOf(HeaderList);
    });

    it('should be able to initialise with header as string', function () {
        var hl = new HeaderList(null, 'Accept: *\nContent-Type: text/html');

        expect(hl.count()).to.equal(2);
    });

    it('should be able to export headers to string', function () {
        var hl = new HeaderList(null, 'Accept: *\nContent-Type: text/html');

        expect(hl.toString()).to.equal('Accept: *\r\nContent-Type: text/html\r\n');
    });

    describe('.contentSize', function () {
        it('should be able to return header size', function () {
            var hl = new HeaderList(null, 'Accept: *\nContent-Type: text/html');

            expect(hl.contentSize(200, 'OK')).to.equal(36);
        });

        it('should return 0 for an empty header set', function () {
            var hl = new HeaderList();

            expect(hl.contentSize()).to.equal(0);
        });

        it('should should handle disabled and falsy headers correctly', function () {
            var hl = new HeaderList(null, [{
                key: undefined,
                value: 'bar'
            }, {
                key: 'foo',
                value: 'bar',
                disabled: true
            }]);

            expect(hl.contentSize()).to.equal(7); // ": bar + CRLF"
        });
    });

    describe('.isHeaderList', function () {
        it('should correctly identify HeaderList instances', function () {
            var headerList = new HeaderList(null, 'Accept: *\nContent-Type: text/html');

            expect(HeaderList.isHeaderList()).to.be.false;
            expect(HeaderList.isHeaderList(headerList)).to.be.true;
            expect(HeaderList.isHeaderList({})).to.be.false;
            expect(HeaderList.isHeaderList({ _postman_propertyName: 'headerList' })).to.be.false;
        });
    });
});
