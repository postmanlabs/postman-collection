var expect = require('expect.js'),
    _ = require('lodash'),
    Url = require('../../').Url,
    rawUrls = require('../fixtures/').rawUrls;

/* global describe, it */
describe('Url', function () {
    describe('.parse()', function () {
        it('must parse bare ipv4 addresses', function () {
            var subject = Url.parse('127.0.0.1');
            expect(subject.protocol).to.be(undefined);
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be(undefined);
            expect(subject.path).to.be(undefined);
            expect(subject.query).to.be(undefined);
            expect(subject.hash).to.be(undefined);
        });

        it('must parse bare ipv4 addresses with variables', function () {
            var subject = Url.parse('127.0.{{subnet}}.1');
            expect(subject.protocol).to.be(undefined);
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '{{subnet}}', '1']);
            expect(subject.port).to.be(undefined);
            expect(subject.path).to.be(undefined);
            expect(subject.query).to.be(undefined);
            expect(subject.hash).to.be(undefined);
        });

        it('must parse bare ipv4 addresses with protocol', function () {
            var subject = Url.parse('http://127.0.0.1');
            expect(subject.protocol).to.be('http');
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be(undefined);
            expect(subject.path).to.be(undefined);
            expect(subject.query).to.be(undefined);
            expect(subject.hash).to.be(undefined);
        });

        it('must parse bare ipv4 addresses with non standard protocol', function () {
            var subject = Url.parse('{{my-protocol}}://127.0.0.1');
            expect(subject.protocol).to.be('{{my-protocol}}');
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be(undefined);
            expect(subject.path).to.be(undefined);
            expect(subject.query).to.be(undefined);
            expect(subject.hash).to.be(undefined);
        });

        it('must parse bare ipv4 addresses with port', function () {
            var subject = Url.parse('127.0.0.1:80');
            expect(subject.protocol).to.be(undefined);
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be('80');
            expect(subject.path).to.be(undefined);
            expect(subject.query).to.be(undefined);
            expect(subject.hash).to.be(undefined);
        });

        it('must parse invalid port of bare ipv4 addresses', function () {
            var subject = Url.parse('127.0.0.1:{{my-port}}');
            expect(subject.protocol).to.be(undefined);
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be('{{my-port}}');
            expect(subject.path).to.be(undefined);
            expect(subject.query).to.be(undefined);
            expect(subject.hash).to.be(undefined);
        });

        it('must parse bare ipv4 addresses with protocol and port', function () {
            var subject = Url.parse('http://127.0.0.1:80');
            expect(subject.protocol).to.be('http');
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be('80');
            expect(subject.path).to.be(undefined);
            expect(subject.query).to.be(undefined);
            expect(subject.hash).to.be(undefined);
        });
        it('must parse bare ipv4 addresses with protocol and port as variables', function () {
            var subject = Url.parse('{{my-protocol}}://127.0.0.1:{{my-port}}');
            expect(subject.protocol).to.be('{{my-protocol}}');
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be('{{my-port}}');
            expect(subject.path).to.be(undefined);
            expect(subject.query).to.be(undefined);
            expect(subject.hash).to.be(undefined);
        });
        it('must parse variable as host with protocol and port as variables', function () {
            var subject = Url.parse('{{my-protocol}}://{{my-host}}:{{my-port}}');
            expect(subject.protocol).to.be('{{my-protocol}}');
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['{{my-host}}']);
            expect(subject.port).to.be('{{my-port}}');
            expect(subject.path).to.be(undefined);
            expect(subject.query).to.be(undefined);
            expect(subject.hash).to.be(undefined);
        });

        it('must parse trailing path backslash in ipv4 address', function () {
            var subject = Url.parse('http://127.0.0.1/');
            expect(subject.protocol).to.be('http');
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.eql(undefined);
            expect(subject.path).to.eql(['']);
            expect(subject.query).to.be(undefined);
            expect(subject.hash).to.be(undefined);
        });

        it('must parse trailing path backslash in ipv4 address and port', function () {
            var subject = Url.parse('http://127.0.0.1:8080/');
            expect(subject.protocol).to.be('http');
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be('8080');
            expect(subject.path).to.eql(['']);
            expect(subject.query).to.be(undefined);
            expect(subject.hash).to.be(undefined);
        });

        it('must parse path backslash in ipv4 address and port', function () {
            var subject = Url.parse('http://127.0.0.1:8080/hello/world');
            expect(subject.protocol).to.be('http');
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be('8080');
            expect(subject.path).to.eql(['hello', 'world']);
            expect(subject.query).to.be(undefined);
            expect(subject.hash).to.be(undefined);
        });

        it('must parse path backslash in ipv4 address and port and retain trailing slash marker', function () {
            var subject = Url.parse('http://127.0.0.1:8080/hello/world/');
            expect(subject.protocol).to.be('http');
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be('8080');
            expect(subject.path).to.eql(['hello', 'world', '']);
            expect(subject.query).to.be(undefined);
            expect(subject.hash).to.be(undefined);
        });

        it('must parse path and query in ipv4 address and port and retain trailing slash marker', function () {
            var subject = Url.parse('127.0.0.1/hello/world/?query=param');
            expect(subject.protocol).to.be(undefined);
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be(undefined);
            expect(subject.path).to.eql(['hello', 'world', '']);
            expect(subject.query).to.eql([{
                key: 'query',
                value: 'param'
            }]);
            expect(subject.hash).to.be(undefined);
        });

        it('must parse ip address host with query param and hash', function () {
            var subject = Url.parse('127.0.0.1/hello/world/?query=param#test-api');
            expect(subject.protocol).to.be(undefined);
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be(undefined);
            expect(subject.path).to.eql(['hello', 'world', '']);
            expect(subject.query).to.eql([{
                key: 'query',
                value: 'param'
            }]);
            expect(subject.hash).to.be('test-api');
        });

        it('must parse url query-param even if `?` is present in the URL hash', function () {
            var subject = Url.parse('127.0.0.1/hello/world/?query=param#?test-api=true');
            expect(subject.protocol).to.be(undefined);
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be(undefined);
            expect(subject.path).to.eql(['hello', 'world', '']);
            expect(subject.query).to.eql([{
                key: 'query',
                value: 'param'
            }]);
            expect(subject.hash).to.be('?test-api=true');
        });

        it('must parse url even if dulicate `?` is present in query-param', function () {
            var subject = Url.parse('127.0.0.1/hello/world/?query=param&err?ng=v_l?e@!');
            expect(subject.protocol).to.be(undefined);
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be(undefined);
            expect(subject.path).to.eql(['hello', 'world', '']);
            expect(subject.query).to.eql([{
                key: 'query',
                value: 'param'
            }, {
                key: 'err?ng',
                value: 'v_l?e@!'
            }]);
            expect(subject.hash).to.be(undefined);
        });

        it('must parse url having auth even if dulicate `@` is present in query-param', function () {
            var subject = Url.parse('username:password@127.0.0.1/hello/world/?query=param&err?ng=v_l?e@!');
            expect(subject.protocol).to.be(undefined);
            expect(subject.auth).to.eql({
                user: 'username',
                password: 'password'
            });
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be(undefined);
            expect(subject.path).to.eql(['hello', 'world', '']);
            expect(subject.query).to.eql([{
                key: 'query',
                value: 'param'
            }, {
                key: 'err?ng',
                value: 'v_l?e@!'
            }]);
            expect(subject.hash).to.be(undefined);
        });

        it('must parse query params with no values and save the value as null', function () {
            var subject = Url.parse('127.0.0.1/hello/world/?query=param&valueless1&valueless2');
            expect(subject.protocol).to.be(undefined);
            expect(subject.auth).to.be(undefined);
            expect(subject.host).to.eql(['127', '0', '0', '1']);
            expect(subject.port).to.be(undefined);
            expect(subject.path).to.eql(['hello', 'world', '']);
            expect(subject.query).to.eql([{
                key: 'query',
                value: 'param'
            }, {
                key: 'valueless1',
                value: null
            }, {
                key: 'valueless2',
                value: null
            }]);
            expect(subject.hash).to.be(undefined);
        });
    });
    describe('unparsing', function () {
        rawUrls.forEach(function (rawUrl) {
            _.isString(rawUrl) && describe(rawUrl, function () {
                var url = new Url(rawUrl);
                it('should be unparsed properly', function () {
                    expect(url.getRaw()).to.eql(rawUrl);
                });
            });
        });

        it('should unparse urls containing parameters with equals sign properly', function () {
            var rawUrl = 'https://localhost:1234/get?param=(key==value)',
                url = new Url(rawUrl);
            expect(url.toString()).to.eql(rawUrl);
        });

        it('should unparse urls containing parameters with no value or equal sign', function () {
            var urlstring = 'https://localhost:1234/get?param1=&param2&param3',
                url = new Url(urlstring);
            expect(url.toString()).to.eql(urlstring);
        });

        it('should unparse urls containing parameters with no blank key and values', function () {
            var urlstring = 'https://localhost:1234/get?param1=&&&param2',
                url = new Url(urlstring);
            expect(url.toString()).to.eql(urlstring);
        });
    });

    describe('OAuth1 Base Url', function () {
        it('should be generated properly', function () {
            var rawUrl = rawUrls[8],
                url = new Url(rawUrl);
            expect(url.getOAuth1BaseUrl()).to.eql('http://example.com/resource');
        });
    });

    describe('Function variables', function () {
        it('should be unparsed properly', function () {
            var rawUrl = 'https://echo.getpostman.com/post?a={{$guid}}',
                url = new Url(rawUrl);
            expect(url.toString()).to.eql(rawUrl);
        });
    });

    describe('JSON representation', function () {
        it('should be generated properly', function () {
            var rawUrl = rawUrls[9],
                url = new Url(rawUrl),
                jsonified = url.toJSON();
            expect(jsonified.protocol).to.eql(rawUrl.protocol);
            expect(jsonified.host).to.eql(rawUrl.host.split('.'));
            expect(jsonified.port).to.eql(rawUrl.port);
            expect(jsonified.path).to.eql(rawUrl.path.split('/'));
            expect(jsonified.query).to.eql(rawUrl.query);
            expect(jsonified.hash).to.eql(rawUrl.hash);

            // Can't use normal comparisons, because variables are by default assigned
            // type = "any" and deep comparison fails because of that.
            _.each(rawUrl.variable, function (variable, index) {
                var jsonifiedVar = jsonified.variable[index];
                _.forOwn(variable, function (value, attribute) {
                    expect(jsonifiedVar[attribute]).to.eql(value);
                });
            });
        });
    });

    describe('Path Variables', function () {
        it('should be processed and resolved', function () {
            var rawUrl = rawUrls[10],
                url = new Url(rawUrl);
            expect(url.getPath()).to.eql('/get');
        });
    });

    describe('URL Encoding', function () {
        it('should be disabled by default', function () {
            var rawUrl = 'https://echo.getpostman.com/get?w=x%y',
                url = new Url(rawUrl);

            expect(url.toString()).to.eql('https://echo.getpostman.com/get?w=x%y');
        });

        it.skip('should be enabled if explicitly specified', function () {
            var rawUrl = 'https://echo.getpostman.com/get?w=x%y',
                url = new Url(rawUrl);

            expect(url.toString({
                encode: true
            })).to.eql('https://echo.getpostman.com/get?w=x%25y');
        });
    });
});
