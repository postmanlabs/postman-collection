var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,

    RequestAuthHandler;

_.inherit((

    /**
     * A Postman Request Auth State, which is in charge of holding the intermediate parameters for
     * the supported auth mechanisms.
     *
     * @param {Object} state
     * @constructor
     * @extends {PropertyBase}
     */
    RequestAuthHandler = function PostmanRequestAuthHandler (state) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        RequestAuthHandler.super_.call(this, arguments);

        _.assign(this, /** @lends RequestAuthHandler.prototype */ {
            /**
             * Holds intermediate state for all authorizations.
             *
             * @type {Object}
             */
            state: state || {}
        });
    }), PropertyBase);

_.extend(RequestAuthHandler.prototype, /** @lends RequestAuthState.prototype */ {

    /**
     * Sets a value in the state.
     *
     * @param name
     * @param value
     */
    set: function (name, value) {
        name && (this.state[name] = value);
    },

    /**
     * Gets the value of a parameter from the state.
     *
     * @param name
     */
    get: function (name) {
        return this.state[name];
    },

    /**
     * Sets multiple names and values in one go.
     *
     * @param {Object} values
     */
    update: function (values) {
        if (!_.isObject(values)) { return; }

        var key;

        for (key in values) {
            values.hasOwnProperty(key) && this.set(key, values[key]);
        }
    }
});

module.exports.RequestAuthState = RequestAuthHandler;
