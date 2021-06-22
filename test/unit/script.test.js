var expect = require('chai').expect,
    fixtures = require('../fixtures'),
    sdk = require('../../lib/index.js'),
    Url = sdk.Url,
    Script = sdk.Script;

describe('Script', function () {
    var rawScript = fixtures.collectionV2.event[1].script,
        script = new Script(rawScript);

    describe('constructor', function () {
        it('should handle the src property correctly', function () {
            var script = new Script({
                src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js'
            });

            expect(script).to.not.have.property('exec');
            expect(Url.isUrl(script.src)).to.be.true;
        });

        it('should default to undefined for script code if neither an array of strings or a string is provided',
            function () {
                var script = new Script({ exec: 123 });

                expect(script).to.have.property('exec', undefined);
            });

        it('should handle ids', function () {
            var script1 = new Script(),
                script2 = new Script({ id: 'ID1' });

            expect(script1).to.have.property('id');
            expect(script2).to.have.property('id', 'ID1');
        });
    });

    describe('sanity', function () {
        var rawScript = fixtures.collectionV2.event[1].script,
            script = new Script(rawScript);

        it('parsed successfully', function () {
            expect(script).to.be.ok;
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
                    expect(script.toSource).to.be.ok;
                    expect(script.toSource).to.be.a('function');
                });

                it('works as expected', function () {
                    var source = script.toSource();

                    expect(source).to.be.a('string');
                    expect(source).to.equal(rawScript.exec);
                });
            });
        });
    });

    describe('isScript', function () {
        it('must distinguish between scripts and other objects', function () {
            var script = new Script(),
                nonScript = {};

            expect(Script.isScript(script)).to.be.true;
            expect(Script.isScript({})).to.be.false;
            expect(Script.isScript(nonScript)).to.be.false;
        });
    });

    describe('Variadic formats', function () {
        it('should support non-wrapped strings', function () {
            var script = new Script('console.log("This is a line of test script code");'),
                scriptJSON = script.toJSON();

            expect(scriptJSON).to.have.property('id');
            expect(scriptJSON).to.deep.include({
                type: 'text/javascript',
                exec: ['console.log("This is a line of test script code");']
            });
        });

        it('should support non-wrapped arrays', function () {
            var script = new Script(['console.log("This is a line of test script code");']),
                scriptJSON = script.toJSON();

            expect(scriptJSON).to.have.property('id');
            expect(scriptJSON).to.deep.include({
                type: 'text/javascript',
                exec: ['console.log("This is a line of test script code");']
            });
        });
    });

    describe('updates', function () {
        it('should not create new ids', function () {
            var script1 = new Script('old script'),
                script2 = new Script({ id: 'ID1' }),
                script1BeforeId = script1.id,
                script2BeforeId = script2.id;

            script1.update('new script');
            expect(script1.id).to.equal(script1BeforeId);
            script1.update({ exec: 'new script' });
            expect(script1.id).to.equal(script1BeforeId);

            script2.update('new script');
            expect(script2.id).to.equal(script2BeforeId);
            script2.update({ exec: 'new script' });
            expect(script2.id).to.equal(script2BeforeId);
        });

        it('should handle the src property correctly', function () {
            var script = new Script();

            script.update({
                src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js'
            });

            expect(script).to.not.have.property('exec');
            expect(Url.isUrl(script.src)).to.be.true;
        });

        it('should default to undefined for script code if neither an array of strings or a string is provided',
            function () {
                var script = new Script();

                script.update({ exec: 123 });
                expect(script).to.have.property('exec', undefined);

                script.update(null);
                expect(script).to.have.property('exec', undefined);
            });

        describe('Variadic formats', function () {
            it('should support non-wrapped strings', function () {
                var script = new Script(),
                    scriptJSON;

                script.update('console.log("This is a line of test script code");');
                scriptJSON = script.toJSON();

                expect(scriptJSON).to.have.property('id');
                expect(scriptJSON).to.deep.include({
                    type: 'text/javascript',
                    exec: ['console.log("This is a line of test script code");']
                });
            });

            it('should support non-wrapped arrays', function () {
                var script = new Script(),
                    scriptJSON;

                script.update(['console.log("This is a line of test script code");']);

                scriptJSON = script.toJSON();

                expect(scriptJSON).to.have.property('id');
                expect(scriptJSON).to.deep.include({
                    type: 'text/javascript',
                    exec: ['console.log("This is a line of test script code");']
                });
            });
        });
    });


    describe('.toSource', function () {
        it('should correctly unparse an array of exec strings', function () {
            var script = new Script({
                type: 'text/javascript',
                exec: ['console.log("Foo isn\'t bar!");']
            });

            expect(script.toSource()).to.equal('console.log("Foo isn\'t bar!");');
        });

        it('should return undefined for a malformed script', function () {
            var script = new Script({ type: 'text/javascript' });

            expect(script.toSource()).to.be.undefined;
        });
    });

    describe('json representation', function () {
        it('must match what the script was initialized with', function () {
            var jsonified = script.toJSON();

            expect(jsonified).to.deep.include({
                type: rawScript.type,
                exec: rawScript.exec.split('\n')
            });
            expect(jsonified.src).to.eql(rawScript.src);
        });
    });
});
