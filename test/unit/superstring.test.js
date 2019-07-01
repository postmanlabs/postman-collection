var _ = require('lodash'),
    expect = require('chai').expect,
    faker = require('faker/locale/en'),
    fakermap = require('../../lib/superstring/faker-map'),
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
            describe('$randomInt', function () {
                it('should work correctly', function () {
                    expect(Substitutor.DEFAULT_VARS.$randomInt()).to.be.within(0, 1000);
                });
            });

            describe('faker variables', function () {
                it('should resolve (sampled)', function () {
                    expect(Substitutor.DEFAULT_VARS.$randomProductMaterial).to.be.a('function');
                });
            });
        });
    });

    describe('Faker Map', function () {
        it('should contain required generators', function () {
            _.forOwn(fakermap, function (extension) {
                var generator = _.get(faker, extension);
                expect(generator).to.be.a('function');
            });
        });

        it('should not have duplicates for same faker method', function () {
            var generatorSet = [];

            _.forOwn(fakermap, function (extension, name) {
                expect(generatorSet[extension]).to.be.undefined;
                generatorSet[extension] = name;
            });
        });

        it('should not include generators that are incomplete', function () {
            _.forOwn(fakermap, function (extension) {
                var generator = _.get(faker, extension);
                expect(generator()).to.not.be.undefined;
            });
        });
    });
});
