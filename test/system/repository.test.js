/**
 * @fileOverview This test specs runs tests on the package.json file of repository. It has a set of strict tests on the
 * content of the file as well. Any change to package.json must be accompanied by valid test case in this spec-sheet.
 */
var _ = require('lodash'),
    expect = require('expect.js'),
    parseIgnore = require('parse-gitignore');

/* global describe, it */
describe('repository', function () {
    var fs = require('fs');

    describe('package.json', function () {
        var content,
            json;

        it('must exist', function (done) {
            fs.stat('./package.json', done);
        });

        it('must have readable content', function () {
            expect(content = fs.readFileSync('./package.json').toString()).to.be.ok();
        });

        it('content must be valid JSON', function () {
            expect(json = JSON.parse(content)).to.be.ok();
        });

        describe('package.json JSON data', function () {
            it('must have valid name, description and author', function () {
                expect(json.name).to.be.a('string');
                expect(json.description).to.be.a('string');
                expect(json.author).to.equal('Postman Labs <help@getpostman.com>');
                expect(json.license).to.be.a('string');
            });

            it('must have a valid version string in form of <major>.<minor>.<revision>', function () {
                // eslint-disable-next-line max-len
                expect(json.version).to.match(/^((\d+)\.(\d+)\.(\d+))(?:-([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?(?:\+([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?$/);
            });
        });

        describe('script definitions', function () {
            it('files must exist', function () {
                var scriptRegex = /^node\snpm\/.*\.js/;

                expect(json.scripts).to.be.ok();
                json.scripts && Object.keys(json.scripts).forEach(function (scriptName) {
                    expect(scriptRegex.test(json.scripts[scriptName])).to.be(true);
                    expect(fs.statSync('npm/' + scriptName + '.js')).to.be.ok();
                });
            });

            it('must have the hashbang defined', function () {
                json.scripts && Object.keys(json.scripts).forEach(function (scriptName) {
                    var fileContent = fs.readFileSync('npm/' + scriptName + '.js').toString();
                    expect(/^#!\/(bin\/bash|usr\/bin\/env\snode)[\r\n][\W\w]*$/g.test(fileContent)).to.be.ok();
                });
            });
        });

        describe('devDependencies', function () {
            it('must exist', function () {
                expect(json.devDependencies).to.be.a('object');
            });

            it('must have specified version for dependencies ', function () {
                _.forEach(json.devDependencies, function (dep) {
                    expect(dep).be.ok();
                });
            });

            it('must point to specific package version; (*, ^, ~) not expected', function () {
                _.forEach(json.devDependencies, function (dep) {
                    expect(/^\d/.test(dep)).be.ok();
                });
            });
        });

        describe('dependencies', function () {
            it('must exist', function () {
                expect(json.dependencies).to.be.a('object');
            });

            // Hawk library v3.1.2+ uses ES6 and is not compatible with the browser.
            it('hawk version', function () {
                expect(json.dependencies.hawk).to.be('3.1.3');
            });

            it('must point to specific package version; (*, ^, ~) not expected', function () {
                _.forEach(json.dependencies, function (dep) {
                    expect(/^\d/.test(dep)).be.ok();
                });
            });
        });

        describe('main entry script', function () {
            it('must point to a valid file', function (done) {
                expect(json.main).to.equal('index.js');
                fs.stat(json.main, done);
            });
        });
    });

    describe('README.md', function () {
        it('must exist', function (done) {
            fs.stat('./README.md', done);
        });

        it('must have readable content', function () {
            expect(fs.readFileSync('./README.md').toString()).to.be.ok();
        });
    });

    describe('LICENSE.md', function () {
        it('must exist', function (done) {
            fs.stat('./LICENSE.md', done);
        });

        it('must have readable content', function () {
            expect(fs.readFileSync('./LICENSE.md').toString()).to.be.ok();
        });
    });

    describe('.ignore files', function () {
        var gitignorePath = '.gitignore',
            npmignorePath = '.npmignore',
            npmignore = parseIgnore(npmignorePath),
            gitignore = parseIgnore(gitignorePath);

        describe(gitignorePath, function () {
            it('must exist', function (done) {
                fs.stat(gitignorePath, done);
            });

            it('must have valid content', function () {
                expect(_.isEmpty(gitignore)).to.not.be.ok();
            });
        });

        describe(npmignorePath, function () {
            it('must exist', function (done) {
                fs.stat(npmignorePath, done);
            });

            it('must have valid content', function () {
                expect(_.isEmpty(npmignore)).to.not.be.ok();
            });
        });

        it('.gitignore coverage must be a subset of .npmignore coverage', function () {
            expect(_.intersection(gitignore, npmignore)).to.eql(gitignore);
        });
    });

    describe('.eslintrc', function () {
        var stripJSON = require('strip-json-comments'),

            content,
            json;

        it('must exist', function (done) {
            fs.stat('./.eslintrc', done);
        });

        it('must have readable content', function () {
            expect(content = fs.readFileSync('./.eslintrc').toString()).to.be.ok();
        });

        it('must be valid JSON content', function () {
            expect(json = JSON.parse(stripJSON(content))).to.be.ok();
        });

        it('must have appropriate plugins specified', function () {
            expect(json.plugins).to.eql(['jsdoc', 'security', 'lodash']);
        });

        it('must have appropriate environments specified', function () {
            expect(json.env.browser).to.be(true);
            expect(json.env.node).to.be(true);
        });
    });
});
