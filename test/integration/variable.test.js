var expect = require('expect.js'),
    Variable = require('../../lib/index.js').Variable;

/* global describe, it */
describe('Variable', function () {
    it('constructor must be exported', function () {
        expect(Variable).to.be.a('function');
    });

    it('should create a new instance', function () {
        var v = new Variable();
        expect(v instanceof Variable).to.be.ok();
    });
});
