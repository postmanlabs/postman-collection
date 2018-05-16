var expect = require('expect.js'),
    filename = require('../../lib/mime-info/filename');

describe('filename', function () {
    it('Should return file name from content disposition header with type attachment and file name', function () {
        expect(filename.getFileNameFromDispositionHeader('attachment; filename=testResponse.json')).to.eql({
            name: 'testResponse',
            ext: 'json'
        });
    });

    it('Should return filename from contentDisposition header with type attachment and file name without ext',
        function () {
            expect(filename.getFileNameFromDispositionHeader('attachment; filename=testResponse')).to
                .eql({
                    name: 'testResponse',
                    ext: ''
                });
        });

    it('Should return file name from contentDisposition header with type attachment and file name with dots',
        function () {
            expect(filename.getFileNameFromDispositionHeader('attachment;filename=test.Response.json')).to
                .eql({
                    name: 'test.Response',
                    ext: 'json'
                });
        });
    it('Should return file name from contentDisposition header with type attachment and dot files',
        function () {
            expect(filename.getFileNameFromDispositionHeader('attachment;filename=.response')).to
                .eql({
                    name: '.response',
                    ext: ''
                });
        });

    it('Should return file name from content disposition header with type attachment and file name with quotes',
        function () {
            expect(filename.getFileNameFromDispositionHeader('attachment;filename="myResponse.json"')).to
                .eql({
                    name: 'myResponse',
                    ext: 'json'
                });
        });

    it('Should return file name from content disposition header with type inline and file name', function () {
        expect(filename.getFileNameFromDispositionHeader('inline; filename=testResponse.json')).to
            .eql({
                name: 'testResponse',
                ext: 'json'
            });
    });

    it('Should return file name from content disposition header with encoded type utf-8', function () {
        expect(filename.getFileNameFromDispositionHeader('inline; filename*=utf-8\'\'%E5%93%8D%E5%BA%94.json')).to
            .eql({
                name: '响应',
                ext: 'json'
            });
    });

    it('Should return file name from content disposition header with encoded type iso-8859-1', function () {
        expect(filename.getFileNameFromDispositionHeader('inline; filename*=iso-8859-1\'\'myResponse.json')).to
            .eql({
                name: 'myResponse',
                ext: 'json'
            });
    });

    it('filename* parameter is preferred than filename in content disposition header', function () {
        expect(filename.getFileNameFromDispositionHeader(
            'inline; filename*=utf-8\'\'%E5%93%8D%E5%BA%94.json; filename = response.json')).to
            .eql({
                name: '响应',
                ext: 'json'
            });
    });

    it('Should return file name from content disposition header with type form-data and file name', function () {
        expect(filename.getFileNameFromDispositionHeader('form-data; filename="testResponse.json"')).to
            .eql({
                name: 'testResponse',
                ext: 'json'
            });
    });
});
