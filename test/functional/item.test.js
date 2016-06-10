var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Item = require('../../lib/index.js').Item;

/* global describe, it */
describe('Item', function () {
    var rawItem = fixtures.collectionV2.item[0],
        item = new Item(rawItem);

    describe('json representation', function () {
        it('must match what the item was initialized with', function () {
            var jsonified = item.toJSON();

            expect(jsonified.id).to.eql(rawItem.id);

            // All of these have their own proper tests
            expect(jsonified).to.have.property('description');
            expect(jsonified).to.have.property('request');
            expect(jsonified).to.have.property('responses');
            expect(jsonified).to.have.property('events');
        });
    });
});
