var expect = require('expect.js'),
    VariableList = require('../../').VariableList,
    rawEnvironments = require('../fixtures/index').environments;

/* global describe, it */
describe('PostmanVariable', function () {
    it('constructor must be exported', function () {
        expect(VariableList).to.be.a('function');
    });

    it('should create a new instance', function () {
        var parent = {},
            v = new VariableList(parent, [], rawEnvironments);
        expect(v instanceof VariableList).to.be.ok();
    });

    it('should store environments as an array', function () {
        var parent = {},
            v = new VariableList(parent, [], rawEnvironments);
        expect(v.environments).to.be.an('array');
    });

    it('should store variables as an object as well', function () {
        var parent = {},
            v = new VariableList(parent, [], rawEnvironments);
        expect(v.reference).to.be.an('object');
    });
});
