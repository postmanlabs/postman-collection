var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    ItemGroup = require('../../lib/index.js').ItemGroup;

/* global describe, it */
describe('ItemGroup', function () {
    var rawItemGroup = fixtures.collectionV2,
        itemGroup = new ItemGroup(rawItemGroup);

    it('initializes successfully', function () {
        expect(itemGroup).to.be.ok();
    });

    describe('has property', function () {
        it('id', function () {
            expect(itemGroup).to.have.property('id', rawItemGroup.info.id);
        });

        it('item', function () {
            expect(itemGroup).to.have.property('items');
            expect(itemGroup.items).to.be.an('object');
            expect(itemGroup.items.all()).to.be.an('array');
            expect(itemGroup.items.all()).to.not.be.empty();
        });

        it('name', function () {
            expect(itemGroup).to.have.property('name', rawItemGroup.info.name);
        });
        it('events', function () {
            expect(itemGroup).to.have.property('events');
            expect(itemGroup.events.all()).to.be.an('array');
            expect(itemGroup.events.all()).to.not.be.empty();
        });
    });

    describe('has function', function () {
        it('forEachItem', function () {
            expect(itemGroup.forEachItem).to.be.ok();
            expect(itemGroup.forEachItem).to.be.a('function');
        });
    });
});
