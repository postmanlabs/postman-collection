var expect = require('expect.js'),
    Variable = require('../../lib/index.js').Variable;

/* global describe, it */
describe.only('Variable', function () {
    it('should initialise variable of type `any` and value `undefined`', function () {
        var v = new Variable();

        expect(v.value).to.be(undefined);
        expect(v.type).to.be('any');
    });

    it('should initialize variable with correct system value', function () {
        var v = new Variable();
        expect(v.system).to.be(undefined);

        v = new Variable({
            system: true
        });
        expect(v.system).to.be(true);

        v = new Variable({
            system: false
        });
        expect(v.system).to.be(false);
    });

    it('should update the sytem property of a variable', function () {
        var v = new Variable();
        v.update({ system: true });
        expect(v.system).to.be(true);

        v = new Variable({
            system: true
        });
        v.update({ system: false });
        expect(v.system).to.be(false);
    });

    it('should prepopulate value and type when passed to the constructor (string)', function () {
        var v = new Variable({
            value: 'Picard',
            type: 'string'
        });

        expect(v.value).to.be('Picard');
        expect(v.type).to.be('string');
    });

    it('should prepopulate value and type when passed to the constructor (number)', function () {
        var v = new Variable({
            value: 42,
            type: 'number'
        });

        expect(v.value).to.be(42);
        expect(v.type).to.be('number');
    });

    it('should prepopulate value and type when passed to the constructor (boolean)', function () {
        var v = new Variable({
            value: true,
            type: 'boolean'
        });

        expect(v.value).to.be(true);
        expect(v.type).to.be('boolean');
    });

    it('should prepopulate value and type when passed to the constructor (json)', function () {
        var vValue = { foo: 'bar' },
            v = new Variable({
                value: vValue,
                type: 'json'
            });

        expect(v.value).to.be(JSON.stringify(vValue));
        expect(v.type).to.be('json');
    });

    it('should typecast value during construction when type is provided (number)', function () {
        var v = new Variable({
            value: '108',
            type: 'number'
        });

        expect(v.value).to.be(108);
    });

    it('should typecast value during construction when type is provided (string)', function () {
        var v = new Variable({
            value: true,
            type: 'string'
        });

        expect(v.value).to.be('true');
    });

    it('should typecast value during construction when type is provided (boolean)', function () {
        var v = new Variable({
            value: 'foo',
            type: 'boolean'
        });

        expect(v.value).to.be(true);
    });

    it('should typecast value during construction when type is provided (json)', function () {
        var v = new Variable({
                value: null,
                type: 'json'
            }),
            v1 = new Variable({
                value: '{"foo":"bar"}',
                type: 'json'
            });

        expect(v.value).to.be('null');
        expect(v1.value).to.be('{"foo":"bar"}');
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

    it('should handle functions correctly', function () {
        var v = new Variable({ type: 'string', key: 'foo', value: function () { return 'bar'; } });

        expect(v.get()).to.be('bar');
    });

    describe('.set', function () {
        it('should handle functions correctly', function () {
            var variable = new Variable({ type: 'string' });

            expect(variable.set.bind(variable)).withArgs(function () {
                return 'random';
            }).to.not.throwError();
        });
    });

    describe('.valueOf', function () {
        it('should handle set arguments correctly', function () {
            var variable = new Variable({ type: 'string', key: 'foo', value: 'bar' });

            variable.valueOf('newVal');
            expect(variable.value).to.be('newVal');
        });
    });

    describe('.toString', function () {
        it('should handle the absence of .valueOf correctly', function () {
            var variable = new Variable({ key: 'foo', value: Object.create(null) });

            expect(variable.toString()).to.be('');
        });
    });

    describe('.cast', function () {
        it('should use a default type of any if there is no existing type', function () {
            var variable = new Variable({ key: 'foo', value: 'bar' });

            delete variable.type;
            expect(variable.cast(123)).to.be.a('number');
        });
    });

    describe('.valueType', function () {
        it('should use the current type if no type is provided', function () {
            var variable = new Variable({ type: 'string', key: 'foo', value: 'bar' });

            expect(variable.valueType()).to.be('string');
        });

        it('should use the default type if no type is provided, and no type exists', function () {
            var variable = new Variable({ type: 'string', key: 'foo', value: 'bar' });
            delete variable.type;

            expect(variable.valueType()).to.be('any');
        });

        it('should cast to the specified type when specified', function () {
            var variable = new Variable({ type: 'string', key: 'foo', value: '123' });

            expect(variable.valueType('number')).to.be('number');
        });

        it('should handle invalid types correctly', function () {
            var variable = new Variable({ type: 'string', key: 'foo', value: '123' });
            delete variable.type;

            expect(variable.valueType('random')).to.be('any');
        });
    });

    describe('sanity', function () {
        it('constructor must be exported', function () {
            expect(Variable).to.be.a('function');
        });

        it('should create a new instance', function () {
            var v = new Variable();
            expect(v instanceof Variable).to.be.ok();
        });

        it('should not update if a non-object parameter is provided', function () {
            var v = new Variable({ key: 'foo', value: 'bar' });

            v.update();
            expect(v.key).to.be('foo');
            expect(v.value).to.be('bar');
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
