var _ = require('lodash'),
    expect = require('expect.js'),
    Sdk = require('../../lib/index.js'),

    fixtures = require('../fixtures');

/* global describe, it */
describe('PropertyBase', function () {
    describe('meta properties', function () {
        it('should return all the meta properties', function () {
            var definition = {
                    _postman_one: { a: 'b' },
                    _postman_two: 'something',
                    _three: _.noop
                },
                base = new Sdk.PropertyBase(definition);

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
                base = new Sdk.PropertyBase(definition);

            expect(base.meta('postman_one').postman_one).to.eql(definition._postman_one);
            expect(base.meta('postman_one')).to.not.have.property('postman_two');
            expect(base.meta('postman_one')).to.not.have.property('three');
        });
    });

    describe('forEachParent helper', function () {
        var expectedOrder = ['F2', 'F2.F3'],
            collection = new Sdk.Collection(fixtures.nestedCollectionV2),
            item = collection.items.members[1].items.members[0].items.members[0];

        it('should set default options correctly when none are specified', function () {
            var chain = [];

            item.forEachParent(chain.unshift.bind(chain));
            expect(_.map(chain, 'name')).to.eql(expectedOrder);
        });

        it('should return the collection as well when required', function () {
            var chain = [];

            item.forEachParent({ withRoot: true }, chain.unshift.bind(chain));
            expect(chain.shift().id).to.be(fixtures.nestedCollectionV2.info._postman_id);
            expect(_.map(chain, 'name')).to.eql(expectedOrder);
        });

        describe('singleton options', function () {
            it('should be handled correctly with withRoot set to false', function () {
                var chain = [];

                item.forEachParent(false, chain.unshift.bind(chain));
                expect(_.map(chain, 'name')).to.eql(expectedOrder);
            });

            it('should be handled correctly with withRoot set to true', function () {
                var chain = [];

                item.forEachParent(true, chain.unshift.bind(chain));
                expect(chain.shift().id).to.be(fixtures.nestedCollectionV2.info._postman_id);
                expect(_.map(chain, 'name')).to.eql(expectedOrder);
            });
        });
    });
});
