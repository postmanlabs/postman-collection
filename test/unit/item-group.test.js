var _ = require('lodash'),
    expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Collection = require('../../lib/index.js').Collection;

/* global describe, it */
describe('ItemGroup', function () {
    it('must be able to iterate over all subfolders', function () {
        var rawCollection = fixtures.collectionV2,
            collection = new Collection(rawCollection),
            groups = [];

        collection.forEachItemGroup(function (group) {
            groups.push(group);
        });
        expect(groups.length).to.be(4);
    });

    describe('.parent checks', function () {
        var collection = new Collection(fixtures.nestedCollectionV2);

        it('should work correctly for nested collections', function () {
            collection.forEachItemGroup(function (group) {
                var groupIds = [],
                    parentIds = [],
                    parent = group.parent();

                while (parent) {
                    parentIds.push(parent.id);
                    expect(parent).to.have.keys(['description', 'id', 'name', 'items', 'events']);
                    parent = parent.parent();
                }

                collection.forEachItemGroup(function (item) {
                    groupIds.unshift(item.id);
                });

                // The top most parent is always the collection, check that here
                expect(parentIds.pop()).to.be(collection.id);

                // Check that the parents returned by .parent are in the same order as those of the itemGroup list
                _.forEach(parentIds, function (id, index) {
                    expect(id).to.be(groupIds[index]);
                });
            });
        });

        it('must work correctly for a nested itemGroup', function () {
            var f2 = collection.items.members[1],
                f3 = f2.items.members[0],
                parent = f3.parent();

            expect(parent.name).to.be(f2.name);
        });

        it('must work correctly for a first level itemGroup', function () {
            var f1 = collection.items.members[0],
                parent = f1.parent();

            expect(parent.name).to.be(collection.name);
        });
    });
});
