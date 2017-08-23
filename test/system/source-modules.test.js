/* global describe, it */
var fs = require('fs'),
    path = require('path'),

    _ = require('lodash'),
    expect = require('expect.js'),

    sdk = require('../../lib'),

    BASELESS_MODULES = ['Description'],
    SCHEMALESS_MODULES = ['EventList', 'FormParam', 'PropertyBase', 'PropertyList', 'Property', 'ProxyConfigList',
        'QueryParam', 'RequestAuth', 'RequestBody', 'VariableList', 'VariableScope', 'RequestAuthBase'];

describe('collection module', function () {
    var modules = require('require-all')({
            dirname: path.join(__dirname, '/../../lib/collection'),
            excludeDirs: /^\.(git|svn)$/,
            recursive: true
        }),
        schemas = fs.readdirSync(path.join(__dirname, '/../../lib/schema')).filter(function (file) {
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

            !_.includes(SCHEMALESS_MODULES, meta.name) && it('must have an associated schema file', function () {
                expect(_.includes(schemas, meta.file)).to.be.ok();
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

            !_.includes(BASELESS_MODULES, meta.name) && it('must inherit from PropertyBase', function () {
                expect((new Module()) instanceof modules['property-base'].property).to.be.ok();
            });

            _.includes(BASELESS_MODULES, meta.name) && it('must not inherit from PropertyBase', function () {
                expect((new Module()) instanceof modules['property-base'].property).to.not.be.ok();
            });
        });
    });
});
