var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Description = require('../../lib/index.js').Description;

/* global describe, it */
describe('Description', function () {
    var rawDescription = fixtures.collectionV2.item[0].description,
        description = new Description(rawDescription);

    it('initializes successfully', function () {
        expect(description).to.be.ok();
    });

    describe('has property', function () {
        it('content', function () {
            expect(description).to.have.property('content', rawDescription.content);
        });

        it('type', function () {
            expect(description).to.have.property('type', 'text/plain');
        });
    });

    describe('has method', function () {
        it('Stringificaton (toString)', function () {
            expect(description).to.have.property('toString');
            expect(description.toString).to.be.a('function');
        });
    });
});
