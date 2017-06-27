var expect = require('expect.js'),
    Collection = require('../../lib/index.js').Collection,

    fixtures = require('../fixtures');

/* global describe, it */
describe('Collection', function () {
    describe('sanity', function () {
        var rawCollection = fixtures.collectionV2,
            collection = new Collection(rawCollection);

        it('initializes successfully', function () {
            expect(collection).to.be.ok();
        });

        describe('has property', function () {
            it('id', function () {
                expect(collection).to.have.property('id', rawCollection.info.id);
            });

            it('items', function () {
                expect(collection).to.have.property('items');
                expect(collection.items).to.be.an('object');
                expect(collection.items.all()).to.be.an('array');
                expect(collection.items.all()).to.not.be.empty();
            });

            it('name', function () {
                expect(collection).to.have.property('name', rawCollection.info.name);
            });

            it('events', function () {
                expect(collection).to.have.property('events');
                expect(collection.events.all()).to.be.an('array');
                expect(collection.events.all()).to.not.be.empty();
            });
        });

        describe('has function', function () {
            it('forEachItem', function () {
                expect(collection.forEachItem).to.be.a('function');
            });
        });

        describe('info block parsing', function () {
            it('must parse description', function () {
                var collection = new Collection({
                    info: {
                        name: 'test',
                        description: 'this is test description'
                    }
                });

                expect(collection.description).be.ok();
                expect(collection.description.toString()).be('this is test description');
            });

            it('must parse description from outside info block if info is absent', function () {
                var collection = new Collection({
                    name: 'test',
                    description: 'this is test description'
                });

                expect(collection.description).be.ok();
                expect(collection.description.toString()).be('this is test description');
            });
        });
    });

    describe('isCollection', function () {
        it('must distinguish between collections and other objects', function () {
            var collection = new Collection(),
                nonCollection = {};

            expect(Collection.isCollection(collection)).to.be(true);
            expect(Collection.isCollection()).to.be(false);
            expect(Collection.isCollection(nonCollection)).to.be(false);
        });
    });

    describe('variables', function () {
        it('must be able to sync variables from an object', function () {
            var collection = new Collection();

            collection.syncVariablesFrom({
                var1: 'value1'
            });

            expect(collection.variables.count()).be(1);
            expect(collection.variables.one('var1')).be.ok();
            expect(collection.variables.one('var1').value).be('value1');
        });

        it('must be able to sync variables to a target object', function () {
            var collection = new Collection({
                    variable: [{
                        key: 'var1',
                        value: '1',
                        type: 'number'
                    }]
                }),
                target = {
                    extra: true
                };

            collection.syncVariablesTo(target);

            expect(target).have.property('var1', 1);
            expect(target).not.have.property('extra');
        });
    });
});
