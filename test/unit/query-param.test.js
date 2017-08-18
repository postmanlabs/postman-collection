var _ = require('lodash'),
    expect = require('expect.js'),
    QueryParam = require('../../').QueryParam,
    rawQueryStrings = require('../fixtures/index').rawQueryStrings;

/* global describe, it */
describe('QueryParam', function () {
    describe('construction', function () {
        it('should handle null keys and values correctly', function () {
            var qp = new QueryParam({
                key: null,
                value: null
            });

            expect(qp).to.be.ok();
            expect(qp).to.have.property('key', null);
            expect(qp).to.have.property('value', null);

            expect(qp.toString()).to.be('');
            expect(qp.valueOf()).to.be('');
        });

        it('should handle string input correctly', function () {
            var qp = new QueryParam('foo=bar');

            expect(qp).to.be.ok();
            expect(qp).to.have.property('key', 'foo');
            expect(qp).to.have.property('value', 'bar');
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
                expect(QueryParam.unparse()).to.be('');
            });
        });

        describe('.unparseSingle', function () {
            it('should return an empty string for non object arguments', function () {
                expect(QueryParam.unparseSingle()).to.be('');
                expect(QueryParam.unparseSingle([])).to.be('');
            });

            it('should return an empty string for undefined values', function () {
                expect(QueryParam.unparseSingle({})).to.be('');
                expect(QueryParam.unparseSingle({ key: 'foo' })).to.be('');
            });

            it('should encode keys when value is null and encode is true', function () {
                expect(QueryParam.unparseSingle({ key: ' ', value: null }, true)).to.be('%20');
                expect(QueryParam.unparseSingle({ key: 'foo', value: null }, true)).to.be('foo');
            });
        });
    });

    rawQueryStrings.forEach(function (rawQueryString) {
        describe(rawQueryString, function () {
            it('should be parsed properly', function () {
                var params = QueryParam.parse(rawQueryString);
                expect(params.length).to.be(4);
            });

            it('should be unparsed properly', function () {
                var params = QueryParam.parse(rawQueryString),
                    paramStr = QueryParam.unparse(params);
                expect(paramStr).to.eql(rawQueryString);
            });
        });
    });

    it('should not url encode by default', function () {
        var rawQueryString = 'x=y%z',
            params = QueryParam.parse(rawQueryString),
            paramStr = QueryParam.unparse(params);
        expect(paramStr).to.eql(rawQueryString);
    });

    it('should url encode if explicitly asked to', function () {
        var rawQueryString = 'x=y%z',
            params = QueryParam.parse(rawQueryString),
            paramStr = QueryParam.unparse(params, { encode: true });
        expect(paramStr).to.eql('x=y%25z');
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
                ignore: {
                    true: 'a=b',
                    false: 'a=b&c=d'
                },
                list: [
                    { key: 'a', value: 'b' },
                    { key: 'c', value: 'd', disabled: true }
                ]
            },
            {
                ignore: {
                    true: 'e=f',
                    false: 'a=b&e=f'
                },
                list: [
                    { key: 'a', value: 'b', disabled: true },
                    { key: 'e', value: 'f' }
                ]
            },
            {
                ignore: {
                    true: 'a=b&e=f',
                    false: 'a=b&c=d&e=f'
                },
                list: [
                    { key: 'a', value: 'b' },
                    { key: 'c', value: 'd', disabled: true },
                    { key: 'e', value: 'f' }
                ]
            },
            {
                ignore: {
                    true: 'c=d',
                    false: 'a=b&c=d&e=f'
                },
                list: [
                    { key: 'a', value: 'b', disabled: true },
                    { key: 'c', value: 'd' },
                    { key: 'e', value: 'f', disabled: true }
                ]
            },
            {
                ignore: {
                    true: 'u=v',
                    false: 'u=v&w=x&y=z'
                },
                list: [
                    { key: 'u', value: 'v' },
                    { key: 'w', value: 'x', disabled: true },
                    { key: 'y', value: 'z', disabled: true }
                ]
            },
            {
                ignore: {
                    true: '',
                    false: 'a=b&c=d&e=f'
                },
                list: [
                    { key: 'a', value: 'b', disabled: true },
                    { key: 'c', value: 'd', disabled: true },
                    { key: 'e', value: 'f', disabled: true }
                ]
            }
        ];

        _.forEach(testCases, function (fixture) {
            it(`should handle ${fixture.ignore.true || 'empty string'}, ignoreDisabled: true`, function () {
                expect(QueryParam.unparse(fixture.list, {
                    ignoreDisabled: true
                })).to.eql(fixture.ignore.true);
            });

            it(`should handle ${fixture.ignore.false || 'empty string'}, ignoreDisabled: false`, function () {
                expect(QueryParam.unparse(fixture.list)).to.eql(fixture.ignore.false);
            });
        });
    });

    describe('encoding', function () {
        it('a=b{{c}}', function () {
            var parsed = [
                { key: 'a', value: 'c{{b}}' },
                { key: 'c', value: 'd' }
            ];
            expect(QueryParam.unparse(parsed, {
                encode: true
            })).to.be('a=c{{b}}&c=d');
        });

        it('a=обязательный&c=d', function () {
            var parsed = [
                { key: 'a', value: 'обязательный' },
                { key: 'c', value: 'd' }
            ];
            expect(QueryParam.unparse(parsed, {
                encode: true
            })).to.be('a=%D0%BE%D0%B1%D1%8F%D0%B7%D0%B0%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9&c=d');
        });

        it('email=foo+bar-xyz@gmail.com', function () {
            var parsed = [
                { key: 'email', value: 'foo+bar-xyz@gmail.com' }
            ];
            expect(QueryParam.unparse(parsed)).to.be('email=foo+bar-xyz@gmail.com');
        });

        it('pre encoded text( must avoid double encoding) - "email=foo%2Bbar%40domain.com"', function () {
            var parsed = [
                { key: 'email', value: 'foo%2Bbar%40domain.com' }
            ];
            expect(QueryParam.unparse(parsed)).to.be('email=foo%2Bbar%40domain.com');
        });

        it('multibyte character - "multibyte=𝌆"', function () {
            var parsed = [
                { key: 'multibyte', value: '𝌆' }
            ];
            expect(QueryParam.unparse(parsed, {
                encode: true
            })).to.be('multibyte=%F0%9D%8C%86');
        });

        it('pre-encoded multibyte character - "multibyte=%F0%9D%8C%86"', function () {
            var parsed = [
                { key: 'multibyte', value: '%F0%9D%8C%86' }
            ];
            expect(QueryParam.unparse(parsed)).to.be('multibyte=%F0%9D%8C%86');
        });

        it('encoding percentage - "charwithPercent=%foo"', function () {
            var parsed = [
                { key: 'multibyte', value: '%foo' }
            ];
            expect(QueryParam.unparse(parsed, {
                encode: true
            })).to.be('multibyte=%25foo');
        });

        it('a[0]=foo&a[1]=bar', function () {
            var parsed = [
                { key: 'a[0]', value: 'foo' },
                { key: 'a[1]', value: 'bar' }
            ];
            expect(QueryParam.unparse(parsed)).to.be('a[0]=foo&a[1]=bar');
        });

        it('encodes ( and )- "a=foo(a)"', function () {
            var parsed = [
                { key: 'a', value: 'foo(a)' }
            ];
            expect(QueryParam.unparse(parsed, {
                encode: true
            })).to.be('a=foo%28a%29');
        });

        it('Russian - "a=Привет Почтальон"', function () {
            var parsed = [
                { key: 'a', value: 'Привет Почтальон' }
            ];
            expect(QueryParam.unparse(parsed, {
                encode: true
            })).to.be(
                'a=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82%20%D0%9F%D0%BE%D1%87%D1%82%D0%B0%D0%BB%D1%8C%D0%BE%D0%BD'
            );
        });

        it('Chinese- "a=你好"', function () {
            var parsed = [
                { key: 'a', value: '你好' }
            ];
            expect(QueryParam.unparse(parsed, {
                encode: true
            })).to.be('a=%E4%BD%A0%E5%A5%BD');
        });

        it('Japanese- "a=ハローポストマン"', function () {
            var parsed = [
                { key: 'a', value: 'ハローポストマン' }
            ];
            expect(QueryParam.unparse(parsed, {
                encode: true
            })).to.be('a=%E3%83%8F%E3%83%AD%E3%83%BC%E3%83%9D%E3%82%B9%E3%83%88%E3%83%9E%E3%83%B3');
        });

        it('Partial Russian - "a=Hello Почтальон"', function () {
            var parsed = [
                { key: 'a', value: 'Hello Почтальон' }
            ];
            expect(QueryParam.unparse(parsed, {
                encode: true
            })).to.be('a=Hello%20%D0%9F%D0%BE%D1%87%D1%82%D0%B0%D0%BB%D1%8C%D0%BE%D0%BD');
        });

        it('pre encoded russian text - a=Hello%20%D0%9F%D0%BE%D1%87%D1%82%D0%B0%D0%BB%D1%8C%D0%BE%D0%BD', function () {
            var parsed = [
                { key: 'a', value: 'Hello%20%D0%9F%D0%BE%D1%87%D1%82%D0%B0%D0%BB%D1%8C%D0%BE%D0%BD' }
            ];
            expect(QueryParam.unparse(parsed, {
                encode: true
            })).to.be('a=Hello%20%D0%9F%D0%BE%D1%87%D1%82%D0%B0%D0%BB%D1%8C%D0%BE%D0%BD');
        });
    });
});
