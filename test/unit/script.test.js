var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Script = require('../../lib/index.js').Script;

/* global describe, it */
describe('Script', function () {
    var rawScript = fixtures.collectionV2.event[1].script,
        script = new Script(rawScript);

    it('parsed successfully', function () {
        expect(script).to.be.ok();
        expect(script).to.be.an('object');
    });

    describe('has properties', function () {
        it('exec', function () {
            expect(script).to.have.property('exec');
        });

        it('type', function () {
            expect(script).to.have.property('type', rawScript.type);
        });
    });

    describe('has method', function () {
        describe('toSource', function () {
            it('exists', function () {
                expect(script.toSource).to.be.ok();
                expect(script.toSource).to.be.a('function');
            });

            it('works as expected', function () {
                var source = script.toSource();

                expect(source).to.be.a('string');
                expect(source).to.be(rawScript.exec);
            });
        });
    });
});
