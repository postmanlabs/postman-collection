var faker = require('faker/locale/en'),

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
    ];


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
        return faker.random.number({ min: 1, max: 99 }) + '-' + faker.phone.phoneNumberFormat(0);
    },

    // faker's random.locale only returns 'en'. this returns from a list of random locales
    Locale: function () {
        return faker.random.arrayElement(LOCALES);
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
    },

    // faker's system.filePath retuns nothing. this returns a path for a file.
    FilePath: function () {
        return this.DirectoryPath() + '/' + faker.system.fileName();
    },

    // faker's system.directoryPath retuns nothing. this returns a path for a directory.
    DirectoryPath: function () {
        return faker.random.arrayElement(DIRECTORY_PATHS);
    }
};
