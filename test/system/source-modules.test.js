/* global describe, it */
var fs = require('fs'),
    expect = require('expect.js'),
    _ = require('lodash'),

    sdk = require('../../lib'),
    _if = function (module, modules) {
        return _.indexOf(modules, module) > -1;
    },

    BASELESS_MODULES = ['Description'],
    SCHEMALESS_MODULES = ['EventList', 'FormParam', 'PropertyBase', 'PropertyList', 'Property', 'ProxyConfigList', 'QueryParam',
        'RequestAuth', 'RequestBody', 'VariableList', 'VariableScope', 'RequestAuthHandler'];

describe('collection module', function () {
    var modules = require('require-all')({
            dirname: __dirname + '/../../lib/collection',
            excludeDirs: /^\.(git|svn)$/,
            recursive: true
        }),
        schemas = fs.readdirSync(__dirname + '/../../lib/schema').filter(function (file) {
            return (/^.*\.json$/g).test(file);
        }).map(function (file) {
            return file.replace(/\.json$/, '');
        });

    modules = _.mapValues(modules, function (value, key) {
        var name = (key.substr(0, 1).toUpperCase() + key.substr(1)).replace(/-([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });

        return {
            module: value,
            property: value[name],
            file: key,
            name: name
        };
    });

    Object.keys(modules).forEach(function (file) {
        describe(modules[file].name, function () {
            var meta = modules[file],
                Module = meta.property;

            it('must be exported in the SDK', function () {
                expect(sdk[meta.name]).to.be.ok();
            });

            it('must have its name defined in the constructor', function () {
                expect(Module._postman_propertyName).to.be(meta.name);
            });

            !_if(meta.name, SCHEMALESS_MODULES) && it('must have an associated schema file', function () {
                expect(schemas.indexOf(meta.file) > -1).to.be.ok();
            });

            it('must be constructed with no parameter', function () {
                var err;

                try {
                    // eslint-disable-next-line no-new
                    new Module();
                }
                catch (e) {
                    err = e;
                }

                expect(err).to.not.be.ok();
            });

            !_if(meta.name, BASELESS_MODULES) && it('must inherit from PropertyBase', function () {
                expect((new Module()) instanceof modules['property-base'].property).to.be.ok();
            });

            _if(meta.name, BASELESS_MODULES) && it('must not inherit from PropertyBase', function () {
                expect((new Module()) instanceof modules['property-base'].property).to.not.be.ok();
            });
        });
    });
});
