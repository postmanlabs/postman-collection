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
        expect(list.one('somevar').valueOf()).to.eql('3nd layer override');
    });
});
