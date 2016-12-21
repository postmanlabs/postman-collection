var expect = require('expect.js'),
    ProxyConfig = require('../../lib/index.js').ProxyConfig,
    Url = require('../../lib/index.js').Url;

describe('Proxy Config', function () {
    describe('globPatternToRegexp', function () {
        var pc = new ProxyConfig();
        it('should escapes the regex releated characters', function () {
            var pattern = '[.+^${}()[]',
                convertedPattern = pc.globPatternToRegexp(pattern);
            expect(convertedPattern).to.eql(/^\[\.\+\^\$\{\}\(\)\[\]$/); // eslint-disable-line no-useless-escape
        });

        it('should change ? to .', function () {
            var pattern = '?foo',
                convertedPattern = pc.globPatternToRegexp(pattern);
            expect(convertedPattern).to.eql(/^.foo$/);
        });

        it('should change * to .*', function () {
            var pattern = '*foo',
                convertedPattern = pc.globPatternToRegexp(pattern);
            expect(convertedPattern).to.eql(/^.*foo$/);
        });
    });

    describe('getMatchRegexObject', function () {
        it('should parse any URL that uses the http protocol', function () {
            var pc = new ProxyConfig({ match: 'http://*/*', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject();
            expect(matchPatternObject.protocol).to.eql(['http']);
            expect(matchPatternObject.host).to.eql('*');
            expect(matchPatternObject.path).to.eql(/^\/.*$/);
        });

        it('should parse any URL that uses the http protocol, on any host, with path starts with /foo', function () {
            var pc = new ProxyConfig({ match: 'http://*/foo*', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject();
            expect(matchPatternObject.protocol).to.eql(['http']);
            expect(matchPatternObject.host).to.eql('*');
            expect(matchPatternObject.path).to.eql(/^\/foo.*$/);
        });

        it('should parse any URL that uses the https protocol, is on a google.com host', function () {
            var pc = new ProxyConfig({ match: 'http://*.google.com/foo*bar', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject();
            expect(matchPatternObject.protocol).to.eql(['http']);
            expect(matchPatternObject.host).to.eql('*.google.com');
            expect(matchPatternObject.path).to.eql(/^\/foo.*bar$/);
        });

        it('should parse any URL that uses the http protocol and is on the host 127.0.0.1', function () {
            var pc = new ProxyConfig({ match: 'http://127.0.0.1/*', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject();
            expect(matchPatternObject.protocol).to.eql(['http']);
            expect(matchPatternObject.host).to.eql('127.0.0.1');
            expect(matchPatternObject.path).to.eql(/^\/.*$/);
        });

        it('should parse any URL that uses the http protocol and is on the host ends with 0.0.1', function () {
            var pc = new ProxyConfig({ match: 'http://*.0.0.1/', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject();
            expect(matchPatternObject.protocol).to.eql(['http']);
            expect(matchPatternObject.host).to.eql('*.0.0.1');
            expect(matchPatternObject.path).to.eql(/^\/$/);
        });

        it('should parse any URL which has host mail.google.com', function () {
            var pc = new ProxyConfig({ match: '*://mail.google.com/*', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject();
            expect(matchPatternObject.protocol).to.eql(['http', 'https']);
            expect(matchPatternObject.host).to.eql('mail.google.com');
            expect(matchPatternObject.path).to.eql(/^\/.*$/);
        });

        it('Bad Match pattern [No Path]', function () {
            var pc = new ProxyConfig({ match: 'http://www.google.com', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject();
            expect(matchPatternObject).to.eql({});
        });

        it('Bad Match pattern ["*" in the host can be followed only by a "." or "/"]', function () {
            var pc = new ProxyConfig({ match: 'http://*foo/bar', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject();
            expect(matchPatternObject).to.eql({});
        });

        it('Bad Match pattern [If "*" is in the host, it must be the first character]', function () {
            var pc = new ProxyConfig({ match: 'http://foo.*.bar/baz', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject();
            expect(matchPatternObject).to.eql({});
        });

        it('Bad Match pattern [Missing protocol separator ("/" should be "//")]', function () {
            var pc = new ProxyConfig({ match: 'http:/bar', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject();
            expect(matchPatternObject).to.eql({});
        });

        it('Bad Match pattern [Invalid protocol', function () {
            var pc = new ProxyConfig({ match: 'foo://*', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject();
            expect(matchPatternObject).to.eql({});
        });
    });

    describe('protocolMatched', function () {
        it('should check for protocol in matchPatternObject [both https and http]', function () {
            var pc = new ProxyConfig({ match: '*://*/*', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject(),
                httpsMatched = pc.protocolMatched(matchPatternObject, 'https'),
                httpMatched = pc.protocolMatched(matchPatternObject, 'http');
            expect(httpsMatched).to.eql(true);
            expect(httpMatched).to.eql(true);
        });

        it('should check for protocol in matchPatternObject and returns false for http', function () {
            var pc = new ProxyConfig({ match: 'https://*/*', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject(),
                httpMatched = pc.protocolMatched(matchPatternObject, 'http');
            expect(httpMatched).to.eql(false);
        });

        it('should check for protocol which is not http or https', function () {
            var pc = new ProxyConfig({ match: '*://*/*', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject(),
                ftpMatched = pc.protocolMatched(matchPatternObject, 'ftp');
            expect(ftpMatched).to.eql(false);
        });
    });

    describe('hostMatched', function () {
        it('should match any host', function () {
            var pc = new ProxyConfig({ match: '*://*/*', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject(),
                anyhost = pc.hostMatched(matchPatternObject, new Url('randomhost.com'));
            expect(anyhost).to.eql(true);
        });

        it('should match host starts with any and have suffix as if in the pattern', function () {
            var pc = new ProxyConfig({ match: 'https://*.foo.com/*', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject(),
                hostMatched = pc.hostMatched(matchPatternObject, new Url('bar.foo.com'));
            expect(hostMatched).to.eql(true);
        });

        it('should match host ends with a suffix as if in the pattern', function () {
            var pc = new ProxyConfig({ match: 'https://*.foo.com/*', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject(),
                hostMatched = pc.hostMatched(matchPatternObject, new Url('foo.com'));
            expect(hostMatched).to.eql(true);
        });

        it('should match host with exact as like in match', function () {
            var pc = new ProxyConfig({ match: '*://foo.com/*', server: 'https://proxy.com/' }),
                matchPatternObject = pc.getMatchRegexObject(),
                hostMatched = pc.hostMatched(matchPatternObject, new Url('foo.com'));
            expect(hostMatched).to.eql(true);
        });
    });


    describe('test', function () {
        it('should match all urls provided', function () {
            var pc = new ProxyConfig({ server: 'https://proxy.com/', tunnel: true });
            expect(pc.test('http://www.google.com/')).to.eql(true);
            expect(pc.test('http://foo.bar.com/')).to.eql(true);
        });

        it('should match all sdk Url provided', function () {
            var pc = new ProxyConfig({ server: 'https://proxy.com/', tunnel: true });
            expect(pc.test(new Url('http://www.google.com/'))).to.eql(true);
            expect(pc.test(new Url('http://foo.bar.com/'))).to.eql(true);
        });

        it('should parse any URL that uses the http protocol', function () {
            var pc = new ProxyConfig({ match: 'http://*/*', server: 'https://proxy.com/' });
            expect(pc.test('http://www.google.com/')).to.eql(true);
            expect(pc.test('http://foo.bar.com/')).to.eql(true);
        });

        it('should parse any URL that uses the http protocol, on any host, with path starts with /foo', function () {
            var pc = new ProxyConfig({ match: 'http://*/foo*', server: 'https://proxy.com/' });
            expect(pc.test('http://example.com/foo/bar.html')).to.eql(true);
            expect(pc.test('http://www.google.com/foo')).to.eql(true);
        });

        it('should parse any URL that uses the https protocol, is on a google.com host', function () {
            var pc = new ProxyConfig({ match: 'http://*.google.com/foo*bar', server: 'https://proxy.com/' });
            expect(pc.test('http://www.google.com/foo/baz/bar')).to.eql(true);
            expect(pc.test('http://docs.google.com/foobar')).to.eql(true);
        });

        it('should parse any URL that uses the http protocol and is on the host 127.0.0.1', function () {
            var pc = new ProxyConfig({ match: 'http://127.0.0.1/*', server: 'https://proxy.com/' });
            expect(pc.test('http://127.0.0.1/')).to.eql(true);
            expect(pc.test('http://127.0.0.1/foo/bar.html')).to.eql(true);
        });

        it('should parse any URL that uses the http protocol and is on the host ends with 0.0.1', function () {
            var pc = new ProxyConfig({ match: 'http://*.0.0.1/', server: 'https://proxy.com/' });
            expect(pc.test('http://127.0.0.1/')).to.eql(true);
            expect(pc.test('http://125.0.0.1/')).to.eql(true);
        });

        it('should parse any URL which has host mail.google.com', function () {
            var pc = new ProxyConfig({ match: '*://mail.google.com/*', server: 'https://proxy.com/' });
            expect(pc.test('http://mail.google.com/foo/baz/bar')).to.eql(true);
            expect(pc.test('https://mail.google.com/foobar')).to.eql(true);
        });

        it('Bad Match pattern [No Path]', function () {
            var pc = new ProxyConfig({ match: 'http://www.google.com', server: 'https://proxy.com/' });
            expect(pc.test('http://www.google.com')).to.eql(false);
        });

        it('Bad Match pattern ["*" in the host can be followed only by a "." or "/"]', function () {
            var pc = new ProxyConfig({ match: 'http://*foo/bar', server: 'https://proxy.com/' });
            expect(pc.test('http://*foo.com')).to.eql(false);
        });

        it('Bad Match pattern [If "*" is in the host, it must be the first character]', function () {
            var pc = new ProxyConfig({ match: 'http://foo.*.bar/baz', server: 'https://proxy.com/' });
            expect(pc.test('http://foo.z.bar/baz')).to.eql(false);
        });

        it('Bad Match pattern [Missing protocol separator ("/" should be "//")]', function () {
            var pc = new ProxyConfig({ match: 'http:/bar', server: 'https://proxy.com/' });
            expect(pc.test('http:/bar.com')).to.eql(false);
        });

        it('Bad Match pattern [Invalid protocol', function () {
            var pc = new ProxyConfig({ match: 'foo://*', server: 'https://proxy.com/' });
            expect(pc.test('foo://www.google.com')).to.eql(false);
        });
    });
});
