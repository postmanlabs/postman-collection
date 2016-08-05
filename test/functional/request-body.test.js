var expect = require('expect.js'),
    rawRequestBody = require('../fixtures').requestData,
    RequestBody = require('../../lib/index.js').RequestBody,
    QueryParam = require('../../lib/index.js').QueryParam;

/* global describe, it */
describe('RequestBody', function () {
    it('should be jsonified properly', function () {
        var reqData = new RequestBody(rawRequestBody),
            jsonified = reqData.toJSON();
        expect(jsonified).to.eql(rawRequestBody);
    });

    it('should be stringified properly', function () {
        var reqData = new RequestBody(rawRequestBody),
            expectedQueryData = QueryParam.unparse(rawRequestBody.urlencoded);

        // Set the mode to URL encoded
        reqData.mode = 'urlencoded';
        expect(reqData.toString()).to.eql(expectedQueryData);
    });

    it('should support file mode', function () {
        var rawBody = {
                mode: 'formdata',
                formdata: [
                    {
                        key: 'hiya',
                        value: 'heyo'
                    },
                    {
                        key: 'alpha',
                        value: 'beta'
                    }
                ],
                raw: 'abhijitkane',
                urlencoded: [
                    {
                        key: 'haha',
                        value: 'somevalue'
                    }
                ],
                file: {
                    src: '/somewhere/in/the/file/system'
                }
            },
            reqData = new RequestBody(rawBody);
        expect(reqData.file).to.have.property('src', rawBody.file.src);
    });

    it('should convert file reference to object, if only the reference is given', function () {
        var rawBody = {
                mode: 'file',
                file: '/omg/where/is/this/file'
            },
            reqData = new RequestBody(rawBody);
        expect(reqData.file).to.have.property('src', rawBody.file);
    });

    describe('isEmpty', function () {
        it('should return true if no request body is set', function () {
            var body = new RequestBody();
            expect(body.isEmpty()).to.be(true);
        });

        it('should return true if mode is set to raw and no data is present', function () {
            var body = new RequestBody({ mode: 'raw', raw: '' });
            expect(body.isEmpty()).to.be(true);
        });

        it('should return true if mode is formdata and no data is present', function () {
            var body = new RequestBody({ mode: 'formdata', formdata: [], raw: 'something' });
            expect(body.isEmpty()).to.be(true);
        });

        it('should return true if mode is urlencoded and no data is present', function () {
            var body = new RequestBody({ mode: 'urlencoded', formdata: [] });
            expect(body.isEmpty()).to.be(true);
        });

        it('should return false if mode is raw and data is available', function () {
            var body = new RequestBody({ mode: 'raw', raw: 'yo' });
            expect(body.isEmpty()).to.be(false);
        });

        it('should return false if mode is file and file ref is available', function () {
            var body = new RequestBody({ mode: 'file', file: { src: '/somewhere/file.txt' } });
            expect(body.isEmpty()).to.be(false);
        });

        it('should return false if mode is file and file ref as well as content are available', function () {
            var body = new RequestBody({ mode: 'file', file: { src: '/somewhere/file.txt',
                    content: new Buffer('omgomg') } });
            expect(body.isEmpty()).to.be(false);
        });

        it('should return false if mode is file and file content is available', function () {
            var body = new RequestBody({ mode: 'file', file: { content: 'asjdhkashd' } });
            expect(body.isEmpty()).to.be(false);
        });

        it('should return false if mode is urlencoded and data is available', function () {
            var body = new RequestBody({
                mode: 'urlencoded',
                urlencoded: [{
                    key: 'haha',
                    value: 'somevalue'
                }]
            });
            expect(body.isEmpty()).to.be(false);
        });

        it('should return false if mode is formdata and data is available', function () {
            var body = new RequestBody({
                mode: 'urlencoded',
                urlencoded: [{
                    key: 'haha',
                    value: { some: 'random', javascript: 'object' }  // this functionality is used in the app
                }]
            });
            expect(body.isEmpty()).to.be(false);
        });
    });
});
