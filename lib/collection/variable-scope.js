var _ = require('../util').lodash,
    Property = require('./property').Property,
    PropertyBase = require('./property-base').PropertyBase,
    VariableList = require('./variable-list').VariableList,

    VariableScope;

/**
 * Environment and Globals of postman is exported and imported in a specified data structure. This data structure can be
 * passed on to the constructor parameter of {@link VariableScope} or {@link VariableList} to instantiate an instance of
 * the same with pre-populated values from arguments.
 *
 * @typedef VariableScope~definition
 * @property {String} [id] ID of the scope
 * @property {String} [name] A name of the scope
 * @property {Array.<Variable~definition>} [values] A list of variables defined in an array in form of `{name:String,
 * value:String}`
 *
 * @example <caption>JSON definition of a VariableScope (environment, globals, etc)</caption>
 * {
 *   "name": "globals",
 *   "values": [{
 *     "key": "var-1",
 *     "value": "value-1"
 *   }, {
 *     "key": "var-2",
 *     "value": "value-2"
 *   }]
 * }
 */
_.inherit((

    /**
     * VariableScope is a representation of a list of variables in Postman, such as the environment variables or the
     * globals. Using this object, it is easy to perform operations on this list of variables such as get a variable or
     * set a variable.
     *
     * @constructor
     * @extends {Property}
     *
     * @param {VariableScope~definition} definition The constructor accepts an initial set of values for initialising
     * the scope
     *
     * @example <caption>Load a environment from file, modify and save back</caption>
     * var fs = require('fs'), // assuming NodeJS
     *     env,
     *     sum;
     *
     * // load env from file assuming it has initial data
     * env = new VariableScope(JSON.parse(fs.readFileSync('./my-postman-environment.postman_environment').toString()));
     *
     * // get two variables and add them
     * sum = env.get('one-var') + env.get('another-var');
     *
     * // save it back in environment and write to file
     * env.set('sum', sum, 'number');
     * fs.writeFileSync('./sum-of-vars.postman_environment', JSON.stringify(env.toJSON()));
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

        _.assign(this, /** @lends VariableScope.prototype */ {
            /**
             * @private
             * @type {Array}
             */
            layers: []
        });
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
     * Get a copy of all variables in form of a plain object. This is useful for iteration and other use.
     * @returns {Object}
     *
     * @example <caption>Iterate on all variables</caption>
     * var env = new VariableScope([{
     *         key: 'var1',
     *         value: 'one'
     *     }, {
     *         key: 'var2',
     *         value: 2,
     *         type: 'number'
     *     }, {
     *         key: 'var3',
     *         value: true,
     *         type: 'boolean'
     *     }]),
     *     obj;
     *
     * // get all variables consolidated as an object
     * obj = env.variables();
     *
     * Object.keys(obj).forEach(function(varname) {
     *     console.log(obj[varname]); // log all variables
     * });
     */
    variables: function () {
        return this.values.syncToObject({});
    },

    /**
     * Determines whether one particular variable is defined in this scope of variables.
     *
     * @param {String} variableName
     * @returns {Boolean}
     */
    has: function (variableName) {
        return this.values.has(variableName);
    },

    /**
     * Fetches a variable from the current scope or from parent scopes if present.
     *
     * @param {String} key - The name of the variable to get.
     * @returns {*} The value of the specified variable across scopes.
     */
    get: function (key) {
        var variable = this.values.one(key);

        // if a variable does not exist in local scope, we search all the layers and find the first occurence.
        if (!variable) {
            _.forEach(this.layers, function (layer) {
                variable = layer.one(key);

                // stop at the first occurence
                if (variable && variable.key === key) {
                    return false;
                }
            });
        }

        return variable ? variable.valueOf() : undefined;
    },

    /**
     * Creates a new variable, or updates an existing one.
     *
     * @param {String} key - The name of the variable to set.
     * @param {*} value - The value of the variable to be set.
     * @param {Variable.types} [type] - Optionally, the value of the variable can be set to a type
     */
    set: function (key, value, type) {
        var variable = this.values.one(key),

            update = { // create an object that will be used as setter
                key: key,
                value: value
            };

        _.isString(type) && (update.type = type);

        // If a variable by the name key exists, update it's value and return.
        if (variable) { return variable.update(update); }

        this.values.add(update);
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
     * @private
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
     * @private
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
    },

    /**
     * Adds a variable list to the current instance in order to increase the surface area of variable resolution.
     * This enables consumers to search across scopes (eg. environment and globals).
     *
     * @param {VariableList|Array} [definition]
     */
    _addLayer: function (definition) {
        var values;

        if (_.isArray(definition) || VariableList.isVariableList(definition)) {
            definition = { values: definition };
        }

        values = definition && definition.values;
        this.layers.push(
            new VariableList(this, VariableList.isVariableList(values) ? values.toJSON() : values)
        );
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
        return Boolean(obj) && ((obj instanceof VariableScope) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', VariableScope._postman_propertyName));
    }
});

module.exports = {
    VariableScope: VariableScope
};
