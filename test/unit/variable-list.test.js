var expect = require('expect.js'),
    sdk = require('../../'),
    VariableList = sdk.VariableList,
    PropertyList = sdk.PropertyList,
    rawEnvironments = require('../fixtures/index').environments;

/* global describe, it */
describe('VariableList', function () {
    var parent = {},
        list = new VariableList(parent, [], rawEnvironments);

    it('should resolve a single reference properly', function () {
        expect(list.one('root').valueOf()).to.eql('one');
    });

    it('should override variables in the lower layers', function () {
        expect(list.one('somevar').valueOf()).to.eql('3rd layer override');
    });

    it('must support function variables', function () {
        var unresolved = {
                xyz: '{{$guid}}\n{{$timestamp}}\n{{somevar}}'
            },
            resolved = list.substitute(unresolved),
            values = resolved.xyz.split('\n'),
            expectations = [
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, // GUID
                /^\d+$/, // A number, without decimals
                /3rd layer override/
            ];
        expectations.forEach(function (regex, index) {
            expect(regex.test(values[index])).to.be(true);
        });
    });

    it('should recursively resolve regular variables', function () {
        var unresolved = {
                xyz: '{{alpha}}'
            },
            mylist = new VariableList({}, [], [
                {
                    alpha: '{{beta}}-bar'
                },
                {
                    beta: '{{name}}'
                },
                {
                    name: 'foo'
                }
            ]),
            resolved = mylist.substitute(unresolved);
        expect(resolved.xyz).to.eql('foo-bar');
    });

    it('should correctly resolve variables with a forward slash in their name', function () {
        var unresolved = {
                xyz: '{{alp/ha}}'
            },
            mylist = new VariableList({}, [], [
                {
                    'alp/ha': 'beta'
                }
            ]),
            resolved = mylist.substitute(unresolved);
        expect(resolved.xyz).to.eql('beta');
    });

    it('should correctly resolve variables with a backslash in their name', function () {
        var unresolved = {
                // eslint-disable-next-line no-useless-escape
                xyz: '{{al\pha}}'
            },
            mylist = new VariableList({}, [], [
                {
                    // eslint-disable-next-line no-useless-escape
                    'al\pha': 'beta'
                }
            ]),
            resolved = mylist.substitute(unresolved);
        expect(resolved.xyz).to.eql('beta');
    });

    it('should correctly handle cyclic resolution loops', function () {
        var unresolved = {
                xyz: '{{alpha}}'
            },
            cyclicList = new VariableList({}, [], [
                {
                    alpha: '{{beta}}',
                    beta: '{{gamma}}',
                    gamma: '{{delta}}',
                    delta: '{{beta}}'
                }
            ]),
            resolved = cyclicList.substitute(unresolved);
        expect(resolved.xyz).to.eql('{{beta}}');
    });

    it('should correctly handle poly chained variable resolution(s)', function () {
        var unresolved = {
                xyz: '{{alpha}}'
            },
            polyChainList = new VariableList({}, [], [
                {
                    alpha: '{{beta-{{gamma}}}}',
                    gamma: 'delta',
                    'beta-delta': 'epsilon'
                }
            ]),
            resolved = polyChainList.substitute(unresolved);
        expect(resolved.xyz).to.eql('epsilon');
    });

    it('should correctly handle recursive poly chained variable resolution(s)', function () {
        var unresolved = {
                xyz: '{{alpha}}'
            },
            polyChainList = new VariableList({}, [], [
                {
                    alpha: '{{beta-{{gamma}}}}',
                    gamma: 'delta',
                    'beta-delta': '{{gamma}}'
                }
            ]),
            resolved = polyChainList.substitute(unresolved);
        expect(resolved.xyz).to.eql('delta');
    });

    it('should correctly handle recursive poly chained variable resolution(s)', function () {
        var unresolved = {
                xyz: '{{a}}'
            },
            polyChainList = new VariableList({}, [], [
                {
                    a: '{{b{{c{{d}}}}}}',
                    d: 'e',
                    ce: 'f',
                    b: 'g',
                    bf: 'z'
                }
            ]),
            resolved = polyChainList.substitute(unresolved);
        expect(resolved.xyz).to.eql('z');
    });

    it.skip('should correctly handle variables with single braces in their name', function () {
        var unresolved = {
                xyz: '{{alpha}}'
            },
            polyChainList = new VariableList({}, [], [
                {
                    alpha: '{{be{t}a}}',
                    'be{t}a': 'gamma',
                    gamma: 'delta'
                }
            ]),
            resolved = polyChainList.substitute(unresolved);
        expect(resolved.xyz).to.eql('delta');
    });

    describe('static helpers', function () {
        var variableList = new VariableList({}, [], [
            {
                alpha: 'foo',
                beta: 'bar',
                gamma: 'len',
                delta: 'may'
            }
        ]);

        it('should work correctly for isVariableList', function () {
            expect(VariableList.isVariableList(variableList)).to.be.ok();
            expect(VariableList.isVariableList({})).to.not.be.ok();
        });

        it('should work correctly for listify', function () {
            var list = VariableList.listify({ foo: 'alpha', bar: 'beta' });

            expect(PropertyList.isPropertyList(list)).to.be.ok();
            expect(list.map()).to.eql([{ type: 'any', value: 'alpha', key: 'foo' },
                { type: 'any', value: 'beta', key: 'bar' }]);
        });

        it('should work correctly for proxy', function () {
            var result = VariableList.proxy({ a: 'zen' }, { foo: 'bar' });

            expect(result.a).to.be('zen');
            expect(result.foo).to.be('bar');
        });

        it('should work correctly for objectify', function () {
            var result = { alpha: { type: 'any', value: 1, key: 'alpha' }, bar: { type: 'any', value: 1, key: 'bar' } };

            expect(VariableList.objectify([{ key: 'alpha', value: 1 }, { key: 'bar', value: 1 }])).to.eql(result);
            expect(VariableList.objectify({ alpha: { key: 'alpha', value: 1 }, bar: { key: 'bar', value: 1 } })).to
                .eql(result);
        });
    });
});
