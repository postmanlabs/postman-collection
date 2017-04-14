var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,

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
    RequestAuthBase = function PostmanRequestAuthBase (name, state) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        RequestAuthBase.super_.call(this, arguments);

        _.assign(this, /** @lends RequestAuthBase.prototype */ {

            /**
             * Name of the auth.
             *
             * @type {String}
             */
            name: name,

            /**
             * Holds intermediate state for all authorizations.
             *
             * @type {Object}
             */
            state: state || {}
        });
    }), PropertyBase);

_.extend(RequestAuthBase.prototype, /** @lends RequestAuthState.prototype */ {

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
     * Deletes a key from the state.
     *
     * @param name
     */
    unset: function (name) {
        name && (delete this.state[name]);
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
    },

    /**
     * Removes all properties from the state.
     */
    clear: function () {
        var values = this.state,
            key;
        for (key in values) {
            values.hasOwnProperty(key) && this.unset(key);
        }
    },

    /**
     * Override the default toJSON functionality so that we don't accidentally leak state.
     *
     * @returns {Object}
     */
    toJSON: function () {
        var obj = PropertyBase.toJSON(this);

        // faster than omit, and we've already created a new object, so no point doing it.
        obj.state && delete obj.state;

        return obj;
    },

    /**
     * String representation of this auth.
     *
     * @returns {String}
     */
    toString: function () {
        return _.invoke(this, 'name.toString', '');
    }
});

_.extend(RequestAuthBase, /** @lends RequestAuthBase */ {

    /**
     * @type {String}
     */
    _postman_propertyName: 'RequestAuthBase'
});

module.exports.RequestAuthBase = RequestAuthBase;
