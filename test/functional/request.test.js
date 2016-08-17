var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Request = require('../../lib/index.js').Request;

/* global describe, it */
describe('Request', function () {
    var rawRequest = fixtures.collectionV2.item[1].request,
        request = new Request(rawRequest);

    describe('json representation', function () {
        it('must match what the request was initialized with', function () {
            var jsonified = request.toJSON();

            expect(jsonified.method).to.eql(rawRequest.method);
            expect(jsonified.url).to.eql(rawRequest.url);
            expect(jsonified.headers).to.eql(rawRequest.header);
            expect(jsonified.body).to.eql(rawRequest.body);
            expect(jsonified.description).to.eql(rawRequest.description);
        });
    });

    describe('addQueryParams', function () {
        it('should add query parameters to the request', function () {
            var testReq = request.clone(),
                addedParams = fixtures.queryParams;

            testReq.addQueryParams(addedParams);
            expect(testReq.url.query.count()).to.eql(2);
            testReq.url.query.each(function (param, index) {
                var expectedParam = addedParams[index];
                expect(param.key).to.eql(expectedParam.key);
                expect(param.value).to.eql(expectedParam.value);
            });
        });
    });

    describe('getHeaders', function () {
        it('should get only enabled headers', function () {
            var rawRequest = {
                    url: 'echo.getpostman.com',
                    method: 'GET',
                    header: [
                        {
                            key: 'some',
                            value: 'header'
                        },
                        {
                            key: 'other',
                            value: 'otherheader',
                            disabled: true
                        }
                    ]
                },
                request = new Request(rawRequest);
            expect(request.getHeaders({ enabled: true })).to.eql({
                some: 'header'
            });
        });
    });

    describe('removeQueryParams', function () {
        it('should remove query parameters from the request', function () {
            var testReq = request.clone(),
                firstParam = fixtures.queryParams[0],
                secondParam = fixtures.queryParams[1];

            // Add two params
            testReq.addQueryParams([firstParam, secondParam]);

            // Remove one
            testReq.removeQueryParams(firstParam.key);

            // Ensure only one is left
            expect(testReq.url.query.count()).to.eql(1);

            // Ensure that the remaining param is the one that was not removed.
            testReq.url.query.each(function (param) {
                // Ideally, only one param should be left, so this runs only once.
                expect(param.key).to.eql(secondParam.key);
                expect(param.value).to.eql(secondParam.value);
            });
        });
    });
});
