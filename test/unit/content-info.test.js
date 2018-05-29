var expect = require('expect.js'),
    contentInfo = require('../../lib/content-info'),
    Response = require('../../lib').Response;

describe('contentInfo module', function () {
    it('Should take the content-type from the response stream if content-type headers is not present', function () {
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
            defaultExtension: 'png',
            format: 'image',
            mimeType: 'image'
        });
    });

    it('Should return file name from content disposition header with type attachment and file name', function () {
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
            defaultExtension: 'json',
            format: 'json',
            mimeType: 'text',
            name: 'testResponse',
            ext: 'json'
        });
    });

    // eslint-disable-next-line max-len
    it('Should return filename from contentDisposition header with type attachment and file name without ext', function () {
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
                defaultExtension: 'json',
                format: 'json',
                mimeType: 'text',
                name: 'testResponse',
                ext: ''
            });
    });

    // eslint-disable-next-line max-len
    it('Should return file name from contentDisposition header with type attachment and file name with dots', function () {
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
                defaultExtension: 'json',
                format: 'json',
                mimeType: 'text',
                name: 'test.Response',
                ext: 'json'
            });
    });

    it('Should return file name from contentDisposition header with type attachment and dot files', function () {
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
                defaultExtension: 'json',
                format: 'json',
                mimeType: 'text',
                name: '.response',
                ext: ''
            });
    });

    // eslint-disable-next-line max-len
    it('Should return file name from content disposition header with type attachment and file name with quotes', function () {
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
                defaultExtension: 'json',
                format: 'json',
                mimeType: 'text',
                name: 'test Response',
                ext: 'json'
            });
    });

    it('Should return file name from content disposition header with type inline and file name', function () {
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
                defaultExtension: 'json',
                format: 'json',
                mimeType: 'text',
                name: 'test.Response',
                ext: 'json'
            });
    });

    it('Should return file name from content disposition header with encoded type utf-8', function () {
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
                defaultExtension: 'json',
                format: 'json',
                mimeType: 'text',
                name: '响应',
                ext: 'json'
            });
    });

    it('Should return file name from content disposition header with encoded type iso-8859-1', function () {
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
                defaultExtension: 'json',
                format: 'json',
                mimeType: 'text',
                name: 'myResponse',
                ext: 'json'
            });
    });

    it('filename* parameter is preferred than filename in content disposition header', function () {
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
                defaultExtension: 'json',
                format: 'json',
                mimeType: 'text',
                name: '响应',
                ext: 'json'
            });
    });

    it('Should return file name from content disposition header with type form-data and file name', function () {
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
                defaultExtension: 'json',
                format: 'json',
                mimeType: 'text',
                name: 'testResponse',
                ext: 'json'
            });
    });

    describe('Regex DOS Security', function () {
        it('should not get ReDos by fileNameRegex for long patterns of ASCII char', function () {
            this.timeout(1000);
            var filenameHeader = 'attachment;filename=' + 'hello.txt.'.repeat(8e6),
                headerPart = contentInfo.Regex.fileNameRegex.exec(filenameHeader);
            expect(headerPart[1].toString()).to.have.length(8e7);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by fileNameRegex for long patterns of ASCII and non-ASCII chars equal split parse', function () {
            this.timeout(300);
            var filenameHeader = 'attachment;filename="' + 'hello你好你好你'.repeat(3e5) + '"',
                headerPart = contentInfo.Regex.fileNameRegex.exec(filenameHeader);
            expect(headerPart).eql(null);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by fileNameRegex for long patterns of ASCII and non-ASCII chars equal split Multiple', function () {
            this.timeout(300);
            var filenameHeader = 'attachment;filename="' + 'hello'.repeat(3e5) + '你好你好你'.repeat(3e5) + '"',
                headerPart = contentInfo.Regex.fileNameRegex.exec(filenameHeader);
            expect(headerPart).eql(null);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by fileNameRegex for long patterns of ASCII and non-ASCII chars unequal split parse', function () {
            this.timeout(300);
            var filenameHeader = 'attachment;filename="' + 'helloooo你好'.repeat(3e5) + '"',
                headerPart = contentInfo.Regex.fileNameRegex.exec(filenameHeader);
            expect(headerPart).eql(null);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by fileNameRegex for long patterns of ASCII and non-ASCII chars unequal split multiple', function () {
            this.timeout(300);
            var filenameHeader = 'attachment;filename="' + 'helloooo'.repeat(3e5) + '你你'.repeat(3e5) + '"',
                headerPart = contentInfo.Regex.fileNameRegex.exec(filenameHeader);
            expect(headerPart).eql(null);
        });

        it('should not get ReDos by encodedFileNameRegex for long patterns of ASCII char', function () {
            this.timeout(300);
            var filenameHeader = 'attachment;filename*=utf-8\'en\'' + 'hello.txt.'.repeat(3e5),
                headerPart = contentInfo.Regex.encodedFileNameRegex.exec(filenameHeader);
            expect(headerPart[2].toString()).to.have.length(3e6);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by encodedFileNameRegex for long patterns of ASCII and non-ASCII chars equal split parse', function () {
            this.timeout(300);
            var filenameHeader = 'attachment;filename*=utf-8\'en\'' + 'hello你好你好你'.repeat(3e5),
                headerPart = contentInfo.Regex.encodedFileNameRegex.exec(filenameHeader);
            expect(headerPart[1]).eql('utf-8');
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by encodedFileNameRegex for long patterns of ASCII and non-ASCII chars equal split Multiple', function () {
            this.timeout(300);
            var filenameHeader = 'attachment;filename*=utf-8\'en\'' + 'hello'.repeat(3e5) + '你好你好你'.repeat(3e5),
                headerPart = contentInfo.Regex.encodedFileNameRegex.exec(filenameHeader);
            expect(headerPart[1]).eql('utf-8');
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by encodedFileNameRegex for long patterns of ASCII and non-ASCII chars unequal split parse', function () {
            this.timeout(300);
            var filenameHeader = 'attachment;filename*=utf-8\'en\'' + 'helloooo你好'.repeat(3e5),
                headerPart = contentInfo.Regex.encodedFileNameRegex.exec(filenameHeader);
            expect(headerPart[1]).eql('utf-8');
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by encodedFileNameRegex for long patterns of ASCII and non-ASCII chars unequal split multiple', function () {
            this.timeout(300);
            var filenameHeader = 'attachment;filename*=utf-8\'en\'' + 'helloooo'.repeat(3e5) + '你你'.repeat(3e5),
                headerPart = contentInfo.Regex.encodedFileNameRegex.exec(filenameHeader);
            expect(headerPart[1]).eql('utf-8');
        });

        it('should not get ReDos by quotedPairRegex for long patterns of ASCII char', function () {
            this.timeout(3000);
            // eslint-disable-next-line
            var filenameHeader = "\\h\\e\\l\\l\\o".repeat(3e5),
                headerPart = filenameHeader.match(contentInfo.Regex.quotedPairRegex);
            expect(headerPart).to.have.length(15e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by quotedPairRegex for long patterns of ASCII and non-ASCII chars equal split parse', function () {
            this.timeout(5000);
            // eslint-disable-next-line
            var filenameHeader = "\\h\\e\\l\\l\\o\\你\\好\\你\\好\\你".repeat(3e5),
                headerPart = filenameHeader.match(contentInfo.Regex.quotedPairRegex);
            expect(headerPart).to.have.length(15e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by quotedPairRegex for long patterns of ASCII and non-ASCII chars equal split Multiple', function () {
            this.timeout(3000);
            // eslint-disable-next-line
            var filenameHeader = "\\h\\e\\l\\l\\o".repeat(3e5) + "\\你\\好\\你\\好\\你".repeat(3e5),
                headerPart = filenameHeader.match(contentInfo.Regex.quotedPairRegex);
            expect(headerPart).to.have.length(15e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by quotedPairRegex for long patterns of ASCII and non-ASCII chars unequal split parse', function () {
            this.timeout(10000);
            // eslint-disable-next-line
            var filenameHeader = "\\h\\e\\l\\l\\o\\o\\o\\o\\你\\好".repeat(3e5),
                headerPart = filenameHeader.match(contentInfo.Regex.quotedPairRegex);
            expect(headerPart).to.have.length(24e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by quotedPairRegex for long patterns of ASCII and non-ASCII chars unequal split multiple', function () {
            this.timeout(10000);
            // eslint-disable-next-line
            var filenameHeader = "\\h\\e\\l\\l\\o\\o\\o\\o".repeat(3e5) + "\\你\\你".repeat(3e5),
                headerPart = filenameHeader.match(contentInfo.Regex.quotedPairRegex);
            expect(headerPart).to.have.length(24e5);
        });

        it('should not get ReDos by nonLatinCharMatchRegex for long patterns of ASCII char', function () {
            this.timeout(2000);
            var filenameHeader = 'hello'.repeat(3e5),
                headerPart = filenameHeader.match(contentInfo.Regex.nonLatinCharMatchRegex);
            expect(headerPart).eql(null);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by nonLatinCharMatchRegex for long patterns of ASCII and non-ASCII chars equal split parse', function () {
            this.timeout(5000);
            var filenameHeader = 'hello你好你好你'.repeat(3e5),
                headerPart = filenameHeader.match(contentInfo.Regex.nonLatinCharMatchRegex);
            expect(headerPart).to.have.length(15e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by nonLatinCharMatchRegex for long patterns of ASCII and non-ASCII chars equal split Multiple', function () {
            this.timeout(5000);
            var filenameHeader = 'hello'.repeat(3e5) + '你好你好你'.repeat(3e5),
                headerPart = filenameHeader.match(contentInfo.Regex.nonLatinCharMatchRegex);
            expect(headerPart).to.have.length(15e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by nonLatinCharMatchRegex for long patterns of ASCII and non-ASCII chars unequal split parse', function () {
            this.timeout(1500);
            var filenameHeader = 'helloooo你好'.repeat(3e5),
                headerPart = filenameHeader.match(contentInfo.Regex.nonLatinCharMatchRegex);
            expect(headerPart).to.have.length(6e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by nonLatinCharMatchRegex for long patterns of ASCII and non-ASCII chars unequal split multiple', function () {
            this.timeout(1500);
            var filenameHeader = 'helloooo'.repeat(3e5) + '你你'.repeat(3e5),
                headerPart = filenameHeader.match(contentInfo.Regex.nonLatinCharMatchRegex);
            expect(headerPart).to.have.length(6e5);
        });

        it('should not get ReDos by hexCharMatchRegex for long patterns of ASCII char', function () {
            this.timeout(1500);
            var filenameHeader = '%E4%BD%A0%E5%A5%BD%0A%0A%0A%0A'.repeat(6e4),
                headerPart = filenameHeader.match(contentInfo.Regex.hexCharMatchRegex);
            expect(headerPart).to.have.length(6e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by hexCharMatchRegex for long patterns of ASCII and non-ASCII chars equal split parse', function () {
            this.timeout(3000);
            var filenameHeader = '%E4%BD%A0%E5%A5你好你好你'.repeat(3e5),
                headerPart = filenameHeader.match(contentInfo.Regex.hexCharMatchRegex);
            expect(headerPart).to.have.length(15e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by hexCharMatchRegex for long patterns of ASCII and non-ASCII chars equal split Multiple', function () {
            this.timeout(3000);
            var filenameHeader = '%E4%BD%A0%E5%A5'.repeat(3e5) + '你好你好你'.repeat(3e5),
                headerPart = filenameHeader.match(contentInfo.Regex.hexCharMatchRegex);
            expect(headerPart).to.have.length(15e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by hexCharMatchRegex for long patterns of ASCII and non-ASCII chars unequal split parse', function () {
            this.timeout(5000);
            var filenameHeader = '%E4%BD%A0%E5%A5%A0%E5%A5你好'.repeat(3e5),
                headerPart = filenameHeader.match(contentInfo.Regex.hexCharMatchRegex);
            expect(headerPart).to.have.length(24e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by hexCharMatchRegex for long patterns of ASCII and non-ASCII chars unequal split multiple', function () {
            this.timeout(5000);
            var filenameHeader = '%E4%BD%A0%E5%A5%A0%E5%A5'.repeat(3e5) + '你你'.repeat(3e5),
                headerPart = filenameHeader.match(contentInfo.Regex.hexCharMatchRegex);
            expect(headerPart).to.have.length(24e5);
        });
    });
});