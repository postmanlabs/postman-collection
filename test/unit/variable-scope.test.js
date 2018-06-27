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
        expect(scope).to.not.have.property('_layers');
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
        expect(scope).to.not.have.property('_layers');
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
        expect(scope).to.not.have.property('_layers');
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
        expect(scope).to.not.have.property('_layers');
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

    describe('PM API helpers', function () {
        describe('get', function () {
            var scope = new VariableScope({
                values: [{
                    key: 'var-1',
                    value: 'var-1-value'
                }, {
                    key: 'var-2',
                    value: 'var-2-value'
                }]
            });

            it('must correctly return the specified value', function () {
                expect(scope.get('var-1')).to.be('var-1-value');
            });

            it('must return undefined for ', function () {
                expect(scope.get('random')).to.be(undefined);
            });

            describe('multi layer search', function () {
                var newScope = new VariableScope();

                newScope.addLayer(new VariableList({}, [
                    { key: 'alpha', value: 'foo' }
                ]));

                it('should work correctly', function () {
                    expect(newScope.get('alpha')).to.be('foo');
                });

                it('should bail out if no matches are found', function () {
                    expect(newScope.get('random')).to.be(undefined);
                });
            });
        });

        describe('set', function () {
            var scope = new VariableScope({
                values: [{
                    key: 'var-1',
                    value: 'var-1-value'
                }, {
                    key: 'var-2',
                    value: 'var-2-value'
                }]
            });

            it('must correctly update an existing value', function () {
                scope.set('var-1', 'new-var-1-value');
                expect(scope.get('var-1')).to.be('new-var-1-value');
            });

            it('must create a new variable if non-existent', function () {
                scope.set('var-3', 'var-3-value');

                expect(scope.values.count()).to.be(3);
                expect(scope.get('var-3')).to.be('var-3-value');
            });

            it('must correctly update type of existing value', function () {
                scope.set('var-1', 3.142, 'number');
                expect(scope.get('var-1')).to.be(3.142);
            });

            it('must correctly create a new typed value', function () {
                scope.set('var-4', 3.142, 'boolean');
                expect(scope.get('var-4')).to.be(true);
            });
        });

        describe('unset', function () {
            it('must correctly remove an existing variable', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'var-1',
                        value: 'var-1-value'
                    }, {
                        key: 'var-2',
                        value: 'var-2-value'
                    }]
                });

                scope.unset('var-1');

                expect(scope.values.count()).to.be(1);
                expect(scope.get('var-1')).to.be(undefined);
            });

            it('must leave the scope untouched for an invalid key', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'var-1',
                        value: 'var-1-value'
                    }, {
                        key: 'var-2',
                        value: 'var-2-value'
                    }]
                });

                scope.unset('random');
                expect(scope.values.count()).to.be(2);
            });
        });

        describe('clear', function () {
            var scope = new VariableScope({
                values: [{
                    key: 'var-1',
                    value: 'var-1-value'
                }, {
                    key: 'var-2',
                    value: 'var-2-value'
                }]
            });

            it('must correctly remove all variables', function () {
                scope.clear();
                expect(scope.values.count()).to.be(0);
            });
        });
    });

    describe('isVariableScope', function () {
        var rawVariableScope = {
            values: [{
                key: 'var-1',
                value: 'var-1-value'
            }, {
                key: 'var-2',
                value: 'var-2-value'
            }]
        };

        it('should return true for a VariableScope instance', function () {
            expect(VariableScope.isVariableScope(new VariableScope(rawVariableScope))).to.be(true);
        });

        it('should return false for a raw VariableScope object', function () {
            expect(VariableScope.isVariableScope(rawVariableScope)).to.be(false);
        });

        it('should return false when called without arguments', function () {
            expect(VariableScope.isVariableScope()).to.be(false);
        });
    });

    describe('.variables()', function () {
        var scope = new VariableScope({
            values: [{
                key: 'var1',
                value: 'one'
            }, {
                key: 'var2',
                value: 2,
                type: 'number'
            }, {
                key: 'var3',
                value: true,
                type: 'boolean'
            }]
        });

        it('must return a copy of all variables in an object form', function () {
            expect(scope.variables()).be.an('object');
            expect(scope.variables()).be.eql({
                var1: 'one',
                var2: 2,
                var3: true
            });
        });
    });

    describe('.addLayer()', function () {
        var layerOne = new VariableList({}, [{
                key: 'var-1-layerOne',
                value: 'var-1-layerOne-value'
            }, {
                key: 'var-2-layerOne',
                value: 'var-2-layerOne-value'
            }]),
            layerTwo = new VariableList({}, [{
                key: 'var-1-layerTwo',
                value: 'var-1-layerTwo-value'
            }, {
                key: 'var-2-layerTwo',
                value: 'var-2-layerTwo-value'
            }]);

        it('adds a variable list to the current instance', function () {
            var scope = new VariableScope(layerOne);
            scope.addLayer(layerTwo);

            expect(scope._layers.length).to.be(1);
            expect(VariableList.isVariableList(scope._layers[0])).to.be.ok();
        });

        it('should bail out for a non VariableList argument', function () {
            var scope = new VariableScope(layerOne);
            scope.addLayer([]);

            expect(scope).to.not.have.property('_layers');
        });
    });

    describe('multiple level variable resolution', function () {
        var layerOne = new VariableList({}, [{
                key: 'var-1-layerOne',
                value: 'var-1-layerOne-value'
            }, {
                key: 'var-2-layerOne',
                value: 'var-2-layerOne-value'
            }]),
            layerTwo = new VariableList({}, [{
                key: 'var-1-layerTwo',
                value: 'var-1-layerTwo-value'
            }, {
                key: 'var-2-layerTwo',
                value: 'var-2-layerTwo-value'
            }, {
                key: 'var-3',
                value: 'var-3-layerTwo-value'
            }]),
            layerThree = new VariableList({}, [{
                key: 'var-1-layer',
                value: 'var-1-layerThree-value'
            }, {
                key: 'var-2-layer',
                value: 'var-2-layerThree-value'
            }, {
                key: 'var-3',
                value: 'var-3-layerThree-value'
            }]);

        it('ensures an array of variable list instances is provided via the constructor', function () {
            var scope = new VariableScope({}, [layerOne, layerTwo]),
                scopeOne = new VariableScope({}, undefined);

            expect(scope._layers.length).to.be(2);
            scope._layers.forEach(function (list) {
                expect(VariableList.isVariableList(list)).to.be(true);
            });

            expect(scopeOne).to.not.have.property('_layers');
        });

        it('the additional variable list is cast to an array if it is not already', function () {
            var scope = new VariableScope({}, layerOne);

            expect(scope._layers.length).to.be(1);
        });

        it('requires instance(s) of VariableList for increasing search area', function () {
            var scope = new VariableScope({}, [{
                key: 'key-1',
                value: 'value-1'
            }]);

            expect(scope._layers.length).to.be(0);
        });

        it('retrieves the value from the current scope', function () {
            var scope = new VariableScope(layerOne);
            expect(scope.get('var-1-layerOne')).to.be('var-1-layerOne-value');
        });

        it('retrieves the value of a variable from parent scopes', function () {
            var scope = new VariableScope(layerOne);
            scope.addLayer(layerTwo);

            expect(scope.get('var-1-layerTwo')).to.be('var-1-layerTwo-value');
        });

        it('retrieves the first occurence of a value should duplicates exist', function () {
            var scope = new VariableScope(layerOne);
            scope.addLayer(layerTwo);
            scope.addLayer(layerThree);

            expect(scope.get('var-3')).to.be('var-3-layerTwo-value');
        });
    });

    describe('.toJSON()', function () {
        it('does not expose the concept of layers', function () {
            var list = new VariableList({}, [{
                    key: 'var-1-layerOne',
                    value: 'var-1-layerOne-value'
                }, {
                    key: 'var-2-layerOne',
                    value: 'var-2-layerOne-value'
                }]),
                scope = new VariableScope({}, list);

            expect(scope.toJSON()).to.not.have.property('_layers');
        });

        it('should handle malformed VariableScope instances correctly', function () {
            var scope = new VariableScope([
                { key: 'alpha', value: 'foo' }
            ]);

            delete scope._layers;
            scope.values = scope.value;
            delete scope.value;

            expect(scope.toJSON()).to.be.ok();
        });
    });

    describe('.toObject()', function () {
        var keyVals = [{
            key: 'key1',
            value: 'val1'
        }, {
            key: 'key2',
            value: 'val2'
        }, {
            key: 'key3',
            value: 'val3'
        }];

        it('should return a pojo', function () {
            var scope = new VariableScope(keyVals);

            expect(scope.toObject()).to.eql({
                'key1': 'val1',
                'key2': 'val2',
                'key3': 'val3'
            });
        });

        it('uses the last found key-val pair should a duplicate key exists', function () {
            var scope = new VariableScope(keyVals.concat({
                key: 'key3',
                value: 'duplicate-val3'
            }));

            expect(scope.toObject()).to.eql({
                'key1': 'val1',
                'key2': 'val2',
                'key3': 'duplicate-val3'
            });
        });

        it('should return a pojo from all layers of scope', function () {
            var globalScope = new VariableList(null, keyVals[0]),
                envScope = new VariableList(null, keyVals[1]),
                localScope = new VariableScope([keyVals[2]], [envScope, globalScope]);

            expect(localScope.toObject()).to.eql({
                'key1': 'val1',
                'key2': 'val2',
                'key3': 'val3'
            });
        });

        it('returns only local scope values if layers are not provided', function () {
            var localValues = [{
                    key: 'key1',
                    value: 'val1'
                }, {
                    key: 'key2',
                    value: 'val2'
                }],
                scope = new VariableScope(localValues);

            expect(scope.toObject()).to.eql({
                'key1': 'val1',
                'key2': 'val2'
            });
        });

        it('gives correct order of precedence for "overrides" when resolving layers', function () {
            var globalValues = [{
                    key: 'foo',
                    value: '1'
                }, {
                    key: 'bar',
                    value: '1'
                }, {
                    key: 'baz',
                    value: '1'
                }],
                localValues = [{
                    key: 'bar',
                    value: '2'
                }, {
                    key: 'baz',
                    value: '2'
                }],
                envValues = [{
                    key: 'baz',
                    value: '3'
                }],
                globalScope = new VariableList(null, globalValues),
                envScope = new VariableList(null, envValues),
                localScope = new VariableList(null, localValues),
                variableScope = new VariableScope(null, [envScope, localScope, globalScope]);

            expect(variableScope.toObject()).to.eql({
                'foo': '1',
                'bar': '2',
                'baz': '3'
            });
        });

        it('"definition" should take the highest precedence when resolving layers', function () {
            var globalValues = [{
                    key: 'foo',
                    value: '1'
                }, {
                    key: 'bar',
                    value: '1'
                }, {
                    key: 'baz',
                    value: '1'
                }],
                localValues = [{
                    key: 'bar',
                    value: '2'
                }, {
                    key: 'baz',
                    value: '2'
                }],
                envValues = [{
                    key: 'baz',
                    value: '3'
                }],
                globalScope = new VariableList(null, globalValues),
                envScope = new VariableList(null, envValues),
                localScope = new VariableList(null, localValues),
                variableScope = new VariableScope(envScope, [localScope, globalScope]);

            expect(variableScope.toObject()).to.eql({
                'foo': '1',
                'bar': '2',
                'baz': '3'
            });
        });
    });

    describe('has', function () {
        var scope = new VariableScope([
            { key: 'alpha', value: 'foo' },
            { key: 'beta', value: 'bar' }
        ]);

        it('should correctly determine if the current scope contains a provided identifier', function () {
            expect(scope.has('alpha')).to.be(true);
            expect(scope.has('random')).to.be(false);
        });
    });

    describe('mutation tracking', function () {
        it('should not be initialized by default', function () {
            var scope = new VariableScope();

            expect(scope).to.not.have.property('mutations');
            expect(scope._postman_enableTracking).to.not.be.ok();
        });

        it('should be restored from definition during construction, but not enabled further on', function () {
            var scopeDefinition = {
                    values: [{ key: 'foo', value: 'foo' }],
                    mutations: {
                        stream: [['foo', 'foo']]
                    }
                },
                scope = new VariableScope(scopeDefinition);

            expect(scope).to.have.property('mutations');
            expect(scope._postman_enableTracking).to.not.be.ok();
            expect(scope.mutations.count()).to.equal(1);
        });

        it('should not track until explicitly enabled', function () {
            var scopeDefinition = {
                    values: [{ key: 'foo', value: 'foo' }],
                    mutations: {
                        stream: [['foo', 'foo']]
                    }
                },
                scope = new VariableScope(scopeDefinition);

            scope.set('bar', 'bar');
            scope.set('foo', 'foo updated');

            expect(scope).to.have.property('mutations');
            expect(scope._postman_enableTracking).to.not.be.ok();
            expect(scope.mutations.count()).to.equal(1);
        });

        it('should track set operations', function () {
            var scope = new VariableScope();

            scope.enableTracking();

            scope.set('foo', 'foo');

            expect(scope).to.have.property('mutations');
            expect(scope.mutations.count()).to.equal(1);
        });

        it('should track unset operations', function () {
            var scope = new VariableScope({
                values: [{
                    key: 'foo',
                    value: 'foo'
                }]
            });

            scope.enableTracking();

            scope.unset('foo');

            expect(scope).to.have.property('mutations');
            expect(scope.mutations.count()).to.equal(1);
        });

        it('should track clear operations', function () {
            var scope = new VariableScope({
                values: [{
                    key: 'foo',
                    value: 'foo'
                }, {
                    key: 'bar',
                    value: 'bar'
                }]
            });

            scope.enableTracking();
            scope.clear();

            expect(scope).to.have.property('mutations');

            // one unset for each key
            expect(scope.mutations.count()).to.equal(2);
        });

        it('should be capable of being replayed', function () {
            var initialState = {
                    values: [{
                        key: 'foo',
                        value: 'foo'
                    }, {
                        key: 'bar',
                        value: 'bar'
                    }]
                },
                scope1 = new VariableScope(initialState),
                scope2 = new VariableScope(initialState);

            scope1.enableTracking();

            // add a new key
            scope1.set('baz', 'baz');
            // update a key
            scope1.set('foo', 'foo updated');
            // remove a key
            scope1.unset('bar');

            // replay mutations on a different object
            scope1.mutations.applyOn(scope2);

            expect(scope1.values).to.eql(scope2.values);
        });

        it('should be serialized', function () {
            var scope = new VariableScope(),
                serialized,
                scope2;

            scope.enableTracking();

            scope.set('foo', 'foo');

            serialized = scope.toJSON();

            expect(serialized).to.have.property('mutations');
            expect(serialized).to.not.have.property('_postman_enableTracking');
            expect(serialized).to.have.property('mutations');

            scope2 = new VariableScope(serialized);

            expect(scope2.toJSON().mutations).to.eql(serialized.mutations);
        });

        it('should be enabled at any time', function () {
            var scope = new VariableScope();

            scope.enableTracking();

            scope.set('foo', 'foo');

            expect(scope).to.have.property('mutations');
            expect(scope).to.have.property('_postman_enableTracking', true);
            expect(scope.mutations.count()).to.equal(1);
        });

        it('should be enabled at any time, with options', function () {
            var scope = new VariableScope();

            scope.enableTracking({ autoCompact: true });

            scope.set('foo', 'foo');

            expect(scope).to.have.property('mutations');
            expect(scope).to.have.property('_postman_enableTracking', true);
            expect(scope.mutations.count()).to.equal(1);
            expect(scope.mutations.autoCompact).to.equal(true);
        });

        it('should do nothing if enabled when already enabled', function () {
            var scope = new VariableScope();

            scope.enableTracking();
            scope.set('foo', 'foo');

            scope.enableTracking();

            expect(scope).to.have.property('mutations');
            expect(scope).to.have.property('_postman_enableTracking', true);
            expect(scope.mutations.count()).to.equal(1);
        });

        it('should reset mutations when enabled', function () {
            var scope = new VariableScope({
                mutations: {
                    stream: [['foo', 'foo']]
                }
            });

            scope.enableTracking();

            expect(scope).to.have.property('mutations');
            expect(scope).to.have.property('_postman_enableTracking', true);
            expect(scope.mutations.count()).to.equal(0);
        });

        it('should be disabled when desired', function () {
            var scope = new VariableScope();

            scope.enableTracking();
            scope.set('foo', 'foo');

            scope.disableTracking();

            // disable further mutations
            expect(scope._postman_enableTracking).to.not.be.ok();

            // but keep the existing mutations
            expect(scope.mutations.count()).to.equal(1);
        });

        it('should stay disabled when disabling multiple times', function () {
            var scope = new VariableScope();

            scope.enableTracking();
            scope.set('foo', 'foo');

            scope.disableTracking();
            scope.disableTracking();


            // disable further mutations
            expect(scope._postman_enableTracking).to.not.be.ok();

            // but keep the existing mutations
            expect(scope.mutations.count()).to.equal(1);
        });
    });
});
