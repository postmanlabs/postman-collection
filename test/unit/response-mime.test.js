var expect = require('chai').expect,
    Response = require('../../lib/index.js').Response;

describe('response mime', function () {
    it('must treat lack of information as plain text', function () {
        var response = new Response();

        expect(response.contentInfo()).to.include({
            mimeType: 'text',
            mimeFormat: 'plain',
            charset: 'utf8',
            fileExtension: 'txt',
            fileName: 'response.txt'
        });
    });

    it('must translate ambiguous content type', function () {
        var response = new Response({
            header: [{
                key: 'content-type',
                value: 'application/json'
            }]
        });

        expect(response.contentInfo()).to.include({
            mimeType: 'text',
            mimeFormat: 'json',
            charset: 'utf8',
            fileExtension: 'json',
            fileName: 'response.json'
        });
    });

    it('must translate malformed content type', function () {
        var response = new Response({
            header: [{
                key: 'content-type',
                value: '  application  / hal+ json '
            }]
        });

        expect(response.contentInfo()).to.include({
            mimeType: 'text',
            mimeFormat: 'json',
            charset: 'utf8',
            fileName: 'response'
        });
    });

    it('must translate content type with charset', function () {
        var response = new Response({
            header: [{
                key: 'content-type',
                value: 'application/ogg; charset=utf8'
            }]
        });

        expect(response.contentInfo()).to.include({
            mimeType: 'audio',
            mimeFormat: 'ogg',
            charset: 'utf8',
            fileExtension: 'ogx',
            fileName: 'response.ogx'
        });
    });

    it('must be greedy in assuming script types', function () {
        var response = new Response({
            header: [{
                key: 'content-type',
                value: 'application/x-ecmascript'
            }]
        });

        expect(response.contentInfo()).to.include({
            mimeType: 'text',
            mimeFormat: 'script',
            charset: 'utf8',
            fileName: 'response'
        });
    });

    it('must be greedy in assuming xml types', function () {
        var response = new Response({
            header: [{
                key: 'content-type',
                // customer reported
                value: 'application/vnd.yamaha.openscoreformat.osfpvg+xml'
            }]
        });

        expect(response.contentInfo()).to.include({
            mimeType: 'text',
            mimeFormat: 'xml',
            charset: 'utf8',
            fileExtension: 'osfpvg',
            fileName: 'response.osfpvg'
        });

        // customer reported
        // reusing the same response object
        response.headers.one('content-type').value = 'application/vnd.route66.link66+xml';

        expect(response.contentInfo()).to.include({
            mimeType: 'text',
            mimeFormat: 'xml',
            charset: 'utf8',
            fileExtension: 'link66',
            fileName: 'response.link66'
        });
    });

    it('must gracefully handle extremely deviant content type', function () {
        var response = new Response({
            header: [{
                key: 'content-type',
                value: 'machine/samaritan'
            }]
        });

        expect(response.contentInfo()).to.include({
            mimeType: 'unknown',
            mimeFormat: 'raw',
            charset: 'utf8',
            fileName: 'response'
        });
    });

    it('must detect mime from body if content-type is missing', function () {
        var sampleArray = [0xFF, 0xD8, 0xFF, 0x62, 0x75, 0x66, 0x66, 0x65, 0x72],
            response = new Response({
                // todo load real file content here (maybe 1x1 px bmp)
                stream: Buffer.from(new Uint32Array(sampleArray))
            });

        expect(response.contentInfo()).to.include({
            mimeType: 'image',
            mimeFormat: 'image',
            charset: 'utf8',
            fileExtension: 'jpg',
            fileName: 'response.jpg'
        });
    });
});
