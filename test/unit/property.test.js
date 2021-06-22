var expect = require('chai').expect,
    sdk = require('../../lib/index.js'),
    VariableList = sdk.VariableList,
    Property = sdk.Property;

describe('Property', function () {
    describe('sanity', function () {
        it('initializes successfully', function () {
            expect((new Property())).to.be.an.instanceof(Property);
        });
        it('allows a description to be set', function () {
            var prop = new Property();

            expect(prop.describe).to.be.a('function');
            expect(function () {
                prop.describe.bind(prop)('Hello Postman');
            }).to.not.throw();
            // expect(prop.describe.bind(prop)).withArgs('Hello Postman').to.not.throwException();
            expect(prop.description).to.be.ok;
            expect(prop.description.toString()).to.equal('Hello Postman');
            expect(prop.description.type).to.equal('text/plain');
        });
    });

    describe('.describe', function () {
        it('should use an existing Description instance when available', function () {
            var property = new Property({ description: 'Sample description' });

            property.describe('New description');
            expect(property.description.toJSON()).to.eql({ content: 'New description', type: 'text/plain' });
        });
    });

    describe('.toObjectResolved', function () {
        it('should throw an error for invalid arguments', function () {
            var property = new Property();

            expect(property.toObjectResolved.bind(property)).to.throw();
        });

        it('should resolve and exclude its own .variables', function () {
            var property = new Property(),
                parent = new Property();

            parent.variables = new VariableList(parent);
            property.variables = new VariableList(property, [
                { key: 'alpha', value: 'foo' },
                { key: 'beta', value: 'bar' }
            ]);

            property.setParent(parent);
            expect(property.toObjectResolved()).to.eql({});
        });

        it('should not resolve disabled variables', function () {
            var property = new Property(),
                parent = new Property();

            parent.variables = new VariableList(parent, [{
                key: 'disabled',
                value: 'disabled-value',
                disabled: true
            }, {
                key: 'enabled',
                value: 'enabled-value'
            }]);

            property.setParent(parent);
            property.disabled = 'substituted-{{disabled}}';
            property.enabled = 'substituted-{{enabled}}';

            expect(property.toObjectResolved()).to.eql({
                disabled: 'substituted-{{disabled}}',
                enabled: 'substituted-enabled-value'
            });
        });

        it('should resolve variables defined in its own tree, up one parent', function () {
            var property = new Property(),
                parent = new Property();

            parent.variables = new VariableList(parent, [{
                key: 'var1',
                value: 'parent-value-1'
            }, {
                key: 'var2',
                value: 'parent-value-2'
            }]);

            property.setParent(parent);
            property.testProp1 = 'substituted-{{var1}}';
            property.testProp2 = 'substituted-{{var2}}';

            expect(property.toObjectResolved()).to.eql({
                testProp1: 'substituted-parent-value-1',
                testProp2: 'substituted-parent-value-2'
            });
        });

        it('should resolve variables defined in its own tree, stored within itself', function () {
            var property = new Property(),
                parent = new Property();

            property.variables = new VariableList(property, [{
                key: 'var1',
                value: 'child-value-1'
            }]);

            parent.variables = new VariableList(parent, [{
                key: 'var1',
                value: 'parent-value-1'
            }, {
                key: 'var2',
                value: 'parent-value-2'
            }]);

            property.setParent(parent);
            property.testProp1 = 'substituted-{{var1}}';
            property.testProp2 = 'substituted-{{var2}}';

            expect(property.toObjectResolved()).to.eql({
                testProp1: 'substituted-child-value-1',
                testProp2: 'substituted-parent-value-2'
            });
        });

        it('should resolve variables defined in a reference property', function () {
            var property = new Property(),
                parent = new Property(),
                childServices = new Property();

            property.variables = new VariableList(property, [{
                key: 'var1',
                value: 'child-value-1'
            }]);

            parent.variables = new VariableList(parent, [{
                key: 'var1',
                value: 'parent-value-1'
            }, {
                key: 'var2',
                value: 'parent-value-2'
            }]);

            property.setParent(parent);
            property.testProp1 = 'substituted-{{var1}}';
            property.testProp2 = 'substituted-{{var2}}';

            childServices.variables = new VariableList(childServices, [{
                key: 'var1',
                value: 'external-value-1'
            }, {
                key: 'var2',
                value: 'external-value-2'
            }]);

            expect(property.toObjectResolved(childServices)).to.eql({
                testProp1: 'substituted-external-value-1',
                testProp2: 'substituted-external-value-2'
            });
        });

        it('should resolve variables defined in a reference property and ride up its tree', function () {
            var property = new Property(),
                parent = new Property(),
                orphan = new Property();

            property.variables = new VariableList(property, [{
                key: 'var1',
                value: 'child-value-1'
            }]);

            parent.variables = new VariableList(parent, [{
                key: 'var1',
                value: 'parent-value-1'
            }, {
                key: 'var2',
                value: 'parent-value-2'
            }]);

            property.setParent(parent);

            orphan.testProp1 = 'substituted-{{var1}}';
            orphan.testProp2 = 'substituted-{{var2}}';
            orphan.variables = new VariableList(orphan, [{
                key: 'var1',
                value: 'orphan-value-1'
            }, {
                key: 'var2',
                value: 'orphan-value-2'
            }]);

            expect(orphan.toObjectResolved(property)).to.eql({
                testProp1: 'substituted-child-value-1',
                testProp2: 'substituted-parent-value-2'
            });
        });

        it('should resolve duplicate and disabled variables correctly', function () {
            var property = new Property(),
                parent = new Property();

            property.variables = new VariableList(property, [{
                key: 'var1',
                value: 'child-value-1'
            }, {
                key: 'var1',
                value: 'child-value-2'
            }, {
                key: 'var1',
                value: 'child-value-3',
                disabled: true
            }]);

            parent.variables = new VariableList(parent, [{
                key: 'var1',
                value: 'parent-value-1'
            }, {
                key: 'var1',
                value: 'parent-value-2',
                disabled: true
            }, {
                key: 'var2',
                value: 'parent-value-1'
            }, {
                key: 'var2',
                value: 'parent-value-2',
                disabled: true
            }]);

            property.setParent(parent);
            property.testProp1 = 'substituted-{{var1}}';
            property.testProp2 = 'substituted-{{var2}}';

            expect(property.toObjectResolved()).to.eql({
                testProp1: 'substituted-child-value-2',
                testProp2: 'substituted-parent-value-1'
            });
        });

        it('should ignore own variables when `ignoreOwnVariables` is set', function () {
            var property = new Property(),
                variables = new VariableList({}, [{
                    key: 'var1',
                    value: 'value-1'
                }]);

            property.variables = new VariableList({}, [{
                key: 'var1',
                value: 'ignore_me_please'
            }]);

            property.testProp1 = 'prop-{{var1}}';

            expect(property.toObjectResolved(null, [variables], { ignoreOwnVariables: true })).to.eql({
                testProp1: 'prop-value-1'
            });
        });

        it('should ignore scope variables when `ignoreOwnVariables` is set', function () {
            var property = new Property(),
                scope = new Property(),
                variables = new VariableList({}, [{
                    key: 'var1',
                    value: 'value-1'
                }]);

            scope.variables = new VariableList({}, [{
                key: 'var1',
                value: 'ignore_me_please'
            }]);

            property.testProp1 = 'prop-{{var1}}';

            // why on earth would anyone want to pass a scope and not use the scope,
            // but you know we have tests to make sure even if someone did
            expect(property.toObjectResolved(scope, [variables], { ignoreOwnVariables: true })).to.eql({
                testProp1: 'prop-value-1'
            });
        });
    });

    describe('.replaceSubstitutions', function () {
        /**
         * Generates a object with n variables
         *
         * @example
         * getVariables(2)
         * {
         *    '0': '',
         *    '1': ''
         * }
         *
         * @param {Number} n - Number of variables
         * @returns {Object}
         */
        function getVariables (n) {
            var i,
                obj = {};

            for (i = 0; i < n; i++) {
                obj[String(i)] = '';
            }

            return obj;
        }

        /**
         * Generates a poly chained variable nested n times
         *
         * @example
         * getPolyChainedVariable(2)
         * '{{1{{0}}}}'
         *
         * @param {Number} n -
         * @returns {String}
         */
        function getPolyChainedVariable (n) {
            var i,
                str = '';

            for (i = 0; i < n; i++) {
                str = `{{${i}` + str;
            }

            str += '}}'.repeat(n);

            return str;
        }

        it('should bail out if a non-string argument is passed', function () {
            expect(Property.replaceSubstitutions(['random'])).to.eql(['random']);
        });

        it('should resolve poly chained variable 19 times', function () {
            var str = getPolyChainedVariable(21),
                variables = getVariables(21);

            // resolves {{0}} to {{18}} poly-chained variables
            expect(Property.replaceSubstitutions(str, variables)).to.eql('{{20{{19}}}}');
        });

        it('should correctly resolve multiple poly chained variables', function () {
            var str = getPolyChainedVariable(20) +
                `{{ - ${getPolyChainedVariable(19)}}}` +
                '{{hello{{world}}}} {{random}}',
                variables = getVariables(20);

            variables = Object.assign(variables, {
                world: 'World',
                helloWorld: 'Hello World'
            });

            // resolves {{0}} to {{18}} poly-chained variables, {{world}} & {{hello}}
            expect(Property.replaceSubstitutions(str, variables)).to.eql('{{19}}{{ - }}Hello World {{random}}');
        });

        it('should correctly resolve all unique variables', function () {
            // eslint-disable-next-line max-len
            var str = '{{0}}{{1}}{{2}}{{3}}{{4}}{{5}}{{6}}{{7}}{{8}}{{9}}' +
                '{{10}}{{11}}{{12}}{{13}}{{14}}{{15}}{{16}}{{17}}{{18}}{{19}}' +
                '{{xyz{{1{{0}}}}}}',
                variables = getVariables(20);

            // resolves all independent unique variables as well as poly-chained {{0}} & {{1}}
            expect(Property.replaceSubstitutions(str, variables)).to.eql('{{xyz}}');
        });
    });

    describe('.replaceSubstitutionsIn', function () {
        it('should bail out if a non-object argument is passed', function () {
            expect(Property.replaceSubstitutionsIn('random')).to.equal('random');
        });

        it('should not mutate the original object', function () {
            const obj = { foo: '{{var}}' },
                variables = [{ var: 'bar' }];

            expect(Property.replaceSubstitutionsIn(obj, variables)).to.eql({ foo: 'bar' });
            expect(obj).to.eql({ foo: '{{var}}' });
        });
    });

    describe('variable resolution', function () {
        it('must resolve variables accurately', function () {
            var unresolvedRequest = {
                    method: 'POST',
                    url: '{{host}}:{{port}}/{{path}}',
                    header: [{ key: '{{headerName}}', value: 'application/json' }],
                    body: {
                        mode: 'urlencoded',
                        urlencoded: [{ key: '{{greeting}}', value: '{{greeting_value}}' }]
                    }
                },
                expectedResolution = {
                    method: 'POST',
                    url: 'postman-echo.com:80/post',
                    header: [{ key: 'Content-Type', value: 'application/json' }],
                    body: {
                        mode: 'urlencoded',
                        urlencoded: [{ key: 'yo', value: 'omg' }]
                    }
                },
                resolved = Property.replaceSubstitutionsIn(unresolvedRequest, [
                    {
                        greeting: 'yo',
                        greeting_value: 'omg'
                    },
                    {
                        host: 'postman-echo.com',
                        port: '80',
                        path: 'post'
                    },
                    {
                        path: 'get',
                        headerName: 'Content-Type'
                    }
                ]);

            expect(resolved).to.eql(expectedResolution);
        });

        it('must resolve variables in complex nested objects correctly', function () {
            var unresolvedRequest = {
                    one: '{{alpha}}-{{beta}}-{{gamma}}',
                    two: { a: '{{alpha}}', b: '{{beta}}', c: '{{gamma}}' },
                    three: ['{{alpha}}', '{{beta}}', '{{gamma}}'],
                    four: [
                        { a: '{{alpha}}', b: '{{beta}}', c: '{{gamma}}' },
                        { d: '{{delta}}', e: '{{epsilon}}', f: '{{theta}}' },
                        { g: '{{iota}}', h: '{{pi}}', i: '{{zeta}}' }
                    ],
                    five: {
                        one: ['{{alpha}}', '{{beta}}', '{{gamma}}'],
                        two: ['{{delta}}', '{{epsilon}}', '{{theta}}'],
                        three: ['{{iota}}', '{{pi}}', '{{zeta}}']
                    },
                    six: [
                        '{{alpha}}',
                        ['{{alpha}}', '{{beta}}', '{{gamma}}'],
                        { a: '{{delta}}', b: '{{epsilon}}', c: '{{theta}}' }
                    ],
                    seven: { a: '{{alpha}}', b: ['{{alpha}}', '{{beta}}', '{{gamma}}'], c: { a: '{{delta}}',
                        b: '{{epsilon}}', c: '{{theta}}' } }
                },
                expectedResolution = {
                    one: 'arbitrary-complex-large',
                    two: { a: 'arbitrary', b: 'complex', c: 'large' },
                    three: ['arbitrary', 'complex', 'large'],
                    four: [
                        { a: 'arbitrary', b: 'complex', c: 'large' },
                        { d: 'nested', e: 'JSON', f: 'property' },
                        { g: 'variable', h: 'resolution', i: 'test' }
                    ],
                    five: {
                        one: ['arbitrary', 'complex', 'large'],
                        two: ['nested', 'JSON', 'property'],
                        three: ['variable', 'resolution', 'test']
                    },
                    six: [
                        'arbitrary',
                        ['arbitrary', 'complex', 'large'],
                        { a: 'nested', b: 'JSON', c: 'property' }
                    ],
                    seven: { a: 'arbitrary', b: ['arbitrary', 'complex', 'large'], c: { a: 'nested',
                        b: 'JSON', c: 'property' } }
                },
                resolved = Property.replaceSubstitutionsIn(unresolvedRequest, [
                    {
                        alpha: 'arbitrary',
                        beta: 'complex',
                        gamma: 'large'
                    },
                    {
                        delta: 'nested',
                        epsilon: 'JSON',
                        theta: 'property'
                    },
                    {
                        iota: 'variable',
                        pi: 'resolution',
                        zeta: 'test'
                    }
                ]);

            expect(resolved).to.eql(expectedResolution);
        });
    });
});
