var _ = require('../util').lodash,
    Property = require('../collection/property').Property,
    Url = require('../collection/url').Url,

    MATCH_ALL = '*',
    PREFIX_DELIMITER = '^',
    POSTFIX_DELIMITER = '$',
    MATCH_ALL_URLS = '<all_urls>',
    ALLOWED_PROTOCOLS = ['http', 'https', 'file', 'ftp'],
    ALLOWED_PROTOCOLS_REGEX = ALLOWED_PROTOCOLS.join('|'),

    regexes = {
        escapeMatcher: /[.+^${}()|[\]\\]/g,
        escapeMatchReplacement: '\\$&',
        questionmarkMatcher: /\?/g,
        questionmarkReplacment: '.',
        starMatcher: '*',
        starReplacement: '.*',
        protocolMatcher: /.*:\/\//g,
        noProtocolPatternSplit: '^(\\*|\\*\\.[^*/]+|[^*/]+|)(/.*)$',
        patternSplit: '^(' + ALLOWED_PROTOCOLS_REGEX + '|\\*)*://(\\*|\\*\\.[^*/]+|[^*/]+|)(/.*)$'
    },

    UrlMatchPattern;

/**
 * UrlMatchPattern allows to create rules to define Urls to match for.
 * It is based on Google's Match Pattern - https://developer.chrome.com/extensions/match_patterns
 *
 * @example <caption>An example UrlMatchPattern</caption>
 * var matchPattern = new UrlMatchPattern('https://*.google.com/*');
*/
_.inherit((
  UrlMatchPattern = function UrlMatchPattern (options) {
      // called as new UrlMatchPattern('https://*.example.com/*')
      if (_.isString(options)) {
          options = { pattern: options };
      }

      // this constructor is intended to inherit and as such the super constructor is required to be executed
      UrlMatchPattern.super_.apply(this, arguments);

      this.update(options);
  }), Property);

_.assign(UrlMatchPattern.prototype, /** @lends UrlMatchPattern.prototype */ {
    /**
     * Assigns the given properties to the UrlMatchPattern
     * @param {{ pattern: (string) }} options
     */
    update: function (options) {
        /**
         * The url match pattern string
         * @type {String}
         */
        this.pattern = _.get(options, 'pattern') || this.pattern || MATCH_ALL_URLS;

        /**
         * The protocols which will be used to match the URLs
         * @type {Array}
         */
        this.protocols = _.get(options, 'protocols');

        _.isArray(this.protocols) && (this.pattern = this.pattern.replace(regexes.protocolMatcher, ''));

        // create a match pattern and store it on cache
        this._matchPatternObject = this.createMatchPattern();
    },

    /**
     * Used to generate the match regex object from the match string we have.
     * @private
     * @returns Match regex object
     */
    createMatchPattern: function () {
        var matchPattern = this.pattern,
            allowProtocols = _.isArray(this.protocols),
            match;

        // Check the match pattern of sanity and split it into protocol, host and path

        if (allowProtocols) {
            match = matchPattern.match(regexes.noProtocolPatternSplit);
        }
        else {
            match = matchPattern.match(regexes.patternSplit);
        }

        if (!match) {
            // This ensures it is a invalid match pattern
            return undefined;
        }

        return {
            protocol: allowProtocols ? null : match[1],
            host: allowProtocols ? match[1] : match[2],
            path: allowProtocols ? this.globPatternToRegexp(match[2]) : this.globPatternToRegexp(match[3])
        };
    },

    /**
     * Converts a given glob pattern into a regular expression
     * @private
     * @param {String} pattern Glob pattern string
     * @return {RegExp=}
     */
    globPatternToRegexp: function (pattern) {
        // Escape everything except ? and *.
        pattern = pattern.replace(regexes.escapeMatcher, regexes.escapeMatchReplacement);
        pattern = pattern.replace(regexes.questionmarkMatcher, regexes.questionmarkReplacment);
        pattern = pattern.replace(regexes.starMatcher, regexes.starReplacement);
        return new RegExp(PREFIX_DELIMITER + pattern + POSTFIX_DELIMITER);
    },

    /**
     * Tests if the given protocol string, is allowed by the pattern.
     *
     * @param {String=} protocol The protocol to be checked if the pattern allows.
     * @return {Boolean=}
     */
    testProtocol: function (protocol) {
        var matchRegexObject = this._matchPatternObject;

        if (_.isArray(this.protocols)) {
            return _.includes(this.protocols, protocol);
        }

        if (!_.includes(ALLOWED_PROTOCOLS, protocol)) {
            return false;
        }
        // Return true if test pattern is *, else return match
        return matchRegexObject.protocol === MATCH_ALL ? true : matchRegexObject.protocol === protocol;
    },

    /**
     * Tests if the given host string, is allowed by the pattern.
     *
     * @param {String=} host The host to be checked if the pattern allows.
     * @return {Boolean=}
     */
    testHost: function (host) {
        /*
        * For Host match, we are considering the port with the host, hence we are using getRemote() instead of getHost()
        * We need to address three cases for the host urlStr
        * 1. * It matches all the host + protocol,  hence we are not having any parsing logic for it.
        * 2. .*foo.bar.com Here the prefix could be anything but it should end with foo.bar.com
        * 3. foo.bar.com This is the absolute matching needs to done.
        */
        var matchRegexObject = this._matchPatternObject;
        return (
          this.matchAnyHost(matchRegexObject) ||
          this.matchAbsoluteHostPattern(matchRegexObject, host) ||
          this.matchSuffixHostPattern(matchRegexObject, host)
        );
    },

    /**
     * Checks whether the matchRegexObject has the MATCH_ALL host.
     * @private
     * @param {Object=} matchRegexObject The regex object generated by the createMatchPattern function.
     * @return {Boolean}
     */
    matchAnyHost: function (matchRegexObject) {
        return matchRegexObject.host === MATCH_ALL;
    },


    /**
      * Check for the (*.foo.bar.com) kind of matches with the remote provided
      * @private
      * @param {Object=} matchRegexObject The regex object generated by the createMatchPattern function.
      * @param {String=} remote The remote url (host+port) of the url for which the hostpattern needs to checked
      * @return {Boolean}
      */
    matchSuffixHostPattern: function (matchRegexObject, remote) {
        var hostSuffix = matchRegexObject.host.substr(2);
        return matchRegexObject.host[0] === MATCH_ALL && (remote === hostSuffix || remote.endsWith('.' + hostSuffix));
    },

    /**
     * Check for the absolute host match
     * @private
     * @param {Object=} matchRegexObject The regex object generated by the createMatchPattern function.
     * @param {String=} remote The remote url, host+port of the url for which the hostpattern needs to checked
     * @return {Boolean}
     */
    matchAbsoluteHostPattern: function (matchRegexObject, remote) {
        return matchRegexObject.host === remote;
    },

    /**
     * Tests if the current pattern allows the given path.
     *
     * @param {String=} path The path to be checked if the pattern allows.
     * @return {Boolean=}
     */
    testPath: function (path) {
        var matchRegexObject = this._matchPatternObject;
        return !_.isEmpty(path.match(matchRegexObject.path));
    },

    /**
      * Tests the url string with the match pattern provided.
      * Follows the https://developer.chrome.com/extensions/match_patterns pattern for pattern validation and matching
      *
      * @param {String=} urlStr The url string for which the proxy match needs to be done.
      * @returns {Boolean=}
      */
    test: function (urlStr) {
        /*
        * This function executes the code in the following sequence for early return avoiding the costly regex matches.
        * To avoid most of the memory consuming code.
        * 1. It check whether the match string is <all_urls> in that case, it return immediately without any further
        *    processing.
        * 2. Checks whether the matchPattern follows the rules, https://developer.chrome.com/extensions/match_patterns,
        *    If not then, dont process it.
        * 3. Check for the protocol, as it is a normal array check.
        * 4. Checks the host, as it doesn't involve regex match and has only string comparisons.
        * 5. Finally, checks for the path, which actually involves the Regex matching, the slow process.
        */
        // If the matchPattern is <all_urls> then there is no need for any validations.
        if (this.pattern === MATCH_ALL_URLS) {
            return true;
        }

        var url,
            matchRegexObject = this._matchPatternObject;

        // Empty matchRegexObject represents the match is INVALID match
        if (_.isEmpty(matchRegexObject)) {
            return false;
        }

        try {
            url = new Url(urlStr);
        }
        catch (e) {
            return false;
        }

        return (this.testProtocol(url.protocol) &&
            this.testHost(url.getRemote()) &&
            this.testPath(url.getPath()));
    },

    /**
     * Returns a string representation of the match pattern
     *
     * @return {String=} pattern
     */
    toString: function () {
        return _.isString(this.pattern) ? this.pattern : '';
    },

    /**
     * Returns the JSON representation
     * @return {{ pattern: (string) }}
     */
    toJSON: function () {
        var pattern;
        pattern = this.toString();

        return {
            pattern: pattern
        };
    }
});

_.assign(UrlMatchPattern, /** @lends UrlMatchPattern */ {
    /**
     * Defines the name of this property for internal use
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'UrlMatchPattern',

    /**
     * String representation for matching all urls - <all_urls>
     * @readOnly
     * @type {String}
     */
    MATCH_ALL_URLS: MATCH_ALL_URLS
});

module.exports = {
    UrlMatchPattern: UrlMatchPattern
};
