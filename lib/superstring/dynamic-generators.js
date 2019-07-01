var faker = require('faker/locale/en');

// generators for $random* variables
module.exports = {

    // faker.phone.phoneNumber returns phone number with or without extension randomly. this only returns a phone
    // number without extension.
    PhoneNumber: function () {
        return faker.phone.phoneNumberFormat(0);
    },

    // faker.phone.phoneNumber returns phone number with or without extension randomly. this only returns a phone
    // number with extension.
    PhoneNumberExt: function () {
        var extensionOptions = ['#', '##', '###', '1-###'];

        // @todo may return +0 or +08 as extension
        return '+' + faker.helpers.replaceSymbolWithNumber(faker.random.arrayElement(extensionOptions)) + '-'
            + faker.phone.phoneNumberFormat(0);
    },

    // faker's random.locale only returns 'en'. this returns from a list of random locales
    Locale: function () {
        // locale list generated from: http://www.loc.gov/standards/iso639-2/php/code_list.php
        var locales = ['aa', 'ab', 'af', 'ak', 'am', 'ar', 'an', 'as', 'av', 'ae', 'ay', 'az', 'ba', 'bm', 'be',
            'bn', 'bh', 'bi', 'bs', 'br', 'bg', 'ca', 'ch', 'ce', 'cu', 'cv', 'kw', 'co', 'cr', 'da', 'dv', 'dz',
            'en', 'eo', 'et', 'ee', 'fo', 'fj', 'fi', 'fy', 'ff', 'gd', 'ga', 'gl', 'gv', 'gn', 'gu', 'ht', 'ha',
            'he', 'hz', 'hi', 'ho', 'hr', 'hu', 'ig', 'io', 'ii', 'iu', 'ie', 'ia', 'id', 'ik', 'it', 'jv', 'ja',
            'kl', 'kn', 'ks', 'kr', 'kk', 'km', 'ki', 'rw', 'ky', 'kv', 'kg', 'ko', 'kj', 'ku', 'lo', 'la', 'lv',
            'li', 'ln', 'lt', 'lb', 'lu', 'lg', 'mh', 'ml', 'mr', 'mg', 'mt', 'mn', 'na', 'nv', 'nr', 'nd', 'ng',
            'ne', 'nn', 'nb', 'no', 'ny', 'oc', 'oj', 'or', 'om', 'os', 'pa', 'pi', 'pl', 'pt', 'ps', 'qt', 'qu',
            'rm', 'rn', 'ru', 'sg', 'sa', 'si', 'sl', 'se', 'sm', 'sn', 'sd', 'so', 'st', 'es', 'sc', 'sr', 'ss',
            'su', 'sw', 'sv', 'ty', 'ta', 'tt', 'te', 'tg', 'tl', 'th', 'ti', 'to', 'tn', 'ts', 'tk', 'tr', 'tw',
            'ug', 'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'wo', 'xh', 'yi', 'yo', 'za', 'zu'];

        return faker.random.arrayElement(locales);
    },

    // fakers' random.words returns random number of words between 1, 3. this returns number of words between 2, 5.
    Words: function () {
        var words = [],
            count = faker.random.number({ min: 2, max: 5 }),
            i;

        for (i = 0; i < count; i++) {
            words.push(faker.random.word());
        }

        return words.join(' ');
    }
};
