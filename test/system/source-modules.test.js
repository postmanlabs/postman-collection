const path = require('path'),
    _ = require('lodash'),
    sdk = require('../../lib'),
    expect = require('chai').expect,

    BASELESS_MODULES = ['Description'];

describe('collection module', function () {
    var modules = require('require-all')({
        dirname: path.join(__dirname, '/../../lib/collection'),
        excludeDirs: /^\.(git|svn)$/,
        recursive: true
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

            it('should be exported in the SDK', function () {
                expect(sdk[meta.name]).to.be.ok;
            });

            it('should have its name defined in the constructor', function () {
                expect(Module._postman_propertyName).to.equal(meta.name);
            });

            it('should be constructed with no parameter', function () {
                var err;

                try {
                    // eslint-disable-next-line no-new
                    new Module();
                }
                catch (e) {
                    err = e;
                }

                expect(err).to.be.undefined;
            });

            !_.includes(BASELESS_MODULES, meta.name) && it('should inherit from PropertyBase', function () {
                expect((new Module()) instanceof modules['property-base'].property).to.be.ok;
            });

            _.includes(BASELESS_MODULES, meta.name) && it('should not inherit from PropertyBase', function () {
                expect((new Module()) instanceof modules['property-base'].property).to.be.false;
            });
        });
    });
});
