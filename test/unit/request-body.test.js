var expect = require('expect.js'),
    rawRequestBody = require('../fixtures').requestData,
    RequestBody = require('../../lib/index.js').RequestBody,
    QueryParam = require('../../lib/index.js').QueryParam,
    PropertyList = require('../../lib/index.js').PropertyList;

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

    it('should allow converting form parameters to an object', function () {
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
                ]
            },
            reqData = new RequestBody(rawBody);
        expect(reqData.formdata.toObject()).to.eql({
            hiya: 'heyo',
            alpha: 'beta'
        });
    });

    it('should work with string bodies correctly', function () {
        var body = new RequestBody('foo');
        expect(body).to.have.property('mode', 'raw');
        expect(body).to.have.property('raw', 'foo');
    });

    it('should reject invalid body types', function () {
        expect(new RequestBody([])).to.be.empty();
        expect(new RequestBody(2)).to.be.empty();
    });

    describe('.update', function () {
        it('should use the raw request body by if an invalid mode is specified', function () {
            var reqData = new RequestBody({
                mode: 'random',
                raw: 'This is supposed to be a raw body. Do not cook it.'
            });
            expect(reqData).to.be.ok();
            expect(reqData).to.have.property('mode', 'raw');
            expect(reqData).to.have.property('raw', 'This is supposed to be a raw body. Do not cook it.');
        });

        it('should support stringified urlencoded bodies', function () {
            var reqData = new RequestBody({
                mode: 'urlencoded',
                urlencoded: 'alpha=foo&beta=bar'
            });

            expect(reqData.urlencoded.reference).to.eql({
                alpha: {
                    key: 'alpha',
                    value: 'foo'
                },
                beta: {
                    key: 'beta',
                    value: 'bar'
                }
            });
        });

        it('should handle missing formdata bodies correctly', function () {
            var reqData = new RequestBody({ mode: 'formdata' });

            expect(reqData.formdata.reference).to.be.empty();
        });

        it('should allow updating to a valid body', function () {
            var body = new RequestBody();

            body.update('foo');
            expect(body).to.have.property('mode', 'raw');
            expect(body).to.have.property('raw', 'foo');

            body.update({ mode: 'formdata', formdata: [{ key: 'foo', value: 'bar' }] });
            expect(body).to.have.property('mode', 'formdata');
            expect(body.formdata.toJSON()).to.eql([{ key: 'foo', value: 'bar' }]);
        });

        it('should prohibit updates to invalid bodies', function () {
            var body = new RequestBody('foo');

            expect(body).to.have.property('mode', 'raw');
            expect(body).to.have.property('raw', 'foo');

            body.update([]);
            expect(body).to.have.property('mode', 'raw');
            expect(body).to.have.property('raw', 'foo');

            body.update(2);
            expect(body).to.have.property('mode', 'raw');
            expect(body).to.have.property('raw', 'foo');
        });

        it('should handle forceInclude property (true -> false) correctly', function () {
            var body = new RequestBody({ mode: 'raw', raw: 'foo', forceInclude: true });

            expect(body).to.have.property('forceInclude', true);

            body.update({ mode: 'raw', raw: 'foo', forceInclude: false });
            expect(body).to.have.property('forceInclude', false);
        });

        it('should handle forceInclude property (false -> true) correctly', function () {
            var body = new RequestBody({ mode: 'raw', raw: 'foo', forceInclude: false });
            expect(body).to.have.property('forceInclude', false);

            body.update({ mode: 'raw', raw: 'foo', forceInclude: true });
            expect(body).to.have.property('forceInclude', true);
        });

        it('should handle disabled property (true -> false) correctly', function () {
            var body = new RequestBody({ mode: 'raw', raw: 'foo', disabled: true });

            expect(body).to.have.property('disabled', true);

            body.update({ mode: 'raw', raw: 'foo', disabled: false });
            expect(body).to.have.property('disabled', false);
        });

        it('should handle disabled property (false -> true) correctly', function () {
            var body = new RequestBody({ mode: 'raw', raw: 'foo', disabled: false });
            expect(body).to.have.property('disabled', false);

            body.update({ mode: 'raw', raw: 'foo', disabled: true });
            expect(body).to.have.property('disabled', true);
        });
    });

    describe('.toString', function () {
        it('should return an empty string for formdata or files', function () {
            var rBody = new RequestBody({ mode: 'formdata' });
            expect(rBody.toString()).to.be('');

            rBody.update({ mode: 'file' });
            expect(rBody.toString()).to.be('');
        });

        it('should correctly stringify urlencoded bodies', function () {
            var rBody = new RequestBody({
                mode: 'urlencoded',
                urlencoded: [{ key: 'foo', value: 'bar' }]
            });

            expect(rBody.toString()).to.be('foo=bar');
        });

        it('should handle malformed urlencoded request bodies gracefully', function () {
            var rBody = new RequestBody({ mode: 'urlencoded' });

            rBody.urlencoded = ['a', 'b']; // This ensures that there is an inbuilt fallback to .unparse
            expect(rBody.toString()).to.be('a,b');

            rBody.urlencoded = Object.create(null); // This ensures that there is an inbuilt fallback to .unparse
            expect(rBody.toString()).to.be('');
        });

        it('should handle raw bodies correctly', function () {
            var rBody = new RequestBody({ mode: 'raw', raw: 'Arbitrary raw request body' });

            expect(rBody.toString()).to.be('Arbitrary raw request body');
            rBody.update({ mode: 'raw' }); // clear the request body
            expect(rBody.toString()).to.be('');
        });

        it('should return an empty string for arbitrary request body modes', function () {
            var rBody = new RequestBody();

            rBody.mode = 'random';
            expect(rBody.toString()).to.be('');
        });
    });

    describe('sanity', function () {
        it('should be parsed properly', function () {
            var reqData = new RequestBody(rawRequestBody);
            expect(reqData).to.be.ok();
            expect(reqData).to.have.property('mode', rawRequestBody.mode);
            expect(reqData).to.have.property('forceInclude', undefined);
            expect(reqData).to.have.property('disabled', undefined);

            // Raw Request body
            expect(reqData).to.have.property('raw', rawRequestBody.raw);

            // Form data
            expect(reqData.formdata).to.be.a(PropertyList);
            expect(reqData.formdata.count()).to.eql(rawRequestBody.formdata.length);

            // URL Encoded parameters
            expect(reqData.urlencoded).to.be.a(PropertyList);
            expect(reqData.urlencoded.count()).to.eql(rawRequestBody.urlencoded.length);
        });
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

        it('should return false if mode is file and file src is available', function () {
            var body = new RequestBody({ mode: 'file', file: { src: '/somewhere/file.txt' } });
            expect(body.isEmpty()).to.be(false);
        });

        it('should return true if mode is file and file src is not available', function () {
            var body = new RequestBody({ mode: 'file' });
            expect(body.isEmpty()).to.be(true);
        });

        it('should return true if mode is file and nothing is available', function () {
            var body = new RequestBody({ mode: 'file', file: {} });
            expect(body.isEmpty()).to.be(true);
        });

        it('should return false if mode is file and file src as well as content are available', function () {
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
                    value: { some: 'random', javascript: 'object' } // this functionality is used in the app
                }]
            });
            expect(body.isEmpty()).to.be(false);
        });
    });
});
