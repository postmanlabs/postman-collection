var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Sdk = require('../../lib/index.js');

/* global describe, it */
describe('Item', function () {
    var rawItem = fixtures.collectionV2.item[0],
        item = new Sdk.Item(rawItem);

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

    describe('.parentOf', function () {
        it('must return a falsy result for a standalone item', function () {
            expect(item.parentOf()).to.not.be.ok();
        });

        it('must correctly return the parent for a provided item', function () {
            var collection = new Sdk.Collection(fixtures.collectionV2);

            collection.forEachItem(function (item) {
                var parent = item.parentOf();

                if (!parent.parentOf()) {
                    expect(parent.id).to.be.ok(collection.id);
                    expect(parent.name).to.be(collection.name);
                }
            });
        });
    });
});
