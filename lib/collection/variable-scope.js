var _ = require('../util').lodash,
    Property = require('./property').Property,
    PropertyBase = require('./property-base').PropertyBase,
    VariableList = require('./variable-list').VariableList,

    VariableScope;

_.inherit((

    /**
     * Create instances of environments and globals
     *
     * @constructor
     * @extends {Property}
     *
     * @param {Object} definition
     */
    VariableScope = function PostmanVariableScope (definition) {
        // in case the definition is an array (legacy format) or existing as list, we convert to actual format
        if (_.isArray(definition) || VariableList.isVariableList(definition)) {
            definition = { values: definition };
        }

        // this constructor is intended to inherit and as such the super constructor is required to be executed
        VariableScope.super_.call(this, definition);

        var values = definition && definition.values; // access the values (need this var to reuse access)

        /**
         * @memberOf VariableScope.prototype
         * @type {VariableList}
         */
        this.values = new VariableList(this, VariableList.isVariableList(values) ? values.toJSON() : values);
        // in above line, we clone the values if it is already a list. there is no point directly using the instance of
        // a variable list since one cannot be created with a parent reference to begin with.
    }), Property);

_.assign(VariableScope.prototype, /** @lends VariableScope.prototype */ {
    /**
     * Defines whether this property instances requires an id
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_requiresId: true,


    /**
     * Fetches a variable from the current scope.
     *
     * @param {String} key - The name of the variable to set.
     * @returns {String|*} The value of the specified variable in the current context.
     */
    get: function (key) {
        var variable = this.values.one(key);
        return variable ? variable.valueOf() : undefined;
    },

    /**
     * Creates a new variable, or updates an existing one.
     *
     * @param {String} key - The name of the variable to set.
     * @param {String} value - The value of the variable to be set.
     */
    set: function (key, value) {
        var variable = this.values.one(key);

        // If a variable by the name key exists, update it's value and return.
        if (variable) { return variable.set(value); }

        this.values.add({ key: key, value: value });
    },

    /**
     * Removes the variable with the specified name.
     */
    unset: function (key) {
        this.values.remove(key);
    },

    /**
     * Removes *all* variables from the current scope. This is a destructive action.
     */
    clear: function () {
        this.values.clear();
    },

    /**
     * Using this function, one can sync the values of this variable list from a reference object.
     *
     * @param {Object} obj
     * @param {Boolean=} [track]
     *
     * @returns {Object}
     */
    syncVariablesFrom: function (obj, track) {
        return this.values.syncFromObject(obj, track);
    },

    /**
     * Transfer the variables in this scope to an object
     *
     * @param {Object=} [obj]
     *
     * @returns {Object}
     */
    syncVariablesTo: function (obj) {
        return this.values.syncToObject(obj);
    },

    /**
     * Convert this variable scope into a JSON serialisable object. Useful to transport or store, environment and
     * globals as a whole.
     *
     * @returns {Object}
     */
    toJSON: function () {
        var obj = PropertyBase.toJSON(this);

        // @todo - remove this when pluralisation is complete
        if (obj.value) {
            obj.values = obj.value;
            delete obj.value;
        }

        return obj;
    }
});

_.assign(VariableScope, /** @lends VariableScope */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     *
     * @note that this is directly accessed only in case of VariableScope from _.findValue lodash util mixin
     */
    _postman_propertyName: 'VariableScope',

    /**
     * Check whether an object is an instance of {@link VariableScope}.
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isVariableScope: function (obj) {
        return obj && ((obj instanceof VariableScope) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', VariableScope._postman_propertyName));
    }
});

module.exports = {
    VariableScope: VariableScope
};
