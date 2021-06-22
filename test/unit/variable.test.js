var expect = require('chai').expect,
    Variable = require('../../lib/index.js').Variable;

describe('Variable', function () {
    it('should initialise variable of type `any` and value `undefined`', function () {
        var v = new Variable();

        expect(v).to.deep.include({
            value: undefined,
            type: 'any'
        });
    });

    it('should initialize variable with correct system value', function () {
        var v = new Variable();

        expect(v.system).to.be.undefined;

        v = new Variable({
            system: true
        });
        expect(v.system).to.be.true;

        v = new Variable({
            system: false
        });
        expect(v.system).to.be.false;
    });

    it('should update the sytem property of a variable', function () {
        var v = new Variable();

        v.update({ system: true });
        expect(v.system).to.be.true;

        v = new Variable({
            system: true
        });
        v.update({ system: false });
        expect(v.system).to.be.false;
    });

    it('should update the disabled property of a variable', function () {
        var v = new Variable();

        v.update({ disabled: true });
        expect(v.disabled).to.be.true;

        v = new Variable({
            disabled: true
        });
        v.update({ disabled: false });
        expect(v.disabled).to.be.false;
    });

    it('should prepopulate value and type when passed to the constructor (string)', function () {
        var v = new Variable({
            value: 'Picard',
            type: 'string'
        });

        expect(v).to.deep.include({
            value: 'Picard',
            type: 'string'
        });
    });

    it('should prepopulate value and type when passed to the constructor (number)', function () {
        var v = new Variable({
            value: 42,
            type: 'number'
        });

        expect(v).to.deep.include({
            value: 42,
            type: 'number'
        });
    });

    it('should prepopulate value and type when passed to the constructor (boolean)', function () {
        var v = new Variable({
            value: true,
            type: 'boolean'
        });

        expect(v).to.deep.include({
            value: true,
            type: 'boolean'
        });
    });

    it('should prepopulate value and type when passed to the constructor (array)', function () {
        var vValue = [1, '2', true],
            v = new Variable({
                value: vValue,
                type: 'array'
            });

        expect(v).to.deep.include({
            value: JSON.stringify(vValue),
            type: 'array'
        });
    });

    it('should prepopulate value and type when passed to the constructor (object)', function () {
        var vValue = { foo: 'bar' },
            v = new Variable({
                value: vValue,
                type: 'object'
            });

        expect(v).to.deep.include({
            value: JSON.stringify(vValue),
            type: 'object'
        });
    });

    it('should typecast value during construction when type is provided (number)', function () {
        var v = new Variable({
            value: '108',
            type: 'number'
        });

        expect(v.value).to.equal(108);
    });

    it('should typecast value during construction when type is provided (string)', function () {
        var v = new Variable({
            value: true,
            type: 'string'
        });

        expect(v.value).to.equal('true');
    });

    it('should typecast value during construction when type is provided (boolean)', function () {
        var v = new Variable({
            value: 'foo',
            type: 'boolean'
        });

        expect(v.value).to.be.true;
    });

    it('should typecast value during construction when type is provided (array)', function () {
        var v = new Variable({
                value: null,
                type: 'array'
            }),
            v1 = new Variable({
                value: '[1,2,"3"]',
                type: 'array'
            });

        expect(v.value).to.equal('null');
        expect(v1.value).to.equal('[1,2,"3"]');
        expect(v1.get()).to.eql([1, 2, '3']);
    });

    it('should set value to null if provided as cyclic object value (array)', function () {
        var objArray = [],
            cyclicObject = {},
            testVariable;

        cyclicObject.prop = cyclicObject;
        objArray[0] = cyclicObject;
        testVariable = new Variable({
            value: objArray,
            type: 'array'
        });

        expect(testVariable.value).to.equal('null');
    });

    it('should typecast value during construction when type is provided (object)', function () {
        var v = new Variable({
                value: null,
                type: 'object'
            }),
            v1 = new Variable({
                value: '{"foo":"bar"}',
                type: 'object'
            });

        expect(v.value).to.equal('null');
        expect(v1.value).to.equal('{"foo":"bar"}');
        expect(v1.get()).to.eql({ foo: 'bar' });
    });

    it('should set value to null if provided invalid json string (object)', function () {
        var cyclicObject = {},
            testVariable;

        cyclicObject.prop = cyclicObject;
        testVariable = new Variable({
            value: cyclicObject,
            type: 'object'
        });

        expect(testVariable.value).to.equal('null');
    });

    it('should support any data type if type is set to `any`', function () {
        var v = new Variable(),
            jsonValue = { iam: 'json' };

        v.set('Picard');
        expect(v.get()).to.equal('Picard');

        v.set(3.142);
        expect(v.get()).to.equal(3.142);

        v.set(jsonValue);
        expect(v.get()).to.equal(jsonValue);
    });

    it('should type cast values to the specific type set', function () {
        var v = new Variable({
            type: 'string'
        });

        v.set('Picard');
        expect(v.get()).to.equal('Picard');

        v.set(3.142);
        expect(v.get()).to.equal('3.142');

        v.set({ foo: 'bar' });
        expect(v.get()).to.equal('[object Object]');
    });

    it('should recast values when type is changed', function () {
        var v = new Variable({
            type: 'string'
        });

        v.set(3.142);
        expect(v.get()).to.equal('3.142');

        v.valueType('number');
        expect(v.get()).to.equal(3.142);
    });

    it('should recast values when type is changed (array)', function () {
        var v = new Variable({
            type: 'string'
        });

        v.set([1, 2, { 3: true }]);
        expect(v.get()).to.equal('1,2,[object Object]');

        v.valueType('array');
        expect(v.get()).to.be.undefined;
    });

    it('should recast values when type is changed (object)', function () {
        var v = new Variable({
            type: 'string'
        });

        v.set({ foo: 'bar' });
        expect(v.get()).to.equal('[object Object]');

        v.valueType('object');
        expect(v.get()).to.be.undefined;
    });

    it('should strictly check for valid object type', function () {
        var v = new Variable({
            type: 'object'
        });

        v.set([{ foo: 'bar' }]);
        expect(v.get()).to.be.undefined;

        v.set(null);
        expect(v.get()).to.be.undefined;
    });

    it('should handle functions correctly', function () {
        var v = new Variable({ type: 'string', key: 'foo', value: function () { return 'bar'; } });

        expect(v.get()).to.equal('bar');
    });

    it('should not touch value functions when type is changed', function () {
        var v = new Variable({ type: 'string', key: 'foo', value: function () { return 'foo'; } });

        expect(v.get()).to.equal('foo');

        v.valueType('boolean');

        expect(v.value).to.be.a('function');
        expect(v.get()).to.be.true;
    });

    it('should typecast returns of values as functions correctly', function () {
        var v = new Variable({ type: 'number', key: 'foo', value: function () { return '3.14'; } }),
            v2 = new Variable({ type: 'boolean', key: 'foo', value: function () { return 'bar'; } });

        // number
        expect(v.get()).to.equal(3.14);

        // boolean
        expect(v2.get()).to.be.true;
    });

    describe('.set', function () {
        it('should handle functions correctly', function () {
            var variable = new Variable({ type: 'string' });

            expect(function () {
                variable.set.bind(variable)(function () {
                    return 'random';
                });
            }).to.not.throw();
        });
    });

    describe('.valueOf', function () {
        it('should handle set arguments correctly', function () {
            var variable = new Variable({ type: 'string', key: 'foo', value: 'bar' });

            variable.valueOf('newVal');
            expect(variable.value).to.equal('newVal');
        });
    });

    describe('.toString', function () {
        it('should convert nil values to empty string', function () {
            var variable;

            // no value
            variable = new Variable();
            expect(variable.toString()).to.equal('');

            // value undefined
            variable = new Variable({ key: 'foo', value: undefined });
            expect(variable.toString()).to.equal('');

            // value undefined
            variable = new Variable({ key: 'foo' });
            expect(variable.toString()).to.equal('');
        });

        it('should preserve empty string', function () {
            var variable;

            variable = new Variable({ key: 'foo', value: '' });
            expect(variable.toString()).to.equal('');
        });

        it('should stringify false as "false"', function () {
            var variable;

            variable = new Variable({ key: 'foo', value: false });
            expect(variable.toString()).to.equal('false');
        });

        it('should stringify 0 as "0"', function () {
            var variable;

            variable = new Variable({ key: 'foo', value: 0 });
            expect(variable.toString()).to.equal('0');
        });

        it('should stringify NaN as "NaN"', function () {
            var variable;

            variable = new Variable({ key: 'foo', value: NaN });
            expect(variable.toString()).to.equal('NaN');
        });

        it('should stringify null as "null"', function () {
            var variable;

            variable = new Variable({ key: 'foo', value: null });
            expect(variable.toString()).to.equal('null');
        });

        it('should handle the absence of .valueOf correctly', function () {
            var variable = new Variable({ key: 'foo', value: Object.create(null) });

            expect(variable.toString()).to.equal('');
        });
    });

    describe('.cast', function () {
        it('should use a default type of any if there is no existing type', function () {
            var variable = new Variable({ key: 'foo', value: 'bar' });

            delete variable.type;
            expect(variable.cast(123)).to.be.a('number');

            variable.set('random');
            expect(variable.get()).to.equal('random');
        });
    });

    describe('.valueType', function () {
        it('should use the current type if no type is provided', function () {
            var variable = new Variable({ type: 'string', key: 'foo', value: 'bar' });

            expect(variable.valueType()).to.equal('string');
        });

        it('should use the default type if no type is provided, and no type exists', function () {
            var variable = new Variable({ type: 'string', key: 'foo', value: 'bar' });

            delete variable.type;

            expect(variable.valueType()).to.equal('any');
        });

        it('should cast to the specified type when specified', function () {
            var variable = new Variable({ type: 'string', key: 'foo', value: '123' });

            expect(variable.valueType('number')).to.equal('number');
        });

        it('should handle invalid types correctly', function () {
            var variable = new Variable({ type: 'string', key: 'foo', value: '123' });

            delete variable.type;

            expect(variable.valueType('random')).to.equal('any');
        });
    });

    describe('sanity', function () {
        it('constructor should be exported', function () {
            expect(Variable).to.be.a('function');
        });

        it('should create a new instance', function () {
            var v = new Variable();

            expect(v).to.be.an.instanceof(Variable);
        });

        it('should not update if a non-object parameter is provided', function () {
            var v = new Variable({ key: 'foo', value: 'bar' });

            v.update();
            expect(v.key).to.equal('foo');
            expect(v.value).to.equal('bar');
        });
    });

    describe('isVariable', function () {
        it('should return true for a valid Variable instance', function () {
            expect(Variable.isVariable(new Variable({ type: 'string', key: 'foo', value: 'bar' }))).to.be.true;
        });

        it('should return false for a raw variable object', function () {
            expect(Variable.isVariable({ type: 'string', key: 'foo', value: 'bar' })).to.be.false;
        });

        it('should return false when called without arguments', function () {
            expect(Variable.isVariable()).to.be.false;
        });
    });
});
