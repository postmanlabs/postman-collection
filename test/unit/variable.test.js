var expect = require('expect.js'),
    Variable = require('../../lib/index.js').Variable;

/* global describe, it */
describe('Variable', function () {
    it('should initialise variable of type `any` and value `undefined`', function () {
        var v = new Variable();

        expect(v.value).to.be(undefined);
        expect(v.type).to.be('any');
    });

    it('should prepopulate value and type when passed to the constructor', function () {
        var v = new Variable({
            value: 'Picard',
            type: 'string'
        });

        expect(v.value).to.be('Picard');
        expect(v.type).to.be('string');
    });

    it('should typecast value during construction when type is provided', function () {
        var v = new Variable({
            value: '108',
            type: 'number'
        });

        expect(v.value).to.be(108);
    });

    it('should support any data type if type is set to `any`', function () {
        var v = new Variable();

        v.set('Picard');
        expect(v.get()).to.be('Picard');

        v.set(3.142);
        expect(v.get()).to.be(3.142);
    });

    it('should type cast values to the specific type set', function () {
        var v = new Variable({
            type: 'string'
        });

        v.set('Picard');
        expect(v.get()).to.be('Picard');

        v.set(3.142);
        expect(v.get()).to.be('3.142');
    });

    it('should recast values when type is changed', function () {
        var v = new Variable({
            type: 'string'
        });

        v.set(3.142);
        expect(v.get()).to.be('3.142');

        v.valueType('number');
        expect(v.get()).to.be(3.142);
    });

    describe('sanity', function () {
        it('constructor must be exported', function () {
            expect(Variable).to.be.a('function');
        });

        it('should create a new instance', function () {
            var v = new Variable();
            expect(v instanceof Variable).to.be.ok();
        });
    });

    describe('isVariable', function () {
        it('should return true for a valid Variable instance', function () {
            expect(Variable.isVariable(new Variable({ type: 'string', key: 'foo', value: 'bar' }))).to.be(true);
        });

        it('should return false for a raw variable object', function () {
            expect(Variable.isVariable({ type: 'string', key: 'foo', value: 'bar' })).to.be(false);
        });

        it('should return false when called without arguments', function () {
            expect(Variable.isVariable()).to.be(false);
        });
    });
});
