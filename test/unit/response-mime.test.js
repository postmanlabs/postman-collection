var expect = require('chai').expect,
    Response = require('../../lib/index.js').Response;

describe('response mime', function () {
    it('must treat lack of information as plain text', function () {
        var response = new Response();
        expect(response.mime()).to.eql({
            type: 'text',
            format: 'plain',
            name: 'response',
            ext: 'txt',
            charset: 'utf8',
            _originalContentType: 'text/plain',
            _sanitisedContentType: 'text/plain',
            _accuratelyDetected: true,
            filename: 'response.txt',
            source: 'default',
            detected: null
        });
    });

    it('must translate ambiguous content type', function () {
        var response = new Response({
            header: [{
                key: 'content-type',
                value: 'application/json'
            }]
        });
        expect(response.mime()).to.eql({
            type: 'text',
            format: 'json',
            name: 'response',
            ext: 'json',
            charset: 'utf8',
            _originalContentType: 'application/json',
            _sanitisedContentType: 'application/json',
            _accuratelyDetected: true,
            filename: 'response.json',
            source: 'header',
            detected: null
        });
    });

    it('must translate malformed content type', function () {
        var response = new Response({
            header: [{
                key: 'content-type',
                value: '  application  / hal+ json '
            }]
        });
        expect(response.mime()).to.eql({
            type: 'text',
            format: 'json',
            name: 'response',
            ext: '',
            charset: 'utf8',
            _originalContentType: '  application  / hal+ json ',
            _sanitisedContentType: 'application/hal+json',
            _accuratelyDetected: true,
            filename: 'response',
            source: 'header',
            detected: null
        });
    });

    it('must translate content type with charset', function () {
        var response = new Response({
            header: [{
                key: 'content-type',
                value: 'application/ogg; charset=utf8'
            }]
        });
        expect(response.mime()).to.eql({
            type: 'audio',
            format: 'ogg',
            name: 'response',
            ext: 'ogx',
            charset: 'utf8',
            _originalContentType: 'application/ogg; charset=utf8',
            _sanitisedContentType: 'application/ogg',
            _accuratelyDetected: true,
            filename: 'response.ogx',
            source: 'header',
            detected: null
        });
    });

    it('must be greedy in assuming script types', function () {
        var response = new Response({
            header: [{
                key: 'content-type',
                value: 'application/x-ecmascript'
            }]
        });
        expect(response.mime()).to.eql({
            type: 'text',
            format: 'script',
            name: 'response',
            ext: '',
            charset: 'utf8',
            _originalContentType: 'application/x-ecmascript',
            _sanitisedContentType: 'application/x-ecmascript',
            _accuratelyDetected: true,
            filename: 'response',
            source: 'header',
            detected: null
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

        expect(response.mime()).to.eql({
            type: 'text',
            format: 'xml',
            name: 'response',
            ext: 'osfpvg',
            charset: 'utf8',
            _originalContentType: 'application/vnd.yamaha.openscoreformat.osfpvg+xml',
            _sanitisedContentType: 'application/vnd.yamaha.openscoreformat.osfpvg+xml',
            _accuratelyDetected: true,
            filename: 'response.osfpvg',
            source: 'header',
            detected: null
        });

        // customer reported
        // reusing the same response object
        response.headers.one('content-type').value = 'application/vnd.route66.link66+xml';

        expect(response.mime()).to.eql({
            type: 'text',
            format: 'xml',
            name: 'response',
            ext: 'link66',
            charset: 'utf8',
            _originalContentType: 'application/vnd.route66.link66+xml',
            _sanitisedContentType: 'application/vnd.route66.link66+xml',
            _accuratelyDetected: true,
            filename: 'response.link66',
            source: 'header',
            detected: null
        });
    });

    it('must gracefully handle extremely deviant content type', function () {
        var response = new Response({
            header: [{
                key: 'content-type',
                value: 'machine/samaritan'
            }]
        });
        expect(response.mime()).to.eql({
            type: 'unknown',
            format: 'raw',
            name: 'response',
            ext: '',
            charset: 'utf8',
            _originalContentType: 'machine/samaritan',
            _sanitisedContentType: 'machine/samaritan',
            _accuratelyDetected: false,
            filename: 'response',
            source: 'header',
            detected: null
        });
    });

    // @todo: update the test block when we decide to drop Node v4 support
    it('must detect mime from body', function () {
        var isNode4 = (/^v4\./).test(process.version),
            sampleArray = [0xFF, 0xD8, 0xFF, 0x62, 0x75, 0x66, 0x66, 0x65, 0x72],
            response = new Response({
                header: [{
                    key: 'content-type',
                    value: 'machine/samaritan'
                }],

                // todo load real file content here (maybe 1x1 px bmp)
                stream: isNode4 ? new Buffer(sampleArray) : Buffer.from(new Uint32Array(sampleArray))
            });

        expect(response.mime()).to.eql({
            type: 'unknown',
            format: 'raw',
            name: 'response',
            ext: '',
            charset: 'utf8',
            _originalContentType: 'machine/samaritan',
            _sanitisedContentType: 'machine/samaritan',
            _accuratelyDetected: false,
            filename: 'response',
            source: 'header',
            detected: {
                _accuratelyDetected: true,
                _originalContentType: 'image/jpeg',
                _sanitisedContentType: 'image/jpeg',
                ext: 'jpeg',
                charset: 'utf8',
                filename: 'response.jpeg',
                format: 'image',
                name: 'response',
                type: 'image'
            }
        });
    });
});
