var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Description = require('../../lib/index.js').Description;

/* global describe, it */
describe('Description', function () {
    var rawDescription = fixtures.collectionV2.item[0].description,
        description = new Description(rawDescription);

    describe('sanity', function () {
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

    describe('.toString', function () {
        it('should correctly handle markdown', function () {
            var description = new Description({
                content: '# Description',
                type: 'text/markdown'
            });

            expect(description.toString()).to.be('Description\n');
        });

        it('should correctly handle HTML', function () {
            var description = new Description({
                content: '<h1>Description</h1><form><input /></form>',
                type: 'text/html'
            });

            expect(description.toString()).to.be('<h1>Description</h1>');
        });

        it('should escape HTML for arbitrary formats', function () {
            var description = new Description({
                content: '<%= template %>',
                type: 'text/random'
            });

            expect(description.toString()).to.be('&lt;%= template %&gt;');
        });

        it('should return an empty string for falsy input', function () {
            expect(new Description().toString()).to.be('');
        });
    });
});
