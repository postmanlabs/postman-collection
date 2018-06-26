var expect = require('expect.js'),
    VariableChangeset = require('../../').VariableChangeset,
    VariableScope = require('../../').VariableScope;

/* global describe, it */
describe('VariableChangeset', function () {
    describe('constructor', function () {
        it('should initialize with definition for set instruction', function () {
            var changesetDefinition = {
                    id: '1',
                    key: 'foo',
                    type: 'set',
                    value: 'fooValue'
                },
                changeset = new VariableChangeset(changesetDefinition);

            expect(changeset).to.have.property('id', changesetDefinition.id);
            expect(changeset).to.have.property('key', changesetDefinition.key);
            expect(changeset).to.have.property('type', changesetDefinition.type);
            expect(changeset).to.have.property('value', changesetDefinition.value);
        });

        it('should initialize with definition for unset instruction', function () {
            var changesetDefinition = {
                    id: '1',
                    key: 'foo',
                    type: 'unset'
                },
                changeset = new VariableChangeset(changesetDefinition);

            expect(changeset).to.have.property('id', changesetDefinition.id);
            expect(changeset).to.have.property('key', changesetDefinition.key);
            expect(changeset).to.have.property('type', changesetDefinition.type);
            expect(changeset).to.not.have.property('value');
        });

        it('should initialize with serialized definition for set instruction', function () {
            var changesetDefinition = {
                    id: '1',
                    key: 'foo',
                    type: 'set',
                    value: 'fooValue'
                },
                serializedDefinition = [changesetDefinition.id, changesetDefinition.key, changesetDefinition.value],
                changeset = new VariableChangeset(serializedDefinition);

            expect(changeset).to.have.property('id', changesetDefinition.id);
            expect(changeset).to.have.property('key', changesetDefinition.key);
            expect(changeset).to.have.property('type', changesetDefinition.type);
            expect(changeset).to.have.property('value', changesetDefinition.value);
        });

        it('should initialize with serialized definition for unset instruction', function () {
            var changesetDefinition = {
                    id: '1',
                    key: 'foo',
                    type: 'unset'
                },
                serializedDefinition = [changesetDefinition.id, changesetDefinition.key],
                changeset = new VariableChangeset(serializedDefinition);

            expect(changeset).to.have.property('id', changesetDefinition.id);
            expect(changeset).to.have.property('key', changesetDefinition.key);
            expect(changeset).to.have.property('type', changesetDefinition.type);
            expect(changeset).to.not.have.property('value');
        });

        it('should initialize by auto creating id', function () {
            var changesetDefinition = {
                    key: 'foo',
                    type: 'unset'
                },
                serializedDefinition = [changesetDefinition.id, changesetDefinition.key],
                changeset = new VariableChangeset(serializedDefinition);

            expect(changeset).to.have.property('id');
            expect(changeset).to.have.property('key', changesetDefinition.key);
            expect(changeset).to.have.property('type', changesetDefinition.type);
            expect(changeset).to.not.have.property('value');
        });
    });

    describe('applying', function () {
        it('should apply set changeset on variable scope for create', function () {
            var changeset = new VariableChangeset({
                    id: 1,
                    key: 'foo',
                    type: 'set',
                    value: 'value'
                }),
                scope = new VariableScope();

            changeset.applyOn(scope);

            expect(scope.get('foo')).to.eql('value');
        });

        it('should apply set changeset on variable scope for update', function () {
            var changeset = new VariableChangeset({
                    id: 1,
                    key: 'foo',
                    type: 'set',
                    value: 'value'
                }),
                scope = new VariableScope({
                    values: [{
                        key: 'foo',
                        value: 'oldValue'
                    }]
                });

            changeset.applyOn(scope);

            expect(scope.get('foo')).to.eql('value');
        });

        it('should apply unset changeset on variable scope', function () {
            var changeset = new VariableChangeset({
                    id: 1,
                    key: 'foo',
                    type: 'unset'
                }),
                scope = new VariableScope({
                    values: [{
                        key: 'foo',
                        value: 'oldValue'
                    }]
                });

            changeset.applyOn(scope);

            expect(scope.has('foo')).to.eql(false);
        });

        it('should ignore unknown operation type', function () {
            var changeset = new VariableChangeset({
                    id: 1,
                    key: 'foo',
                    type: 'lolol'
                }),
                scope = new VariableScope({
                    values: [{
                        key: 'foo',
                        value: 'oldValue'
                    }]
                });

            changeset.applyOn(scope);

            expect(scope.get('foo')).to.eql('oldValue');
        });

        it('should bail for anything other than variable scope', function () {
            var changeset = new VariableChangeset({
                id: 1,
                key: 'foo',
                type: 'lolol'
            });

            // apply on does not return anything, we're okay with that
            // we're just making sure there are no errors
            expect(changeset.applyOn({})).to.not.be.ok();
            expect(changeset.applyOn()).to.not.be.ok();
            expect(changeset.applyOn(null)).to.not.be.ok();
            expect(changeset.applyOn(new VariableChangeset())).to.not.be.ok();
        });
    });

    describe('toJSON', function () {
        it('should generate serialized set changeset', function () {
            var changeset = new VariableChangeset({
                id: '1',
                key: 'foo',
                type: 'set',
                value: 'fooValue'
            });

            expect(changeset.toJSON()).to.eql(['1', ['foo'], 'fooValue']);
        });

        it('should generate serialized unset changeset', function () {
            var changeset = new VariableChangeset({
                id: '1',
                key: 'foo',
                type: 'unset'
            });

            expect(changeset.toJSON()).to.eql(['1', ['foo']]);
        });
    });
});
