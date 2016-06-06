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
                    ref: '/somewhere/in/the/file/system'
                }
            },
            reqData = new RequestBody(rawBody);
        expect(reqData.file).to.have.property('ref', rawBody.file.ref);
    });

    it('should convert file reference to object, if only the reference is given', function () {
        var rawBody = {
                mode: 'file',
                file: '/omg/where/is/this/file'
            },
            reqData = new RequestBody(rawBody);
        expect(reqData.file).to.have.property('ref', rawBody.file);
    });
});
