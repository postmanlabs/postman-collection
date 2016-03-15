var tv4 = require('tv4'),
    versions = require('./version-manager'),
    utils = require('./utils'),
    nodeUtil = require('util'),
    _ = require('lodash'),

    /**
     * Completely resolves a schema, ensuring that no references remain.
     * @param schemaPath
     * @param schemaDirPath
     * @returns {Object}
     */
    compile = function (schemaPath, schemaDirPath) {
        var schema = utils.removeCommentsAndLoadJSON(schemaPath),
            all = utils.getAllSchemas(schemaDirPath),
            subSchemas = _.omit(all, schema.id);
        schema.definitions = _.mapKeys(subSchemas, function (value, key) {
            if (utils.startsWith(key, '#/definitions/')) {
                return key.replace('#/definitions/', '');
            }
        });
        return schema;
    },

    /**
     * Validates a given JSON file against a bunch of nested schemas.
     * @param inputPath Path to the input JSON File.
     * @param schemaPath Path to the schema which we need to validate against.
     * @param schemaDirPath Path to the directory containing all the schemas
     * @returns {boolean}
     */
    validate = function (inputPath, schemaPath, schemaDirPath) {
        var input = utils.removeCommentsAndLoadJSON(inputPath),
            validator = tv4.freshApi(),
            schema,
            result;
        schema = compile(schemaPath, schemaDirPath);  // true => Completely dereferenced schema
        validator.addSchema(schema);
        result = validator.validate(input, schema);
        !result && console.log(nodeUtil.inspect(validator.error, {
            colors: true,
            depth: 10000
        }));
        if (validator.missing.length) {
            console.log(validator.missing);
            return false;
        }
        return result;
    };

module.exports = {
    validate: validate,
    compile: compile,
    versions: versions
};
