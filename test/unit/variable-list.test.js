var expect = require('expect.js'),
    VariableList = require('../../').VariableList,
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
});
