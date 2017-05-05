var expect = require('expect.js'),
    VariableList = require('../../').VariableList;

/* global describe, it */
describe('PostmanVariable', function () {
    it('constructor must be exported', function () {
        expect(VariableList).to.be.a('function');
    });

    it('should create a new instance', function () {
        var parent = {},
            v = new VariableList(parent, [{
                key: 'somevar',
                value: 'asdasd'
            }, {
                key: 'root',
                value: 'one'
            }, {
                key: 'third',
                value: 'in 3rd layer'
            }]);
        expect(v instanceof VariableList).to.be.ok();
    });

    it('should store variables as an object as well', function () {
        var parent = {},
            v = new VariableList(parent, [{
                key: 'somevar',
                value: 'asdasd'
            }, {
                key: 'root',
                value: 'one'
            }, {
                key: 'third',
                value: 'in 3rd layer'
            }]);
        expect(v.reference).to.be.an('object');
    });
});
