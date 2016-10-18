var _ = require('../util').lodash,
    Property = require('./property').Property,
    Url = require('./url').Url,

    E = '',
    SELECTALL = '*',
    HTTPS = 'https',
    HTTP = 'http',
    DEFAULT_PORT = '80',
    regexes = {
        proxyStringSanitizer: /(PROXY)|(DIRECT)|\[|\]|\s/g
    },

    Proxy;


/**
* You can either provide the options object alone to the constructor or the ProxyString and the UrlString
*
* The following is the object structure accepted as constructor parameter while calling `new Proxy(...)`. It is
* also the structure exported when {@link Property#toJSON} or {@link Property#toObjectResolved} is called on a
* Proxy instance.
* @typedef Proxy~definition
*
* @property {String=} [url] The url for which the proxy needs to be configured @default would '*' means select all url.
* @property {String=} [protocol] The proxy server protocol by @default it will be taken as 'http'
* @property {String=} [host] The proxy server host name @default would be '' [Empty String] represents no proxy
* @property {String=} [port] The proxy server port @default would be '80'
* @property {Boolean=} [tunnel] The option to provide whether tunneling needs to be done while proxying the request,
* @default would be true.
*
* @example <caption>JSON definition of an example proxy object</caption>
* {
*     url: 'https://example.com',
*     protocol: 'http',
*     host: 'proxy.com',
*     port: 88,
*     tunnel: true
* }
*
* Incase of ProxyString format
* @param {String=} [options] supported formats return by the PAC files as provided here
* (https://web.archive.org/web/20070602031929/http://wp.netscape.com/eng/mozilla/2.0/relnotes/demo/proxy-live.html)
* @param {String=} [url] The url for which the proxy needs to be configured @default would '*' means select all url.

* @example
* var proxyObj = new Proxy('PROXY [https://proxy.com]:88', 'http://example.com')
* {
*     url: 'http://example.com',
*     protocol: 'http',
*     host: 'proxy.com',
*     port: '88',
*     tunnel: true
* }
*/
_.inherit((
    Proxy = function PostmanProxy (options, url) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        Proxy.super_.call(this, options);

        // Assign defaults before proceeding
        _.assign(this, /** @lends Variable.prototype */ {
            /**
             * The url for which the proxy has been associated with.
             * @type {String}
             */
            url: SELECTALL,

            /**
             * @type {String}
             * @default 'http'
             */
            protocol: HTTP,

            /**
             * @type {String}
             * @default ''
             */
            host: E,

            /**
             * @type {String}
             * @default '80'
             */
            port: DEFAULT_PORT,

            /**
             * @type {Boolean}
             * @default true
             */
            tunnel: true
        });

        if (!options) { return; } // in case definition object is missing, there is no point moving forward

        /**
        * If the options and url is a string then we need to parse the input and update it.
        */
        _.isString(options) && (options = Proxy.parse(options, url));

        /**
        * Make sure the 'url' key property is available in the options provided or generated
        */
        this.update(options);

    }), Property);

_.assign(Proxy.prototype, /** @lends Proxy.prototype */ {
    update: function (options) {
        if (!_.isObject(options)) {
            return;
        }
        _.assign(this, {
            /**
             * The url for which the proxy has been associated with.
             * @type {String}
             */
            url: options.url || SELECTALL,

            /**
             * @type {String}
             * @default 'http'
             */
            protocol: options.protocol || HTTP,

            /**
             * @type {String}
             * @default ''
             */
            host: options.host || E,

            /**
             * @type {String}
             * @default 80
             */
            port: options.port || DEFAULT_PORT,

            /**
             * @type {Boolean}
             * @default true
             */
            tunnel: options.tunnel || true
        });
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
    * @param {String} url
    * @param {String} proxyString
    * @returns {*} A plain proxy object
    * @example
    * var postmanProxy = parseProxyString('PROXY http://proxy.com:8080', 'example.com');
    *
    *    {
    *       url: 'http://example.com',
    *       protocol: 'http',
    *       host: 'proxy.com',
    *       port: '8080'
    *    }
    *
    */
    parse: function(proxyString, url) {
        // If the Url is not available it must be taken as the '*' wild card
        url = url || SELECTALL;

        /**
        * proxyString can be DIRECT || PROXY [url]:port
        * Using the regex /(PROXY)|(DIRECT)|\[|\]|\s/g to replace the unwanted values with ''
        * For Proxy Load balancing the pac scripts will return the Proxy with two URLs seperated by ';'
        * We by default will be considering only the first proxy URL
        */
        var proxyUrl = proxyString.replace(regexes.proxyStringSanitizer, '').split(';'),
            proxyUrlObj = new Url(proxyUrl[0]);
        return {
            url: url,
            protocol: proxyUrlObj.protocol || HTTP,
            host: proxyUrlObj.host ? proxyUrlObj.getHost() : E,
            port: proxyUrlObj.port || DEFAULT_PORT,
            tunnel: _.startsWith(url, HTTPS)
        };
    }

});

module.exports = {
    Proxy: Proxy
};
