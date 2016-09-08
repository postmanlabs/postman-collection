var expect = require('expect.js'),
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

    describe('variables', function () {
        it('must be able to sync variables from an object', function () {
            var collection = new Collection();

            collection.syncVariablesFrom({
                var1: 'value1'
            });

            expect(collection.variables.count()).be(1);
            expect(collection.variables.one('var1')).be.ok();
            expect(collection.variables.one('var1').value).be('value1');
        });
    });
});
