/**
 * @fileOverview Ensures nsprc is as expected
 */

var expect = require('expect.js'),
    fs = require('fs'),
    _ = require('lodash');

/* global describe, it, before */
describe('nsprc', function () {
    var nsprc;

    before(function () {
        nsprc = JSON.parse(fs.readFileSync('./.nsprc').toString());
    });

    it('must exist', function () {
        expect(nsprc).to.be.ok();
    });

    it('must not have any exclusion', function () {
        expect(nsprc.exceptions).to.eql([]);
    });

    it('must exclude only a known set of packages (prevent erroneous exclusions)', function () {
        expect(nsprc.exclusions).to.be.empty();
    });

    it('dependency version in package.json should match .nsprc (time to remove exclusion?)', function () {
        var pkg = _.pick(require('../../package').dependencies, _.keys(nsprc.exclusions));
        expect(pkg).to.eql(nsprc.exclusions);
    });
});
