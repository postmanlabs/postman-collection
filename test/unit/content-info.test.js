var expect = require('chai').expect,
    contentInfo = require('../../lib/content-info'),
    Response = require('../../lib').Response,
    fs = require('fs');

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
            contentType: 'image/png',
            fileExtension: 'png',
            fileName: 'response.png',
            mimeFormat: 'image',
            mimeType: 'image'
        });
    });

    // eslint-disable-next-line max-len
    (typeof window === 'undefined' ? it : it.skip)('Should detect mp3 response stream if content-type is not present', function () {
        // data url of mp3 file
        var data = fs.readFileSync('test/fixtures/audio.mp3'),
            response = new Response({ stream: data });

        expect(contentInfo.contentInfo(response)).to.include({
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
            contentType: 'application/json',
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

        expect(contentInfo.contentInfo(response)).to.include({
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
            .include({
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
            .include({
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
            .include({
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
            .include({
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
            .include({
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
            .include({
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
            .include({
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
            .include({
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
            .include({
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
            .include({
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
            .include({
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
                contentType: 'image/png',
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
            .include({
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
            .include({
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
            .include({
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
            .include({
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
            .include({
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
            .include({
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

        expect(contentInfo.contentInfo(response)).to.include({
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
