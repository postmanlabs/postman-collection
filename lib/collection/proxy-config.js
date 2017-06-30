var _ = require('../util').lodash,
    Property = require('./property').Property,
    Url = require('../collection/url').Url,
    UrlMatchPattern = require('../url-pattern/url-match-pattern').UrlMatchPattern,
    ProxyConfig,
    DEFAULT_PORT = 8080,
    PROTOCOL_HOST_SEPARATOR = '://',
    DEFAULT_PROTOCOL = 'http',
    regexes = {
        protocolMatcher: /.*:\/\//,
        validProtocolTester: UrlMatchPattern.validProtocolTester
    };

/**
* The following is the object structure accepted as constructor parameter while calling `new ProxyConfig(...)`. It is
* also the structure exported when {@link Property#toJSON} or {@link Property#toObjectResolved} is called on a
* Proxy instance.
* @typedef ProxyConfig~definition
*
* @property {String=} [match = '<all_url>'] The match for which the proxy needs to be configured.
* @property {String=} [host = ''] The proxy server url.
* @property {Integer=} [port = 8080] The proxy server port number.
* @property {Boolean=} [tunnel = false] The tunneling option for the proxy request.
* @property {Boolean=} [disabled = false] To override the proxy for the particiular url, you need to provide true.
*
* @example <caption>JSON definition of an example proxy object</caption>
* {
*     match: 'http+https://example.com/*',
*     host: 'proxy.com',
*     port: 8080
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
     *          host: 'proxy.com',
     *          match: 'http+https://example.com/*',
     *          port: 8080,
     *          tunnel: true,
     *          disabled: false
     *     });
     *
     */
    ProxyConfig = function ProxyConfig (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        ProxyConfig.super_.call(this, options);

        // Assign defaults before proceeding
        _.assign(this, /** @lends ProxyConfig */ {
            /**
             * The proxy server host or ip
             * @type {String}
             */
            host: '',

            /**
             * The url mach for which the proxy has been associated with.
             * @type {String}
             */
            match: new UrlMatchPattern(),

            /**
             * The proxy server port number
             * @type {Integer}
             */
            port: DEFAULT_PORT,

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
     * Defines whether this property instances requires an id
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_requiresId: true,

    /**
     * Updates the properties of the proxy object based on the options provided.
     *
     * @param {ProxyConfig~definition} options The proxy object structure.
     */
    update: function (options) {
        if (!_.isObject(options)) {
            return;
        }

        var port = parseInt(options.port, 10);

        _.isString(options.host) && (this.host = options.host.replace(regexes.protocolMatcher, ''));
        _.isString(options.match) && (this.match = new UrlMatchPattern(options.match));
        _.isInteger(port) && (this.port = port);
        _.isBoolean(options.tunnel) && (this.tunnel = options.tunnel);
        // todo: Add update method in parent class Property and call that here
        _.isBoolean(options.disabled) && (this.disabled = options.disabled);
    },

    /**
     * Tests the url string with the match provided.
     * Follows the https://developer.chrome.com/extensions/match_patterns pattern for pattern validation and matching
     *
     * @param {String=} [urlStr] The url string for which the proxy match needs to be done.
     */
    test: function(urlStr) {
        // this ensures we don't proceed any further for any non-supported protocol
        if (_.isEmpty(urlStr) || (_.isString(urlStr) && !urlStr.match(regexes.validProtocolTester))) {
            return false;
        }

        return this.match.test(urlStr);
    },

    /**
     * Returns the proxy server url. The protocol in the returned URL will be taken from the passed `urlStr`.
     * If the passed `urlStr` does not have any protocol then the default Protocol `http` will be used
     * @param {String=} [urlStr] The url string for which the proxy will be used
     * @returns {String}
     */
    getProxyUrl: function (urlStr) {
        var url;

        try {
            url = new Url(urlStr);
        }
        catch (e) {
            return '';
        }

        return (url.protocol || DEFAULT_PROTOCOL) + PROTOCOL_HOST_SEPARATOR + this.host + ':' + this.port;
    },

    /**
     * Returns the protocols supported
     *
     * @returns {Array.<String>}
     */
    getProtocols: function () {
        return this.match.getProtocols();
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
