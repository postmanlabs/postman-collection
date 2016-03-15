var fs = require('fs'),
    strip = require('strip-json-comments'),
    UTF8 = 'utf-8',

    endsWith = function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },

    startsWith = function (str, prefix) {
        return str.slice(0, prefix.length) == prefix;
    },

    removeCommentsAndLoadJSON = function (path) {
        var bytes = fs.readFileSync(path, UTF8);
        return JSON.parse(strip(bytes));
    },

    _getAllSchemasRecurse = function (path, schemas) {
        var stats = fs.lstatSync(path),
            file;

        if (stats.isDirectory()) {
            fs.readdirSync(path).map(function (child) {
                return _getAllSchemasRecurse(path + '/' + child, schemas);
            });
        }
        else {
            if (endsWith(path, '.json')) {
                file = removeCommentsAndLoadJSON(path);
                schemas[file.id] = file;
                if (!file.id) {
                    console.log('WARNING: File: ', path + ' has no id');
                }
            }
        }
    },

    getAllSchemas = function (path) {
        var schemas = {};
        _getAllSchemasRecurse(path, schemas);
        return schemas;
    };

module.exports = {
    removeCommentsAndLoadJSON: removeCommentsAndLoadJSON,
    endsWith: endsWith,
    startsWith: startsWith,
    getAllSchemas: getAllSchemas
};
