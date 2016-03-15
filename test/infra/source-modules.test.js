/* global describe, it */
var expect = require('expect.js'),
    _ = require('lodash'),
    sdk = require('../../index'),

    _if = function (module, modules) {
        return _.indexOf(modules, module) > -1;
    },

    BASELESS_MODULES = ['Description'];

describe('collection module', function () {
    var modules = require('require-all')({
        dirname:  __dirname + '/../../lib/collection',
        excludeDirs:  /^\.(git|svn)$/,
        recursive: true,

        map: function (name) {
            name = name.substr(0, 1).toUpperCase() + name.substr(1);
            return name.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
        }
    });

    Object.keys(modules).forEach(function (moduleName) {
        describe(moduleName, function () {
            var Module = modules[moduleName][moduleName];

            it('must be constructed with no parameter', function () {
                var err;

                try {
                    new Module();
                }
                catch (e) {
                    err = e;
                }

                expect(err).to.not.be.ok();
            });

            !_if(moduleName, BASELESS_MODULES) && it('must inherit from base', function () {
                expect((new Module()) instanceof modules.PropertyBase.PropertyBase).to.be.ok();
            });

            it('must be exported in the SDK', function () {
                expect(sdk[moduleName]).to.be.ok();
            });
        });
    });
});
