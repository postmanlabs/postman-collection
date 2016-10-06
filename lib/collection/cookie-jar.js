var _ = require('../util').lodash,
    tough = require('tough-cookie'),
    Property = require('./property').Property,

    CookieJar,
    CookieStore,

    /**
     * Populates matching cookies into the given array
     *
     * @param domains
     * @param path
     * @param results
     */
    matchPaths = function (domains, path, results) {
        _.forEach(_.keys(domains), function (cookiePath) {
            if (!path || tough.pathMatch(path, cookiePath)) {
                var pathIndex = domains[cookiePath];
                _.forOwn(pathIndex, function (key) {
                    results.push(pathIndex[key]);
                });
            }
        });
    };


/**
 * This is an implementation of a tough-cookie compatible CookieStore.
 *
 * @constructor
 * @note Although the API exposed is async, it can optionally be made synchronous, as needed.
 */
CookieStore = function () {
    tough.Store.call(this, arguments);
    this.idx = {};
};

// Inherit manually, because `util.inherit` may or may not be available in browsers.
CookieStore.prototype = Object.create(tough.Store.prototype);
CookieStore.prototype.constructor = CookieStore;

// Ensure that these are set for all CookieStores
CookieStore.prototype.idx = null;
CookieStore.prototype.synchronous = true;

_.assign(CookieStore.prototype, /** @lends CookieStore.prototype */ {

    /**
     * Get a single cookie
     *
     * @param domain
     * @param path
     * @param key
     * @param cb
     * @returns {*}
     */
    findCookie: function(domain, path, key, cb) {
        if (!this.idx[domain]) {
            return cb(null, undefined);
        }
        if (!_.get(this.idx, [domain, path])) {
            return cb(null, undefined);
        }
        return cb(null, _.get(this.idx, [domain, path, key], null));
    },

    /**
     *
     * @param domain
     * @param path
     * @param cb
     * @returns {*}
     */
    findCookies: function (domain, path, cb) {
        var results = [],
            domains,
            idx;

        // No domain, no results.
        if (!domain) {
            return cb(null, results);
        }

        domains = tough.permuteDomain(domain) || [domain];
        idx = this.idx;
        domains.forEach(function (curDomain) {
            if (!idx[curDomain]) { return; }

            matchPaths(idx[curDomain], path, results);
        });

        cb(null, results);
    },

    /**
     * Puts a cookie in the cookie store.
     *
     * @param cookie
     * @param cb
     */
    putCookie: function (cookie, cb) {
        if (!(cookie && cookie.key)) { return cb(); }

        var domain = cookie.domain,
            path = cookie.path;

        this.idx[domain] = this.idx[domain] || {};
        this.idx[domain][path] = this.idx[domain][path] || {};

        this.idx[domain][path][cookie.key] = cookie;
        cb(null);
    },

    /**
     * Alias for putCookie.
     *
     * @param old
     * @param updated
     * @param cb
     */
    updateCookie: function (old, updated, cb) {
        this.putCookie(updated, cb);
    },

    /**
     * Removes a cookie from the store.
     *
     * @param domain
     * @param path
     * @param key
     * @param cb
     */
    removeCookie: function(domain, path, key, cb) {
        if (this.idx[domain] && this.idx[domain][path] && this.idx[domain][path][key]) {
            delete this.idx[domain][path][key];
        }
        cb(null);
    },

    /**
     * Remove multiple cookies from the store.
     *
     * @param domain
     * @param path
     * @param cb
     * @returns {*}
     */
    removeCookies: function(domain, path, cb) {
        if (this.idx[domain]) {
            path ? (delete this.idx[domain][path]) : (delete this.idx[domain]);
        }
        return cb(null);
    },

    /**
     * Retrieves all the cookies in the store, in an array.
     *
     * @param cb
     * @note This function is optionally async
     */
    getAllCookies: function (cb) {
        var cookies = [],
            idx = this.idx,
            domains = _.keys(idx);

        _.forEach(domains, function (domain) {
            var paths = _.keys(idx[domain]);
            _.forEach(paths, function (path) {
                var keys = _.keys(idx[domain][path]);
                _.forEach(keys, function (key) {
                    if (key !== null) {
                        cookies.push(idx[domain][path][key]);
                    }
                });
            });
        });

        cookies.sort(function (a, b) {
            return (a.creationIndex || 0) - (b.creationIndex || 0);
        });

        return cb ? cb(null, cookies) : cookies;
    }
});

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
        if (_.isArray(definition)) {
            definition = { values: definition };
        }

        // this constructor is intended to inherit and as such the super constructor is required to be executed
        CookieJar.super_.call(this, definition);

        var values = definition && definition.values; // access the values (need this var to reuse access)

        this.store = new CookieStore();
        this.update(values);
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
     * Convert this variable scope into a JSON serialisable object. Useful to transport or store, environment and
     * globals as a whole.
     *
     * @returns {Object}
     */
    toJSON: function () {
        var obj = {};

        obj.values = this.store.getAllCookies();
    },

    /**
     * Adds given values to the current cookie store.
     *
     * @param values
     */
    update: function (values) {
        if (!_.isArray(values)) { return; }

        var store = this.store;
        _.forEach(values, function (cookie) {
            store.putCookie(cookie);
        });
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
    },

    /**
     * @constructor CookieStore
     */
    CookieStore: CookieStore // expose the store for testability.
});

module.exports = {
    CookieJar: CookieJar
};
