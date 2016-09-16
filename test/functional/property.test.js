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

        it('must resolve variables accurately', function () {
            var unresolvedRequest = {
                    one: '{{alpha}}-{{beta}}-{{gamma}}',
                    two: { a: '{{alpha}}', b: '{{beta}}', c: '{{gamma}}' },
                    three: ['{{alpha}}', '{{beta}}', '{{gamma}}'],
                    four: [
                        { a: '{{alpha}}', b: '{{beta}}', c: '{{gamma}}' },
                        { d: '{{delta}}', e: '{{epsilon}}', f: '{{theta}}' },
                        { g: '{{iota}}', h: '{{pi}}', i: '{{zeta}}' }
                    ],
                    five: {
                        one: ['{{alpha}}', '{{beta}}', '{{gamma}}'],
                        two: ['{{delta}}', '{{epsilon}}', '{{theta}}'],
                        three: ['{{iota}}', '{{pi}}', '{{zeta}}']
                    },
                    six: [
                        '{{alpha}}',
                        ['{{alpha}}', '{{beta}}', '{{gamma}}'],
                        { a: '{{delta}}', b: '{{epsilon}}', c: '{{theta}}' }
                    ],
                    seven: { a: '{{alpha}}', b: ['{{alpha}}', '{{beta}}', '{{gamma}}'], c: { a: '{{delta}}',
                        b: '{{epsilon}}', c: '{{theta}}' }}
                },
                expectedResolution = {
                    one: 'arbitrary-complex-large',
                    two: { a: 'arbitrary', b: 'complex', c: 'large' },
                    three: ['arbitrary', 'complex', 'large'],
                    four: [
                        { a: 'arbitrary', b: 'complex', c: 'large' },
                        { d: 'nested', e: 'JSON', f: 'property' },
                        { g: 'variable', h: 'resolution', i: 'test' }
                    ],
                    five: {
                        one: ['arbitrary', 'complex', 'large'],
                        two: ['nested', 'JSON', 'property'],
                        three: ['variable', 'resolution', 'test']
                    },
                    six: [
                        'arbitrary',
                        ['arbitrary', 'complex', 'large'],
                        { a: 'nested', b: 'JSON', c: 'property' }
                    ],
                    seven: { a: 'arbitrary', b: ['arbitrary', 'complex', 'large'], c: { a: 'nested',
                        b: 'JSON', c: 'property' }}
                },
                resolved = Property.replaceSubstitutionsIn(unresolvedRequest, [
                    {
                        alpha: 'arbitrary',
                        beta: 'complex',
                        gamma: 'large'
                    },
                    {
                        delta: 'nested',
                        epsilon: 'JSON',
                        theta: 'property'
                    },
                    {
                        iota: 'variable',
                        pi: 'resolution',
                        zeta: 'test'
                    }
                ]);
            expect(resolved).to.eql(expectedResolution);
        });
    });
});
