var expect = require('chai').expect,
    Property = require('../../').Property,
    Variable = require('../../').Variable,
    VariableList = require('../../').VariableList,
    VariableScope = require('../../').VariableScope;

describe('VariableScope', function () {
    it('should be inherited from property and not list', function () {
        expect(new VariableScope()).to.be.an.instanceof(Property);
    });

    it('should have values list as a variable-list', function () {
        var scope = new VariableScope();

        expect(scope).to.have.property('id');
        expect(scope.id).to.be.ok;

        expect(scope).to.have.property('values');
        expect(scope).to.not.have.property('_layers');
        expect(VariableList.isVariableList(scope.values)).to.be.ok;
        expect(scope.values.__parent).to.equal(scope);
    });

    it('should accept an array of variable objects as definition', function () {
        var scope = new VariableScope([{
            key: 'var-1',
            value: 'var-1-value'
        }, {
            key: 'var-2',
            value: 'var-2-value'
        }]);

        expect(scope).to.include.keys(['id', 'values']);
        expect(scope.id).to.be.ok;
        expect(scope).to.not.have.property('_layers');
        expect(scope.values.count()).to.equal(2);

        // check whether the
        expect(scope.values.idx(0)).to.be.an.instanceof(Variable);
        expect(scope.values.idx(0)).to.deep.include({
            key: 'var-1',
            value: 'var-1-value'
        });

        expect(scope.values.idx(1)).to.be.an.instanceof(Variable);
        expect(scope.values.idx(1)).to.deep.include({
            key: 'var-2',
            value: 'var-2-value'
        });
    });

    it('should accept a `values` array of variable objects as definition', function () {
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

        expect(scope).to.have.property('id').that.equal('test-scope-id');
        expect(scope).to.have.property('values');
        expect(scope).to.not.have.property('_layers');
        expect(scope.values.count()).to.equal(2);

        expect(scope.values.idx(0)).to.be.an.instanceof(Variable);
        expect(scope.values.idx(0)).to.deep.include({
            key: 'var-1',
            value: 'var-1-value'
        });

        expect(scope.values.idx(1)).to.be.an.instanceof(Variable);
        expect(scope.values.idx(1)).to.deep.include({
            key: 'var-2',
            value: 'var-2-value'
        });
    });

    it('should carry the id and name from definition', function () {
        var scope = new VariableScope({
            id: 'test-scope-id',
            name: 'my-environment'
        });

        expect(scope).to.deep.include({
            id: 'test-scope-id',
            name: 'my-environment'
        });

        expect(scope).to.have.property('values');
        expect(scope).to.not.have.property('_layers');
        expect(VariableList.isVariableList(scope.values)).to.be.ok;
        expect(scope.values.count()).to.equal(0);
    });

    describe('syncing variables from source', function () {
        it('should be able to sync values from an object (and not return crud when not specified)', function () {
            var scope = new VariableScope(),
                crud;

            expect(scope.values.count()).to.equal(0);

            crud = scope.syncVariablesFrom({
                var1: 'value1',
                var2: 'value2'
            });

            expect(crud).to.be.undefined;
            expect(scope.values.count()).to.equal(2);

            expect(scope.values.idx(0)).to.be.an.instanceof(Variable);
            expect(scope.values.idx(0)).to.deep.include({
                key: 'var1',
                value: 'value1'
            });

            expect(scope.values.idx(1)).to.be.an.instanceof(Variable);
            expect(scope.values.idx(1)).to.deep.include({
                key: 'var2',
                value: 'value2'
            });
        });

        it('should be able to sync values from an object and return crud operation details', function () {
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

            expect(scope.values.count()).to.equal(2);

            crud = scope.syncVariablesFrom({
                original1: 'original1Updated',
                synced1: 'syncedValue1'
            }, true);

            expect(scope.values.count()).to.equal(2);
            expect(scope.values.idx(0)).to.be.an.instanceof(Variable);
            expect(scope.values.idx(0)).to.deep.include({
                key: 'original1',
                value: 'original1Updated'
            });

            expect(scope.values.idx(1)).to.be.an.instanceof(Variable);
            expect(scope.values.idx(1)).to.deep.include({
                key: 'synced1',
                value: 'syncedValue1'
            });

            expect(crud).to.eql({
                created: ['synced1'],
                deleted: ['original2'],
                updated: ['original1']
            });
        });

        it('should retain original type while syncing from object', function () {
            var scope = new VariableScope({
                    values: [{
                        key: 'oneNumber',
                        value: 3.142,
                        type: 'number' // note that type is specified here
                    }]
                }),

                crud;

            // we check that the original values are set
            expect(scope.values.count()).to.equal(1);
            expect(scope.values.one('oneNumber').value).to.equal(3.142);
            expect(scope.values.one('oneNumber').type).to.eql('number');

            // we now sync object while setting track flag to true
            crud = scope.syncVariablesFrom({
                oneNumber: '17'
            }, true); // <- track is `true`

            expect(crud).to.eql({
                created: [],
                deleted: [],
                updated: ['oneNumber'] // only oneNumber updated and no other change
            });

            expect(scope.values.count()).to.equal(1); // ensure it is still 1 variable
            expect(scope.values.one('oneNumber').value).to.equal(17); // number has changed
            expect(scope.values.one('oneNumber').type).to.eql('number'); // type is still number
        });

        it('should clone the variable-list instance if passed as a list in constructor', function () {
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

            expect(scope.values).to.not.equal(list);
            expect(scope.values.one('var-1')).to.eql(list.one('var-1'));
        });
    });

    describe('syncing variables to target', function () {
        it('should be able to sync to an object', function () {
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

            expect(target).to.deep.include({
                'var-1': 'var-1-value',
                'var-2': 'var-2-value'
            });
        });

        it('should retain variable type while syncing to object', function () {
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

            expect(target).to.deep.include({
                'var-1': 'var-1-value',
                'var-2': 2
            });
        });

        it('should remove extra properties from target object', function () {
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

            expect(target).to.deep.include({
                'var-1': 'var-1-value',
                'var-2': 2
            });
            expect(target).to.not.have.property('extra');
        });
    });

    describe('PM API helpers', function () {
        describe('get', function () {
            it('should get the specified variable', function () {
                var scope = new VariableScope([
                    { key: 'var-1', value: 'var-1-value' },
                    { key: 'var-2', value: 'var-2-value' }
                ]);

                expect(scope.get('var-2')).to.equal('var-2-value');
            });

            it('should get last enabled from multi value list', function () {
                var scope = new VariableScope([
                    { key: 'var-2', value: 'var-2-value' },
                    { key: 'var-2', value: 'var-2-value2' },
                    { key: 'var-2', value: 'var-2-value3', disabled: true }
                ]);

                expect(scope.get('var-2')).to.equal('var-2-value2');
            });

            it('should bail out if variable is disabled', function () {
                var scope = new VariableScope([
                    { key: 'var-3', value: 'var-3-value3', disabled: true }
                ]);

                expect(scope.get('var-3')).to.be.undefined;
            });

            it('should bail out if no matches are found', function () {
                var scope = new VariableScope([
                    { key: 'var-2', value: 'var-3-value3', disabled: true }
                ]);

                expect(scope.get('random')).to.be.undefined;
            });

            describe('multi layer search', function () {
                it('should get from parent scope', function () {
                    var scope = new VariableScope([
                        { key: 'alpha', value: 'foo' }
                    ]);

                    scope.addLayer(new VariableList({}, [
                        { key: 'alpha_layer_1', value: 'foo_layer_1' }
                    ]));

                    expect(scope.get('alpha_layer_1')).to.equal('foo_layer_1');
                });

                it('should bail out if variable is disabled', function () {
                    var scope = new VariableScope([
                        { key: 'alpha', value: 'foo' }
                    ]);

                    scope.addLayer(new VariableList({}, [
                        { key: 'beta', value: 'bar', disabled: true }
                    ]));

                    expect(scope.get('beta')).to.be.undefined;
                });

                it('should bail out if no matches are found', function () {
                    var scope = new VariableScope([
                        { key: 'alpha', value: 'foo' }
                    ]);

                    scope.addLayer(new VariableList({}, [
                        { key: 'alpha_layer_1', value: 'foo_layer_1' }
                    ]));

                    expect(scope.get('random')).to.be.undefined;
                });

                it('should get last enabled from multi value list', function () {
                    var scope = new VariableScope([
                        { key: 'alpha', value: 'foo' }
                    ]);

                    scope.addLayer(new VariableList({}, [
                        { key: 'gamma', value: 'foo' },
                        { key: 'gamma', value: 'foo_2' },
                        { key: 'gamma', value: 'foo_3', disabled: true }
                    ]));

                    expect(scope.get('gamma')).to.equal('foo_2');
                });

                it('should get from current scope in case of duplicates', function () {
                    var scope = new VariableScope([
                        { key: 'alpha', value: 'foo' }
                    ]);

                    scope.addLayer(new VariableList({}, [
                        { key: 'alpha', value: 'foo_layer_1' }
                    ]));

                    expect(scope.get('alpha')).to.equal('foo');
                });

                it('should get first enabled in case of duplicates', function () {
                    var scope = new VariableScope([
                        { key: 'alpha', value: 'foo', disabled: true }
                    ]);

                    scope.addLayer(new VariableList({}, [
                        { key: 'alpha', value: 'foo_layer_1' }
                    ]));

                    scope.addLayer(new VariableList({}, [
                        { key: 'alpha', value: 'foo_layer_2', disabled: true }
                    ]));

                    expect(scope.get('alpha')).to.equal('foo_layer_1');
                });
            });
        });

        describe('set', function () {
            it('should correctly update an existing value', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'var-1',
                        value: 'var-1-value'
                    }]
                });

                scope.set('var-1', 'new-var-1-value');
                expect(scope.get('var-1')).to.equal('new-var-1-value');
            });

            it('should correctly update the last enabled item in multi value list', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'var-2',
                        value: 'var-2-value'
                    }, {
                        key: 'var-2',
                        value: 'var-2-value2',
                        disabled: true
                    }, {
                        key: 'var-2',
                        value: 'var-2-value3'
                    }]
                });

                scope.set('var-2', 'new-var-2-value');
                expect(scope.get('var-2')).to.equal('new-var-2-value');
                expect(scope.values.toJSON()).to.eql([
                    { key: 'var-2', type: 'any', value: 'var-2-value' },
                    { key: 'var-2', disabled: true, type: 'any', value: 'var-2-value2' },
                    { key: 'var-2', type: 'any', value: 'new-var-2-value' } // updated last enabled in multi value
                ]);
            });

            it('should handle disabled variable correctly', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'var-3',
                        value: 'var-3-value',
                        disabled: true
                    }]
                });

                expect(scope.values.count()).to.equal(1);
                expect(scope.has('var-3')).to.be.false;
                expect(scope.get('var-3')).to.be.undefined;

                scope.set('var-3', 'new-var-3-value');

                // creates new variable with same name, won't overwrite disabled
                expect(scope.values.count()).to.equal(2);
                expect(scope.has('var-3')).to.be.true;
                expect(scope.get('var-3')).to.equal('new-var-3-value');

                expect(scope.values.toJSON()).to.eql([
                    { key: 'var-3', disabled: true, type: 'any', value: 'var-3-value' },
                    { key: 'var-3', type: 'any', value: 'new-var-3-value' } // new variable created on disabled set
                ]);
            });

            it('should create a new variable if non-existent', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'var-1',
                        value: 'var-1-value'
                    }]
                });

                scope.set('var-4', 'var-4-value');

                expect(scope.values.count()).to.equal(2);
                expect(scope.get('var-4')).to.equal('var-4-value');
            });

            it('should correctly update type of existing value', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'var-1',
                        value: 'var-1-value'
                    }]
                });

                scope.set('var-1', 3.142, 'number');
                expect(scope.get('var-1')).to.equal(3.142);
            });

            it('should correctly create a new typed value', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'var-1',
                        value: 'var-1-value'
                    }]
                });

                scope.set('var-4', 3.142, 'boolean');
                expect(scope.get('var-4')).to.be.true;
            });
        });

        describe('unset', function () {
            it('should correctly remove an existing variable', function () {
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

                expect(scope.values.count()).to.equal(1);
                expect(scope.get('var-1')).to.be.undefined;
            });

            it('should leave the scope untouched for an invalid key', function () {
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
                expect(scope.values.count()).to.equal(2);
            });

            // @todo delete last enabled on unset
            // eslint-disable-next-line mocha/no-skipped-tests
            it.skip('should remove the last enabled from the multi value list', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'var-2',
                        value: 'var-2-value1'
                    }, {
                        key: 'var-2',
                        value: 'var-2-value2'
                    }, {
                        key: 'var-2',
                        value: 'var-2-value3',
                        disabled: true
                    }]
                });

                // delete last enabled
                scope.unset('var-2');
                expect(scope.values.count()).to.equal(2);
                expect(scope.get('var-2')).to.equal('var-2-value1');

                // delete last enabled
                scope.unset('var-2');
                expect(scope.values.count()).to.equal(1);
                expect(scope.get('var-2')).to.be.undefined;

                // try deleting disabled
                scope.unset('var-2');
                expect(scope.values.count()).to.equal(1);
                expect(scope.get('var-2')).to.be.undefined;
            });

            it('should remove all the enabled from the multi value list', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'var-2',
                        value: 'var-2-value1'
                    }, {
                        key: 'var-2',
                        value: 'var-2-value2'
                    }, {
                        key: 'var-2',
                        value: 'var-2-value3',
                        disabled: true
                    }]
                });

                // delete all enabled
                scope.unset('var-2');
                expect(scope.values.count()).to.equal(1);
                expect(scope.get('var-2')).to.be.undefined;

                // try deleting disabled
                scope.unset('var-2');
                expect(scope.values.count()).to.equal(1);
                expect(scope.get('var-2')).to.be.undefined;

                // check members list
                expect(scope.values.toJSON()).to.eql([
                    { key: 'var-2', value: 'var-2-value3', type: 'any', disabled: true }
                ]);

                // check reference list
                expect(scope.values.reference).to.have.property('var-2');
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
                }, {
                    key: 'var-2',
                    value: 'var-2-value2'
                }, {
                    key: 'var-2',
                    value: 'var-2-value3',
                    disabled: true
                }]
            });

            it('should correctly remove all variables', function () {
                scope.clear();
                expect(scope.values.count()).to.equal(0);
            });
        });

        describe('replaceIn', function () {
            it('should handle all inputs', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'var1',
                        value: 'value1'
                    }]
                });

                expect(scope.replaceIn('{{var1}}')).to.equal('value1');
                expect(scope.replaceIn(null)).to.equal(null);
                expect(scope.replaceIn(undefined)).to.equal(undefined);
                expect(scope.replaceIn(true)).to.equal(true);
                expect(scope.replaceIn({})).to.eql({});
            });

            it('should work with no variables ', function () {
                var emptyScope = new VariableScope();

                expect(emptyScope.replaceIn('{{var1}}')).to.equal('{{var1}}');
            });

            it('should resolve all variables in object', function () {
                var scope = new VariableScope({
                        values: [{
                            key: 'name',
                            value: 'Cooper'
                        }, {
                            key: 'job',
                            value: 'Postman'
                        }]
                    }),
                    obj = { name: '{{name}}', job: '{{job}}' };

                expect(scope.replaceIn(obj)).to.eql({ name: 'Cooper', job: 'Postman' });
            });

            it('should resolve all variables in string', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'name',
                        value: 'Cooper'
                    }, {
                        key: 'job',
                        value: 'Postman'
                    }]
                });

                expect(scope.replaceIn('I am {{name}} and I work at {{job}}'))
                    .to.equal('I am Cooper and I work at Postman');
            });

            it('should resolve all variables in arrays', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'name',
                        value: 'Cooper'
                    }, {
                        key: 'job',
                        value: 'Postman'
                    }]
                });

                expect(scope.replaceIn([])).to.eql([]);
                expect(scope.replaceIn(['text'])).to.eql(['text']);
                expect(scope.replaceIn(['{{name}}'])).to.eql(['Cooper']);
                expect(scope.replaceIn([{ name: '{{name}}' }, { job: '{{job}}' }]))
                    .to.eql([{ name: 'Cooper' }, { job: 'Postman' }]);
            });

            it('should resolve variables in a user defined type instance', function () {
                var scope = new VariableScope({
                        values: [{
                            key: 'var',
                            value: 'value'
                        }]
                    }),
                    MyVar = function (val) {
                        this.val = val;
                    },
                    myVar = new MyVar('{{var}}');

                expect(scope.replaceIn(myVar)).to.eql({ val: 'value' });
            });

            it('should not resolve disabled variables', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'name',
                        value: 'Cooper'
                    }, {
                        key: 'job',
                        value: 'Postman',
                        disabled: true
                    }]
                });

                expect(scope.replaceIn('I am {{name}} and I work at {{job}}'))
                    .to.equal('I am Cooper and I work at {{job}}');
            });

            it('should not resolve variable templates with spaces', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'place',
                        value: 'Bangalore'
                    }]
                });

                expect(scope.replaceIn('{{place}} is not {{ place }}'))
                    .to.equal('Bangalore is not {{ place }}');
            });

            it('should be able to resolve variables deeply', function () {
                var scope = new VariableScope({
                    values: [{
                        key: 'var1',
                        value: 'var2'
                    }, {
                        key: 'var2',
                        value: 'var3'
                    }, {
                        key: 'var3',
                        value: 'value'
                    }]
                });

                expect(scope.replaceIn('{{var1}}')).to.equal('var2');
                expect(scope.replaceIn('{{{{var1}}}}')).to.equal('var3');
                expect(scope.replaceIn('{{{{{{var1}}}}}}')).to.equal('value');
            });

            it('should handle layers priority', function () {
                var layer1 = new VariableList({}, [{
                        key: 'var1',
                        value: 'value1.1'
                    }, {
                        key: 'var2',
                        value: 'value1.2'
                    }, {
                        key: 'var3',
                        value: 'value1.3',
                        disabled: true
                    }, {
                        key: 'var4',
                        value: 'value1.4'
                    }]),
                    layer2 = new VariableList({}, [{
                        key: 'var2',
                        value: 'value2.2'
                    }, {
                        key: 'var3',
                        value: 'value2.3',
                        disabled: true
                    }]),
                    layer3 = new VariableList({}, [{
                        key: 'var1',
                        value: 'value3.1'
                    }, {
                        key: 'var4',
                        value: 'value3.4'
                    }]),
                    scope1 = new VariableScope({}, [layer1, layer2, layer3]),
                    scope2 = new VariableScope({}, [layer3, layer1, layer2]);

                expect(scope1.replaceIn('{{var1}}')).to.equal('value1.1');
                expect(scope1.replaceIn('{{var2}}')).to.equal('value1.2');
                expect(scope1.replaceIn('{{var3}}')).to.equal('{{var3}}');
                expect(scope1.replaceIn('{{var4}}')).to.equal('value1.4');

                expect(scope2.replaceIn('{{var1}}')).to.equal('value3.1');
                expect(scope2.replaceIn('{{var2}}')).to.equal('value1.2');
                expect(scope2.replaceIn('{{var3}}')).to.equal('{{var3}}');
                expect(scope2.replaceIn('{{var4}}')).to.equal('value3.4');
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
            expect(VariableScope.isVariableScope(new VariableScope(rawVariableScope))).to.be.true;
        });

        it('should return false for a raw VariableScope object', function () {
            expect(VariableScope.isVariableScope(rawVariableScope)).to.be.false;
        });

        it('should return false when called without arguments', function () {
            expect(VariableScope.isVariableScope()).to.be.false;
        });
    });

    describe('.variables()', function () {
        it('should throw error as function is discontinued', function () {
            var scope = new VariableScope({
                values: [{
                    key: 'var1',
                    value: 'one'
                }]
            });

            expect(function () {
                scope.variables();
            // eslint-disable-next-line max-len
            }).to.throw('`VariableScope#variables` has been discontinued, use `VariableScope#syncVariablesTo` instead.');
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

            expect(scope._layers.length).to.equal(1);
            expect(VariableList.isVariableList(scope._layers[0])).to.be.ok;
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

            expect(scope._layers.length).to.equal(2);
            scope._layers.forEach(function (list) {
                expect(VariableList.isVariableList(list)).to.be.true;
            });

            expect(scopeOne).to.not.have.property('_layers');
        });

        it('the additional variable list is cast to an array if it is not already', function () {
            var scope = new VariableScope({}, layerOne);

            expect(scope._layers.length).to.equal(1);
        });

        it('requires instance(s) of VariableList for increasing search area', function () {
            var scope = new VariableScope({}, [{
                key: 'key-1',
                value: 'value-1'
            }]);

            expect(scope._layers.length).to.equal(0);
        });

        it('retrieves the value from the current scope', function () {
            var scope = new VariableScope(layerOne);

            expect(scope.get('var-1-layerOne')).to.equal('var-1-layerOne-value');
        });

        it('retrieves the value of a variable from parent scopes', function () {
            var scope = new VariableScope(layerOne);

            scope.addLayer(layerTwo);

            expect(scope.get('var-1-layerTwo')).to.equal('var-1-layerTwo-value');
        });

        it('retrieves the first occurence of a value should duplicates exist', function () {
            var scope = new VariableScope(layerOne);

            scope.addLayer(layerTwo);
            scope.addLayer(layerThree);

            expect(scope.get('var-3')).to.equal('var-3-layerTwo-value');
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

            expect(scope.toJSON()).to.be.ok;
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
                key1: 'val1',
                key2: 'val2',
                key3: 'val3'
            });
        });

        it('uses the last found key-val pair should a duplicate key exists', function () {
            var scope = new VariableScope(keyVals.concat({
                key: 'key3',
                value: 'duplicate-val3'
            }));

            expect(scope.toObject()).to.eql({
                key1: 'val1',
                key2: 'val2',
                key3: 'duplicate-val3'
            });
        });

        it('should return a pojo from all layers of scope', function () {
            var globalScope = new VariableList(null, keyVals[0]),
                envScope = new VariableList(null, keyVals[1]),
                localScope = new VariableScope([keyVals[2]], [envScope, globalScope]);

            expect(localScope.toObject()).to.eql({
                key1: 'val1',
                key2: 'val2',
                key3: 'val3'
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
                key1: 'val1',
                key2: 'val2'
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
                foo: '1',
                bar: '2',
                baz: '3'
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
                foo: '1',
                bar: '2',
                baz: '3'
            });
        });
    });

    describe('has', function () {
        it('should find variable from current scope', function () {
            var scope = new VariableScope([
                { key: 'alpha', value: 'foo' },
                { key: 'gamma', value: 'baz', disabled: true }
            ]);

            expect(scope.has('alpha')).to.be.true;
            expect(scope.has('gamma')).to.be.false;
            expect(scope.has('random')).to.be.false;
        });

        it('should find variables from all scopes', function () {
            var scope = new VariableScope([
                { key: 'alpha', value: 'foo' }
            ]);

            scope.addLayer(new VariableList(null, [
                { key: 'alpha_layer1', value: 'foo_layer1' }
            ]));

            scope.addLayer(new VariableList(null, [
                { key: 'alpha_layer2', value: 'foo_layer2' }
            ]));

            expect(scope.has('alpha')).to.be.true;
            expect(scope.has('alpha_layer1')).to.be.true;
            expect(scope.has('alpha_layer2')).to.be.true;
        });

        it('should not consider disabled variables from any scopes', function () {
            var scope = new VariableScope([
                { key: 'alpha', value: 'foo', disabled: true }
            ]);

            scope.addLayer(new VariableList(null, [
                { key: 'alpha_layer1', value: 'foo_layer1', disabled: true }
            ]));

            scope.addLayer(new VariableList(null, [
                { key: 'alpha_layer2', value: 'foo_layer2', disabled: true }
            ]));

            expect(scope.has('alpha')).to.be.false;
            expect(scope.has('alpha_layer1')).to.be.false;
            expect(scope.has('alpha_layer2')).to.be.false;
        });

        it('should return true incase of duplicates across the scopes', function () {
            var scope = new VariableScope([
                { key: 'alpha', value: 'foo' }
            ]);

            scope.addLayer(new VariableList(null, [
                { key: 'alpha', value: 'foo_layer1' }
            ]));

            scope.addLayer(new VariableList(null, [
                { key: 'alpha', value: 'foo_layer2' }
            ]));

            expect(scope.has('alpha')).to.be.true;
        });

        it('should find variable that exists in only one scope', function () {
            var scope = new VariableScope([
                { key: 'alpha', value: 'foo' }
            ]);

            scope.addLayer(new VariableList(null, [
                { key: 'beta', value: 'bar_layer1' }
            ]));

            scope.addLayer(new VariableList(null, [
                { key: 'alpha', value: 'foo_layer2' }
            ]));

            expect(scope.has('beta')).to.be.true;
        });

        it('should find enabled variable from duplicates in current scope', function () {
            var scope = new VariableScope([
                { key: 'alpha', value: 'foo_disabled_1', disabled: true },
                { key: 'alpha', value: 'foo' },
                { key: 'alpha', value: 'foo_disabled_2', disabled: true }
            ]);

            expect(scope.has('alpha')).to.be.true;
        });

        it('should find enabled variable from duplicates across the scopes', function () {
            var scope = new VariableScope([
                { key: 'alpha', value: 'foo_disabled_1', disabled: true },
                { key: 'alpha', value: 'foo_disabled_2', disabled: true }
            ]);

            scope.addLayer(new VariableList(null, [
                { key: 'alpha', value: 'foo_disabled_1_layer_1', disabled: true },
                { key: 'alpha', value: 'foo_layer_1' },
                { key: 'alpha', value: 'foo_disabled_2_layer_1', disabled: true }
            ]));

            scope.addLayer(new VariableList(null, [
                { key: 'alpha', value: 'foo_disabled_1_layer_2', disabled: true },
                { key: 'alpha', value: 'foo_disabled_2_layer_2', disabled: true }
            ]));

            expect(scope.has('alpha')).to.be.true;
        });
    });

    describe('disabled variable', function () {
        var scope = new VariableScope([
            { key: 'foo', value: 'bar', disabled: true }
        ]);

        it('should return undefined on .get()', function () {
            expect(scope.has('foo')).to.be.false;
            expect(scope.get('foo')).to.be.undefined;
        });

        it('should not remove on .unset()', function () {
            scope.unset('foo');
            expect(scope.values.count()).to.equal(1);
        });

        it('should create new enabled variable on .set()', function () {
            scope.set('foo', 'baz');
            expect(scope.has('foo')).to.be.true;
            expect(scope.get('foo')).to.equal('baz');
            expect(scope.values.count()).to.equal(2);
        });

        it('should correctly maintain the members list', function () {
            expect(scope.values.toJSON()).to.eql([
                { key: 'foo', value: 'bar', type: 'any', disabled: true },
                { key: 'foo', value: 'baz', type: 'any' }
            ]);
        });
    });

    describe('mutation tracking', function () {
        it('should not be initialized by default', function () {
            var scope = new VariableScope();

            expect(scope).to.not.have.property('mutations');
            expect(scope._postman_enableTracking).to.be.undefined;
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
            expect(scope._postman_enableTracking).to.be.undefined;
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
            expect(scope._postman_enableTracking).to.be.undefined;
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
            expect(scope.mutations.autoCompact).to.be.true;
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
            expect(scope._postman_enableTracking).to.be.false;

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
            expect(scope._postman_enableTracking).to.be.false;

            // but keep the existing mutations
            expect(scope.mutations.count()).to.equal(1);
        });
    });
});
