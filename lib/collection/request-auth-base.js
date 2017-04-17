var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,

    UNDERSCORE = '_',
    AUTH_META_PREFIX = 'postman_auth_',

    RequestAuthBase;

_.inherit((

    /**
     * A Postman Request Auth State, which is in charge of holding the intermediate parameters for
     * the supported auth mechanisms.
     *
     * @param {Object} state
     * @constructor
     * @extends {PropertyBase}
     */
    RequestAuthBase = function PostmanRequestAuthBase () {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        RequestAuthBase.super_.call(this, arguments);
    }), PropertyBase);

_.extend(RequestAuthBase.prototype, /** @lends RequestAuthState.prototype */ {
    /**
     * Override the default toJSON functionality so that we don't accidentally leak state.
     *
     * @returns {Object}
     */
    toJSON: function () {
        var obj = PropertyBase.toJSON(this),
            meta = obj._,
            prop;

        for (prop in meta) {
            meta.hasOwnProperty(prop) && _.startsWith(prop, AUTH_META_PREFIX) && (delete meta[prop]);
        }

        return obj;
    },

    /**
     * Adds a meta property with the appropriate prefix.
     *
     * @param {String} name
     * @param {*} value
     * @private
     */
    setMeta: function (name, value) {
        _.set(this, [UNDERSCORE, AUTH_META_PREFIX + name], value);
    },

    /**
     * Retrieves the value of a meta property.
     *
     * @param {String} name
     * @private
     */
    getMeta: function (name) {
        return _.get(this, [UNDERSCORE, AUTH_META_PREFIX + name]);
    },

    /**
     * Removes the value of a meta property (if it's there).
     *
     * @param {String} name
     * @private
     */
    clearMeta: function (name) {
        var prop = AUTH_META_PREFIX + name,
            meta = this._;

        meta && (delete meta[prop]);
    }
});

_.extend(RequestAuthBase, /** @lends RequestAuthBase */ {

    /**
     * @type {String}
     */
    _postman_propertyName: 'RequestAuthBase',

    /**
     * @type {String}
     */
    AUTH_META_PREFIX: AUTH_META_PREFIX
});

module.exports.RequestAuthBase = RequestAuthBase;
