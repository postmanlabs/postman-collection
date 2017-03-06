var expect = require('expect.js'),
    UrlMatchPatternList = require('../../lib/url-pattern/url-match-pattern-list').UrlMatchPatternList,

    // return a target to run specs on
    getTargetForSpec = function (matchPatternString) {
        return new UrlMatchPatternList({}, [matchPatternString]);
    },

    // We run every spec for test method on UrlMatchPattern and UrlMatchPatternList
    // because the UrlMatchPatternList.prototype.test does not internally use
    // UrlMatchPattern.prototype.test.
    // So we have to run the spec on both pattern.test and patternList.test
    // to ensure they behave the same.
    specForTestMethodOnTarget = require('./url-match-pattern.test.js').specForTestMethodOnTarget;

describe('UrlMatchPatternList', function () {
    describe('test', function () {
        specForTestMethodOnTarget(getTargetForSpec);

        it('should match for any', function () {
            var matchPatternList = new UrlMatchPatternList({}, ['https://example.com/*']);
            expect(matchPatternList.test('https://example.com')).to.eql(true);
            expect(matchPatternList.test('https://example.com/')).to.eql(true);
            expect(matchPatternList.test('https://www.example.com/')).to.eql(false);
            expect(matchPatternList.test('https://example.com/hello')).to.eql(true);
            expect(matchPatternList.test('https://example.com/foo/bar')).to.eql(true);
            expect(matchPatternList.test('https://foo.example.com')).to.eql(false);
            expect(matchPatternList.test('https://foo.com')).to.eql(false);
        });
        it('should match any url for <all_urls>', function() {
            var matchPatternList = new UrlMatchPatternList({}, ['<all_urls>']);
            expect(matchPatternList.test('https://google.com')).to.eql(true);
            expect(matchPatternList.test('https://www.google.com')).to.eql(true);
            expect(matchPatternList.test('https://example.com')).to.eql(true);
            expect(matchPatternList.test('https://foo.com')).to.eql(true);
        });
        it('should match url is pattern list', function() {
            var matchPatternList = new UrlMatchPatternList({}, ['https://google.com/*', 'https://example.com/*']);
            expect(matchPatternList.test('https://google.com')).to.eql(true);
            expect(matchPatternList.test('https://example.com')).to.eql(true);
            expect(matchPatternList.test('https://foo.com')).to.eql(false);
        });
    });

    describe('toJSON', function() {
        it('should return [] when called on an empty UrlMatchPatternList', function() {
            var patternList = new UrlMatchPatternList();
            expect(patternList.toJSON()).to.eql([]);
        });
    });
});
