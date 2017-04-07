var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    sdk = require('../../lib/index.js');

/* global describe, it */
describe('Item', function () {
    var rawItem = fixtures.collectionV2.item[0],
        item = new sdk.Item(rawItem);

    describe('json representation', function () {
        it('must match what the item was initialized with', function () {
            var jsonified = item.toJSON();

            expect(jsonified.id).to.eql(rawItem.id);

            // All of these have their own proper tests
            expect(jsonified).to.have.property('description');
            expect(jsonified).to.have.property('request');
            expect(jsonified).to.have.property('response');
            expect(jsonified).to.have.property('event');
        });
    });

    describe('.parent', function () {
        var collection = new sdk.Collection(fixtures.nestedCollectionV2);

        it('must return a falsy result for a standalone item', function () {
            expect(item.parent()).to.not.be.ok();
        });

        it('must work correctly for a nested item', function () {
            var nestedItem = collection.items.members[1].items.members[0].items.members[0],
                parent = nestedItem.parent();

            expect(parent.name).to.be('F2.F3');
        });

        it('must work correctly for a regular folder item', function () {
            var f1 = collection.items.members[0],
                r1 = f1.items.members[0],
                parent = r1.parent();

            expect(parent.name).to.be(f1.name);
        });

        it('must work correctly for a first level item', function () {
            var firstLevelItem = collection.items.members[2], // root level request R1
                parent = firstLevelItem.parent();

            expect(parent.name).to.be(collection.name);
        });
    });

    describe('isItem', function () {
        var rawItem = fixtures.collectionV2.item[0];

        it('should return true for a Item instance', function () {
            expect(sdk.Item.isItem(new sdk.Item(rawItem))).to.be(true);
        });

        it('should return false for a raw Item object', function () {
            expect(sdk.Item.isItem(rawItem)).to.be(false);
        });

        it('should return false when called without arguments', function () {
            expect(sdk.Item.isItem()).to.be(false);
        });
    });
});
