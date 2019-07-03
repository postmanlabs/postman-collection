var faker = require('faker/locale/en'),
    uuid = require('uuid'),

    // locale list generated from: https://github.com/chromium/chromium/blob/master/ui/base/l10n/l10n_util.cc
    LOCALES = ['af', 'am', 'an', 'ar', 'ast', 'az', 'be', 'bg', 'bh', 'bn', 'br', 'bs', 'ca', 'ceb', 'ckb', 'co', 'cs',
        'cy', 'da', 'de', 'el', 'en', 'eo', 'es', 'et', 'eu', 'fa', 'fi', 'fil', 'fo', 'fr', 'fy', 'ga', 'gd', 'gl',
        'gn', 'gu', 'ha', 'haw', 'he', 'hi', 'hmn', 'hr', 'ht', 'hu', 'hy', 'ia', 'id', 'ig', 'is', 'it', 'ja', 'jv',
        'ka', 'kk', 'km', 'kn', 'ko', 'ku', 'ky', 'la', 'lb', 'ln', 'lo', 'lt', 'lv', 'mg', 'mi', 'mk', 'ml', 'mn',
        'mo', 'mr', 'ms', 'mt', 'my', 'nb', 'ne', 'nl', 'nn', 'no', 'ny', 'oc', 'om', 'or', 'pa', 'pl', 'ps', 'pt',
        'qu', 'rm', 'ro', 'ru', 'sd', 'sh', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'st', 'su', 'sv', 'sw',
        'ta', 'te', 'tg', 'th', 'ti', 'tk', 'to', 'tr', 'tt', 'tw', 'ug', 'uk', 'ur', 'uz', 'vi', 'wa', 'xh', 'yi',
        'yo', 'zh', 'zu'],

    // paths for directories
    DIRECTORY_PATHS = [
        '/Applications',
        '/bin',
        '/boot',
        '/boot/defaults',
        '/dev',
        '/etc',
        '/etc/defaults',
        '/etc/mail',
        '/etc/namedb',
        '/etc/periodic',
        '/etc/ppp',
        '/home',
        '/home/user',
        '/home/user/dir',
        '/lib',
        '/Library',
        '/lost+found',
        '/media',
        '/mnt',
        '/net',
        '/Network',
        '/opt',
        '/opt/bin',
        '/opt/include',
        '/opt/lib',
        '/opt/sbin',
        '/opt/share',
        '/private',
        '/private/tmp',
        '/private/var',
        '/proc',
        '/rescue',
        '/root',
        '/sbin',
        '/selinux',
        '/srv',
        '/sys',
        '/System',
        '/tmp',
        '/Users',
        '/usr',
        '/usr/X11R6',
        '/usr/bin',
        '/usr/include',
        '/usr/lib',
        '/usr/libdata',
        '/usr/libexec',
        '/usr/local/bin',
        '/usr/local/src',
        '/usr/obj',
        '/usr/ports',
        '/usr/sbin',
        '/usr/share',
        '/usr/src',
        '/var',
        '/var/log',
        '/var/mail',
        '/var/spool',
        '/var/tmp',
        '/var/yp'
    ],

    // generators for $random* variables
    dynamicGenerators = {
        guid: function () {
            return uuid.v4();
        },

        timestamp: function () {
            return Math.round(Date.now() / 1000);
        },

        randomInt: function () {
            return ~~(Math.random() * (1000 + 1));
        },

        randomCity: faker.address.city,
        randomStreetName: faker.address.streetName,
        randomStreetAddress: faker.address.streetAddress,
        randomCountry: faker.address.country,
        randomCountryCode: faker.address.countryCode,
        randomLatitude: faker.address.latitude,
        randomLongitude: faker.address.longitude,

        randomColor: faker.commerce.color,
        randomDepartment: faker.commerce.department,
        randomProductName: faker.commerce.productName,
        randomProductAdjective: faker.commerce.productAdjective,
        randomProductMaterial: faker.commerce.productMaterial,
        randomProduct: faker.commerce.product,

        randomCompanyName: faker.company.companyName,
        randomCompanySuffix: faker.company.companySuffix,
        randomCatchPhrase: faker.company.catchPhrase,
        randomBs: faker.company.bs,
        randomCatchPhraseAdjective: faker.company.catchPhraseAdjective,
        randomCatchPhraseDescriptor: faker.company.catchPhraseDescriptor,
        randomCatchPhraseNoun: faker.company.catchPhraseNoun,
        randomBsAdjective: faker.company.bsAdjective,
        randomBsBuzz: faker.company.bsBuzz,
        randomBsNoun: faker.company.bsNoun,

        randomDatabaseColumn: faker.database.column,
        randomDatabaseType: faker.database.type,
        randomDatabaseCollation: faker.database.collation,
        randomDatabaseEngine: faker.database.engine,

        randomDatePast: faker.date.past,
        randomDateFuture: faker.date.future,
        randomDateRecent: faker.date.recent,
        randomMonth: faker.date.month,
        randomWeekday: faker.date.weekday,

        randomBankAccount: faker.finance.account,
        randomBankAccountName: faker.finance.accountName,
        randomCreditCardMask: faker.finance.mask,
        randomPrice: faker.finance.amount,
        randomTransactionType: faker.finance.transactionType,
        randomCurrencyCode: faker.finance.currencyCode,
        randomCurrencyName: faker.finance.currencyName,
        randomCurrencySymbol: faker.finance.currencySymbol,
        randomBitcoin: faker.finance.bitcoinAddress,
        randomBankAccountIban: faker.finance.iban,
        randomBankAccountBic: faker.finance.bic,

        randomAbbreviation: faker.hacker.abbreviation,
        randomAdjective: faker.hacker.adjective,
        randomNoun: faker.hacker.noun,
        randomVerb: faker.hacker.verb,
        randomIngverb: faker.hacker.ingverb,
        randomPhrase: faker.hacker.phrase,

        randomImage: faker.image.image,
        randomAvatarImage: faker.image.avatar,
        randomImageUrl: faker.image.imageUrl,
        randomAbstractImage: faker.image.abstract,
        randomAnimalsImage: faker.image.animals,
        randomBusinessImage: faker.image.business,
        randomCatsImage: faker.image.cats,
        randomCityImage: faker.image.city,
        randomFoodImage: faker.image.food,
        randomNightlifeImage: faker.image.nightlife,
        randomFashionImage: faker.image.fashion,
        randomPeopleImage: faker.image.people,
        randomNatureImage: faker.image.nature,
        randomSportsImage: faker.image.sports,
        randomTechnicsImage: faker.image.technics,
        randomTransportImage: faker.image.transport,
        randomImageDataUri: faker.image.dataUri,

        randomEmail: faker.internet.email,
        randomExampleEmail: faker.internet.exampleEmail,
        randomUserName: faker.internet.userName,
        randomProtocol: faker.internet.protocol,
        randomUrl: faker.internet.url,
        randomDomainName: faker.internet.domainName,
        randomDomainSuffix: faker.internet.domainSuffix,
        randomDomainWord: faker.internet.domainWord,
        randomIP: faker.internet.ip,
        randomIPV6: faker.internet.ipv6,
        randomUserAgent: faker.internet.userAgent,
        randomHexColor: faker.internet.color,
        randomMACAddress: faker.internet.mac,
        randomPassword: faker.internet.password,

        randomLoremWord: faker.lorem.word,
        randomLoremWords: faker.lorem.words,
        randomLoremSentence: faker.lorem.sentence,
        randomLoremSlug: faker.lorem.slug,
        randomLoremSentences: faker.lorem.sentences,
        randomLoremParagraph: faker.lorem.paragraph,
        randomLoremParagraphs: faker.lorem.paragraphs,
        randomLoremText: faker.lorem.text,
        randomLoremLines: faker.lorem.lines,

        randomFirstName: faker.name.firstName,
        randomLastName: faker.name.lastName,
        randomFullName: faker.name.findName,
        randomJobTitle: faker.name.jobTitle,
        randomNamePrefix: faker.name.prefix,
        randomNameSuffix: faker.name.suffix,
        randomJobDescriptor: faker.name.jobDescriptor,
        randomJobArea: faker.name.jobArea,
        randomJobType: faker.name.jobType,

        randomUUID: faker.random.uuid,
        randomBoolean: faker.random.boolean,
        randomWord: faker.random.word,
        randomAlphaNumeric: faker.random.alphaNumeric,

        randomFileName: faker.system.fileName,
        randomCommonFileName: faker.system.commonFileName,
        randomMimeType: faker.system.mimeType,
        randomCommonFileType: faker.system.commonFileType,
        randomCommonFileExt: faker.system.commonFileExt,
        randomFileType: faker.system.fileType,
        randomFileExt: faker.system.fileExt,
        randomSemver: faker.system.semver,

        // faker.phone.phoneNumber returns phone number with or without
        // extension randomly. this only returns a phone number without extension.
        randomPhoneNumber: function () {
            return faker.phone.phoneNumberFormat(0);
        },

        // faker.phone.phoneNumber returns phone number with or without
        // extension randomly. this only returns a phone number with extension.
        randomPhoneNumberExt: function () {
            return faker.random.number({ min: 1, max: 99 }) + '-' + faker.phone.phoneNumberFormat(0);
        },

        // faker's random.locale only returns 'en'. this returns from a list of
        // random locales
        randomLocale: function () {
            return faker.random.arrayElement(LOCALES);
        },

        // fakers' random.words returns random number of words between 1, 3.
        // this returns number of words between 2, 5.
        randomWords: function () {
            var words = [],
                count = faker.random.number({ min: 2, max: 5 }),
                i;

            for (i = 0; i < count; i++) {
                words.push(faker.random.word());
            }

            return words.join(' ');
        },

        // faker's system.filePath retuns nothing. this returns a path for a file.
        randomFilePath: function () {
            return dynamicGenerators.randomDirectoryPath() + '/' + faker.system.fileName();
        },

        // faker's system.directoryPath retuns nothing. this returns a path for
        // a directory.
        randomDirectoryPath: function () {
            return faker.random.arrayElement(DIRECTORY_PATHS);
        }
    };

module.exports = dynamicGenerators;
