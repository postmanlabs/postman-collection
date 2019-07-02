var dynamicGenerators = require('../../lib/superstring/dynamic-generators'),
    expect = require('chai').expect;

describe('Overridden generator', function () {
    describe('PhoneNumber', function () {
        it('returns a random phone number without extension', function () {
            var phone1 = dynamicGenerators.PhoneNumber(),
                phone2 = dynamicGenerators.PhoneNumber();

            expect(phone1.length).to.equal(12);
            expect(phone2.length).to.equal(12);
            expect(phone1).to.not.equal(phone2);
        });
    });

    describe('Locale', function () {
        it('returns a random locale', function () {
            var locale1 = dynamicGenerators.Locale(),
                locale2 = dynamicGenerators.Locale();

            expect(locale1.length).to.equal(2);
            expect(locale2.length).to.equal(2);
            expect(locale1).to.not.equal(locale2);
        });
    });

    describe('PhoneNumberExt', function () {
        it('returns a random phone number with extension', function () {
            var phone1 = dynamicGenerators.PhoneNumberExt(),
                phone2 = dynamicGenerators.PhoneNumberExt();

            expect(phone1.length).to.be.at.least(15);
            expect(phone2.length).to.be.at.least(15);
            expect(phone1).to.not.equal(phone2);
        });
    });

    describe('Words', function () {
        it('returns some random numbers', function () {
            var words = dynamicGenerators.Words(),
                wordsArray = words.split(' ');

            expect(words).to.not.be.null;
            expect(wordsArray.length).to.be.at.least(2);
        });
    });
});

