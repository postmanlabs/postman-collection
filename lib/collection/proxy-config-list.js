var _ = require('../util').lodash,
    PropertyList = require('./property-list').PropertyList,
    ProxyConfig = require('./proxy-config').ProxyConfig,
    Url = require('./url').Url,

    ProxyConfigList;

_.inherit((

    /**
     * @constructor
     * @extends {PropertyList}
     *
     * @param {Array} populate The list of proxy objects
     *
     * @example <caption>Create a new ProxyConfigList</caption>
     * var ProxyConfigList = require('postman-collection').ProxyConfigList,
     *     myProxyConfig = new ProxyConfigList({}, [
     *              {match: 'https://example.com/*',server: 'https://proxy.com',tunnel: true},
     *              {match: 'https://example2.com/*',server: 'http://proxy2.com'},
     *          ]);
     */
    ProxyConfigList = function PostmanProxyConfigList (parent, populate) {

        // this constructor is intended to inherit and as such the super constructor is required to be executed
        ProxyConfigList.super_.call(this, ProxyConfig, parent, populate);
    }), PropertyList);

_.assign(ProxyConfigList.prototype, /** @lends ProxyConfigList.prototype */ {
    /**
     * Matches and gets the proxy config for the particular url
     * @returns {ProxyConfig~definition=} The matched proxyConfig object
     * @param {String=} [url] The url for which the proxy config needs to be fetched
     * @param {function} cb Callback that will be called with node-style argument signature with the resolved proxy configuration.
     */
    resolve: function(url, cb) {
        // url must be either string or an instance of url.
        if (!_.isString(url) && !Url.isUrl(url)) {
            return;
        }

        // @todo - use a fixed-length cacheing of regexes in future
        var config = this.find(function(proxyConfig) {
            return !proxyConfig.disabled && proxyConfig.test(url);
        });


        if (!config) {
            return _.isFunction(cb) && cb('Proxy Configuration not found for URL : ' + url);
        }

        return _.isFunction(cb) && cb(null, config);

    }
});

_.assign(ProxyConfigList, /** @lends ProxyConfigList */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     *
     * @note that this is directly accessed only in case of ProxyConfigList from _.findValue lodash util mixin
     */
    _postman_propertyName: 'ProxyConfigList',

    /**
     * Checks whether an object is a ProxyConfigList
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isProxyConfigList: function (obj) {
        return Boolean(obj) && ((obj instanceof ProxyConfigList) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', ProxyConfigList._postman_propertyName));
    }
});

module.exports = {
    ProxyConfigList: ProxyConfigList
};
