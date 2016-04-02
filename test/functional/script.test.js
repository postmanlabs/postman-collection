var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Script = require('../../lib/index.js').Script;

/* global describe, it */
describe('Script', function () {
    var rawScript = fixtures.collectionV2.event[1].script,
        script = new Script(rawScript);

    describe('json representation', function () {
        it('must match what the script was initialized with', function () {
            var jsonified = script.toJSON();
            expect(jsonified.type).to.eql(rawScript.type);
            expect(jsonified.src).to.eql(rawScript.src);
            expect(jsonified.exec).to.eql(rawScript.exec.split('\n'));
        });
    });
});
