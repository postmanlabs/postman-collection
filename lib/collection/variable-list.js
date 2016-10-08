var _ = require('../util').lodash,
    PropertyList = require('./property-list').PropertyList,
    PropertyBase = require('./property-base').PropertyBase,
    Property = require('./property').Property,
    Variable = require('./variable').Variable,

    /**
     * Convert object to JSON using the base converter
     * @private
     * @param {Object} obj
     * @returns {Object}
     */
    toJSON = function (obj) {
        return PropertyBase.prototype.toJSON.call(obj);
    },

    VariableList;

_.inherit((

    /**
     * @constructor
     * @extends {PropertyList}
     *
     * @param {Object} populate
     * @param {Object} environment
     * @param {Object} global
     */
    VariableList = function PostmanVariableList (parent, populate, environments) {
        /**
         * Stores a list of environments associated with this list
         * @private
         * @type {Array}
         */
        this._environments = [];

        // we process the environments here only if it is defined as an array and has at least one environment
        if (_.isArray(environments) && environments.length) {
            var proxies = this._environments;
            environments.reduce(function (parent, child) {
                return (proxies.push(VariableList.proxy(parent, VariableList.objectify(child))), _.last(proxies));
            }, {}); // @todo: allow injecting default variables into this externally.

            // pre-create the reference object (will be used by super) to store the actual variables
            this.reference = VariableList.proxy(_.last(proxies));
        }

        // this constructor is intended to inherit and as such the super constructor is required to be executed
        VariableList.super_.call(this, Variable, parent, populate);
    }), PropertyList);

_.assign(VariableList.prototype, /** @lends VariableList.prototype */ {
    /**
     * Replaces the variable tokens inside a string with its actual values.
     *
     * @param {String} str
     * @param {Object} [overrides] - additional objects to lookup for variable values
     * @returns {String}
     */
    replace: function (str, overrides) {
        return Property.replaceSubstitutions(str, this, overrides);
    },

    /**
     * Recursively replace strings in an object with instances of variables. Note that it clones the original object. If
     * the `mutate` param is set to true, then it replaces the same object instead of creating a new one.
     *
     * @param {Array|Object} obj
     * @param {?Array<Object>=} [overrides] - additional objects to lookup for variable values
     * @param {Boolean=} [mutate=false]
     * @returns {Array|Object}
     */
    substitute: function (obj, overrides, mutate) {
        return Property.replaceSubstitutionsIn(obj, _.union([this], overrides), mutate);
    },

    /**
     * Using this function, one can sync the values of this variable list from a reference object.
     *
     * @param {Object} obj
     * @param {Boolean=} [track]
     *
     * @returns {Object}
     */
    syncFromObject: function (obj, track) {
        var list = this,
            ops = track && {
                created: [],
                updated: [],
                deleted: []
            },
            indexer = list._postman_listIndexKey,
            tmp;

        if (!_.isObject(obj)) { return ops; }

        // ensure that all properties in the object is updated in this list
        _.forOwn(obj, function (value, key) {
            // we need to create new variable if exists or update existing
            if (list.has(key)) {
                list.one(key).set(value);
                ops && ops.updated.push(key);
            }
            else {
                tmp = { value: value };
                tmp[indexer] = key;
                list.add(tmp);
                tmp = null;
                ops && ops.created.push(key);
            }
        });

        // now remove any variable that is not in source object
        // @note - using direct `this.reference` list of keys here so that we can mutate the list while iterating
        // on it
        _.forEach(_.keys(list.reference), function (key) {
            if (obj.hasOwnProperty(key)) { return; } // de not delete if source obj has this variable
            list.remove(key); // use propertylist functions to remove so that the .members array is cleared too
            ops && ops.deleted.push(key);
        });

        return ops;
    },

    /**
     * Transfar all variables from this list to an object
     *
     * @param {Object=} [obj]
     * @returns {Object}
     */
    syncToObject: function (obj) {
        var list = this;

        // in case user did not ptovide an object to mutate, create a new one
        !_.isObject(obj) && (obj = {});

        // delete extra variables from object that are not present in list
        _.forEach(obj, function (value, key) {
            !_.has(list.reference, key) && (delete obj[key]);
        });

        // we first sync all variables in this list to the object
        list.each(function (variable) {
            obj[variable.key] = variable.valueOf();
        });

        return obj;
    },

    /**
     * This function allows to manipulate the environment chain in this variable list.
     * @private
     *
     * @param {Number} [index] If an index value is provided, this function returns the JSON representation of the
     * particular environment. In its absence, all environments are returned within an array.
     * @param {(Object|(Array<Variable>)|Null)=} [assign] A list of variables can be passed on for replacement in the
     * environment. If a replacement is sent, then the function does not return any JSON.
     * @param {Boolean=} [clear=false] If set to true, then the environment is cleared before new set of assignments are
     * done. The assignment can be sent a `null` if environment is needed to be cleared alone.
     *
     * @returns {Object|undefined}
     *
     * @example
     * myCollection.variables.env(); // gets all environments as array
     * myCollection.variables.env(1); // gets the second environment as Object
     * myCollection.variables.env(0, null, true); // clears the first environment (does not delete the layer though)
     * myCollection.variables.env(0, {
     *     var1: "variable-value"
     * }); // assigns `var1` variable to the first environment layer
     * myCollection.variables.env(1, {
     *     var2: "variable-value-2"
     * }); // clears the 2nd layer and then assigns `var2` variable to it
     * myCollection.variables.env(0, [
     *     new Variable({ key: "var3", value: "value-3"}),
     *     new Variable({ key: "var4", value: "value-4"})
     * ]); // accepts array of variables property ass assignment
     *
     * @todo
     * - convert this to an environment instance (coded within this module) and then add an easy API on it
     */
    env: function (index, assign, clear) {
        // keep a reference to the select environment for future use
        var env = this._environments[index];

        // we check whether a replacement was instructed then we perform replacement
        if (arguments.length && (assign || (assign === null)) && env) {
            // first we clear (if needed) all the variables stored within the particular environment
            clear && Object.keys(this._environments[index]).forEach(function (prop) {
                delete env[prop];
            });
            // then we merge the new assignment variables
            _.mergeDefined(env, VariableList.objectify(assign));
            return;
        }

        // if we request a particular environment, we get the one, else we convert all environments to JSON
        return arguments.length ? (env && toJSON(env)) : _.map(this._environments, function (environment) {
            return toJSON(environment);
        });
    }
});

_.assign(VariableList, /** @lends VariableList */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     *
     * @note that this is directly accessed only in case of VariableList from _.findValue lodash util mixin
     */
    _postman_propertyName: 'VariableList',

    /**
     * Checks whether an object is a VariableList
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isVariableList: function (obj) {
        return obj && ((obj instanceof VariableList) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', VariableList._postman_propertyName));
    },

    /**
     * Converts an object into an inheritable constructor, creates a new instance and returns the same with the `values`
     * parameter copied
     * @private
     *
     * @param {Object} proto
     * @param {Object} values
     *
     * @returns {Object}
     */
    proxy: function (proto, values) {
        return new (_.inherit(function PostmanVariableProxy (values) {
            _.mergeDefined(this, values);
        }, proto))(values);
    },

    /**
     * Converts a plain object into PropertyList of variables having object key as id.
     * @private
     *
     * @param {Object} items
     * @param {*} parent
     * @returns {PropertyList}
     *
     * @todo maybe move to instance methods or take instance as parameter? will help to create list specific keys and
     * case senitivity
     */
    listify: function (items, parent) {
        // if item is plain object transform to array of objects
        _.isPlainObject(items) && (items = _.values(_.mapValues(items, function (value, key) {
            var obj = { value: value };
            obj[Variable._postman_propertyIndexKey] = key;
            return obj;
        })));

        return new PropertyList(Variable, parent, items);
    },

    /**
     * Converts objects or array of objects into consumable variable object
     * @private
     *
     * @param {Object|Array} items
     * @returns {Object}
     *
     * @todo maybe move to instance methods or take instance as parameter? will help to create list specific keys and
     * case senitivity
     */
    objectify: function (items) {
        // convert array to an indexed object
        // in any case variable without `key` is useless
        _.isArray(items) && (items = _.indexBy(items, Variable._postman_propertyIndexKey));
        // create an object with `key` as keys and an instance of `Variable` as their value.
        return _.mapValues(items, function (item, key) {
            // if already an instance of `Variable`, we simply return it, else we create a new instance of `Variable`
            if (Variable.isVariable(item)) {
                return item;
            }

            // if the item is a valid object, we use the entire object as a variable definition
            // also works to handle array type definition along with object type definition
            var obj = item;

            // in case item is not a valid object, we create our own object + it handles object-type definition
            if (!_.isObject(obj)) {
                obj = { value: item };
                obj[Variable._postman_propertyIndexKey] = key;
            }

            return new Variable(obj);
        });
    }
});

module.exports = {
    VariableList: VariableList
};
