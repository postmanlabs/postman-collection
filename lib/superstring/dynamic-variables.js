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
        $guid: {
            description: 'Generates a v4 style guid',
            generator: function () {
                return uuid.v4();
            }
        },

        $timestamp: {
            description: 'Generates the current timestamp',
            generator: function () {
                return Math.round(Date.now() / 1000);
            }
        },

        $randomInt: {
            description: 'Generates a random integer between 1 and 1000',
            generator: function () {
                return ~~(Math.random() * (1000 + 1));
            }
        },

        // faker.phone.phoneNumber returns phone number with or without
        // extension randomly. this only returns a phone number without extension.
        $randomPhoneNumber: {
            description: 'Generates a random phone number',
            generator: function () {
                return faker.phone.phoneNumberFormat(0);
            }
        },

        // faker.phone.phoneNumber returns phone number with or without
        // extension randomly. this only returns a phone number with extension.
        $randomPhoneNumberExt: {
            description: 'Generates a random phone number with extension',
            generator: function () {
                return faker.random.number({ min: 1, max: 99 }) + '-' + faker.phone.phoneNumberFormat(0);
            }
        },

        // faker's random.locale only returns 'en'. this returns from a list of
        // random locales
        $randomLocale: {
            description: 'Generates a random locale',
            generator: function () {
                return faker.random.arrayElement(LOCALES);
            }
        },

        // fakers' random.words returns random number of words between 1, 3.
        // this returns number of words between 2, 5.
        $randomWords: {
            description: 'Generates some random words',
            generator: function () {
                var words = [],
                    count = faker.random.number({ min: 2, max: 5 }),
                    i;

                for (i = 0; i < count; i++) {
                    words.push(faker.random.word());
                }

                return words.join(' ');
            }
        },

        // faker's system.filePath retuns nothing. this returns a path for a file.
        $randomFilePath: {
            description: 'Generates a random path for a file',
            generator: function () {
                return dynamicGenerators.$randomDirectoryPath.generator() + '/' + faker.system.fileName();
            }
        },

        // faker's system.directoryPath retuns nothing. this returns a path for
        // a directory.
        $randomDirectoryPath: {
            description: 'Generates a random directory path',
            generator: function () {
                return faker.random.arrayElement(DIRECTORY_PATHS);
            }
        },

        $randomCity: {
            description: 'Generates a random city',
            generator: faker.address.city
        },
        $randomStreetName: {
            description: 'Generates a random street name',
            generator: faker.address.streetName
        },
        $randomStreetAddress: {
            description: 'Generates a random street address',
            generator: faker.address.streetAddress
        },
        $randomCountry: {
            description: 'Generates a random country',
            generator: faker.address.country
        },
        $randomCountryCode: {
            description: 'Generates a random country code',
            generator: faker.address.countryCode
        },
        $randomLatitude: {
            description: 'Generates a random latitude',
            generator: faker.address.latitude
        },
        $randomLongitude: {
            description: 'Generates a random longitude',
            generator: faker.address.longitude
        },

        $randomColor: {
            description: 'Generates a random color',
            generator: faker.commerce.color
        },
        $randomDepartment: {
            description: 'Generates a random commerce department',
            generator: faker.commerce.department
        },
        $randomProductName: {
            description: 'Generates a random product name',
            generator: faker.commerce.productName
        },
        $randomProductAdjective: {
            description: 'Generates a random product adjective',
            generator: faker.commerce.productAdjective
        },
        $randomProductMaterial: {
            description: 'Generates a random product material',
            generator: faker.commerce.productMaterial
        },
        $randomProduct: {
            description: 'Generates a random product',
            generator: faker.commerce.product
        },

        $randomCompanyName: {
            description: 'Generates a random company name',
            generator: faker.company.companyName
        },
        $randomCompanySuffix: {
            description: 'Generates a random company suffix',
            generator: faker.company.companySuffix
        },
        $randomCatchPhrase: {
            description: 'Generates a random company catchphrase',
            generator: faker.company.catchPhrase
        },
        $randomBs: {
            description: 'Generates a random company Bs',
            generator: faker.company.bs
        },
        $randomCatchPhraseAdjective: {
            description: 'Generates a random catchphrase adjective',
            generator: faker.company.catchPhraseAdjective
        },
        $randomCatchPhraseDescriptor: {
            description: 'Generates a random catchphrase descriptor',
            generator: faker.company.catchPhraseDescriptor
        },
        $randomCatchPhraseNoun: {
            description: 'Generates a random catchphrase noun',
            generator: faker.company.catchPhraseNoun
        },
        $randomBsAdjective: {
            description: 'Generates a random company Bs adjective',
            generator: faker.company.bsAdjective
        },
        $randomBsBuzz: {
            description: 'Generates a random company Bs buzz',
            generator: faker.company.bsBuzz
        },
        $randomBsNoun: {
            description: 'Generates a random company Bs noun',
            generator: faker.company.bsNoun
        },

        $randomDatabaseColumn: {
            description: 'Generates a random database column name',
            generator: faker.database.column
        },
        $randomDatabaseType: {
            description: 'Generates a random database type',
            generator: faker.database.type
        },
        $randomDatabaseCollation: {
            description: 'Generates a random database collation',
            generator: faker.database.collation
        },
        $randomDatabaseEngine: {
            description: 'Generates a random database engine',
            generator: faker.database.engine
        },

        $randomDatePast: {
            description: 'Generates a random past date',
            generator: faker.date.past
        },
        $randomDateFuture: {
            description: 'Generates a random future date',
            generator: faker.date.future
        },
        $randomDateRecent: {
            description: 'Generates a random recent date',
            generator: faker.date.recent
        },
        $randomMonth: {
            description: 'Generates a random month',
            generator: faker.date.month
        },
        $randomWeekday: {
            description: 'Generates a random weekday',
            generator: faker.date.weekday
        },

        $randomBankAccount: {
            description: 'Generates a random bank account',
            generator: faker.finance.account
        },
        $randomBankAccountName: {
            description: 'Generates a random bank account name',
            generator: faker.finance.accountName
        },
        $randomCreditCardMask: {
            description: 'Generates a random masked credit card number',
            generator: faker.finance.mask
        },
        $randomPrice: {
            description: 'Generates a random price',
            generator: faker.finance.amount
        },
        $randomTransactionType: {
            description: 'Generates a random transaction type',
            generator: faker.finance.transactionType
        },
        $randomCurrencyCode: {
            description: 'Generates a random currency code',
            generator: faker.finance.currencyCode
        },
        $randomCurrencyName: {
            description: 'Generates a random currency name',
            generator: faker.finance.currencyName
        },
        $randomCurrencySymbol: {
            description: 'Generates a random currency symbol',
            generator: faker.finance.currencySymbol
        },
        $randomBitcoin: {
            description: 'Generates a random bitcoin address',
            generator: faker.finance.bitcoinAddress
        },
        $randomBankAccountIban: {
            description: 'Generates a random bank account IBAN',
            generator: faker.finance.iban
        },
        $randomBankAccountBic: {
            description: 'Generates a random bank account BIC',
            generator: faker.finance.bic
        },

        $randomAbbreviation: {
            description: 'Generates a random abbreviation',
            generator: faker.hacker.abbreviation
        },
        $randomAdjective: {
            description: 'Generates a random adjective',
            generator: faker.hacker.adjective
        },
        $randomNoun: {
            description: 'Generates a random noun',
            generator: faker.hacker.noun
        },
        $randomVerb: {
            description: 'Generates a random verb',
            generator: faker.hacker.verb
        },
        $randomIngverb: {
            description: 'Generates a random verb ending with an ing',
            generator: faker.hacker.ingverb
        },
        $randomPhrase: {
            description: 'Generates a random phrase',
            generator: faker.hacker.phrase
        },

        $randomImage: {
            description: 'Generates a random image',
            generator: faker.image.image
        },
        $randomAvatarImage: {
            description: 'Generates a random avatar image',
            generator: faker.image.avatar
        },
        $randomImageUrl: {
            description: 'Generates a random image URL',
            generator: faker.image.imageUrl
        },
        $randomAbstractImage: {
            description: 'Generates a random abstract image URL',
            generator: faker.image.abstract
        },
        $randomAnimalsImage: {
            description: 'Generates a random animals image URL',
            generator: faker.image.animals
        },
        $randomBusinessImage: {
            description: 'Generates a random business image URL',
            generator: faker.image.business
        },
        $randomCatsImage: {
            description: 'Generates a random cat image URL',
            generator: faker.image.cats
        },
        $randomCityImage: {
            description: 'Generates a random city image URL',
            generator: faker.image.city
        },
        $randomFoodImage: {
            description: 'Generates a random food image URL',
            generator: faker.image.food
        },
        $randomNightlifeImage: {
            description: 'Generates a random nightlife image URL',
            generator: faker.image.nightlife
        },
        $randomFashionImage: {
            description: 'Generates a random fashion image URL',
            generator: faker.image.fashion
        },
        $randomPeopleImage: {
            description: 'Generates a random people image URL',
            generator: faker.image.people
        },
        $randomNatureImage: {
            description: 'Generates a random nature image URL',
            generator: faker.image.nature
        },
        $randomSportsImage: {
            description: 'Generates a random sports image URL',
            generator: faker.image.sports
        },
        $randomTechnicsImage: {
            description: 'Generates a random technics image URL',
            generator: faker.image.technics
        },
        $randomTransportImage: {
            description: 'Generates a random transport image URL',
            generator: faker.image.transport
        },
        $randomImageDataUri: {
            description: 'Generates a random image data URI',
            generator: faker.image.dataUri
        },

        $randomEmail: {
            description: 'Generates a random email',
            generator: faker.internet.email
        },
        $randomExampleEmail: {
            description: 'Generates a random example email',
            generator: faker.internet.exampleEmail
        },
        $randomUserName: {
            description: 'Generates a random username',
            generator: faker.internet.userName
        },
        $randomProtocol: {
            description: 'Generates a random internet protocol',
            generator: faker.internet.protocol
        },
        $randomUrl: {
            description: 'Generates a random URL',
            generator: faker.internet.url
        },
        $randomDomainName: {
            description: 'Generates a random domain name',
            generator: faker.internet.domainName
        },
        $randomDomainSuffix: {
            description: 'Generates a random domain suffix',
            generator: faker.internet.domainSuffix
        },
        $randomDomainWord: {
            description: 'Generates a random domain word',
            generator: faker.internet.domainWord
        },
        $randomIP: {
            description: 'Generates a random IPv4 address',
            generator: faker.internet.ip
        },
        $randomIPV6: {
            description: 'Generates a random IPv6 address',
            generator: faker.internet.ipv6
        },
        $randomUserAgent: {
            description: 'Generates a random user agent',
            generator: faker.internet.userAgent
        },
        $randomHexColor: {
            description: 'Generates a random hex color',
            generator: faker.internet.color
        },
        $randomMACAddress: {
            description: 'Generates a random MAC address',
            generator: faker.internet.mac
        },
        $randomPassword: {
            description: 'Generates a random password',
            generator: faker.internet.password
        },

        $randomLoremWord: {
            description: 'Generates a random lorem word',
            generator: faker.lorem.word
        },
        $randomLoremWords: {
            description: 'Generates some random lorem words',
            generator: faker.lorem.words
        },
        $randomLoremSentence: {
            description: 'Generates a random lorem sentence',
            generator: faker.lorem.sentence
        },
        $randomLoremSlug: {
            description: 'Generates a random lorem slug',
            generator: faker.lorem.slug
        },
        $randomLoremSentences: {
            description: 'Generates some random lorem sentences',
            generator: faker.lorem.sentences
        },
        $randomLoremParagraph: {
            description: 'Generates a random lorem paragraph',
            generator: faker.lorem.paragraph
        },
        $randomLoremParagraphs: {
            description: 'Generates some random lorem paragraphs',
            generator: faker.lorem.paragraphs
        },
        $randomLoremText: {
            description: 'Generates some random lorem text',
            generator: faker.lorem.text
        },
        $randomLoremLines: {
            description: 'Generates some random lorem lines',
            generator: faker.lorem.lines
        },

        $randomFirstName: {
            description: 'Generates a random first name',
            generator: faker.name.firstName
        },
        $randomLastName: {
            description: 'Generates a random last name',
            generator: faker.name.lastName
        },
        $randomFullName: {
            description: 'Generates a random full name',
            generator: faker.name.findName
        },
        $randomJobTitle: {
            description: 'Generates a random job title',
            generator: faker.name.jobTitle
        },
        $randomNamePrefix: {
            description: 'Generates a random name prefix',
            generator: faker.name.prefix
        },
        $randomNameSuffix: {
            description: 'Generates a random name suffix',
            generator: faker.name.suffix
        },
        $randomJobDescriptor: {
            description: 'Generates a random job descriptor',
            generator: faker.name.jobDescriptor
        },
        $randomJobArea: {
            description: 'Generates a random job area',
            generator: faker.name.jobArea
        },
        $randomJobType: {
            description: 'Generates a random job type',
            generator: faker.name.jobType
        },

        $randomUUID: {
            description: 'Generates a random UUID',
            generator: faker.random.uuid
        },
        $randomBoolean: {
            description: 'Generates a random boolean value (true/false)',
            generator: faker.random.boolean
        },
        $randomWord: {
            description: 'Generates a random word',
            generator: faker.random.word
        },
        $randomAlphaNumeric: {
            description: 'Generates a random alpha-numeric value',
            generator: faker.random.alphaNumeric
        },

        $randomFileName: {
            description: 'Generates a random file name',
            generator: faker.system.fileName
        },
        $randomCommonFileName: {
            description: 'Generates a random common file name',
            generator: faker.system.commonFileName
        },
        $randomMimeType: {
            description: 'Generates a random mime type',
            generator: faker.system.mimeType
        },
        $randomCommonFileType: {
            description: 'Generates a random common file type',
            generator: faker.system.commonFileType
        },
        $randomCommonFileExt: {
            description: 'Generates a random common file extension',
            generator: faker.system.commonFileExt
        },
        $randomFileType: {
            description: 'Generates a random file type',
            generator: faker.system.fileType
        },
        $randomFileExt: {
            description: 'Generates a random file extension',
            generator: faker.system.fileExt
        },
        $randomSemver: {
            description: 'Generates a random semantic version number',
            generator: faker.system.semver
        }
    };

module.exports = dynamicGenerators;
