var fs = require('fs-extra'),
    path = require('path'),
    semver = require('semver'),
    _ = require('lodash'),
    mustache = require('mustache'),

    SCHEMA_DIR = path.join(__dirname, '..', 'schemas'),
    VERSION_URL_TEMPLATE = 'https://schema.getpostman.com/json/collection/{{version}}/',

    allVersions = fs.readdirSync(SCHEMA_DIR).sort(function (versionA, versionB) {
        return (semver.gt(versionA, versionB)) ? versionA : versionB;
    }),

    allVersionSchemaDirMap = _.object(_.map(allVersions, semver.clean), _.map(allVersions, function (version) {
        return path.join(SCHEMA_DIR, version);
    })),

    _versionExists = function (versionString) {
        return _.includes(allVersions, versionString);
    },

    _getVersionDirName = function (version) {
        return 'v' + version;
    },

    _getSchemaDirPath = function (version) {
        return path.join(SCHEMA_DIR, _getVersionDirName(version));
    },

    listVersions = function () {
        allVersions.forEach(function (version) {
            console.log('[*] - %s', version);
        });
    },

    createVersion = function (baseVersion, newVersion) {
        var fromDir,
            toDir,
            schema;

        if (!baseVersion) {
            baseVersion = _.last(allVersions); // take the latest version as the base
        }
        if (!_versionExists(baseVersion)) {
            console.log('No such version: ' + baseVersion);
            console.log('Use the "list" option to see available versions');
            return;
        }
        if (!semver.valid(newVersion, true)) {
            console.log('Invalid new version: ' + newVersion);
            return;
        }
        baseVersion = semver.clean(baseVersion);
        newVersion = semver.clean(newVersion);

        fromDir = allVersionSchemaDirMap[baseVersion];
        toDir = _getSchemaDirPath(newVersion);
        console.log('Creating a new version "%s" using "%s" as the base', newVersion, baseVersion);
        console.log('Copying files from {%s} to {%s}', fromDir, toDir);
        try {
            fs.copySync(fromDir, toDir);
        }
        catch (e) {
            console.log('Unable to create the new version', e);
            return;
        }

        // Replace the version URL
        console.log('Replacing Schema ID URL');
        try {
            schema = JSON.parse(fs.readFileSync(path.join(toDir, 'collection.json')));
            schema.id = mustache.render(VERSION_URL_TEMPLATE, {
                version: _getVersionDirName(newVersion)
            });
            fs.writeFileSync(path.join(toDir, 'collection.json'), JSON.stringify(schema, null, 4));
        }
        catch (e) {
            console.log('Problem overwriting the new URL in created version, ' + toDir, e);
            return;
        }

        console.log('Version Created');
    };

module.exports = {
    list: listVersions,
    create: createVersion
};
