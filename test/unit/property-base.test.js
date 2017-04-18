var _ = require('lodash'),
    expect = require('expect.js'),
    sdk = require('../../lib/index.js'),

    fixtures = require('../fixtures');

/* global describe, it, beforeEach */
describe('PropertyBase', function () {
    describe('meta properties', function () {
        it('should return all the meta properties', function () {
            var definition = {
                    _postman_one: { a: 'b' },
                    _postman_two: 'something',
                    _three: _.noop
                },
                base = new sdk.PropertyBase(definition);

            expect(base.meta().postman_one).to.eql(definition._postman_one);
            expect(base.meta()).to.have.property('postman_two', definition._postman_two);
            expect(base.meta()).to.have.property('three', definition._three);
        });

        it('should pick given meta properties', function () {
            var definition = {
                    _postman_one: { a: 'b' },
                    _postman_two: 'something',
                    _three: _.noop
                },
                base = new sdk.PropertyBase(definition);

            expect(base.meta('postman_one').postman_one).to.eql(definition._postman_one);
            expect(base.meta('postman_one')).to.not.have.property('postman_two');
            expect(base.meta('postman_one')).to.not.have.property('three');
        });

        it('should be a part of toJSON', function () {
            var definition = {
                    _postman_one: { a: 'b' },
                    _postman_two: 'something',
                    _three: _.noop
                },
                base = new sdk.PropertyBase(definition);

            expect(base).to.have.property('_');
            expect(base._).to.have.property('postman_one');
            expect(base._).to.have.property('postman_two');
        });
    });

    describe('.forEachParent()', function () {
        var collection = new sdk.Collection(fixtures.nestedCollectionV2),
            item = collection.items.members[1].items.members[0].items.members[0];

        it('should set default options correctly when none are specified', function () {
            var chain = [],
                expectedOrder = ['F2', 'F2.F3'];

            item.forEachParent(chain.unshift.bind(chain));
            expect(_.map(chain, 'name')).to.eql(expectedOrder);
        });

        it('should return the collection as well when required', function () {
            var chain = [],
                expectedOrder = ['multi-level-folders-v2', 'F2', 'F2.F3'];

            item.forEachParent({ withRoot: true }, chain.unshift.bind(chain));
            expect(_.map(chain, 'name')).to.eql(expectedOrder);
        });
    });

    describe('.lookup()', function () {
        var util = require('../../lib/util'),
            FakeType,
            // See below for why these are named this way ;-)
            ggggp,
            gggp,
            ggp,
            gp,
            p,
            c;

        FakeType = function (level, value) {
            FakeType.super_.apply(this, arguments);
            this.level = level;
            this.value = value;
        };

        util.lodash.inherit(FakeType, sdk.PropertyBase);

        beforeEach(function () {
            ggggp = new FakeType('great-great-great-grandparent');
            gggp = new FakeType('great-great-grandparent');
            ggp = new FakeType('great-grandparent', 'yo1');
            gp = new FakeType('grandparent');
            p = new FakeType('parent', 'yo2');
            c = new FakeType('child');

            c.__parent = p;
            p.__parent = gp;
            gp.__parent = ggp;
        });

        afterEach(function () {
            ggp = null;
            gp = null;
            p = null;
            c = null;
        });

        it('should be able to look up values from the parent', function () {
            expect(c.lookup('value')).to.eql('yo2');
        });

        it('should be able retrieve the value if stored locally', function () {
            expect(p.lookup('value')).to.eql('yo2');
        });

        it('should return undefined if no value was found', function () {
            expect(gggp.lookup('value')).to.be(undefined);
        });

        it('should return undefined if a random property is provided for lookup', function () {
            expect(gggp.lookup('some-randome-stuff')).to.be(undefined);
        });
    });
});
