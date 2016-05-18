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
});
