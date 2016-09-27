var expect = require('expect.js'),
    Property = require('../../').Property,
    Variable = require('../../').Variable,
    VariableList = require('../../').VariableList,
    VariableScope = require('../../').VariableScope;

/* global describe, it */
describe('VariableScope', function () {
    it('must be inherited from property and not list', function () {
        expect(new VariableScope() instanceof Property).be.ok();
    });

    it('must have values list as a variable-list', function () {
        var scope = new VariableScope();

        expect(scope).have.property('id');
        expect(scope.id).be.ok();

        expect(scope).have.property('values');
        expect(VariableList.isVariableList(scope.values)).be.ok();
        expect(scope.values.__parent).be(scope);
    });

    it('must accept an array of variable objects as definition', function () {
        var scope = new VariableScope([{
            key: 'var-1',
            value: 'var-1-value'
        }, {
            key: 'var-2',
            value: 'var-2-value'
        }]);

        expect(scope).have.property('id');
        expect(scope.id).be.ok();
        expect(scope).have.property('values');
        expect(scope.values.count()).be(2);

        // check whether the
        expect(scope.values.idx(0) instanceof Variable).be.ok();
        expect(scope.values.idx(0)).have.property('key', 'var-1');
        expect(scope.values.idx(0)).have.property('value', 'var-1-value');

        expect(scope.values.idx(1) instanceof Variable).be.ok();
        expect(scope.values.idx(1)).have.property('key', 'var-2');
        expect(scope.values.idx(1)).have.property('value', 'var-2-value');
    });

    it('must accept a `values` array of variable objects as definition', function () {
        var scope = new VariableScope({
            id: 'test-scope-id',
            values: [{
                key: 'var-1',
                value: 'var-1-value'
            }, {
                key: 'var-2',
                value: 'var-2-value'
            }]
        });

        expect(scope).have.property('id');
        expect(scope.id).be('test-scope-id');
        expect(scope).have.property('values');
        expect(scope.values.count()).be(2);

        expect(scope.values.idx(0) instanceof Variable).be.ok();
        expect(scope.values.idx(0)).have.property('key', 'var-1');
        expect(scope.values.idx(0)).have.property('value', 'var-1-value');

        expect(scope.values.idx(1) instanceof Variable).be.ok();
        expect(scope.values.idx(1)).have.property('key', 'var-2');
        expect(scope.values.idx(1)).have.property('value', 'var-2-value');
    });

    it('must carry the id and name from definition', function () {
        var scope = new VariableScope({
            id: 'test-scope-id',
            name: 'my-environment'
        });

        expect(scope).have.property('id');
        expect(scope.id).be('test-scope-id');

        expect(scope).have.property('name');
        expect(scope.name).be('my-environment');

        expect(scope).have.property('values');
        expect(VariableList.isVariableList(scope.values)).be.ok();
        expect(scope.values.count()).be(0);
    });

    describe('syncing variables from source', function () {
        it('must be able to sync values from an object (and not return crud when not specified)', function () {
            var scope = new VariableScope(),
                crud;

            expect(scope.values.count()).be(0);

            crud = scope.syncVariablesFrom({
                var1: 'value1',
                var2: 'value2'
            });

            expect(crud).not.be.ok();
            expect(scope.values.count()).be(2);

            expect(scope.values.idx(0) instanceof Variable).be.ok();
            expect(scope.values.idx(0)).have.property('key', 'var1');
            expect(scope.values.idx(0)).have.property('value', 'value1');

            expect(scope.values.idx(1) instanceof Variable).be.ok();
            expect(scope.values.idx(1)).have.property('key', 'var2');
            expect(scope.values.idx(1)).have.property('value', 'value2');
        });

        it('must be able to sync values from an object and return crud operation details', function () {
            var scope = new VariableScope({
                    values: [{
                        key: 'original1',
                        value: 'originalValue1'
                    }, {
                        key: 'original2',
                        value: 'originalValue2'
                    }]
                }),
                crud;

            expect(scope.values.count()).be(2);

            crud = scope.syncVariablesFrom({
                original1: 'original1Updated',
                synced1: 'syncedValue1'
            }, true);

            expect(scope.values.count()).be(2);
            expect(scope.values.idx(0) instanceof Variable).be.ok();
            expect(scope.values.idx(0)).have.property('key', 'original1');
            expect(scope.values.idx(0)).have.property('value', 'original1Updated');

            expect(scope.values.idx(1) instanceof Variable).be.ok();
            expect(scope.values.idx(1)).have.property('key', 'synced1');
            expect(scope.values.idx(1)).have.property('value', 'syncedValue1');

            expect(crud).eql({
                created: ['synced1'],
                deleted: ['original2'],
                updated: ['original1']
            });
        });

        it('must retain original type while syncing from object', function () {
            var scope = new VariableScope({
                    values: [{
                        key: 'oneNumber',
                        value: 3.142,
                        type: 'number' // note that type is specified here
                    }]
                }),

                crud;

            // we check that the original values are set
            expect(scope.values.count()).be(1);
            expect(scope.values.one('oneNumber').value).eql(3.142);
            expect(scope.values.one('oneNumber').type).eql('number');

            // we now sync object while setting track flag to true
            crud = scope.syncVariablesFrom({
                oneNumber: '17'
            }, true); // <- track is `true`

            expect(crud).eql({
                created: [],
                deleted: [],
                updated: ['oneNumber'] // only oneNumber updated and no other change
            });

            expect(scope.values.count()).be(1); // ensure it is still 1 variable
            expect(scope.values.one('oneNumber').value).eql(17); // number has changed
            expect(scope.values.one('oneNumber').type).eql('number'); // type is still number
        });

        it('must clone the variable-list instance if passed as a list in constructor', function () {
            var list,
                scope;

            list = new VariableList({}, [{
                key: 'var-1',
                value: 'var-1-value'
            }, {
                key: 'var-2',
                value: 'var-2-value'
            }]);

            scope = new VariableScope({
                values: list
            });

            expect(scope.values).not.be(list);
            expect(scope.values.one('var-1')).eql(list.one('var-1'));
        });
    });

    describe('syncing variables to target', function () {
        it('must be able to sync to an object', function () {
            var scope = new VariableScope({
                    values: [{
                        key: 'var-1',
                        value: 'var-1-value'
                    }, {
                        key: 'var-2',
                        value: 'var-2-value'
                    }]
                }),

                target = {};

            scope.syncVariablesTo(target);

            expect(target).have.property('var-1', 'var-1-value');
            expect(target).have.property('var-2', 'var-2-value');
        });

        it('must retain variable type while syncing to object', function () {
            var scope = new VariableScope({
                    values: [{
                        key: 'var-1',
                        value: 'var-1-value',
                        type: 'string'
                    }, {
                        key: 'var-2',
                        value: '2',
                        type: 'number'
                    }]
                }),

                target = {};

            scope.syncVariablesTo(target);

            expect(target).have.property('var-1', 'var-1-value');
            expect(target).have.property('var-2', 2);
        });

        it('must remove extra properties from target object', function () {
            var scope = new VariableScope({
                    values: [{
                        key: 'var-1',
                        value: 'var-1-value',
                        type: 'string'
                    }, {
                        key: 'var-2',
                        value: '2',
                        type: 'number'
                    }]
                }),

                target = {
                    extra: 'extra-variable'
                };

            scope.syncVariablesTo(target);

            expect(target).have.property('var-1', 'var-1-value');
            expect(target).have.property('var-2', 2);
            expect(target).not.have.property('extra');
        });
    });
});
