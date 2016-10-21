var _ = require('../util').lodash,
    async = require('async'),
    Property = require('./property').Property,
    CookieList = require('./cookie-list').CookieList,

    CookieJar;

_.inherit((

    /**
     * Create instances of environments and globals
     *
     * @constructor
     * @extends {Property}
     *
     * @param {Object} definition
     */
    CookieJar = function PostmanCookieJar (definition) {
        // in case the definition is an array (legacy format) or existing as list, we convert to actual format
        if (_.isArray(definition) || CookieList.isCookieList(definition)) {
            definition = { values: definition };
        }

        // this constructor is intended to inherit and as such the super constructor is required to be executed
        CookieJar.super_.call(this, definition);

        var values = definition && definition.values; // access the values (need this var to reuse access)

        /**
         * @memberOf CookieJar.prototype
         * @type {CookieList}
         */
        this.values = new CookieList(this, CookieList.isCookieList(values) ? values.toJSON() : values);
        // in above line, we clone the values if it is already a list. there is no point directly using the instance of
        // a cookie list since one cannot be created with a parent reference to begin with.
    }), Property);

_.assign(CookieJar.prototype, /** @lends CookieJar.prototype */ {
    /**
     * Defines whether this property instances requires an id
     * @private
     * @readOnly
     * @type {Boolean}
     */
    _postman_requiresId: true,

    /**
     * Using this function, one can sync the values of this variable list from a reference object.
     *
     * @param {Object} tough - A tough-cookie CookieJar object.
     * @param {Function} callback
     * @returns {Object}
     */
    syncFromTough: function (tough, callback) {
        var values = this.values;

        return tough.serialize(function (err, store) {
            if (err) { return callback(err); }

            values.clear();
            _.forEach(store.cookies, function (cookie) {
                values.upsert(cookie);
            });
            callback();
        });
    },

    /**
     * Transfer the cookies in this jar to a tough-cookie compatible cookie jar.
     *
     * @param {Object} tough - A tough-cookie CookieJar object.
     * @param {Function} callback
     * @returns {Object}
     * @note This method uses some undocumented tough-cookie store features, since the public API is not good enough.
     * It also assumes that the store is a 'MemoryCookieStore', which is the one that comes with tough-cookie by
     * default.
     */
    syncToTough: function (tough, callback) {
        var store = tough.store;

        // Clears the tough-cookie store.
        _.replaceProps(store.idx, {});

        // this will add all cookies to the tough cookie jar
        async.forEach(this.values.members, tough.store.putCookie.bind(tough.store), callback);
    },

    /**
     * Convert this variable scope into a JSON serialisable object. Useful to transport or store, environment and
     * globals as a whole.
     *
     * @returns {Object}
     */
    toJSON: function () {
        var obj = toJSON(this);

        // @todo - remove this when pluralisation is complete
        if (obj.value) {
            obj.values = obj.value;
            delete obj.value;
        }

        return obj;
    }
});

_.assign(CookieJar, /** @lends CookieJar */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     *
     * @note that this is directly accessed only in case of CookieJar from _.findValue lodash util mixin
     */
    _postman_propertyName: 'CookieJar',

    /**
     * Check whether an object is an instance of {@link CookieJar}.
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isCookieJar: function (obj) {
        return obj && ((obj instanceof CookieJar) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', CookieJar._postman_propertyName));
    }
});

module.exports = {
    CookieJar: CookieJar
};
