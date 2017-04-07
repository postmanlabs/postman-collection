var _ = require('lodash'),
    expect = require('expect.js'),
    fixtures = require('../fixtures'),
    sdk = require('../../lib/index.js'),
    Item = sdk.Item,
    ItemGroup = sdk.ItemGroup,
    Collection = sdk.Collection;

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

    it('should not cast incoming items/item groups', function () {
        var collection = new Collection(),
            url = 'https://www.random.org:443/integers/?num=1&min=0&max=255&col=16&base=10&format=plain&rnd=new';

        collection.items.add(new Item({
            request: {
                method: 'GET',
                url: url
            }
        }));
        expect(collection.toJSON().item[0].request.url).to.be(url);
    });

    it('should correctly handle incoming items/item groups and/or plain objects', function () {
        var plain = ItemGroup._createNewGroupOrItem({
                request: {
                    url: 'https://postman-echo.com/get',
                    method: 'GET'
                }
            }),
            item = ItemGroup._createNewGroupOrItem(new sdk.Item({
                request: {
                    url: 'https://postman-echo.com/get',
                    method: 'GET'
                }
            })),
            group = ItemGroup._createNewGroupOrItem(new sdk.ItemGroup({ name: 'Blank folder' }));

        expect(plain).to.be.ok();
        expect(plain.events).to.be.ok();
        expect(plain.responses).to.be.ok();
        expect(plain.request).to.have.property('method', 'GET');
        expect(plain.request.url.path).to.eql(['get']);
        expect(plain.request.url.host).to.eql(['postman-echo', 'com']);

        expect(item).to.be.ok();
        expect(item.events).to.be.ok();
        expect(item.responses).to.be.ok();
        expect(item.request).to.have.property('method', 'GET');
        expect(item.request.url.path).to.eql(['get']);
        expect(item.request.url.host).to.eql(['postman-echo', 'com']);

        expect(_.omit(group.toJSON(), 'id')).to.eql({ name: 'Blank folder', item: [], event: [] });
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

    describe('isItemGroup', function () {
        it('should return true for a ItemGroup instance', function () {
            expect(sdk.ItemGroup.isItemGroup(new sdk.ItemGroup(fixtures.collectionV2.item))).to.be(true);
        });

        it('should return false for a raw ItemGroup object', function () {
            expect(sdk.ItemGroup.isItemGroup(fixtures.collectionV2.item)).to.be(false);
        });

        it('should return false when called without arguments', function () {
            expect(sdk.ItemGroup.isItemGroup()).to.be(false);
        });
    });
});
