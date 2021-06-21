const fs = require('fs'),
    yaml = require('js-yaml'),
    expect = require('chai').expect;

describe('travis.yml', function () {
    var travisYAML,
        travisYAMLError;

    try {
        travisYAML = yaml.load(fs.readFileSync('.travis.yml').toString());
    }
    catch (e) {
        travisYAMLError = e;
    }

    it('should exist', function (done) {
        fs.stat('.travis.yml', done);
    });

    it('should be a valid yml', function () {
        expect(travisYAMLError && travisYAMLError.message || travisYAMLError).to.be.undefined;
    });

    describe('strucure', function () {
        it('should have the language set to node', function () {
            expect(travisYAML).to.have.property('language').that.equal('node_js');
            expect(travisYAML).to.have.property('node_js').that.eql([10, 12]);
        });
    });
});
