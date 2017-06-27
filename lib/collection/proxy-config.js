var _ = require('../util').lodash,
    Property = require('./property').Property,
    UrlMatchPattern = require('../url-pattern/url-match-pattern').UrlMatchPattern,
    DEFAULT_PROTOCOLS = ['http'],
    DEFAULT_PORT = 8080,
    MAX_PORT = 65535,
    MIN_PORT = 0,
    regexes = {
        protocolMatcher: /.*:\/\//
    },
    ProxyConfig;


/**
* The following is the object structure accepted as constructor parameter while calling `new ProxyConfig(...)`. It is
* also the structure exported when {@link Property#toJSON} or {@link Property#toObjectResolved} is called on a
* Proxy instance.
* @typedef ProxyConfig~definition
*
* @property {String=} [match = '<all_url>'] The match for which the proxy needs to be configured.
* @property {String=} [host = ''] The proxy server url.
* @property {Integer=} [port = 8080] The proxy server port number.
* @property {Array=} [protocols = ['http']] The protocols that the proxy server supports
* @property {Boolean=} [tunnel = false] The tunneling option for the proxy request.
* @property {Boolean=} [disabled = false] To override the proxy for the particiular url, you need to provide true.
*
* @example <caption>JSON definition of an example proxy object</caption>
* {
*     match: 'example.com/*',
*     host: 'proxy.com',
*     port: 8080
*     protocols: ['https']
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
     *          match: 'example.com/*',
     *          host: 'proxy.com',
     *          port: 8080
     *          protocols: ['https']
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
            match: new UrlMatchPattern(),

            /**
             * The proxy server host or ip
             * @type {String}
             */
            host: '',

            /**
             * The proxy server port number
             * @type {Integer}
             */
            port: DEFAULT_PORT,

            /**
             * The protocol(s) that the proxy server supports
             * @type {Array}
             */
            protocols: DEFAULT_PROTOCOLS,

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
        _.isString(options.host) && (this.host = options.host.replace(regexes.protocolMatcher, ''));
        _.isInteger(options.port) && (options.port >= MIN_PORT && options.port <= MAX_PORT) && (this.port = options.port);
        _.isBoolean(options.tunnel) && (this.tunnel = options.tunnel);

        // match pattern
        if (_.isString(options.match)) {
            var matchPatternOptions = {
                ignoreProtocol: true,
                pattern: options.match
            };
            this.match = new UrlMatchPattern(matchPatternOptions);
        }
        // protocols
        _.isArray(options.protocols) && (this.protocols = options.protocols) ||
            _.isString(options.protocols) && (this.protocols = [options.protocols]);
    },

    /**
     * Tests the url string with the match provided.
     * Follows the https://developer.chrome.com/extensions/match_patterns pattern for pattern validation and matching
     *
     * @param {String=} [urlStr] The url string for which the proxy match needs to be done.
     */
    test: function(urlStr) {
        // this ensures we don't proceed any further for any protocol
        // that is not http or https
        if (_.isEmpty(urlStr) || (_.isString(urlStr) && !urlStr.startsWith('http'))) {
            return false;
        }

        return this.match.test(urlStr, this.protocols);
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
    _postman_propertyIndexKey: 'match',

    /**
     * Check whether an object is an instance of PostmanItem.
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isProxyConfig: function (obj) {
        return Boolean(obj) && ((obj instanceof ProxyConfig) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', ProxyConfig._postman_propertyName));
    }
});

module.exports = {
    ProxyConfig: ProxyConfig
};
