var expect = require('chai').expect,
    _ = require('lodash'),
    Url = require('../../').Url,
    QueryParam = require('../../').QueryParam,
    PropertyList = require('../../').PropertyList,
    VariableList = require('../../').VariableList,
    rawUrls = require('../fixtures/').rawUrls;

describe('Url', function () {
    describe('sanity', function () {
        var rawUrl = 'https://user:pass@postman-echo.com/:path/get?a=1&b=2#heading',
            url = new Url(rawUrl);

        it('parsed successfully', function () {
            expect(url).to.be.ok;
            expect(url).to.be.an('object');
        });

        describe('has property', function () {
            it('auth', function () {
                expect(url).to.have.property('auth').that.is.an('object');
                expect(url.auth).to.deep.include({
                    user: 'user',
                    password: 'pass'
                });
            });

            it('hash', function () {
                expect(url).to.have.property('hash', 'heading');
            });

            it('host', function () {
                expect(url).to.have.property('host').that.eql(['postman-echo', 'com']);
            });

            it('path', function () {
                expect(url).to.have.property('path').that.eql([':path', 'get']);
            });

            it('port', function () {
                expect(url).to.have.property('port', undefined);
            });

            it('protocol', function () {
                expect(url).to.have.property('protocol', 'https');
            });

            it('query', function () {
                expect(url).to.have.property('query').that.is.an('object');
            });

            it('variables', function () {
                expect(url).to.have.property('variables').that.is.an('object');
            });

            it('update', function () {
                expect(url.update).to.be.ok;
                expect(url.update).to.be.a('function');
            });
        });

        describe('hosts in query params', function () {
            it('should accept hosts as query param values in URL strings sans protocol', function () {
                var url = new Url('google.com?param=https://fb.com');

                expect(url.toJSON()).to.eql({
                    host: ['google', 'com'],
                    query: [{ key: 'param', value: 'https://fb.com' }],
                    variable: []
                });
            });

            it('should accept hosts as query param values in URL strings with a protocol', function () {
                var url = new Url('http://google.com?param=https://fb.com');

                expect(url.toJSON()).to.eql({
                    protocol: 'http',
                    host: ['google', 'com'],
                    query: [{ key: 'param', value: 'https://fb.com' }],
                    variable: []
                });
            });

            it('should accept email addresses as query param values in URL strings', function () {
                var url = new Url('localhost:80/api/validate-email?user_email=fred@gmail.com');

                expect(url.toJSON()).to.eql({
                    host: ['localhost'],
                    path: ['api', 'validate-email'],
                    port: '80',
                    query: [{ key: 'user_email', value: 'fred@gmail.com' }],
                    variable: []
                });
            });
        });
    });

    describe('Constructor', function () {
        it('should be able to construct a URL from empty string', function () {
            var u = new Url('');

            expect(u).to.include.keys({
                auth: undefined,
                protocol: undefined,
                port: undefined,
                path: undefined,
                hash: undefined,
                host: undefined
            });
            expect(u).to.have.property('query').that.is.an.instanceOf(PropertyList);
            expect(u).to.have.property('variables').that.is.an.instanceOf(VariableList);
        });
    });

    describe('.parse()', function () {
        it('should parse empty string', function () {
            var subject = Url.parse('');

            // explicitly match object to track addition/deletion of properties.
            expect(subject).to.eql({
                raw: '',
                port: undefined,
                auth: undefined,
                protocol: undefined,
                host: undefined,
                path: undefined,
                query: undefined,
                hash: undefined,
                variable: undefined
            });
        });

        it('must parse bare ipv4 addresses', function () {
            var subject = Url.parse('127.0.0.1');

            expect(subject).to.deep.include({
                protocol: undefined,
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: undefined,
                path: undefined,
                query: undefined,
                hash: undefined
            });
        });

        it('must parse bare ipv4 addresses with variables', function () {
            var subject = Url.parse('127.0.{{subnet}}.1');

            expect(subject).to.deep.include({
                protocol: undefined,
                auth: undefined,
                host: ['127', '0', '{{subnet}}', '1'],
                port: undefined,
                path: undefined,
                query: undefined,
                hash: undefined
            });
        });

        it('must parse bare ipv4 addresses with protocol', function () {
            var subject = Url.parse('http://127.0.0.1');

            expect(subject).to.deep.include({
                protocol: 'http',
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: undefined,
                path: undefined,
                query: undefined,
                hash: undefined
            });
        });

        it('must parse bare ipv4 addresses with non standard protocol', function () {
            var subject = Url.parse('{{my-protocol}}://127.0.0.1');

            expect(subject).to.deep.include({
                protocol: '{{my-protocol}}',
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: undefined,
                path: undefined,
                query: undefined,
                hash: undefined
            });
        });

        it('must parse bare ipv4 addresses with port', function () {
            var subject = Url.parse('127.0.0.1:80');

            expect(subject).to.deep.include({
                protocol: undefined,
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: '80',
                path: undefined,
                query: undefined,
                hash: undefined
            });
        });

        it('must parse invalid port of bare ipv4 addresses', function () {
            var subject = Url.parse('127.0.0.1:{{my-port}}');

            expect(subject).to.deep.include({
                protocol: undefined,
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: '{{my-port}}',
                path: undefined,
                query: undefined,
                hash: undefined
            });
        });

        it('must parse bare ipv4 addresses with protocol and port', function () {
            var subject = Url.parse('http://127.0.0.1:80');

            expect(subject).to.deep.include({
                protocol: 'http',
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: '80',
                path: undefined,
                query: undefined,
                hash: undefined
            });
        });
        it('must parse bare ipv4 addresses with protocol and port as variables', function () {
            var subject = Url.parse('{{my-protocol}}://127.0.0.1:{{my-port}}');

            expect(subject).to.deep.include({
                protocol: '{{my-protocol}}',
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: '{{my-port}}',
                path: undefined,
                query: undefined,
                hash: undefined
            });
        });
        it('must parse variable as host with protocol and port as variables', function () {
            var subject = Url.parse('{{my-protocol}}://{{my-host}}:{{my-port}}');

            expect(subject).to.deep.include({
                protocol: '{{my-protocol}}',
                auth: undefined,
                host: ['{{my-host}}'],
                port: '{{my-port}}',
                path: undefined,
                query: undefined,
                hash: undefined
            });
        });

        it('must parse trailing path backslash in ipv4 address', function () {
            var subject = Url.parse('http://127.0.0.1/');

            expect(subject).to.deep.include({
                protocol: 'http',
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: undefined,
                path: [''],
                query: undefined,
                hash: undefined
            });
        });

        it('must parse trailing path backslash in ipv4 address and port', function () {
            var subject = Url.parse('http://127.0.0.1:8080/');

            expect(subject).to.deep.include({
                protocol: 'http',
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: '8080',
                path: [''],
                query: undefined,
                hash: undefined
            });
        });

        it('must parse path backslash in ipv4 address and port', function () {
            var subject = Url.parse('http://127.0.0.1:8080/hello/world');

            expect(subject).to.deep.include({
                protocol: 'http',
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: '8080',
                path: ['hello', 'world'],
                query: undefined,
                hash: undefined
            });
        });

        it('must parse path backslash in ipv4 address and port and retain trailing slash marker', function () {
            var subject = Url.parse('http://127.0.0.1:8080/hello/world/');

            expect(subject).to.deep.include({
                protocol: 'http',
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: '8080',
                path: ['hello', 'world', ''],
                query: undefined,
                hash: undefined
            });
        });

        it('must parse path and query in ipv4 address and port and retain trailing slash marker', function () {
            var subject = Url.parse('127.0.0.1/hello/world/?query=param');

            expect(subject).to.deep.include({
                protocol: undefined,
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: undefined,
                path: ['hello', 'world', ''],
                query: [{
                    key: 'query',
                    value: 'param'
                }],
                hash: undefined
            });
        });

        it('must parse ip address host with query param and hash', function () {
            var subject = Url.parse('127.0.0.1/hello/world/?query=param#test-api');

            expect(subject).to.deep.include({
                protocol: undefined,
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: undefined,
                path: ['hello', 'world', ''],
                query: [{
                    key: 'query',
                    value: 'param'
                }],
                hash: 'test-api'
            });
        });

        it('must parse url query-param even if `?` is present in the URL hash', function () {
            var subject = Url.parse('127.0.0.1/hello/world/?query=param#?test-api=true');

            expect(subject).to.deep.include({
                protocol: undefined,
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: undefined,
                path: ['hello', 'world', ''],
                query: [{
                    key: 'query',
                    value: 'param'
                }],
                hash: '?test-api=true'
            });
        });

        it('must parse url even if duplicate `?` is present in query-param', function () {
            var subject = Url.parse('127.0.0.1/hello/world/?query=param&err?ng=v_l?e@!');

            expect(subject).to.deep.include({
                protocol: undefined,
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: undefined,
                path: ['hello', 'world', ''],
                query: [{
                    key: 'query',
                    value: 'param'
                }, {
                    key: 'err?ng',
                    value: 'v_l?e@!'
                }],
                hash: undefined
            });
        });

        it('must parse url having auth even if duplicate `@` is present in query-param', function () {
            var subject = Url.parse('username:password@127.0.0.1/hello/world/?query=param&err?ng=v_l?e@!');

            expect(subject).to.deep.include({
                protocol: undefined,
                auth: {
                    user: 'username',
                    password: 'password'
                },
                host: ['127', '0', '0', '1'],
                port: undefined,
                path: ['hello', 'world', ''],
                query: [{
                    key: 'query',
                    value: 'param'
                }, {
                    key: 'err?ng',
                    value: 'v_l?e@!'
                }],
                hash: undefined
            });
        });

        it('must parse query params with no values and save the value as null', function () {
            var subject = Url.parse('127.0.0.1/hello/world/?query=param&valueless1&valueless2');

            expect(subject).to.deep.include({
                protocol: undefined,
                auth: undefined,
                host: ['127', '0', '0', '1'],
                port: undefined,
                path: ['hello', 'world', ''],
                query: [{
                    key: 'query',
                    value: 'param'
                }, {
                    key: 'valueless1',
                    value: null
                }, {
                    key: 'valueless2',
                    value: null
                }],
                hash: undefined
            });
        });

        it('must parse url hosts having dots within variables', function () {
            var subject = Url.parse('127.0.{{ip.subnet}}.1/get');

            expect(subject).to.deep.include({
                protocol: undefined,
                auth: undefined,
                host: ['127', '0', '{{ip.subnet}}', '1'],
                port: undefined,
                path: ['get']
            });
        });

        it('must parse url hosts having dots within variables and with values around variable', function () {
            var subject = Url.parse('127.0.1{{ip.subnet}}2.1/get');

            expect(subject).to.deep.include({
                protocol: undefined,
                auth: undefined,
                host: ['127', '0', '1{{ip.subnet}}2', '1'],
                port: undefined,
                path: ['get']
            });
        });

        it('must parse url hosts with invalid non-closing double braces', function () {
            var subject = Url.parse('127.0.{{ip.subnet.1');

            expect(subject).to.deep.include({
                protocol: undefined,
                auth: undefined,
                host: ['127', '0', '{{ip', 'subnet', '1'],
                port: undefined
            });
        });

        it('must parse url hosts with multiple variables with dots', function () {
            var subject = Url.parse('{{ip.network_identifier}}.{{ip.subnet}}.1');

            expect(subject).to.deep.include({
                protocol: undefined,
                auth: undefined,
                host: ['{{ip.network_identifier}}', '{{ip.subnet}}', '1'],
                port: undefined
            });
        });

        it('must parse url with file protocol', function () {
            var subject = Url.parse('file://hostname/path/to/file.txt');

            expect(subject).to.deep.include({
                protocol: 'file',
                auth: undefined,
                host: ['hostname'],
                path: ['path', 'to', 'file.txt'],
                port: undefined
            });
        });

        it('must parse url with file protocol and file name without extension', function () {
            var subject = Url.parse('file://hostname/path/to/file');

            expect(subject).to.deep.include({
                protocol: 'file',
                auth: undefined,
                host: ['hostname'],
                path: ['path', 'to', 'file'],
                port: undefined
            });
        });

        it('must parse url with file protocol and relative path to files', function () {
            var subject = Url.parse('file://../path/to/file');

            expect(subject).to.deep.include({
                protocol: 'file',
                auth: undefined,
                host: ['', '', ''],
                path: ['path', 'to', 'file'],
                port: undefined
            });
        });

        it('must parse url with file protocol and with leading / in path', function () {
            var subject = Url.parse('file:///etc/hosts');

            expect(subject.protocol).to.equal('file');
            expect(subject.auth).to.be.undefined;
            expect(subject.host).to.be.undefined;
            expect(subject.path).to.eql(['etc', 'hosts']);
            expect(subject.port).to.be.undefined;
        });

        it('must parse url with file protocol and with leading / in path and relative path', function () {
            var subject = Url.parse('file:///../etc/hosts');

            expect(subject.protocol).to.equal('file');
            expect(subject.auth).to.be.undefined;
            expect(subject.host).to.be.undefined;
            expect(subject.path).to.eql(['..', 'etc', 'hosts']);
            expect(subject.port).to.be.undefined;
        });

        it('must parse url with file protocol and with multiple leading / in path and relative path', function () {
            var subject = Url.parse('file:////../etc/hosts');

            expect(subject).to.deep.include({
                protocol: 'file',
                host: undefined,
                path: ['', '..', 'etc', 'hosts']
            });
            expect(subject.auth).to.be.undefined;
            expect(subject.port).to.be.undefined;
        });

        it('should parse path variables properly', function () {
            var subject = Url.parse('http://127.0.0.1/:a/:ab.json/:a+b');

            expect(subject).to.have.property('variable').that.has.lengthOf(3).that.eql([
                { key: 'a' }, { key: 'ab.json' }, { key: 'a+b' }
            ]);
        });

        it('should not parse empty path variables', function () {
            var subject = Url.parse('http://127.0.0.1/:/:/:var');

            expect(subject.path).to.eql([':', ':', ':var']);
            expect(subject.variable).to.have.lengthOf(1).that.eql([{ key: 'var' }]);
        });

        it('should parse a path variable only once if it is used multiple times', function () {
            var subject = Url.parse('http://127.0.0.1/:foo/:bar/:foo');

            expect(subject).to.have.property('variable').that.has.lengthOf(2).that.eql([
                { key: 'foo' }, { key: 'bar' }
            ]);
        });

        it('should parse path variables containing special characters properly', function () {
            var subject = Url.parse('http://127.0.0.1/:郵差/:foo.json');

            expect(subject).to.have.property('variable').that.has.lengthOf(2).that.eql([
                { key: '郵差' }, { key: 'foo.json' }
            ]);
        });

        it('should parse with variables having reserved characters', function () {
            var subject = Url.parse('{{p://}}://{{@}}:{{###}}@{{host.name}}:{{:p}}/{{f/o/o}}/bar?{{?}}={{&}}#{{[#]}}');

            expect(subject).to.deep.include({
                raw: '{{p://}}://{{@}}:{{###}}@{{host.name}}:{{:p}}/{{f/o/o}}/bar?{{?}}={{&}}#{{[#]}}',
                protocol: '{{p://}}',
                auth: { user: '{{@}}', password: '{{###}}' },
                host: ['{{host.name}}'],
                port: '{{:p}}',
                path: ['{{f/o/o}}', 'bar'],
                query: [{ key: '{{?}}', value: '{{&}}' }],
                hash: '{{[#]}}'
            });
        });

        it('should handle newlines in every segment', function () {
            var subject = Url.parse('http://\n:\r@\r.\n:\n/\n/\n?\n=\r#\n');

            expect(subject).to.deep.include({
                raw: 'http://\n:\r@\r.\n:\n/\n/\n?\n=\r#\n',
                protocol: 'http',
                auth: { user: '\n', password: '\r' },
                host: ['\r', '\n'],
                port: '\n',
                path: ['\n', '\n'],
                query: [{ key: '\n', value: '\r' }],
                hash: '\n'
            });
        });

        it('should handle empty port', function () {
            var subject = Url.parse('localhost:/path');

            expect(subject).to.deep.include({
                raw: 'localhost:/path',
                host: ['localhost'],
                port: '',
                path: ['path']
            });
        });

        it('should handle \\ in pathname', function () {
            var subject = Url.parse('http://localhost\\foo\\bar');

            expect(subject).to.deep.include({
                raw: 'http://localhost\\foo\\bar',
                host: ['localhost'],
                path: ['foo', 'bar']
            });
        });

        it('should distinguish between hostname and path', function () {
            var subject = Url.parse('http://postman.com:80\\@evil.com/#foo\\bar');

            expect(subject).to.deep.include({
                raw: 'http://postman.com:80\\@evil.com/#foo\\bar',
                protocol: 'http',
                host: ['postman', 'com'],
                port: '80',
                path: ['@evil.com', ''],
                hash: 'foo\\bar'
            });
        });

        it('should handle local IPv6 address', function () {
            var subject = Url.parse('http://[::1]/path');

            expect(subject).to.deep.include({
                raw: 'http://[::1]/path',
                host: ['[::1]'],
                path: ['path']
            });
        });

        it('should handle IPv6 address with port', function () {
            var subject = Url.parse('http://[::1]:8080');

            expect(subject).to.deep.include({
                raw: 'http://[::1]:8080',
                protocol: 'http',
                host: ['[::1]'],
                port: '8080'
            });
        });

        it('should handle IPv6 address without port', function () {
            var subject = Url.parse('http://[1080:0:0:0:8:800:200C:417A]/foo/bar?q=z');

            expect(subject).to.deep.include({
                raw: 'http://[1080:0:0:0:8:800:200C:417A]/foo/bar?q=z',
                protocol: 'http',
                host: ['[1080:0:0:0:8:800:200C:417A]'],
                path: ['foo', 'bar'],
                query: [{ key: 'q', value: 'z' }]
            });
        });

        it('should handle IPv6 with auth', function () {
            var subject = Url.parse('http://user:password@[1080:0:0:0:8:800:200C:417A]:8080');

            expect(subject).to.deep.include({
                raw: 'http://user:password@[1080:0:0:0:8:800:200C:417A]:8080',
                protocol: 'http',
                host: ['[1080:0:0:0:8:800:200C:417A]'],
                auth: {
                    user: 'user',
                    password: 'password'
                },
                port: '8080'
            });
        });

        it('should trim whitespace on the left', function () {
            var subject = Url.parse(' \n\t\rhttp://localhost/path\n/name\n ');

            expect(subject).to.deep.include({
                raw: 'http://localhost/path\n/name\n ',
                protocol: 'http',
                host: ['localhost'],
                path: ['path\n', 'name\n ']
            });
        });

        it('should handle multiple : in auth', function () {
            var subject = Url.parse('http://user:p:a:s:s@localhost');

            expect(subject).to.deep.include({
                raw: 'http://user:p:a:s:s@localhost',
                protocol: 'http',
                host: ['localhost'],
                auth: {
                    user: 'user',
                    password: 'p:a:s:s'
                }
            });
        });

        it('should handle multiple @ in auth', function () {
            var subject = Url.parse('http://us@r:p@ssword@localhost');

            expect(subject).to.deep.include({
                raw: 'http://us@r:p@ssword@localhost',
                protocol: 'http',
                host: ['localhost'],
                auth: {
                    user: 'us@r',
                    password: 'p@ssword'
                }
            });
        });

        it('should handle multiple ???', function () {
            var subject = Url.parse('http://localhost/p/q=foo@bar???&hl=en&src=api&x=2&y=2&z=3&s=');

            expect(subject).to.deep.include({
                raw: 'http://localhost/p/q=foo@bar???&hl=en&src=api&x=2&y=2&z=3&s=',
                protocol: 'http',
                host: ['localhost'],
                path: ['p', 'q=foo@bar'],
                query: [
                    { key: '??', value: null },
                    { key: 'hl', value: 'en' },
                    { key: 'src', value: 'api' },
                    { key: 'x', value: '2' },
                    { key: 'y', value: '2' },
                    { key: 'z', value: '3' },
                    { key: 's', value: '' }
                ]
            });
        });

        it('should handle multiple &&&', function () {
            var subject = Url.parse('http://localhost?foo=bar&&&bar=baz');

            expect(subject).to.deep.include({
                raw: 'http://localhost?foo=bar&&&bar=baz',
                protocol: 'http',
                host: ['localhost'],
                query: [
                    { key: 'foo', value: 'bar' },
                    { key: null, value: null },
                    { key: null, value: null },
                    { key: 'bar', value: 'baz' }
                ]
            });
        });

        it('should handle auth without password', function () {
            var subject = Url.parse('http://root@localhost');

            expect(subject).to.deep.include({
                raw: 'http://root@localhost',
                protocol: 'http',
                host: ['localhost'],
                auth: {
                    user: 'root',
                    password: undefined
                }
            });
        });

        it('should handle handle protocol with backslashes', function () {
            var subject = Url.parse('http:\\\\localhost');

            expect(subject).to.deep.include({
                raw: 'http:\\\\localhost',
                protocol: 'http',
                host: ['localhost']
            });
        });
    });

    describe('unparsing', function () {
        rawUrls.forEach(function (rawUrl) {
            _.isString(rawUrl) && describe(rawUrl, function () {
                var url = new Url(rawUrl);

                it('should be unparsed properly', function () {
                    expect(url.toString()).to.eql(rawUrl);
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

        it('should add a protocol if asked to', function () {
            var urlstring = 'httpbin.org/get?a=1',
                url = new Url(urlstring);

            expect(url.toString(true)).to.eql('http://' + urlstring);
        });

        it('should not add a protocol if asked to but one already exists', function () {
            var urlstring = 'https://httpbin.org/get?a=1',
                url = new Url(urlstring);

            expect(url.toString(true)).to.eql(urlstring);
        });

        it('should not add a protocol if not asked to', function () {
            var urlstring = 'httpbin.org/get?a=1',
                url = new Url(urlstring);

            expect(url.toString()).to.eql(urlstring);
        });

        it('must handle falsy input correctly', function () {
            expect(new Url().toString()).to.equal('');
            expect(new Url('').toString()).to.equal('');
            expect(new Url(null).toString()).to.equal('');
            expect(new Url(undefined).toString()).to.equal('');
        });

        it('must not include disabled query params in the unparsed result', function () {
            var url = new Url({
                host: 'postman-echo.com',
                query: [
                    { key: 'foo', value: 'bar' },
                    { key: 'alpha', value: 'beta', disabled: true }
                ]
            });

            expect(url.toString()).to.equal('postman-echo.com?foo=bar');
        });
    });

    describe('OAuth1 Base Url', function () {
        it('should be generated properly', function () {
            var rawUrl = rawUrls[8],
                url = new Url(rawUrl);

            expect(url.getOAuth1BaseUrl()).to.eql('http://example.com/Resource');
        });
    });

    describe('Function variables', function () {
        it('should be unparsed properly', function () {
            var rawUrl = 'https://postman-echo.com/post?a={{$guid}}',
                url = new Url(rawUrl);

            expect(url.toString()).to.eql(rawUrl);
        });
    });

    describe('JSON representation', function () {
        it('should be generated properly', function () {
            var parsedUrl = new Url({
                protocol: 'http',
                host: ['postman-echo', 'com'],
                port: '80',
                path: [':resource'],
                query: [{ key: 'id', value: '123' }],
                variable: [
                    {
                        id: 'resource',
                        value: 'post'
                    },
                    {
                        id: 'foo',
                        value: 'bar'
                    }
                ]
            }).toJSON();

            expect(parsedUrl).to.be.ok;
            expect(parsedUrl).to.deep.include({
                protocol: 'http',
                host: ['postman-echo', 'com'],
                path: [':resource'],
                port: '80',
                query: [{
                    key: 'id',
                    value: '123'
                }]
            });
            expect(parsedUrl.hash).to.be.undefined;

            expect(parsedUrl.variable).to.be.ok;
            expect(parsedUrl.variable.length).to.eql(2);

            expect(parsedUrl.variable[0]).to.be.ok;
            expect(parsedUrl.variable[0]).to.deep.include({
                id: 'resource',
                value: 'post'
            });

            expect(parsedUrl.variable[1]).to.be.ok;
            expect(parsedUrl.variable[1]).to.deep.include({
                id: 'foo',
                value: 'bar'
            });
        });

        it('should parse host even if sent as string', function () {
            var parsedUrl = new Url({
                protocol: 'http',
                host: 'postman-echo.com',
                path: ':resource'
            }).toJSON();

            expect(parsedUrl).to.be.ok;
            expect(parsedUrl.host).to.eql(['postman-echo', 'com']);
        });

        it('should parse path even if sent as string', function () {
            var parsedUrl = new Url({
                protocol: 'http',
                host: 'postman-echo.com',
                path: ':resource'
            }).toJSON();

            expect(parsedUrl).to.be.ok;
            expect(parsedUrl.path).to.eql([':resource']);
        });

        it('should drop malformed leading separator in path definition when sent as a string', function () {
            var parsedUrl = new Url({
                protocol: 'http',
                host: 'postman-echo.com',
                path: '/:resource'
            }).toJSON();

            expect(parsedUrl).to.be.ok;
            expect(parsedUrl.path).to.eql([':resource']);
        });
    });

    describe('Path Variables', function () {
        it('should be processed and resolved', function () {
            var rawUrl = rawUrls[10],
                url = new Url(rawUrl);

            expect(url.getPath()).to.eql('/get');
        });

        it('should ignore non string valued path variables correctly', function () {
            var url = new Url({
                protocol: 'https',
                host: 'postman-echo.com',
                port: '443',
                path: '/:alpha/:beta/:gamma/:delta/:epsilon/:phi',
                variable: [
                    { id: 'alpha', value: 'get' },
                    { id: 'beta', value: null },
                    { id: 'gamma', value: NaN },
                    { id: 'gamma', value: undefined },
                    { id: 'epsilon', value: [] },
                    { id: 'phi', value: {} }
                ]
            });

            expect(url.getPath()).to.eql('/get/:beta/:gamma/:delta/:epsilon/:phi');
        });

        it('should work correctly without the id field as well', function () {
            var url = new Url({
                protocol: 'https',
                host: 'postman-echo.com',
                port: '443',
                path: '/:alpha/:beta/:gamma/:delta/:epsilon/:phi',
                variable: [
                    { key: 'alpha', value: 'get' },
                    { key: 'beta', value: null },
                    { key: 'gamma', value: NaN },
                    { key: 'gamma', value: undefined },
                    { key: 'epsilon', value: [] },
                    { key: 'phi', value: {} }
                ]
            });

            expect(url.getPath()).to.eql('/get/:beta/:gamma/:delta/:epsilon/:phi');
        });

        it('should not resolve path variables when unresolved is set to false', function () {
            var url = new Url({
                protocol: 'https',
                host: 'postman-echo.com',
                port: '443',
                path: '/:alpha/:beta/:gamma/:delta/:epsilon/:phi',
                variable: [
                    { key: 'alpha', value: '1' },
                    { key: 'beta', value: '2' },
                    { key: 'gamma', value: '3' },
                    { key: 'gamma', value: '4' },
                    { key: 'epsilon', value: '5' },
                    { key: 'phi', value: '6' }
                ]
            });

            expect(url.getPath({
                unresolved: true
            })).to.eql('/:alpha/:beta/:gamma/:delta/:epsilon/:phi');
        });
    });

    describe('URL Encoding', function () {
        it('should be disabled by default', function () {
            var rawUrl = 'https://postman-echo.com/get?w=x%y',
                url = new Url(rawUrl);

            expect(url.toString()).to.eql('https://postman-echo.com/get?w=x%y');
        });
    });

    describe('toString', function () {
        it('should return empty string when url is empty', function () {
            var url = new Url();

            expect(url.toString()).to.eql('');
        });

        it('should handle null auth.user', function () {
            var url = new Url({ host: 'localhost', auth: { user: null, password: 'password' } });

            expect(url.toString()).to.eql(':password@localhost');
        });

        it('should handle null auth.password', function () {
            var url = new Url({ host: 'localhost', auth: { user: 'user', password: null } });

            expect(url.toString()).to.eql('user@localhost');
        });

        it('should handle empty auth', function () {
            var url = new Url({ host: 'localhost', auth: {} });

            expect(url.toString()).to.eql('localhost');
        });

        it('should handle empty path properly', function () {
            var url = new Url('https://postman-echo.com///get');

            expect(url.toString()).to.eql('https://postman-echo.com///get');
        });

        it('should handle disabled query parameters', function () {
            var url = new Url({
                host: 'https://postman-echo.com',
                query: [{
                    key: 'foo',
                    value: 'bar',
                    disabled: true
                }]
            });

            expect(url.toString()).to.eql('https://postman-echo.com');
        });

        it('should encode &, = and # in query parameters', function () {
            var url = new Url({
                host: 'https://postman-echo.com',
                query: [{
                    key: '#foo=',
                    value: 'bar =&= {{&baz=}}'
                }]
            });

            expect(url.toString()).to.eql('https://postman-echo.com?%23foo%3D=bar =%26= {{&baz=}}');
        });

        it('should handle bare ipv4 addresses with variables', function () {
            var url = '127.0.{{subnet}}.1';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should handle bare ipv4 addresses with protocol and port as variables', function () {
            var url = '{{my-protocol}}://127.0.0.1:{{my-port}}';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should handle trailing path backslash in ipv4 address and port', function () {
            var url = 'http://127.0.0.1:8080/';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should handle url with file protocol and relative path to files', function () {
            var url = 'file://../path/to/file';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should handle path variables', function () {
            var url = 'http://127.0.0.1/:郵差/:/:foo.json';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should resolve path variables', function () {
            var url = new Url({
                host: 'localhost',
                path: '/:v1/:/:郵差',
                variable: [
                    { key: 'v1', value: 'foo' },
                    { key: '郵差', value: 'bar' }
                ]
            });

            expect(url.toString()).to.equal('localhost/foo/:/bar');
        });

        it('should handle variables having reserved characters', function () {
            var url = '{{p://}}://{{@}}:{{###}}@{{host.name}}:{{:p}}/{{f/o/o}}/bar?{{?}}={{&}}#{{[#]}}';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should handle whitespace and newlines', function () {
            var url = 'http://\n:\r@\r.\n:\n/\n/\n?\n=\r#\n';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should trim whitespace on the left', function () {
            var url = ' \n\t\rhttp://localhost/path\n/name\n ';

            expect((new Url(url)).toString()).to.equal(url.trimLeft());
        });

        it('should replace \\ in pathname with /', function () {
            var url = 'http://localhost\\foo\\bar';

            expect((new Url(url)).toString()).to.equal('http://localhost/foo/bar');
        });

        it('should replace \\ in protocol with /', function () {
            var url = 'http:\\\\localhost/foo\\bar';

            expect((new Url(url)).toString()).to.equal('http://localhost/foo/bar');
        });

        it('should handle IPv6 with auth', function () {
            var url = 'http://user:password@[1080:0:0:0:8:800:200C:417A]:8080';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should handle multiple : and @ in auth', function () {
            var url = 'http://us@r:p@ssword@localhost';

            expect((new Url(url)).toString()).to.equal(url);

            url = 'http://user:p:a:s:s@localhost';
            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should handle auth without user', function () {
            var url = 'http://:password@localhost';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should handle auth without password', function () {
            var url = 'http://user@localhost';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should handle empty path', function () {
            const url = new Url({ host: 'localhost', path: '' });

            expect(url.path).to.be.undefined;
            expect(url.toString()).to.equal('localhost');
        });

        it('should retain @ in auth without user and password', function () {
            var url = 'http://@localhost';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should retain : in auth with empty user and password', function () {
            var url = 'http://:@localhost';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should retain : in empty port', function () {
            var url = 'localhost:/path';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should retain / in empty path', function () {
            var url = 'localhost/';

            expect((new Url(url)).toString()).to.equal(url);
            expect((new Url({ host: 'localhost', path: '/' })).toString()).to.equal(url);
        });

        it('should retain # in empty hash', function () {
            var url = 'localhost#';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should retain ? in empty query param', function () {
            var url = 'http://localhost?';

            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should retain & in empty query params', function () {
            var url = 'http://localhost?&';

            expect((new Url(url)).toString()).to.equal(url);

            url = 'http://localhost?&&';
            expect((new Url(url)).toString()).to.equal(url);

            url = 'http://localhost?foo&';
            expect((new Url(url)).toString()).to.equal(url);

            url = 'http://localhost?&foo';
            expect((new Url(url)).toString()).to.equal(url);
        });

        it('should handle disabled query params', function () {
            expect(new Url({
                host: 'localhost',
                query: [
                    { key: 'foo', value: 'bar', disabled: true },
                    { key: '', value: null, disabled: true }
                ]
            }).toString()).to.equal('localhost');

            expect(new Url({
                host: 'localhost',
                query: [
                    { key: 'foo', value: 'bar', disabled: true },
                    { key: '', value: null, disabled: false }
                ]
            }).toString()).to.equal('localhost?');
        });

        it('should handle non-string port number', function () {
            expect(new Url({
                host: 'localhost',
                port: 8081
            }).toString()).to.equal('localhost:8081');

            expect(new Url({
                host: 'localhost',
                port: new Number(123) // eslint-disable-line no-new-wrappers
            }).toString()).to.equal('localhost:123');
        });

        it('should handle query parameters as string', function () {
            var url = new Url({
                host: 'https://postman-echo.com',
                query: 'foo=bar'
            });

            expect(url.toString()).to.equal('https://postman-echo.com?foo=bar');
        });

        it('should not add query parameters if set to null', function () {
            var url = new Url({
                host: 'https://postman-echo.com',
                query: null
            });

            expect(url.toString()).to.equal('https://postman-echo.com');
        });

        it('should not add query parameters if set to empty string', function () {
            var url = new Url({
                host: 'https://postman-echo.com',
                query: ''
            });

            expect(url.toString()).to.equal('https://postman-echo.com');
        });
    });

    describe('getHost', function () {
        it('should return empty string when url is empty', function () {
            var url = new Url();

            expect(url.getHost()).to.eql('');
        });
    });

    describe('getRemote', function () {
        describe('default', function () {
            it('should return empty string when url is empty', function () {
                var url = new Url();

                expect(url.getRemote()).to.eql('');
            });

            it('should get the correct remote when port is specified', function () {
                var rawUrl = 'https://postman-echo.com:8999/get?w=x%y',
                    url = new Url(rawUrl);

                expect(url.getRemote()).to.eql('postman-echo.com:8999');
            });

            it('should get the correct remote when port is not specified and protocol is "http"', function () {
                var rawUrl = 'http://postman-echo.com/get?w=x%y',
                    url = new Url(rawUrl);

                expect(url.getRemote()).to.eql('postman-echo.com');
            });

            it('should get the correct remote when port is not specified and protocol is "https"', function () {
                var rawUrl = 'https://postman-echo.com/get?w=x%y',
                    url = new Url(rawUrl);

                expect(url.getRemote()).to.eql('postman-echo.com');
            });

            it('should get the correct remote when port is specified and protocol is "http"', function () {
                var rawUrl = 'http://postman-echo.com:22/get?w=x%y',
                    url = new Url(rawUrl);

                expect(url.getRemote()).to.eql('postman-echo.com:22');
            });

            it('should get the correct remote when port is specified and protocol is "https"', function () {
                var rawUrl = 'https://postman-echo.com:3344/get?w=x%y',
                    url = new Url(rawUrl);

                expect(url.getRemote()).to.eql('postman-echo.com:3344');
            });

            it('should get the correct remote when port is specified and protocol is not specified', function () {
                var rawUrl = 'postman-echo.com:8999/get?w=x%y',
                    url = new Url(rawUrl);

                expect(url.getRemote()).to.eql('postman-echo.com:8999');
            });

            it('should get the correct remote when port is not specified and protocol is not specified', function () {
                var rawUrl = 'postman-echo.com/get?w=x%y',
                    url = new Url(rawUrl);

                expect(url.getRemote()).to.eql('postman-echo.com');
            });
        });

        describe('forcePort', function () {
            var options = {
                forcePort: true
            };

            it('should get the correct remote when port is not specified and protocol is "http"', function () {
                var rawUrl = 'http://postman-echo.com/get?w=x%y',
                    url = new Url(rawUrl);

                expect(url.getRemote(options)).to.eql('postman-echo.com:80');
            });

            it('should get the correct remote when port is not specified and protocol is "https"', function () {
                var rawUrl = 'https://postman-echo.com/get?w=x%y',
                    url = new Url(rawUrl);

                expect(url.getRemote(options)).to.eql('postman-echo.com:443');
            });

            it('should get the correct remote when port is not specified and protocol is not specified', function () {
                var rawUrl = 'postman-echo.com/get?w=x%y',
                    url = new Url(rawUrl);

                expect(url.getRemote(options)).to.eql('postman-echo.com:80');
            });
        });

        describe('isUrl', function () {
            it('Should return true for the ProxyConfigList constructor', function () {
                var url = new Url({}, []);

                expect(Url.isUrl(url)).to.be.true;
            });

            it('Should return false for the invalid ProxyConfigList', function () {
                var url = { _postman_propertyName: 'Url' };

                expect(Url.isUrl(url)).to.be.false;
            });
        });
    });

    describe('.getHost', function () {
        it('should handle string based hosts correctly', function () {
            var url = new Url('postman-echo.com');

            expect(url.getHost()).to.equal('postman-echo.com');

            url.host = url.host.join('.'); // hijack the host form to ensure sanity in the next assertion
            expect(url.getHost()).to.equal('postman-echo.com');
        });
    });

    describe('.getOAuth1BaseUrl', function () {
        it('should use the default protocol of http', function () {
            var url = new Url('https://postman-echo.com/auth/oauth1');

            delete url.protocol;
            expect(url.getOAuth1BaseUrl()).to.equal('http://postman-echo.com/auth/oauth1');
        });

        it('should use the the port if one is provided', function () {
            var url = new Url('https://postman-echo.com:8443/auth/oauth1');

            expect(url.getOAuth1BaseUrl()).to.equal('https://postman-echo.com:8443/auth/oauth1');
        });

        it('should not append superfluous protocol separators', function () {
            var url = new Url('https://postman-echo.com/auth/oauth1');

            url.protocol = 'https://';
            expect(url.getOAuth1BaseUrl()).to.equal('https://postman-echo.com/auth/oauth1');
        });
    });

    describe('.getRaw', function () {
        it('should throw error as function is discontinued', function () {
            var url = new Url('http://example.com');

            expect(function () {
                url.getRaw();
            }).to.throw('`Url#getRaw` has been discontinued, use `Url#toString` instead.');
        });
    });

    describe('Query parameters', function () {
        it('should correctly add a string of query params to an existing Url instance', function () {
            var url = new Url();

            url.addQueryParams('alpha=foo&beta=bar');

            expect(url.toJSON().query).to.eql([
                { key: 'alpha', value: 'foo' },
                { key: 'beta', value: 'bar' }
            ]);
        });

        // Refer: https://github.com/postmanlabs/postman-app-support/issues/8924
        it('should correctly add hasOwnProperty query key to an existing Url instance', function () {
            var url = new Url();

            url.addQueryParams('hasOwnProperty=0&foo=bar');

            expect(url.toJSON().query).to.eql([
                { key: 'hasOwnProperty', value: '0' },
                { key: 'foo', value: 'bar' }
            ]);
        });

        it('should correctly remove a list of query params from an existing Url instance', function () {
            var url = new Url('https://postman-echo.com/get?alpha=foo&beta=bar&gamma=baz');

            url.removeQueryParams([{ key: 'alpha' }, { key: 'gamma' }]);
            expect(url.toJSON().query).to.eql([{ key: 'beta', value: 'bar' }]);

            url.removeQueryParams(['beta']);
            expect(url.toJSON().query).to.eql([]);
        });

        it('should return an empty string if there are no query parameters', function () {
            var url = new Url('https://postman-echo.com/getbaz');

            expect(url.getQueryString()).to.equal('');
        });

        it('should return the stringified query string when the query parameters are set', function () {
            var url = new Url('https://postman-echo.com/getbaz?foo=bar');

            expect(url.getQueryString()).to.equal('foo=bar');
        });

        it('should return the complete path, including the query string for given URL', function () {
            var url = new Url('https://postman-echo.com/getbaz?foo=bar');

            expect(url.getPathWithQuery()).to.equal('/getbaz?foo=bar');
        });

        it('must be able to convert query params to object', function () {
            var url = new Url('http://127.0.0.1/hello/world/?query=param&query2=param2#test-api');

            expect(url.query.toObject()).to.eql({ query: 'param', query2: 'param2' });
        });
    });

    describe('Security', function () {
        describe('ReDoS', function () {
            // as per NSP guidelines, anything that blocks the event loop for a second or more is a potential DOS threat
            this.timeout(2000);

            // The raw URLs are being constructed here to avoid messing up the timing sequence for the tests below
            var q = '?',
                at = '@',
                eq = '=',
                amp = '&',
                dot = '.',
                hash = '#',
                sep = ':',
                fk = 5e3,
                slash = '/', // not to be confused with the Guns and Roses guitarist
                protoSep = sep + slash.repeat(2),
                // ~76 million characters
                longUrl = 'h'.repeat(fk) + protoSep + 'u'.repeat(fk) + sep + 'p'.repeat(fk) + at +
                    ('d'.repeat(fk) + dot).repeat(50) + 'com' + sep + 1e10 + (slash + 'x'.repeat(fk)).repeat(fk) +
                    q + ('k'.repeat(fk) + eq + 'v'.repeat(fk) + amp).repeat(fk) + hash + 'r'.repeat(fk),
                longProto = 'h'.repeat(1e7) + protoSep + 'postman-echo.com',
                longAuth = 'https://' + 'u'.repeat(1e7) + sep + 'p'.repeat(1e7) + '@postman-echo.com',
                // ~50 billion characters
                longPath = 'https://postman-echo.com' + (slash + 'x'.repeat(fk)).repeat(1e4),
                longHash = 'https://postman-echo.com#' + 'h'.repeat(1e8),
                // ~0.5 million characters
                longHost = ('a'.repeat(fk) + dot).repeat(100) + 'com',
                // 50 million characters
                longQuery = 'postman-echo.com?' + ('k'.repeat(fk) + eq + 'v'.repeat(fk) + amp).repeat(fk);

            it('should be thwarted for a long URL', function () {
                var url = new Url(longUrl),
                    json = url.toJSON();

                expect(url).to.be.ok;
                expect(json.auth.user).to.have.lengthOf(fk);
                expect(json.auth.password).to.have.lengthOf(fk);
                expect(json.protocol).to.have.lengthOf(fk);
                expect(json.port).to.equal(1e10.toString());
                expect(json.path).to.have.lengthOf(fk);
                expect(json.hash).to.have.lengthOf(fk);
                expect(json.host).to.have.lengthOf(51);
                expect(json.query).to.have.lengthOf(fk + 1);
            });

            it('should be thwarted for a long protocol', function () {
                var url = new Url(longProto),
                    json = url.toJSON();

                expect(url).to.be.ok;
                expect(json.protocol).to.have.lengthOf(1e7);
                expect(json).to.not.have.keys(['auth', 'port', 'path', 'hash', 'query']);
                expect(json.host).to.eql(['postman-echo', 'com']);
            });

            it('should be thwarted for a long auth', function () {
                var url = new Url(longAuth),
                    json = url.toJSON();

                expect(url).to.be.ok;
                expect(json).to.not.have.keys(['port', 'path', 'hash', 'query']);
                expect(json.auth.user).to.have.lengthOf(1e7);
                expect(json.auth.password).to.have.lengthOf(1e7);
                expect(json.host).to.eql(['postman-echo', 'com']);
            });

            it('should be thwarted for a long path', function () {
                var url = new Url(longPath),
                    json = url.toJSON();

                expect(url).to.be.ok;
                expect(json).to.not.have.keys(['port', 'auth', 'hash', 'query']);
                expect(json.host).to.eql(['postman-echo', 'com']);
                expect(json.path).to.have.lengthOf(1e4);
            });

            it('should be thwarted for a long hash', function () {
                var url = new Url(longHash),
                    json = url.toJSON();

                expect(url).to.be.ok;
                expect(json).to.not.have.keys(['port', 'auth', 'query', 'path']);
                expect(json.host).to.eql(['postman-echo', 'com']);
                expect(json.hash).to.have.lengthOf(1e8);
            });

            it('should be thwarted for a long host', function () {
                var url = new Url(longHost),
                    json = url.toJSON();

                expect(url).to.be.ok;
                expect(json).to.not.have.keys(['port', 'auth', 'query', 'path', 'hash', 'protocol']);
                expect(json.host).to.have.lengthOf(101);
            });

            it('should be thwarted for a long query', function () {
                var url = new Url(longQuery),
                    json = url.toJSON();

                expect(url).to.be.ok;
                expect(json).to.not.have.keys(['port', 'auth', 'query', 'path', 'hash', 'protocol']);
                expect(json.host).to.eql(['postman-echo', 'com']);
                expect(json.query).to.have.lengthOf(fk + 1);
            });
        });
    });

    describe('Regression', function () {
        describe('path', function () {
            // Tests issue where path starting with empty segment removes first segment on `Url.getPath()`
            // Reference: https://github.com/postmanlabs/postman-app-support/issues/4761

            it('should handle empty path properly', function () {
                var url = new Url('https://postman-echo.com////////get/');

                expect(url.path).to.be.an('array').that.has.lengthOf(9);
                expect(url.toString()).to.eql('https://postman-echo.com////////get/');
            });

            it('should parse string path properly for JSON representation', function () {
                var url = new Url({
                    protocol: 'http',
                    host: 'postman-echo.com',
                    path: '/get'
                });

                expect(url.path).to.be.an('array').that.eql(['get']);
            });

            it('should parse multiple empty path properly for JSON representation', function () {
                var url = new Url({
                    protocol: 'http',
                    host: 'postman-echo.com',
                    path: '///get'
                });

                expect(url.path).to.be.an('array').that.eql(['', '', 'get']);
            });
        });

        describe('query', function () {
            // Tests issue where trailing spaces were removed from value of query parameter
            // Reference: https://github.com/postmanlabs/postman-app-support/issues/6097
            it('should not remove trailing whitespace from value of last query parameter', function () {
                var url = new Url('https://postman-echo.com/get?foo1  =bar1  &foo2  =bar2  ');

                expect(url.query.all()[0].key).to.eql('foo1  ');
                expect(url.query.all()[0].value).to.eql('bar1  ');
                expect(url.query.all()[1].key).to.eql('foo2  ');
                expect(url.query.all()[1].value).to.eql('bar2  ');
            });

            it('should handle query parameters with empty key or value', function () {
                var url = new Url('https://postman-echo.com?get&=bar&=&baz=&&');

                expect(url.query.all()).to.have.deep.members([
                    new QueryParam({ key: 'get', value: null }),
                    new QueryParam({ key: '', value: 'bar' }),
                    new QueryParam({ key: '', value: '' }),
                    new QueryParam({ key: 'baz', value: '' }),
                    new QueryParam({ key: null, value: null }),
                    // why's ☝🏻 different from 👇🏻 (╯°□°)╯︵ ┻━┻
                    new QueryParam({ key: '', value: null })
                ]);
            });
        });
    });
});
