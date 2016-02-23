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

        it('must exist', function () {
            expect(fs.existsSync('./package.json')).to.be.ok();
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
            it('scripts key should exist', function () {
                expect(json.scripts).to.be.ok();
            });

            it('files must exist', function () {
                var script;

                for (script in json.scripts) {
                    expect(fs.existsSync(json.scripts[script])).to.be.ok();
                }
            });

            it('must be defined as per standards `[script]: scripts/*/[name].sh`', function () {
                var script,
                    parts;

                for (script in json.scripts) {
                    parts = json.scripts[script].split('/');
                    expect((parts[0] === 'scripts') && (parts.slice(-1)[0].match(script))).to.be.ok();
                }
            });

            it('must have the hashbang defined', function () {
                var fileContent,
                    script;

                for (script in json.scripts) {
                    fileContent = fs.readFileSync(json.scripts[script]).toString();
                    expect(/^#!\/(bin\/bash|usr\/bin\/env\s(node|bash))[\r\n][\W\w]*$/g.test(fileContent)).to.be.ok();
                }
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

            it('must point to specific package version; (*) not expected', function () {
                for (var item in json.devDependencies) {
                    expect(json.devDependencies[item]).not.to.equal('*');
                }
            });
        });

        describe('dependencies', function () {
            it('must exist', function () {
                expect(json.dependencies).to.be.a('object');
            });

            // Hawk library v3.1.2+ uses ES6 and is not compatible with the browser.
            it('hawk version', function () {
                expect(json.dependencies.hawk).to.be('3.1.2');
            });

            it('must point to specific package version; (*) not expected', function () {
                for (var item in json.dependencies) {
                    expect(json.dependencies[item]).not.to.equal('*');
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
});
