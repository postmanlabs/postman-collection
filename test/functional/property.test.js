var expect = require('expect.js'),
    Property = require('../../lib/index.js').Property;

/* global describe, it */
describe('Property', function () {
    describe('variable resolution', function () {
        it('must resolve variables accurately', function () {
            var unresolvedRequest = {
                    method: 'POST',
                    url: '{{host}}:{{port}}/{{path}}',
                    header: [
                        {
                            key: '{{headerName}}',
                            value: 'application/json'
                        }
                    ],
                    body: {
                        mode: 'urlencoded',
                        urlencoded: [
                            {
                                key: '{{greeting}}',
                                value: '{{greeting_value}}'
                            }
                        ]
                    }
                },
                expectedResolution = {
                    method: 'POST',
                    url: 'echo.getpostman.com:80/post',
                    header: [{ key: 'Content-Type', value: 'application/json' }],
                    body: {
                        mode: 'urlencoded',
                        urlencoded: [{ key: 'yo', value: 'omg' }]
                    }
                },
                resolved = Property.replaceSubstitutionsIn(unresolvedRequest, [
                    {
                        greeting: 'yo',
                        greeting_value: 'omg'
                    },
                    {
                        host: 'echo.getpostman.com',
                        port: '80',
                        path: 'post'
                    },
                    {
                        path: 'get',
                        headerName: 'Content-Type'
                    }
                ]);
            expect(resolved).to.eql(expectedResolution);
        });
    });
});
