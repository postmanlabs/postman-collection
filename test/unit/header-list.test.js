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

    it('should be able to return header size', function () {
        var hl = new HeaderList(null, 'Accept: *\nContent-Type: text/html');
        expect(hl.contentSize(200, 'OK')).eql(38);
    });
});
