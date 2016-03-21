var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Collection = require('../../lib/index.js').Collection;

/* global describe, it */
describe('Collection', function () {
    describe('isCollection', function () {
        it('must distinguish between collections and other objects', function () {
            var collection = new Collection(),
                nonCollection = {};

            expect(Collection.isCollection(collection)).to.be(true);
            expect(Collection.isCollection(nonCollection)).to.be(false);
        });
    });
});
