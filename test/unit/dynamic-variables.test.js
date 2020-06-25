var _ = require('lodash'),
    dynamicVariables = require('../../lib/superstring/dynamic-variables'),
    expect = require('chai').expect;

describe('Dynamic variable', function () {
    it('should have all attributes', function () {
        expect(dynamicVariables).to.be.an('object');
        _.forOwn(dynamicVariables, function (dynamicVariable) {
            expect(dynamicVariable).to.be.an('object');
            expect(dynamicVariable.description).to.be.a('string');
            expect(dynamicVariable.generator).to.be.a('function');
        });
    });

    describe('generator', function () {
        it('should return random data', function () {
            _.forOwn(dynamicVariables, function (variable) {
                expect(variable.generator()).to.not.be.undefined;
            });
        });

        it('should start with $', function () {
            _.forOwn(dynamicVariables, function (variable, name) {
                expect(name[0]).to.equal('$');
            });
        });

        it('$randomInt should return a random number', function () {
            expect(dynamicVariables.$randomInt.generator()).to.be.within(0, 1000);
        });

        it('$timeStamp should return a valid timestamp', function () {
            expect(dynamicVariables.$timestamp.generator()).to.be.a('number');
        });

        it('$isoTimestamp returns a timestamp in ISO format', function () {
            var isoTimestamp = dynamicVariables.$isoTimestamp.generator(),
                // eslint-disable-next-line security/detect-non-literal-regexp
                regex = new RegExp('^(-?(?:[1-9][0-9]*)?[0-9]{4})' + // match year
                    '-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])' + // match month and day
                    'T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$'); // match time

            expect(isoTimestamp).to.be.a('string');
            expect(isoTimestamp).to.match(regex);
        });

        it('$guid should return a valid uuid', function () {
            expect(dynamicVariables.$guid.generator())
                .to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });

        it('$randomPhoneNumber returns a random phone number without extension', function () {
            var phone1 = dynamicVariables.$randomPhoneNumber.generator(),
                phone2 = dynamicVariables.$randomPhoneNumber.generator();

            expect(phone1.length).to.equal(12);
            expect(phone2.length).to.equal(12);
            expect(phone1).to.not.equal(phone2);
        });

        it('$randomLocale returns a random locale', function () {
            var locale1 = dynamicVariables.$randomLocale.generator(),
                locale2 = dynamicVariables.$randomLocale.generator();

            expect(locale1.length).to.be.at.least(2).and.at.most(3);
            expect(locale2.length).to.be.at.least(2).and.at.most(3);
            expect(locale1).to.not.equal(locale2);
        });

        it('$randomPhoneNumberExt returns a random phone number with extension', function () {
            var phone1 = dynamicVariables.$randomPhoneNumberExt.generator(),
                phone2 = dynamicVariables.$randomPhoneNumberExt.generator();

            expect(phone1.length).to.be.at.least(14);
            expect(phone2.length).to.be.at.least(14);
            expect(phone1).to.not.equal(phone2);
        });

        it('$randomWords returns some random numbers', function () {
            var words = dynamicVariables.$randomWords.generator(),
                wordsArray = words.split(' ');

            expect(words).to.not.be.null;
            expect(wordsArray.length).to.be.at.least(2);
        });

        it('$randomFilePath returns a file path', function () {
            var filePath = dynamicVariables.$randomFilePath.generator();

            expect(filePath).to.not.be.undefined;
            expect(filePath).to.not.be.null;
        });

        it('$randomDirectoryPath returns a directory path', function () {
            var directoryPath = dynamicVariables.$randomDirectoryPath.generator();

            expect(directoryPath).to.not.be.undefined;
            expect(directoryPath).to.not.be.null;
        });
    });
});
