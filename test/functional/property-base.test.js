var expect = require('expect.js'),
    PropertyBase = require('../../lib/index.js').PropertyBase;

/* global describe, it */
describe('PropertyBase', function () {
    describe('meta properties', function () {
        it('should return all the meta properties', function () {
            var definition = {
                    _postman_one: { a: 'b'},
                    _postman_two: 'something',
                    _three: function () {}  // No-Op
                },
                base = new PropertyBase(definition);

            expect(base.meta().postman_one).to.eql(definition._postman_one);
            expect(base.meta()).to.have.property('postman_two', definition._postman_two);
            expect(base.meta()).to.have.property('three', definition._three);
        });

        it('should pick given meta properties', function () {
            var definition = {
                    _postman_one: { a: 'b'},
                    _postman_two: 'something',
                    _three: function () {}  // No-Op
                },
                base = new PropertyBase(definition);

            expect(base.meta('postman_one').postman_one).to.eql(definition._postman_one);
            expect(base.meta('postman_one')).to.not.have.property('postman_two');
            expect(base.meta('postman_one')).to.not.have.property('three');
        });
    });
});
