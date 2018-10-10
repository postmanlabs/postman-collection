/**
 * @fileOverview This test specs runs tests on the ,jsdoc-config.json file of repository. It has a set of strict tests
 * on the content of the file as well. Any change to .jsdoc-config.json must be accompanied by valid test case in this
 * spec-sheet.
 */
var fs = require('fs');

describe('JSDoc configuration', function () {
    var json,
        content,
        jsdocConfigPath = './.jsdoc-config.json';

    it('should exist', function (done) {
        fs.stat(jsdocConfigPath, done);
    });

    it('should have readable content', function () {
        expect(content = fs.readFileSync(jsdocConfigPath).toString(), 'Should have readable content').to.be.ok;
    });

    it('should have valid JSON content', function () {
        expect(json = JSON.parse(content), 'Should have valid JSON content').to.be.ok;
    });

    describe('tags', function () {
        it('should allow unknown tags', function () {
            expect(json.tags.allowUnknownTags, 'Should allow unknown tags').to.be.ok;
        });

        it('should have jsdoc and closure dictionaries', function () {
            expect(json.tags.dictionaries).to.eql(['jsdoc', 'closure']);
        });
    });

    describe('source', function () {
        it('should have an include pattern', function () {
            expect(json.source.includePattern).to.equal('.+\\.js(doc)?$');
        });

        it('should have an exclude pattern', function () {
            expect(json.source.excludePattern).to.equal('(^|\\/|\\\\)_');
        });
    });

    describe('plugins', function () {
        it('should have the markdown plugin', function () {
            expect(json.plugins, 'Should use the markdown plugin').to.include('plugins/markdown');
        });
    });

    describe('templates', function () {
        it('should not have clever links', function () {
            expect(json.templates.cleverLinks).to.be.false;
        });

        it('should not have monospace links', function () {
            expect(json.templates.monospaceLinks).to.be.false;
        });

        it('should highlight tutorial code', function () {
            expect(json.templates.highlightTutorialCode).to.be.ok;
        });
    });

    describe('opts', function () {
        it('should use the Postman JSDoc theme', function () {
            expect(json.opts.template).to.equal('./node_modules/postman-jsdoc-theme');
        });

        it('should use UTF-8 encoding', function () {
            expect(json.opts.encoding).to.equal('utf8');
        });

        it('should create documentation in out/docs', function () {
            expect(json.opts.destination).to.equal('./out/docs');
        });

        it('should recurse', function () {
            expect(json.opts.recurse).to.be.ok;
        });

        it('should have a valid readme', function () {
            expect(json.opts.readme, 'Should use a valid readme').to.equal('README.md');
        });
    });

    describe('markdown', function () {
        it('should have a gfm parser', function () {
            expect(json.markdown.parser, 'Should use the gfm markdown parser').to.equal('gfm');
        });

        it('should have jsdoc and closure dictionaries', function () {
            expect(json.markdown.hardwrap).to.be.false;
        });
    });
});
