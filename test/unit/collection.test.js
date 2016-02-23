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
});
