/**
 * @fileOverview This test specs runs tests on the package.json file of repository. It has a set of strict tests on the
 * content of the file as well. Any change to package.json must be accompanied by valid test case in this spec-sheet.
 */
var expect = require('expect.js');

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
                /* jshint ignore:start */
                expect(json.version).to.match(/^((\d+)\.(\d+)\.(\d+))(?:-([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?(?:\+([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?$/);

                /* jshint ignore:end */
            });
        });

        describe('script definitions', function () {
            it('files must exist', function () {
                expect(json.scripts).to.be.ok();
                json.scripts && Object.keys(json.scripts).forEach(function (scriptName) {
                    expect(fs.existsSync('npm/' + scriptName + '.js')).to.be.ok();
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
                for (var item in json.devDependencies) {
                    expect(json.devDependencies[item]).to.be.ok();
                }
            });

            it('must point to specific package version; (*, ^, ~) not expected', function () {
                for (var item in json.devDependencies) {
                    expect(/^\d/.test(json.devDependencies[item])).to.be.ok();
                }
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
                for (var item in json.dependencies) {
                    expect(/^\d/.test(json.dependencies[item])).to.be.ok();
                }
            });
        });

        describe('main entry script', function () {
            it('must point to a valid file', function () {
                expect(json.main).to.equal('index.js');
                expect(fs.existsSync(json.main)).to.be.ok();
            });
        });
    });

    describe('README.md', function () {
        it('must exist', function () {
            expect(fs.existsSync('./README.md')).to.be.ok();
        });

        it('must have readable content', function () {
            expect(fs.readFileSync('./README.md').toString()).to.be.ok();
        });
    });

    describe('LICENSE.md', function () {
        it('must exist', function () {
            expect(fs.existsSync('./LICENSE.md')).to.be.ok();
        });

        it('must have readable content', function () {
            expect(fs.readFileSync('./LICENSE.md').toString()).to.be.ok();
        });
    });

    describe('.gitignore file', function () {
        it('must exist', function () {
            expect(fs.existsSync('./.gitignore')).to.be.ok();
        });

        it('must have readable content', function () {
            expect(fs.readFileSync('./.gitignore').toString()).to.be.ok();
        });
    });

    describe('.npmignore file', function () {
        it('must exist', function () {
            expect(fs.existsSync('./.npmignore')).to.be.ok();
        });

        it('must be a superset of .gitignore (.npmi = .npmi + .gi)', function () {
            // normalise the ignore file text contents
            var gi = fs.readFileSync('./.gitignore').toString().replace(/#.*\n/g, '\n').replace(/\n+/g, '\n'),
                npmi = fs.readFileSync('./.npmignore').toString().replace(/#.*\n/g, '\n').replace(/\n+/g, '\n');

            expect(npmi.substr(-gi.length)).to.eql(gi);
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

        it('must be ES5 compliant', function () {
            expect(json.parserOptions.ecmaVersion).to.be(5);
        });

        it('must have appropriate plugins specified', function () {
            expect(json.plugins).to.eql(['jsdoc', 'lodash', 'mocha', 'security']);
        });

        it('must have appropriate environments specified', function () {
            expect(json.env.browser).to.be(true);
            expect(json.env.node).to.be(true);
        });
    });
});
