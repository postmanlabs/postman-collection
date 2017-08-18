var expect = require('expect.js'),
    sdk = require('../../lib/index.js'),

    HeaderList = sdk.HeaderList;

describe('HeaderList', function () {
    it('should be a working constructor', function () {
        expect(new HeaderList()).be.a(HeaderList);
    });

    it('should be able to initialise with header as string', function () {
        var hl = new HeaderList(null, 'Accept: *\nContent-Type: text/html');
        expect(hl.count()).eql(2);
    });

    it('should be able to export headers to string', function () {
        var hl = new HeaderList(null, 'Accept: *\nContent-Type: text/html');
        expect(hl.toString()).eql('Accept: *\nContent-Type: text/html');
    });

    describe('.contentSize', function () {
        it('should be able to return header size', function () {
            var hl = new HeaderList(null, 'Accept: *\nContent-Type: text/html');
            expect(hl.contentSize(200, 'OK')).eql(38);
        });

        it('should return 0 for an empty header set', function () {
            var hl = new HeaderList();
            expect(hl.contentSize()).to.be(0);
        });
    });

    describe('.isHeaderList', function () {
        it('should correctly identify HeaderList instances', function () {
            var headerList = new HeaderList(null, 'Accept: *\nContent-Type: text/html');

            expect(HeaderList.isHeaderList()).to.eql(false);
            expect(HeaderList.isHeaderList(headerList)).to.eql(true);
            expect(HeaderList.isHeaderList({})).to.eql(false);
            expect(HeaderList.isHeaderList({ _postman_propertyName: 'headerList' })).to.eql(false);
        });
    });
});
