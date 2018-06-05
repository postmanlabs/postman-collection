var expect = require('expect.js'),
    contentInfo = require('../../lib/content-info'),
    Response = require('../../lib').Response;

describe('contentInfo module', function () {
    // eslint-disable-next-line max-len
    it('Should take the sniffed content-type from the response stream if content-type headers is not present', function () {
        // data url of png image
        var img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0' +
        'NAAAAKElEQVQ4jWNgYGD4Twzu6FhFFGYYNXDUwGFpIAk2E4dHDRw1cDgaCAASFOffhEIO' +
        '3gAAAABJRU5ErkJggg==',
            // replacing the mime type and encoded format
            data = img.replace(/^data:image\/\w+;base64,/, ''),
            // creating the buffer of the image file
            response = new Response({ stream: Buffer.from(data, 'base64') });

        expect(contentInfo.contentInfo(response)).to.eql({
            charset: 'utf8',
            fileExtension: 'png',
            fileName: 'response.png',
            mimeFormat: 'image',
            mimeType: 'image'
        });
    });

    it('Should return file name from content-disposition header with type attachment and file name', function () {
        var response = new Response({ header: [
            {
                key: 'content-disposition',
                value: 'attachment; filename=testResponse.json'
            },
            {
                key: 'content-type',
                value: 'application/json'
            }
        ], stream: Buffer.from('random').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to.eql({
            charset: 'utf8',
            fileExtension: 'json',
            mimeFormat: 'json',
            mimeType: 'text',
            fileName: 'testResponse.json'
        });
    });

    it('Should return default file name and extension from mime if disposition header is not present ', function () {
        var response = new Response({ header: [
            {
                key: 'content-type',
                value: 'application/json'
            }
        ], stream: Buffer.from('random').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to.eql({
            charset: 'utf8',
            fileExtension: 'json',
            mimeFormat: 'json',
            mimeType: 'text',
            fileName: 'response.json'
        });
    });

    // eslint-disable-next-line max-len
    it('Should return filename from content-disposition header with type attachment and file name without ext', function () {
        var response = new Response({ header: [
            {
                key: 'Content-Disposition',
                value: 'attachment; filename=testResponse'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }
        ], stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: 'testResponse'
            });
    });

    // eslint-disable-next-line max-len
    it('Should return file name from content-disposition header with type attachment and file name with dots', function () {
        var response = new Response({ header: [
            {
                key: 'Content-Disposition',
                value: 'attachment;filename=test.Response.json'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }
        ], stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: 'test.Response.json'
            });
    });

    it('Should return file name from content-disposition header with type attachment and dot files', function () {
        var response = new Response({ header: [
            {
                key: 'Content-Disposition',
                value: 'attachment;filename=.response'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }
        ], stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: '.response'
            });
    });

    // eslint-disable-next-line max-len
    it('Should return file name from content-disposition header with type attachment and file name with quotes', function () {
        var response = new Response({ header: [
            {
                key: 'Content-Disposition',
                value: 'attachment;filename="test Response.json"'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }
        ], stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: 'test Response.json'
            });
    });

    it('Should return file name from content-disposition header with type inline and file name', function () {
        var response = new Response({ header: [
            {
                key: 'Content-Disposition',
                value: 'attachment;filename=test.Response.json'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }
        ], stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: 'test.Response.json'
            });
    });

    it('Should return file name from content-disposition header with encoded type utf-8', function () {
        var response = new Response({ header: [
            {
                key: 'Content-Disposition',
                value: 'attachment;filename*=utf-8\'\'%E5%93%8D%E5%BA%94.json'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }
        ], stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: '响应.json'
            });
    });

    it('Should return file name from content-disposition header with encoded type iso-8859-1', function () {
        var response = new Response({ header: [
            {
                key: 'Content-Disposition',
                value: 'attachment;filename*=iso-8859-1\'\'myResponse.json'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }
        ], stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: 'myResponse.json'
            });
    });

    it('filename* parameter is preferred than filename in content-disposition header', function () {
        var response = new Response({ header: [
            {
                key: 'Content-Disposition',
                value: 'attachment;filename*=utf-8\'\'%E5%93%8D%E5%BA%94.json; filename = response.json'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }
        ], stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: '响应.json'
            });
    });

    it('Should return file name from content-disposition header with type form-data and file name', function () {
        var response = new Response({ header: [
            {
                key: 'Content-Disposition',
                value: 'form-data; filename="testResponse.json"'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }
        ], stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: 'testResponse.json'
            });
    });
});