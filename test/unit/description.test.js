var expect = require('chai').expect,
    fixtures = require('../fixtures'),
    Description = require('../../lib/index.js').Description;

describe('Description', function () {
    var rawDescription = fixtures.collectionV2.item[0].description,
        description = new Description(rawDescription);

    describe('sanity', function () {
        it('initializes successfully', function () {
            expect(description).to.be.ok;
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
                expect(description).to.have.property('toString').that.is.a('function');
            });
        });
    });

    describe('json representation', function () {
        it('must match what the description was initialized with', function () {
            var jsonified = description.toJSON();

            expect(jsonified).to.deep.include({
                content: rawDescription.content,
                type: rawDescription.type || 'text/plain'
            });
        });
    });

    describe('isDescription', function () {
        var rawDescription = {
            content: '<h1>This is H1</h1> <i>italic</i> <script>this will be dropped in toString()</script>',
            version: '2.0.1-abc+efg'
        };

        it('should return true for a description instance', function () {
            expect(Description.isDescription(new Description(rawDescription))).to.be.true;
        });

        it('should return false for a raw description object', function () {
            expect(Description.isDescription(rawDescription)).to.be.false;
        });

        it('should return false when called without arguments', function () {
            expect(Description.isDescription()).to.be.false;
        });
    });

    describe('.toString', function () {
        it('should return stringified description content', function () {
            var description = new Description({
                content: '<%= Description %>',
                type: 'text/plain'
            });

            expect(description.toString()).to.equal('<%= Description %>');
        });

        it('should return an empty string for falsy input', function () {
            expect(new Description().toString()).to.equal('');
        });
    });
});
