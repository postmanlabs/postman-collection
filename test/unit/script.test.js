var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Script = require('../../lib/index.js').Script;

/* global describe, it */
describe('Script', function () {
    var rawScript = fixtures.collectionV2.event[1].script,
        script = new Script(rawScript);

    describe('isScript', function () {
        it('must distinguish between scripts and other objects', function () {
            var script = new Script(),
                nonScript = {};

            expect(Script.isScript(script)).to.be(true);
            expect(Script.isScript(nonScript)).to.be(false);
        });
    });

    describe('json representation', function () {
        it('must match what the script was initialized with', function () {
            var jsonified = script.toJSON();
            expect(jsonified.type).to.eql(rawScript.type);
            expect(jsonified.src).to.eql(rawScript.src);
            expect(jsonified.exec).to.eql(rawScript.exec.split('\n'));
        });
    });
});
