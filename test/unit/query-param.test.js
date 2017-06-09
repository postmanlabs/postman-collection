var _ = require('lodash'),
    expect = require('expect.js'),
    QueryParam = require('../../').QueryParam,
    rawQueryStrings = require('../fixtures/index').rawQueryStrings;

/* global describe, it */
describe('QueryParam', function () {
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

    describe('integrity', function () {
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
            it('parsing - ' + string, function () {
                expect(QueryParam.parse(string)).to.eql(array);
            });

            it('unparsing - ' + string, function () {
                expect(QueryParam.unparse(array)).to.eql(string);
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
