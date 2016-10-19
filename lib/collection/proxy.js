var _ = require('../util').lodash,
    Property = require('./property').Property,
    Url = require('./url').Url,

    E = '',
    SEMICOLON = ';',
    MATCH_ALL = '*',
    HTTPS = 'https',
    HTTP = 'http',
    PROTOCOL_SEPARATOR = '://',
    regexes = {
        sanitize: /(PROXY)|(DIRECT)|\[|\]|\s/g
    },

    HTTPS_PROTOCOL = HTTPS + PROTOCOL_SEPARATOR,

    Proxy;


/**
* You can either provide the options object alone to the constructor or the ProxyString and the UrlString
*
* The following is the object structure accepted as constructor parameter while calling `new Proxy(...)`. It is
* also the structure exported when {@link Property#toJSON} or {@link Property#toObjectResolved} is called on a
* Proxy instance.
* @typedef Proxy~definition
*
* @property {String=} [url = *] The url for which the proxy needs to be configured. `*` represents select all.
* @property {String=} [protocol = http] The proxy server protocol.
* @property {String=} [host = ''] The proxy server host name.
* @property {String=} [port = ''] The proxy server port.
*
* @example <caption>JSON definition of an example proxy object</caption>
* {
*     url: 'https://example.com',
*     protocol: 'http',
*     host: 'proxy.com',
*     port: 88
* }
*
*/
_.inherit((

/**
 * A Postman Proxy definition that represents the proxy configuration for an url.
 *
 * Properties can then use the `.toObjectResolved` function to procure an object representation of the property with
 * all the variable references replaced by corresponding values.
 * @constructor
 * @extends {Property}
 *
 * @param {Proxy~definition=} [options] - Specify the object structure of proxy or the proxyString to be parsed
 * or supported formats returns by the PAC files as provided {@link
 * https://web.archive.org/web/20070602031929/http://wp.netscape.com/eng/mozilla/2.0/relnotes/demo/proxy-live.html
 * here.}
 * @param {String=} [url = *] - The url for which the proxy needs to be used (Wild cards are also supported).
 *
 * @example <caption>Create a new Proxy</caption>
 * var Proxy = require('postman-collection').Proxy,
 *     myProxy = new Proxy({
 *         url: 'https://example.com',
 *         protocol: 'http',
 *         host: 'proxy.com',
 *         port: 88
 *     });
 *
 * @example <caption>Parse a proxyString</caption>
 * var Proxy = require('postman-collection').Proxy,
 *     myProxy = new Proxy('PROXY [https://proxy.com]:88', 'http://example.com');
 */
    Proxy = function PostmanProxy (options, url) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        Proxy.super_.call(this, options);

        // Assign defaults before proceeding
        _.assign(this, /** @lends Variable.prototype */ {
            /**
             * The url for which the proxy has been associated with.
             * @type {String}
             */
            url: MATCH_ALL,

            /**
             * @type {String}
             */
            protocol: HTTP,

            /**
             * @type {Boolean}
             */
            direct: !_.isEmpty(options) && _.isEmpty(options.host)

        });

        // If the options and url is a string then we need to parse the input and update it.
        _.isString(options) && (options = Proxy.parse(options, url));

        // Make sure the 'url' key property is available in the options provided or generated
        this.update(options);
    }), Property);

_.assign(Proxy.prototype, /** @lends Proxy.prototype */ {
    /**
     * Updates the properties of the proxy object based on the options provided.
     *
     * @param {Proxy~definition} options The proxy object structure.
     */
    update: function (options) {
        _.isObject(options) && _.mergeDefined(this, options);
    },

    /**
     * This provides whether the tunneling needs to be done while proxying the request.
     * @public
     * @returns {Boolean}
     * @type {Function}
     */
    tunnel: function () {
        return _.startsWith(this.url, HTTPS_PROTOCOL);
    },

    /**
     * direct determines whether the request is to be proxied or by-passing the proxy.
     * @public
     * @returns {Boolean}
     * @type {Function}
     */
    direct: function () {
        return _.isEmpty(this.host);
    }
});

_.assign(Proxy, /** @lends Proxy */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'Proxy',

    /**
     * Specify the key to be used while indexing this object
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyIndexKey: 'url',

    /**
     * Parse the proxy string to postman proxy object
     * @public
     * @param {String=} [proxyString] Supports formats returns by the PAC files as provided {@link
     * https://web.archive.org/web/20070602031929/http://wp.netscape.com/eng/mozilla/2.0/relnotes/demo/proxy-live.html
     * here.}
     * @param {String=} [url = *] The url for which the proxy needs to be used (Wild cards are also supported).
     * @returns {Proxy~definition=} A plain proxy object
     * @example
     * var postmanProxy = parseProxyString('PROXY http://proxy.com:8080', 'example.com');
     */
    parse: function(proxyString, url) {
        // If the Url is not available it must be taken as the '*' wild card
        url = url || MATCH_ALL;

        /*
        * proxyString can be DIRECT || PROXY [url]:port
        * Using the regex /(PROXY)|(DIRECT)|\[|\]|\s/g to replace the unwanted values with ''
        * For Proxy Load balancing the pac scripts will return the Proxy with two URLs seperated by ';'
        * We by default will be considering only the first proxy URL
        */
        var proxyUrl = proxyString.replace(regexes.sanitize, E).split(SEMICOLON),
            proxyUrlObj = new Url(proxyUrl[0]);
        return {
            url: url,
            protocol: proxyUrlObj.protocol || HTTP,
            host: proxyUrlObj.host ? proxyUrlObj.getHost() : E,
            port: proxyUrlObj.port,
            tunnel: _.startsWith(url, HTTPS_PROTOCOL),
            direct: _.isEmpty(proxyUrlObj.host)
        };
    }

});

module.exports = {
    Proxy: Proxy
};
