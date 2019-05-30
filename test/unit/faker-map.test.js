var _ = require('lodash'),
    expect = require('chai').expect,
    faker = require('faker/locale/en'),
    fakermap = require('../../lib/superstring/faker-map');

describe.only('Faker Map', function () {
    it('should contain required generators', function () {
        _.forOwn(fakermap, function (extension) {
            var generator = _.get(faker, extension);
            expect(generator).to.be.a('function');
        });
    });

    it('should not have duplicates for same faker method', function () {
        var generatorSet = [];

        _.forOwn(fakermap, function(extension, name) {
            expect(generatorSet[extension]).to.be.undefined;
            generatorSet[extension] = name;
        });
    });
});
