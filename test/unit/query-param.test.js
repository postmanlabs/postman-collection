var _ = require('lodash'),
    expect = require('chai').expect,
    QueryParam = require('../../').QueryParam,
    rawQueryStrings = require('../fixtures/index').rawQueryStrings;

describe('QueryParam', function () {
    describe('construction', function () {
        it('should handle null keys and values correctly', function () {
            var qp = new QueryParam({
                key: null,
                value: null
            });

            expect(qp).to.be.ok;
            expect(qp).to.deep.include({
                key: null,
                value: null
            });

            expect(qp.toString()).to.equal('');
            expect(qp.valueOf()).to.equal('');
        });

        it('should handle string input correctly', function () {
            var qp = new QueryParam('foo=bar');

            expect(qp).to.be.ok;
            expect(qp.valueOf()).to.equal('bar');
            expect(qp).to.deep.include({
                key: 'foo',
                value: 'bar'
            });
        });

        it('should handle system property correctly', function () {
            var qp1 = new QueryParam({
                    key: 'foo1',
                    value: 'bar1',
                    system: true
                }),
                qp2 = new QueryParam({
                    key: 'foo2',
                    value: 'bar2',
                    system: false
                }),
                qp3 = new QueryParam({
                    key: 'foo3',
                    value: 'bar3'
                });

            expect(qp1).to.have.property('system', true);
            expect(qp2).to.have.property('system', false);
            expect(qp3).not.to.have.property('system');
        });
    });

    describe('static helpers', function () {
        describe('.parse', function () {
            it('should return an empty array for non string arguments', function () {
                expect(QueryParam.parse()).to.eql([]);
                expect(QueryParam.parse([])).to.eql([]);
                expect(QueryParam.parse({})).to.eql([]);
                expect(QueryParam.parse(null)).to.eql([]);
            });
        });

        describe('.parseSingle', function () {
            it('should return null as a value if the query param string does not contain `=`', function () {
                var result = QueryParam.parseSingle({
                    value: 'foo',
                    substr: function () {
                        return this.value;
                    }
                });

                expect(result).to.eql({
                    key: 'foo',
                    value: null
                });
            });
        });

        describe('.unparse', function () {
            it('should bail out of the provided set of params is falsy', function () {
                expect(QueryParam.unparse()).to.equal('');
            });

            it('should handle null and undefined values', function () {
                var queryParams = [{
                    key: 'foo',
                    value: 'foo'
                }, {
                    key: 'bar',
                    value: null
                }, {
                    key: 'baz',
                    value: undefined
                }];

                expect(QueryParam.unparse(queryParams)).to.equal('foo=foo&bar&baz');
            });

            it('should should handle null and undefined values when unparsing object format', function () {
                expect(QueryParam.unparse({ foo: 'foo', bar: null, baz: undefined }))

                    // if query param value is undefined the param is not appeneded
                    // but the trailing ampersand is not removed
                    // this is the current behaviour
                    .to.equal('foo=foo&bar&baz');
            });
        });

        describe('.unparseSingle', function () {
            it('should return an empty string for non object arguments', function () {
                expect(QueryParam.unparseSingle()).to.equal('');
                expect(QueryParam.unparseSingle([])).to.equal('');
            });

            it('should return an empty string for undefined values', function () {
                expect(QueryParam.unparseSingle({})).to.equal('');
                expect(QueryParam.unparseSingle({ key: 'foo' })).to.equal('foo');
            });

            it('should handle empty key or empty value', function () {
                expect(QueryParam.unparseSingle({ key: 'foo' })).to.equal('foo');
                expect(QueryParam.unparseSingle({ value: 'foo' })).to.equal('=foo');
                expect(QueryParam.unparseSingle({ key: '', value: '' })).to.equal('=');
                expect(QueryParam.unparseSingle({ key: 'foo', value: '' })).to.equal('foo=');
                expect(QueryParam.unparseSingle({ key: '', value: 'foo' })).to.equal('=foo');
            });

            it('should always encode `&` and `#` present in key or value', function () {
                expect(QueryParam.unparseSingle({ key: null, value: '& #' })).to.equal('=%26 %23');
                expect(QueryParam.unparseSingle({ key: '"#&#"' })).to.equal('"%23%26%23"');
            });

            it('should not encode `&` and `#` present in variable names', function () {
                expect(QueryParam.unparseSingle({ key: '#{{#&#}}#', value: '{{&}}' }))
                    .to.equal('%23{{#&#}}%23={{&}}');

                expect(QueryParam.unparseSingle({ key: '{{&}} {{#}}', value: ' {{&}} ' }))
                    .to.equal('{{&}} {{#}}= {{&}} ');
            });

            it('should always encode `=` present in param key', function () {
                expect(QueryParam.unparseSingle({ key: '={{=}}=', value: '{{===}}' })).to.equal('%3D{{=}}%3D={{===}}');
                expect(QueryParam.unparseSingle({ key: '={{&=#}}' })).to.equal('%3D{{&=#}}');
            });

            it('should not encode `=` present in param value', function () {
                expect(QueryParam.unparseSingle({ key: '{{===}}', value: '={{=}}=' })).to.equal('{{===}}=={{=}}=');
                expect(QueryParam.unparseSingle({ value: '={{&=#}}=' })).to.equal('=={{&=#}}=');
            });
        });
    });

    rawQueryStrings.forEach(function (rawQueryString) {
        describe(rawQueryString, function () {
            it('should be parsed properly', function () {
                var params = QueryParam.parse(rawQueryString);

                expect(params.length).to.equal(4);
            });

            it('should be unparsed properly', function () {
                var params = QueryParam.parse(rawQueryString),
                    paramStr = QueryParam.unparse(params);

                expect(paramStr).to.eql(rawQueryString);
            });
        });
    });

    it('should not url encode', function () {
        var rawQueryString = 'x=foo bar',
            params = QueryParam.parse(rawQueryString),
            paramStr = QueryParam.unparse(params);

        expect(paramStr).to.eql(rawQueryString);
    });

    it('should be able to unparse when values are given as an object', function () {
        var params = {
            a: 'a',
            b: 'b'
        };

        expect(QueryParam.unparse(params)).to.eql('a=a&b=b');
    });

    describe('integrity', function () {
        // key is what the string representation should be, value is the parsed representation.
        var testCases = {
            'a=b&c': [
                { key: 'a', value: 'b' },
                { key: 'c', value: null }
            ],
            'a=b&c=': [
                { key: 'a', value: 'b' },
                { key: 'c', value: '' }
            ],
            'a=b&c=&d=e': [
                { key: 'a', value: 'b' },
                { key: 'c', value: '' },
                { key: 'd', value: 'e' }
            ],
            'a=b&c&d=e': [
                { key: 'a', value: 'b' },
                { key: 'c', value: null },
                { key: 'd', value: 'e' }
            ],
            'a=b&a=c': [
                { key: 'a', value: 'b' },
                { key: 'a', value: 'c' }
            ],
            'a=b&a': [
                { key: 'a', value: 'b' },
                { key: 'a', value: null }
            ],
            'a=b&=cd': [
                { key: 'a', value: 'b' },
                { key: '', value: 'cd' }
            ],
            'a=b&=&': [
                { key: 'a', value: 'b' },
                { key: '', value: '' },
                { key: '', value: null }
            ],
            'a=b&&': [
                { key: 'a', value: 'b' },
                { key: null, value: null },
                { key: '', value: null }
            ],
            'a=b&&c=d': [
                { key: 'a', value: 'b' },
                { key: null, value: null },
                { key: 'c', value: 'd' }
            ]
        };

        _.forOwn(testCases, function (array, string) {
            describe(string, function () {
                it('parse', function () {
                    expect(QueryParam.parse(string)).to.eql(array);
                });

                it('unparse', function () {
                    expect(QueryParam.unparse(array)).to.eql(string);
                });
            });
        });
    });

    describe('disabled-enabled states', function () {
        // key is what the string representation should be, value is the parsed representation.
        var testCases = [
            {
                result: 'a=b&e=f',
                list: [
                    { key: 'a', value: 'b' },
                    { key: 'c', value: 'd', disabled: true },
                    { key: 'e', value: 'f', disabled: 1 } // this is done to test the explicit true check
                ]
            },
            {
                result: 'c=d&e=f',
                list: [
                    { key: 'a', value: 'b', disabled: true },
                    { key: 'c', value: 'd', disabled: 1 },
                    { key: 'e', value: 'f' }
                ]
            },
            {
                result: 'a=b&d=e&e=f',
                list: [
                    { key: 'a', value: 'b' },
                    { key: 'c', value: 'd', disabled: true },
                    { key: 'd', value: 'e', disabled: 1 },
                    { key: 'e', value: 'f' }
                ]
            },
            {
                result: 'c=d&g=h',
                list: [
                    { key: 'a', value: 'b', disabled: true },
                    { key: 'c', value: 'd' },
                    { key: 'e', value: 'f', disabled: true },
                    { key: 'g', value: 'h', disabled: 1 }
                ]
            },
            {
                result: 'u=v&a=b',
                list: [
                    { key: 'u', value: 'v' },
                    { key: 'w', value: 'x', disabled: true },
                    { key: 'y', value: 'z', disabled: true },
                    { key: 'a', value: 'b', disabled: 1 }
                ]
            },
            {
                result: 'g=h',
                list: [
                    { key: 'a', value: 'b', disabled: true },
                    { key: 'c', value: 'd', disabled: true },
                    { key: 'e', value: 'f', disabled: true },
                    { key: 'g', value: 'h', disabled: 1 }
                ]
            }
        ];

        _.forEach(testCases, function (fixture) {
            it(`should handle ${fixture.result || 'empty string'}`, function () {
                expect(QueryParam.unparse(fixture.list)).to.eql(fixture.result);
            });
        });
    });
});
