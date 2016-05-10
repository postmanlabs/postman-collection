var expect = require('expect.js'),
    Property = require('../../lib/index.js').Property;

/* global describe, it */
describe('Property', function () {
    describe('variable resolution', function () {
        it('must resolve variables accurately', function () {
            var unresolvedRequest = {
                    method: 'POST',
                    url: '{{host}}:{{port}}/{{path}}',
                    header: [{ key: '{{headerName}}', value: 'application/json' }],
                    body: {
                        mode: 'urlencoded',
                        urlencoded: [{ key: '{{greeting}}', value: '{{greeting_value}}' }]
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

        it('must support function variables', function () {
            var unresolved = {
                    xyz: '{{$guid}}\n{{$timestamp}}\n{{someVar}}'
                },
                variables = [{ someVar: 'yo' }],
                resolved = Property.replaceSubstitutionsIn(unresolved, variables),
                values = resolved.xyz.split('\n'),
                expectations = [
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, // GUID
                    /^\d+$/, // A number, without decimals
                    /yo/
                ];
            expectations.forEach(function (regex, index) {
                expect(regex.test(values[index])).to.be(true);
            });
        });
    });
});
