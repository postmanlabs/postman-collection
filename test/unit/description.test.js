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
        });
    });

    describe('isDescription', function () {
        var rawDescription = {
            content: '<h1>This is H1</h1> <i>italic</i> <script>this will be dropped in toString()</script>',
            version: '2.0.1-abc+efg'
        };

        it('should return true for a description instance', function () {
            expect(Description.isDescription(new Description(rawDescription))).to.be(true);
        });

        it('should return false for a raw description object', function () {
            expect(Description.isDescription(rawDescription)).to.be(false);
        });

        it('should return false when called without arguments', function () {
            expect(Description.isDescription()).to.be(false);
        });
    });
});
