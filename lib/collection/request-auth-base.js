var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,

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
