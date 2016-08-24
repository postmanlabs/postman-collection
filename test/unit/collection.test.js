var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Collection = require('../../lib/index.js').Collection;

/* global describe, it */
describe('Collection', function () {
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
