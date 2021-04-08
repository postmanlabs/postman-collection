var expect = require('chai').expect,
    contentInfo = require('../../lib/content-info'),
    Response = require('../../lib').Response;

describe('contentInfo module', function () {
    // eslint-disable-next-line max-len
    it('Should take the sniffed content-type from the response stream if content-type and content-disposition headers is not present', function () {
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

    // eslint-disable-next-line max-len
    it('For mp3 files response, it should take the sniffed content-type from the response stream if content-type and content-disposition headers is not present', function () {
        // data url of mp3 file
        // eslint-disable-next-line max-len
        var data = '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',
            // creating the buffer of the file
            response = new Response({ stream: Buffer.from(data, 'base64') });

        expect(contentInfo.contentInfo(response)).to.eql({
            charset: 'utf8',
            fileExtension: 'mp3',
            fileName: 'response.mp3',
            mimeFormat: 'audio',
            mimeType: 'audio'
        });
    });

    it('Should return file name from content-disposition header with type attachment and file name', function () {
        var response = new Response({
            header: [{
                key: 'content-disposition',
                value: 'attachment; filename=testResponse.json'
            },
            {
                key: 'content-type',
                value: 'application/json'
            }],
            stream: Buffer.from('random').toJSON()
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
        var response = new Response({
            header: [{
                key: 'content-type',
                value: 'application/json'
            }],
            stream: Buffer.from('random').toJSON()
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
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'attachment; filename=testResponse'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
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
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'attachment;filename=test.Response.json'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
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
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'attachment;filename=.response'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
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
    it('should return file name from content-disposition header with type attachment and file name with quotes', function () {
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'attachment;filename="test Response.json"'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
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

    it('should return file name from content-disposition header with type inline and file name', function () {
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'attachment;filename=test.Response.json'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
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

    it('should return default file name if charset specified in content-disposition header is invalid', function () {
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'attachment;filename*=invalid-charset\'\'%E5%93%8D%E5%BA%94.json'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: 'response.json'
            });
    });

    it('should return file name from content-disposition header with encoded type utf-8', function () {
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'attachment;filename*=utf-8\'\'%E5%93%8D%E5%BA%94.json'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
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

    it('should return file name from content-disposition header with encoded type iso-8859-1', function () {
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'attachment;filename*=iso-8859-1\'\'myResponse.json'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
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
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'attachment;filename*=utf-8\'\'%E5%93%8D%E5%BA%94.json; filename = response.json'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
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

    it('should return file name from content-disposition header with type form-data and file name', function () {
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'form-data; filename="testResponse.json"'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
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

    it('should take default filename if content-disposition header value is empty', function () {
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: ''
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: 'response.json'
            });
    });

    // eslint-disable-next-line max-len
    it('should take default filename and sniffed content type, if content-disposition and content-type header value are empty', function () {
        // data url of png image
        var img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0' +
                'NAAAAKElEQVQ4jWNgYGD4Twzu6FhFFGYYNXDUwGFpIAk2E4dHDRw1cDgaCAASFOffhEIO' +
                '3gAAAABJRU5ErkJggg==',
            // replacing the mime type and encoded format
            data = img.replace(/^data:image\/\w+;base64,/, ''),
            // creating the buffer of the image file
            response = new Response({
                header: [{
                    key: 'Content-Disposition',
                    value: ''
                },
                {
                    key: 'Content-Type',
                    value: ''
                }],
                stream: Buffer.from(data, 'base64')
            });

        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'png',
                mimeFormat: 'image',
                mimeType: 'image',
                fileName: 'response.png'
            });
    });

    it('should take default filename if there is no separator in content-disposition header value', function () {
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'form-data filename="testResponse.json"'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: 'response.json'
            });
    });

    it('should take default filename if separator placed wrongly in content-disposition header value', function () {
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'form-data; filename;="testResponse.json"'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: 'response.json'
            });
    });
    // eslint-disable-next-line max-len
    it('if spaces present in the filename without quotes, text from and beyond space should be ignored', function () {
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'form-data; filename = test  Response.json'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: 'test'
            });
    });

    it('should take default filename if order of the content-disposition header value is wrong', function () {
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'filename = test  Response.json; form-data'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: 'response.json'
            });
    });

    // eslint-disable-next-line max-len
    it('should take default filename if unsupported characters are present in content-disposition header', function () {
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: '你你你你你你 = test  Response.json; form-data'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
        });
        expect(contentInfo.contentInfo(response)).to
            .eql({
                charset: 'utf8',
                fileExtension: 'json',
                mimeFormat: 'json',
                mimeType: 'text',
                fileName: 'response.json'
            });
    });

    // eslint-disable-next-line max-len
    it('should take first token value if multiple filename tokens are present in the content-disposition header value', function () {
        var response = new Response({
            header: [{
                key: 'Content-Disposition',
                value: 'attachment; filename = testResponse.json; filename = test.json'
            },
            {
                key: 'Content-Type',
                value: 'application/json'
            }],
            stream: Buffer.from('a test json').toJSON()
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

    it('should take sniffed mime-type if content-type header value is empty', function () {
        // data url of png image
        var img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0' +
                  'NAAAAKElEQVQ4jWNgYGD4Twzu6FhFFGYYNXDUwGFpIAk2E4dHDRw1cDgaCAASFOffhEIO' +
                  '3gAAAABJRU5ErkJggg==',
            // replacing the mime type and encoded format
            data = img.replace(/^data:image\/\w+;base64,/, ''),
            // creating the buffer of the image file
            response = new Response({
                header: [{
                    key: 'Content-Disposition',
                    value: 'form-data; filename=testResponse.xml'
                },
                {
                    key: 'Content-Type',
                    value: ''
                }],
                stream: Buffer.from(data, 'base64') });

        expect(contentInfo.contentInfo(response)).to.eql({
            charset: 'utf8',
            fileExtension: 'png',
            fileName: 'testResponse.xml',
            mimeFormat: 'image',
            mimeType: 'image'
        });
    });

    describe('regexes DOS Security', function () {
        this.timeout(1500);

        it('should not get ReDos by fileNameRegex for long patterns of ASCII char', function () {
            var filenameHeader = 'attachment;filename=' + 'hello.txt.'.repeat(1e5),
                headerPart = contentInfo.regexes.fileNameRegex.exec(filenameHeader);
            expect(headerPart[1].toString()).to.have.lengthOf(1e6);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by fileNameRegex for long patterns of ASCII and non-ASCII chars equal split parse', function () {
            var filenameHeader = 'attachment;filename="' + 'hello你好你好你'.repeat(1e5) + '"',
                headerPart = contentInfo.regexes.fileNameRegex.exec(filenameHeader);
            expect(headerPart).to.be.null;
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by fileNameRegex for long patterns of ASCII and non-ASCII chars equal split Multiple', function () {
            var filenameHeader = 'attachment;filename="' + 'hello'.repeat(1e5) + '你好你好你'.repeat(1e5) + '"',
                headerPart = contentInfo.regexes.fileNameRegex.exec(filenameHeader);
            expect(headerPart).to.be.null;
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by fileNameRegex for long patterns of ASCII and non-ASCII chars unequal split parse', function () {
            var filenameHeader = 'attachment;filename="' + 'helloooo你好'.repeat(1e5) + '"',
                headerPart = contentInfo.regexes.fileNameRegex.exec(filenameHeader);
            expect(headerPart).to.be.null;
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by fileNameRegex for long patterns of ASCII and non-ASCII chars unequal split multiple', function () {
            var filenameHeader = 'attachment;filename="' + 'helloooo'.repeat(1e5) + '你你'.repeat(1e5) + '"',
                headerPart = contentInfo.regexes.fileNameRegex.exec(filenameHeader);
            expect(headerPart).to.be.null;
        });

        it('should not get ReDos by encodedFileNameRegex for long patterns of ASCII char', function () {
            var filenameHeader = 'attachment;filename*=utf-8\'en\'' + 'hello.txt.'.repeat(1e5),
                headerPart = contentInfo.regexes.encodedFileNameRegex.exec(filenameHeader);
            expect(headerPart[2].toString()).to.have.lengthOf(1e6);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by encodedFileNameRegex for long patterns of ASCII and non-ASCII chars equal split parse', function () {
            var filenameHeader = 'attachment;filename*=utf-8\'en\'' + 'hello你好你好你'.repeat(1e5),
                headerPart = contentInfo.regexes.encodedFileNameRegex.exec(filenameHeader);
            expect(headerPart[1]).to.eql('utf-8');
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by encodedFileNameRegex for long patterns of ASCII and non-ASCII chars equal split Multiple', function () {
            var filenameHeader = 'attachment;filename*=utf-8\'en\'' + 'hello'.repeat(1e5) + '你好你好你'.repeat(1e5),
                headerPart = contentInfo.regexes.encodedFileNameRegex.exec(filenameHeader);
            expect(headerPart[1]).to.eql('utf-8');
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by encodedFileNameRegex for long patterns of ASCII and non-ASCII chars unequal split parse', function () {
            var filenameHeader = 'attachment;filename*=utf-8\'en\'' + 'helloooo你好'.repeat(1e5),
                headerPart = contentInfo.regexes.encodedFileNameRegex.exec(filenameHeader);
            expect(headerPart[1]).to.eql('utf-8');
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by encodedFileNameRegex for long patterns of ASCII and non-ASCII chars unequal split multiple', function () {
            var filenameHeader = 'attachment;filename*=utf-8\'en\'' + 'helloooo'.repeat(1e5) + '你你'.repeat(1e5),
                headerPart = contentInfo.regexes.encodedFileNameRegex.exec(filenameHeader);
            expect(headerPart[1]).to.eql('utf-8');
        });

        it('should not get ReDos by quotedPairRegex for long patterns of ASCII char', function () {
            // eslint-disable-next-line
            var filenameHeader = "\\h\\e\\l\\l\\o".repeat(2e5),
                headerPart = filenameHeader.match(contentInfo.regexes.quotedPairRegex);
            expect(headerPart).to.have.lengthOf(1e6);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by quotedPairRegex for long patterns of ASCII and non-ASCII chars equal split parse', function () {
            // eslint-disable-next-line
            var filenameHeader = "\\h\\e\\l\\l\\o\\你\\好\\你\\好\\你".repeat(1e5),
                headerPart = filenameHeader.match(contentInfo.regexes.quotedPairRegex);
            expect(headerPart).to.have.lengthOf(5e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by quotedPairRegex for long patterns of ASCII and non-ASCII chars equal split Multiple', function () {
            // eslint-disable-next-line
            var filenameHeader = "\\h\\e\\l\\l\\o".repeat(1e5) + "\\你\\好\\你\\好\\你".repeat(1e5),
                headerPart = filenameHeader.match(contentInfo.regexes.quotedPairRegex);
            expect(headerPart).to.have.lengthOf(5e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by quotedPairRegex for long patterns of ASCII and non-ASCII chars unequal split parse', function () {
            // eslint-disable-next-line
            var filenameHeader = "\\h\\e\\l\\l\\o\\o\\o\\o\\你\\好".repeat(1e5),
                headerPart = filenameHeader.match(contentInfo.regexes.quotedPairRegex);
            expect(headerPart).to.have.lengthOf(8e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by quotedPairRegex for long patterns of ASCII and non-ASCII chars unequal split multiple', function () {
            // eslint-disable-next-line
            var filenameHeader = "\\h\\e\\l\\l\\o\\o\\o\\o".repeat(1e5) + "\\你\\你".repeat(1e5),
                headerPart = filenameHeader.match(contentInfo.regexes.quotedPairRegex);
            expect(headerPart).to.have.lengthOf(8e5);
        });

        it('should not get ReDos by nonLatinCharMatchRegex for long patterns of ASCII char', function () {
            var filenameHeader = 'hellohello'.repeat(1e6),
                headerPart = filenameHeader.match(contentInfo.regexes.nonLatinCharMatchRegex);
            expect(headerPart).to.be.null;
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by nonLatinCharMatchRegex for long patterns of ASCII and non-ASCII chars equal split parse', function () {
            var filenameHeader = 'hello你好你好你'.repeat(1e5),
                headerPart = filenameHeader.match(contentInfo.regexes.nonLatinCharMatchRegex);
            expect(headerPart).to.have.lengthOf(5e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by nonLatinCharMatchRegex for long patterns of ASCII and non-ASCII chars equal split Multiple', function () {
            var filenameHeader = 'hello'.repeat(1e5) + '你好你好你'.repeat(1e5),
                headerPart = filenameHeader.match(contentInfo.regexes.nonLatinCharMatchRegex);
            expect(headerPart).to.have.lengthOf(5e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by nonLatinCharMatchRegex for long patterns of ASCII and non-ASCII chars unequal split parse', function () {
            var filenameHeader = 'helloooo你好'.repeat(1e5),
                headerPart = filenameHeader.match(contentInfo.regexes.nonLatinCharMatchRegex);
            expect(headerPart).to.have.lengthOf(2e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by nonLatinCharMatchRegex for long patterns of ASCII and non-ASCII chars unequal split multiple', function () {
            var filenameHeader = 'helloooo'.repeat(1e5) + '你你'.repeat(1e5),
                headerPart = filenameHeader.match(contentInfo.regexes.nonLatinCharMatchRegex);
            expect(headerPart).to.have.lengthOf(2e5);
        });

        it('should not get ReDos by hexCharMatchRegex for long patterns of ASCII char', function () {
            var filenameHeader = '%E4%BD%A0%E5%A5%BD%0A%0A%0A%0A'.repeat(1e5),
                headerPart = filenameHeader.match(contentInfo.regexes.hexCharMatchRegex);
            expect(headerPart).to.have.lengthOf(1e6);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by hexCharMatchRegex for long patterns of ASCII and non-ASCII chars equal split parse', function () {
            var filenameHeader = '%E4%BD%A0%E5%A5你好你好你'.repeat(1e5),
                headerPart = filenameHeader.match(contentInfo.regexes.hexCharMatchRegex);
            expect(headerPart).to.have.lengthOf(5e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by hexCharMatchRegex for long patterns of ASCII and non-ASCII chars equal split Multiple', function () {
            var filenameHeader = '%E4%BD%A0%E5%A5'.repeat(1e5) + '你好你好你'.repeat(1e5),
                headerPart = filenameHeader.match(contentInfo.regexes.hexCharMatchRegex);
            expect(headerPart).to.have.lengthOf(5e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by hexCharMatchRegex for long patterns of ASCII and non-ASCII chars unequal split parse', function () {
            var filenameHeader = '%E4%BD%A0%E5%A5%A0%E5%A5你好'.repeat(1e5),
                headerPart = filenameHeader.match(contentInfo.regexes.hexCharMatchRegex);
            expect(headerPart).to.have.lengthOf(8e5);
        });

        // eslint-disable-next-line max-len
        it('should not get ReDos by hexCharMatchRegex for long patterns of ASCII and non-ASCII chars unequal split multiple', function () {
            var filenameHeader = '%E4%BD%A0%E5%A5%A0%E5%A5'.repeat(1e5) + '你你'.repeat(1e5),
                headerPart = filenameHeader.match(contentInfo.regexes.hexCharMatchRegex);
            expect(headerPart).to.have.lengthOf(8e5);
        });
    });
});
