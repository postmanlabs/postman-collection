var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Script = require('../../lib/index.js').Script;

/* global describe, it */
describe('Script', function () {
    var rawScript = fixtures.collectionV2.event[1].script,
        script = new Script(rawScript);

    describe('sanity', function () {
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

    describe('isScript', function () {
        it('must distinguish between scripts and other objects', function () {
            var script = new Script(),
                nonScript = {};

            expect(Script.isScript(script)).to.be(true);
            expect(Script.isScript({})).to.be(false);
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
