var expect = require('chai').expect,
    SuperString = require('../../lib/superstring').SuperString,
    Substitutor = require('../../lib/superstring').Substitutor;

describe('String utilities', function () {
    describe('SuperString', function () {
        describe('sanity', function () {
            it('should correctly default to the .toString value for non string types', function () {
                var supStr = new SuperString([1, 2, 3]);

                expect(supStr.valueOf()).to.equal('1,2,3');
            });

            it('should correctly default to an empty string as a fallback', function () {
                var supStr = new SuperString(Object.create(null)); // A null prototyped object does not have .toString

                expect(supStr.valueOf()).to.equal('');
            });
        });
    });

    describe('Substitutor', function () {
        describe('default vars', function () {
            it('should not be empty', function () {
                expect(Substitutor.DEFAULT_VARS).to.not.be.empty;
            });
        });
    });
});
