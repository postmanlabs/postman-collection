/**
 * @fileOverview This test specs runs tests on the package.json file of repository. It has a set of strict tests on the
 * content of the file as well. Any change to package.json must be accompanied by valid test case in this spec-sheet.
 */
var _ = require('lodash'),
    parseIgnore = require('parse-gitignore');

describe('project repository', function () {
    var fs = require('fs');

    describe('package.json', function () {
        var content,
            json;

        it('should exist', function (done) {
            fs.stat('./package.json', done);
        });

        it('should have readable JSON content', function () {
            expect(content = fs.readFileSync('./package.json').toString(), 'Should have readable content').to.be.ok;
        });

        it('should have valid JSON content', function () {
            expect(json = JSON.parse(content), 'Should have valid JSON content').to.be.ok;
        });

        describe('package.json JSON data', function () {
            it('should have valid name, description, author and license', function () {
                expect(json).to.include.keys({
                    name: 'postman-collection',
                    description: 'Enables developers to use a unified Postman Collection format Object across projects',
                    author: 'Postman Labs <help@getpostman.com>',
                    license: 'Apache-2.0'
                });
            });

            it('should have a valid version string in form of <major>.<minor>.<revision>', function () {
                expect(json.version)
                    // eslint-disable-next-line max-len
                    .to.match(/^((\d+)\.(\d+)\.(\d+))(?:-([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?(?:\+([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?$/);
            });
        });

        describe('script definitions', function () {
            it('should have valid, existing files', function () {
                var scriptRegex = /^node\snpm\/.+\.js$/;

                expect(json.scripts).to.be.ok;
                json.scripts && Object.keys(json.scripts).forEach(function (scriptName) {
                    expect(json.scripts[scriptName]).to.match(scriptRegex);
                    expect(fs.statSync('npm/' + scriptName + '.js')).to.be.ok;
                });
            });

            it('should have the hashbang defined', function () {
                json.scripts && Object.keys(json.scripts).forEach(function (scriptName) {
                    var fileContent = fs.readFileSync('npm/' + scriptName + '.js').toString();
                    expect(fileContent).to.match(/^#!\/(bin\/bash|usr\/bin\/env\snode)[\r\n][\W\w]*$/g);
                });
            });
        });

        describe('devDependencies', function () {
            it('should exist', function () {
                expect(json.devDependencies).to.be.an('object');
            });

            it('should have specified version for dependencies ', function () {
                _.forEach(json.devDependencies, function (dep) {
                    expect(dep).to.be.ok;
                });
            });

            it('should point to specific package version; (*, ^, ~) not expected', function () {
                _.forEach(json.devDependencies, function (dep) {
                    expect(/^\d/.test(dep)).to.be.ok;
                });
            });
        });

        describe('dependencies', function () {
            it('should exist', function () {
                expect(json.dependencies).to.be.an('object');
            });

            it('should point to specific package version; (*, ^, ~) not expected', function () {
                _.forEach(json.dependencies, function (dep) {
                    expect(/^\d/.test(dep)).to.be.ok;
                });
            });
        });

        describe('main entry script', function () {
            it('should point to a valid file', function (done) {
                expect(json.main).to.equal('index.js');
                fs.stat(json.main, done);
            });
        });
    });

    describe('README.md', function () {
        it('should exist', function (done) {
            fs.stat('./README.md', done);
        });

        it('should have readable content', function () {
            expect(fs.readFileSync('./README.md').toString()).to.be.ok;
        });
    });

    describe('LICENSE.md', function () {
        it('should exist', function (done) {
            fs.stat('./LICENSE.md', done);
        });

        it('should have readable content', function () {
            expect(fs.readFileSync('./LICENSE.md').toString()).to.be.ok;
        });
    });

    describe('.gitattributes', function () {
        it('should exist', function (done) {
            fs.stat('./.gitattributes', done);
        });

        it('should have readable content', function () {
            expect(fs.readFileSync('./.gitattributes').toString()).to.be.ok;
        });
    });

    describe('.ignore files', function () {
        var gitignorePath = '.gitignore',
            npmignorePath = '.npmignore',
            npmignore = parseIgnore(fs.readFileSync(npmignorePath)),
            gitignore = parseIgnore(fs.readFileSync(gitignorePath));

        describe(gitignorePath, function () {
            it('should exist', function (done) {
                fs.stat(gitignorePath, done);
            });

            it('should have valid content', function () {
                expect(gitignore).to.be.an('array');
            });
        });

        describe(npmignorePath, function () {
            it('should exist', function (done) {
                fs.stat(npmignorePath, done);
            });

            it('should have valid content', function () {
                expect(npmignore).to.be.an('array');
            });
        });

        it('should have .gitignore coverage to be a subset of .npmignore coverage', function () {
            expect(_.intersection(gitignore, npmignore)).to.eql(gitignore);
        });
    });

    describe('.eslintrc', function () {
        var stripJSON = require('strip-json-comments'),

            content,
            json;

        it('should exist', function (done) {
            fs.stat('./.eslintrc', done);
        });

        it('should have readable content', function () {
            expect(content = fs.readFileSync('./.eslintrc').toString()).to.be.ok;
        });

        it('should be valid JSON content', function () {
            expect(json = JSON.parse(stripJSON(content))).to.be.ok;
        });

        it('should have appropriate plugins specified', function () {
            expect(json.plugins).to.eql(['jsdoc', 'security', 'lodash']);
        });

        it('should have appropriate environments specified', function () {
            expect(json.env.browser).to.be.true;
            expect(json.env.node).to.be.true;
        });
    });
});
