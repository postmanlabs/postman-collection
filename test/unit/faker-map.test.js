var _ = require('lodash'),
    expect = require('chai').expect,
    faker = require('faker/locale/en'),
    fakermap = require('../../lib/superstring/faker-map');

describe('Faker Map', function () {
    it('should contain required generators', function () {
        _.forOwn(fakermap, function (extension) {
            var generator = _.get(faker, extension);
            expect(generator).to.be.a('function');
        });
    });
});
