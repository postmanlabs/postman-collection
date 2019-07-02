var _ = require('lodash'),
    dynamicGenerators = require('../../lib/superstring/dynamic-generators'),
    expect = require('chai').expect;

describe('Dynamic variable', function () {
    describe('generator', function () {

        it('should be a function', function () {
            _.forOwn(dynamicGenerators, function (generator) {
                expect(generator).to.be.a('function');
            });
        });

        it('should not be a duplicate', function () {
            var generatorSet = [];

            _.forOwn(dynamicGenerators, function (generator, name) {
                expect(generatorSet[name]).to.be.undefined;
                generatorSet[name] = generator;
            });
        });

        it('should be return random data', function () {
            _.forOwn(dynamicGenerators, function (generator) {
                expect(generator()).to.not.be.undefined;
            });
        });
    });

    describe('randomPhoneNumber', function () {
        it('returns a random phone number without extension', function () {
            var phone1 = dynamicGenerators.randomPhoneNumber(),
                phone2 = dynamicGenerators.randomPhoneNumber();

            expect(phone1.length).to.equal(12);
            expect(phone2.length).to.equal(12);
            expect(phone1).to.not.equal(phone2);
        });
    });

    describe('randomLocale', function () {
        it('returns a random locale', function () {
            var locale1 = dynamicGenerators.randomLocale(),
                locale2 = dynamicGenerators.randomLocale();

            expect(locale1.length).to.equal(2);
            expect(locale2.length).to.equal(2);
            expect(locale1).to.not.equal(locale2);
        });
    });

    describe('randomPhoneNumberExt', function () {
        it('returns a random phone number with extension', function () {
            var phone1 = dynamicGenerators.randomPhoneNumberExt(),
                phone2 = dynamicGenerators.randomPhoneNumberExt();

            expect(phone1.length).to.be.at.least(14);
            expect(phone2.length).to.be.at.least(14);
            expect(phone1).to.not.equal(phone2);
        });
    });

    describe('randomWords', function () {
        it('returns some random numbers', function () {
            var words = dynamicGenerators.randomWords(),
                wordsArray = words.split(' ');

            expect(words).to.not.be.null;
            expect(wordsArray.length).to.be.at.least(2);
        });
    });

    describe('randomFilePath', function () {
        it('returns a file path', function () {
            var filePath = dynamicGenerators.randomFilePath();

            expect(filePath).to.not.be.undefined;
            expect(filePath).to.not.be.null;
        });
    });

    describe('randomDirectoryPath', function () {
        it('returns a directory path', function () {
            var directoryPath = dynamicGenerators.randomDirectoryPath();

            expect(directoryPath).to.not.be.undefined;
            expect(directoryPath).to.not.be.null;
        });
    });
});
