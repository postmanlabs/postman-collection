var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Description = require('../../lib/index.js').Description;

/* global describe, it */
describe('Description', function () {
    var rawDescription = fixtures.collectionV2.item[0].description,
        description = new Description(rawDescription);

    describe('json representation', function () {
        it('must match what the description was initialized with', function () {
            var jsonified = description.toJSON();

            expect(jsonified.content).to.eql(rawDescription.content);
            expect(jsonified.type).to.eql(rawDescription.type || 'text/plain');
            expect(jsonified).to.have.property('version');
        });
    });
});
