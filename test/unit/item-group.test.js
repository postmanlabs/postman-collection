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

    describe('.parentOf checks', function () {
        it('should work correctly for nested collections', function () {
            var collection = new Collection(fixtures.nestedCollectionV2);

            collection.forEachItemGroup(function (group) {
                var groupIds = [],
                    parentIds = [],
                    parent = group.parentOf();

                while (parent) {
                    parentIds.push(parent.id);
                    expect(parent).to.have.keys(['description', 'id', 'name', 'items', 'events']);
                    parent = parent.parentOf();
                }

                collection.forEachItemGroup(function (item) {
                    groupIds.unshift(item.id);
                });

                // The top most parent is always the collection, check that here
                expect(parentIds.pop()).to.be(collection.id);

                // Check that the parents returned by .parentOf are in the same order as those of the itemGroup list
                _.forEach(parentIds, function (id, index) {
                    expect(id).to.be(groupIds[index]);
                });
            });
        });
    });
});
