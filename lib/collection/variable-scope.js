var _ = require('../util').lodash,
    Property = require('./property').Property,
    PropertyBase = require('./property-base').PropertyBase,
    VariableList = require('./variable-list').VariableList,
    VariableScopeDiff = require('./variable-scope-diff').VariableScopeDiff,

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
 * @property {VariableScopeDiff~definition} [changes] A series of variable changes that were tracked
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
     * @param {Array<VariableList>} [layers] Additional parent scopes to search for and resolve variables
     * @param {Object} [options] Additional options
     * @param {Boolean} [options.enableTracking] This option can be used to track changes to values.
     * If set to `true`, tracking is enabled with default options.
     * Note that, if tracking is enabled, any existing changes in the definition will be reset.
     * @param {Object} [options.trackingOptions] Options for tracking variable changes. Use this with `enableTracking`.
     * See {@link VariableScope.prototype.enableTracking}
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
    VariableScope = function PostmanVariableScope (definition, layers, options) {
        // in case the definition is an array (legacy format) or existing as list, we convert to actual format
        if (_.isArray(definition) || VariableList.isVariableList(definition)) {
            definition = { values: definition };
        }

        // we accept parent scopes to increase search area. Here we normalize the argument to be an array
        // so we can easily loop though them and add them to the instance.
        layers && !_.isArray(layers) && (layers = [layers]);

        // this constructor is intended to inherit and as such the super constructor is required to be executed
        VariableScope.super_.call(this, definition);

        var values = definition && definition.values, // access the values (need this var to reuse access)
            isTrackingEnabled = options && options.enableTracking,
            preExistingChanges = definition && definition.changes,
            ii,
            i;

        /**
         * @memberOf VariableScope.prototype
         * @type {VariableList}
         */
        this.values = new VariableList(this, VariableList.isVariableList(values) ? values.toJSON() : values);
        // in above line, we clone the values if it is already a list. there is no point directly using the instance of
        // a variable list since one cannot be created with a parent reference to begin with.

        if (layers) {
            this._layers = [];

            for (i = 0, ii = layers.length; i < ii; i++) {
                VariableList.isVariableList(layers[i]) && this._layers.push(layers[i]);
            }
        }

        // enable tracking if option is set or if definition has changes
        if (isTrackingEnabled || preExistingChanges) {
            this.enableTracking(options && options.trackingOptions, preExistingChanges);
        }
    }), Property);

_.assign(VariableScope.prototype, /** @lends VariableScope.prototype */ {
    /**
     * Defines whether this property instances requires an id
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyRequiresId: true,

    /**
     * @deprecated since v1.2.5.*
     * Get a copy of all variables in form of a plain object. This is useful for iteration and other use.
     * @returns {Object}
     *
     * @example <caption>Iterate on all variables</caption>
     * var VariableScope = require('postman-collection').VariableScope,
     *     env = new VariableScope([{
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
     * Converts a list of Variables into an object where key is `_postman_propertyIndexKey` and value is determined
     * by the `valueOf` function
     *
     * @param {Boolean} excludeDisabled
     * @param {Boolean} caseSensitive
     * @return {Object}
     */
    toObject: function (excludeDisabled, caseSensitive) {
        // if the scope has no layers, we simply export the contents of primary store
        if (!this._layers) {
            return this.values.toObject(excludeDisabled, caseSensitive);
        }

        var mergedLayers = {};

        _.forEachRight(this._layers, function (layer) {
            _.assign(mergedLayers, layer.toObject(excludeDisabled, caseSensitive));
        });

        return _.assign(mergedLayers, this.values.toObject(excludeDisabled, caseSensitive));
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
        var variable = this.values.one(key),
            i,
            ii;

        // if a variable does not exist in local scope, we search all the layers and return the first occurrence.
        if (!(variable || !this._layers)) {
            for (i = 0, ii = this._layers.length; i < ii; i++) {
                variable = this._layers[i].one(key);
                if (variable) { break; }
            }
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
        if (variable) {
            variable.update(update);
        }
        else {
            this.values.add(update);
        }

        // track the set changeset
        this._postman_enableTracking && this.changes.track('set', key, value);
    },

    /**
     * Removes the variable with the specified name.
     *
     * @param {String} key
     */
    unset: function (key) {
        if (!(key && this.values.has(key))) {
            return;
        }

        this.values.remove(key);

        // track the unset changeset
        this._postman_enableTracking && this.changes.track('unset', key);
    },

    /**
     * Removes *all* variables from the current scope. This is a destructive action.
     */
    clear: function () {
        // if change tracking is enabled, track the changes first, then remove the keys.
        if (this._postman_enableTracking) {
            // track clear as delete for each key
            this.values.each(function (variable) {
                this.changes.track('unset', variable.key);
            }.bind(this));
        }

        this.values.clear();
    },

    /**
     * Enables change tracking. Any future, variable changes through setters (set, unset, clear)
     * will be tracked. The tracked changes are available on the `changes` attribute {@link VariableScopeDiff}
     *
     * *note:* If tracking is already enabled, this will have no effect.
     * *note:* If tracking is not enabled already, any existing changes will be reset.
     *
     * @param {Object} [options] tracking options
     * @param {String} [options.compress] when set to true, only latest change for a key will be recorded
     * @param {VariableScopeDiff~definition} [preFill] an initial set of changes
     */
    enableTracking: function (options, preFill) {
        if (this._postman_enableTracking) {
            return;
        }

        this._postman_enableTracking = true;

        /**
         * Holds all the changes that have been applied on this instance.
         *
         * @memberOf VariableScope.prototype
         * @type {VariableScopeDiff}
         */
        this.changes = new VariableScopeDiff(preFill, options); // wipe existing changes
    },

    /**
     * Disables change tracking.
     * *note:* Any previously tracked changes will also be reset at this point.
     */
    disableTracking: function () {
        this.changes = null;

        if (this._postman_enableTracking) {
            this._postman_enableTracking = false;
        }
    },

    /**
     * Applies a variable diff. See {@link VariableScopeDiff}.
     * *note:* This operation mutates the instance.
     *
     * @param {VariableScopeDiff} diff
     */
    patch (diff) {
        if (!diff) {
            return;
        }

        // convert the diff to variable scope instance if not already
        !VariableScopeDiff.isVariableScopeDiff(diff) && (diff = new VariableScopeDiff(diff));

        diff.applyOn(this);
    },

    /**
     * Using this function, one can sync the values of this variable list from a reference object.
     *
     * @private
     * @param {Object} obj
     * @param {Boolean=} [track]
     * @returns {Object}
     */
    syncVariablesFrom: function (obj, track) {
        return this.values.syncFromObject(obj, track);
    },

    /**
     * Transfer the variables in this scope to an object
     *
     * @private
     * @param {Object=} [obj]
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

        // ensure that the concept of layers is not exported as JSON. JSON cannot retain references and this will end up
        // being a pointless object post JSONification.
        if (obj._layers) {
            delete obj._layers;
        }

        // remove internal variable for change tracking
        if (obj._postman_enableTracking) {
            delete obj._postman_enableTracking;
        }

        return obj;
    },

    /**
     * Adds a variable list to the current instance in order to increase the surface area of variable resolution.
     * This enables consumers to search across scopes (eg. environment and globals).
     *
     * @private
     * @param {VariableList} [list]
     */
    addLayer: function (list) {
        if (!VariableList.isVariableList(list)) {
            return;
        }

        !this._layers && (this._layers = []); // lazily initialize layers
        this._layers.push(list);
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
