var _ = require('../util').lodash,
    PropertyList = require('./property-list').PropertyList,
    Variable = require('./variable').Variable,

    /**
     * Maintain a list of types that are native
     * @private
     * @enum {String}
     */
    nativeTypes = {
        'string': true,
        'number': true,
        'boolean': true
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
        this.environments = [];

        // we process the environments here only if it is defined as an array and has at least one environment
        if (_.isArray(environments) && environments.length) {
            var proxies = this.environments;
            environments.reduce(function (parent, child) {
                return (proxies.push(VariableList.proxy(parent, VariableList.objectify(child))), _.last(proxies));
            }, {}); // @todo: this blank object can have global default

            // pre-create the reference object (will be used by super) to store the actual variables
            this.reference = VariableList.proxy(_.last(proxies));
        }

        // this constructor is intended to inherit and as such the super constructor is required to be executed
        VariableList.super_.call(this, Variable, parent, populate);
    }), PropertyList);

_.extend(VariableList.prototype, /** @lends VariableList.prototype */ {
    /**
     * Replaces the variable tokens inside a string with its actual values
     *
     * @param {String} str
     * @returns {String}
     */
    replace: function (str) {
        var self = this;
        return str.replace ? str.replace(VariableList.REGEX_EXTRACT_VARS, function (a, b) {
            var r = self.one(b) && self.one(b).toString();
            return nativeTypes[(typeof r)] ? r : a;
        }) : str;
    },

    /**
     * Recursively replace strings in an object with instances of variables. Note that it clones the original object. If
     * the `mutate` param is set to true, then it replaces the same object instead of creatinbg a new one.
     *
     * @param {Array|Object} obj
     * @param {Boolean=} [mutate=false]
     * @returns {Array|Object}
     */
    substitute: function (obj, mutate) {
        return _.isObject(obj) ? _.merge(mutate ? obj : {}, obj, function (objectValue, sourceValue) {
            return _.isString(sourceValue) ?  this.replace(sourceValue) : undefined;
        }, this) : obj;
    }
});

_.extend(VariableList, /** @lends VariableList */ {
    /**
     * @private
     *
     * @type {RegExp}
     */
    REGEX_EXTRACT_VARS: /\{\{([^}]*?)}}/g,
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
            _.merge(this, values);
        }, proto))(values);
    },

    /**
     * Converts a plain object into PropertyList of variables having object key as id.
     * @private
     *
     * @param {Object} items
     * @param {*} parent
     * @returns {PropertyList}
     */
    listify: function (items, parent) {
        // if item is plain object transform to array of objects
        _.isPlainObject(items) && (items = _.values(_.mapValues(items, function (value, key) {
            return {
                id: key,
                value: value
            };
        })));

        return new PropertyList(Variable, parent, items);
    },

    /**
     * Converts objects or array of objects into consumable variable object
     * @private
     *
     * @param {Object|Array} items
     * @returns {Object}
     */
    objectify: function (items) {
        // convert array to an indexed object
        _.isArray(items) && (items = _.indexBy(items, 'id')); // in any case variable without `id` is useless
        // create an object with `id` as keys and an instance of `Variable` as their value.
        return _.mapValues(items, function (item, key) {
            // if already an instance of `Variable`, we simply return it, else we create a new instance of `Variable`
            return Variable.isVariable(item) ? item : (new Variable((_.isPlainObject(item) && _.has(item, 'value')) ?
                item : {
                    id: key,
                    value: item
                }
            ));
        });
    }
});

module.exports = {
    VariableList: VariableList
};
