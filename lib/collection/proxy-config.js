var _ = require('../util').lodash,
    Property = require('./property').Property,
    Url = require('./url').Url,

    MATCH_ALL = '*',
    PREFIX_DELIMITER = '^',
    POSTFIX_DELIMITER = '$',
    MATCH_ALL_URLS = '<all_urls>',
    ALLOWED_PROTOCOLS = ['http', 'https'],
    ALLOWED_PROTOCOLS_REGEX = ALLOWED_PROTOCOLS.join('|'),

    regexes = {
        escapeMatcher: /[.+^${}()|[\]\\]/g,
        escapeMatchReplacement: '\\$&',
        questionmarkMatcher: /\?/g,
        questionmarkReplacment: '.',
        starMatcher: '*',
        starReplacement: '.*',
        patternSplit: '^(' + ALLOWED_PROTOCOLS_REGEX + '|\\*)*://(\\*|\\*\\.[^*/]+|[^*/]+|)(/.*)$'
    },

    ProxyConfig;


/**
* The following is the object structure accepted as constructor parameter while calling `new ProxyConfig(...)`. It is
* also the structure exported when {@link Property#toJSON} or {@link Property#toObjectResolved} is called on a
* Proxy instance.
* @typedef ProxyConfig~definition
*
* @property {String=} [url = *] The match for which the proxy needs to be configured. `*` represents select all.
* @property {Url=} [server = new Url()] The proxy server url.
* @property {Boolean=} [tunnel = false] The tunneling option for the proxy request.
* @property {Boolean=} [disabled = false] To override the proxy for the particiular url, you need to provide true.
*
* @example <caption>JSON definition of an example proxy object</caption>
* {
*     match: 'https://example.com',
*     server: 'https://proxy.com',
*     tunnel: true,
*     disabled: false
* }
*/
_.inherit((

    /**
     * A ProxyConfig definition that represents the proxy configuration for an url match.
     *
     * Properties can then use the `.toObjectResolved` function to procure an object representation of the property with
     * all the variable references replaced by corresponding values.
     * @constructor
     * @extends {Property}
     *
     * @param {ProxyConfig~definition=} [options] - Specifies object with props matches, server and tunnel.
     *
     * @example <caption>Create a new ProxyConfig</caption>
     * var ProxyConfig = require('postman-collection').ProxyConfig,
     *     myProxyConfig = new ProxyConfig({
     *          match: 'https://example*',
     *          server: 'https://proxy.com',
     *          tunnel: true,
     *          disabled: false
     *     });
     *
     */
    ProxyConfig = function ProxyConfig (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        ProxyConfig.super_.call(this, options);

        // Assign defaults before proceeding
        _.assign(this, /** @lends ProxyConfig.prototype */ {
            /**
             * The url mach for which the proxy has been associated with.
             * @type {String}
             */
            match: MATCH_ALL_URLS,

            /**
             * The server url or the proxy url.
             * @type {Url}
             */
            server: new Url(),

            /**
             * This represents whether the tunneling needs to done while proxying this request.
             * @type Boolean
             */
            tunnel: false
        });

        this.update(options);
    }), Property);

_.assign(ProxyConfig.prototype, /** @lends ProxyConfig.prototype */ {
    /**
     * Updates the properties of the proxy object based on the options provided.
     *
     * @param {ProxyConfig~definition} options The proxy object structure.
     */
    update: function (options) {
        if (!_.isObject(options)) {
            return;
        }
        _.has(options, 'server') && this.server.update(options.server);
        _.isString(options.match) && (this.match = options.match);
        _.has(options, 'server') && (this.tunnel = _.isBoolean(options.tunnel) ? options.tunnel : false);
    },

    /**
     * Tests the url string with the match provided.
     * Follows the https://developer.chrome.com/extensions/match_patterns pattern for pattern validation and matching
     *
     * @param {String=} [urlStr] The url string for which the proxy match needs to be done.
     */

    test: function(urlStr) {
        /*
        * This function executes the code in the following sequence for early return avoiding the costly regex matches.
        * To avoid most of the memory consuming code.
        * 1. It check whether the match string is <all_urls> in that case, it return immediately without any further
        *    processing.
        * 2. Checks whether the matchPattern follows the rules, https://developer.chrome.com/extensions/match_patterns,
        *    If not then, dont process it. It is a Regex match process which is slower, @todo needs to be cached in
        *    future.
        * 3. Check for the protocol, as it is a normal array check.
        * 4. Checks the host, as it doesn't involve only string comparisons.
        * 5. Finally, checks for the path, which actually involves the Regex matching, the slow process.
        */
        var matchRegexObject = {},
            match = null,
            url,
            hostSuffix = '';

        // If the matchPattern is <all_urls> then there is no need for any validations.
        if (this.match === MATCH_ALL_URLS) {
            return true;
        }

        // Check the match pattern of sanity and split it into protocol, host and path
        match = this.match.match(regexes.patternSplit);

        if (!match) {
            // This ensures it is a invalid match pattern
            return false;
        }

        // If the protocol retuns '*' we are going to assign ['https', 'http'] array to it.
        matchRegexObject.protocol = match[1] === MATCH_ALL ? ALLOWED_PROTOCOLS : [match[1]];

        matchRegexObject.host = match[2];

        if (match[3]) {
            matchRegexObject.path = this.globPatternToRegexp(match[3]);
        }

        // We reached here means, the match pattern provided is valid and been parsed to protocol, host and path.
        // Convert the url provided into a url object, happens only if the match string is parsed properly.
        try {
            url = new Url(urlStr);
        }
        catch (e) {
            return false;
        }

        // Check for the protocol availability in the parsed match protocol array
        if (!_.includes(matchRegexObject.protocol, url.protocol)) {
            return false;
        }

        /*
        * For Host match, we are considering the port with the host, hence we are using getRemote() instead of getHost()
        * We need to address three cases for the host urlStr
        * 1. * It matches all the host + protocol,  hence we are not having any parsing logic for it.
        * 2. .*foo.bar.com Here the prefix could be anything but it should end with foo.bar.com
        * 3. foo.bar.com This is the absolute matching needs to done.
        */
        if (matchRegexObject.host === MATCH_ALL) {
          // Don't check anything in host. simple go ahead for the path matching logic
        }
        else if (matchRegexObject.host[0] === MATCH_ALL) {
            // It must be *.foo. We also need to allow foo by itself.
            hostSuffix = matchRegexObject.host.substr(2);
            if (url.getRemote() !== hostSuffix && !url.getRemote().endsWith('.' + hostSuffix)) {
                return false;
            }
        }
        else if (matchRegexObject.host !== url.getRemote()) {
            return false;
        }

        // The path of the url has been tested
        if (!url.getPath().match(matchRegexObject.path)) {
            return false;
        }

        // If all the conditions are satisfied then it is matched.
        return true;
    },

    globPatternToRegexp: function(pattern) {
        // Escape everything except ? and *.
        pattern = pattern.replace(regexes.escapeMatcher, regexes.escapeMatchReplacement);
        pattern = pattern.replace(regexes.questionmarkMatcher, regexes.questionmarkReplacment);
        pattern = pattern.replace(regexes.starMatcher, regexes.starReplacement);
        return new RegExp(PREFIX_DELIMITER + pattern + POSTFIX_DELIMITER);
    }
});

_.assign(ProxyConfig, /** @lends ProxyConfig */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'ProxyConfig',

    /**
     * Specify the key to be used while indexing this object
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyIndexKey: 'match'

});

module.exports = {
    ProxyConfig: ProxyConfig
};
