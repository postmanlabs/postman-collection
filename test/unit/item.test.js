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

    describe('.getAuth()', function () {
        var item,
            folder,
            collection,
            itemWithAuth,
            folderWithAuth,
            collectionWithAuth;

        // Create building blocks which we can use in different combinations for the tests.
        beforeEach(function () {
            collection = new sdk.Collection();
            collectionWithAuth = new sdk.Collection({
                auth: { type: 'basic', basic: { username: 'c', password: 'd' } }
            });
            item = new sdk.Item({ name: 'item1', request: 'https://postman-echo.com/get' });
            folder = new sdk.ItemGroup({ name: 'folder1' });
            itemWithAuth = new sdk.Item({
                name: 'item2',
                request: {
                    url: 'https://postman-echo.com/get',
                    auth: { type: 'basic', basic: { username: 'a', password: 'b' } }
                }
            });
            folderWithAuth = new sdk.ItemGroup({ name: 'folder2', auth: { type: 'hawk', hawk: {} } });
        });

        afterEach(function () {
            collection = null;
            item = null;
            folder = null;
            itemWithAuth = null;
            folderWithAuth = null;
        });

        it('should lookup auth method from parent folder', function () {
            folderWithAuth.items.add(item);
            collection.items.add(folderWithAuth);

            var auth = item.getAuth();

            expect(auth.constructor.name).to.eql('HawkAuth');
        });

        it('should lookup auth method from collection, if absent in folder and item', function () {
            folder.items.add(item);
            collectionWithAuth.items.add(folder);

            var auth = item.getAuth();

            expect(auth.username).to.eql('c');
            expect(auth.password).to.eql('d');
            expect(auth.constructor.name).to.eql('BasicAuth');
        });


        it('should lookup auth method, if present in item', function () {
            folder.items.add(itemWithAuth);
            collectionWithAuth.items.add(folder);

            var auth = itemWithAuth.getAuth();

            expect(auth.username).to.eql('a');
            expect(auth.password).to.eql('b');
            expect(auth.constructor.name).to.eql('BasicAuth');
        });

        it('should return undefined if no auth is present', function () {
            folder.items.add(item);
            collection.items.add(folder);

            var auth = item.getAuth();

            expect(auth).to.be(undefined);
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
