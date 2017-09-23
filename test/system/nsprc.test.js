/**
 * @fileOverview Ensures nsprc is as expected
 */

var expect = require('expect.js'),
    fs = require('fs');

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
        expect(nsprc.exceptions).to.eql(['https://nodesecurity.io/advisories/531']);
    });

    it('must exclude only a known set of packages', function () {
        expect(nsprc.exclusions).to.eql(['marked']);
    });
});
