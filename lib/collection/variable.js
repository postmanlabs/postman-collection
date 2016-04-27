var _ = require('../util').lodash,
    Property = require('./property').Property,

    E = '',
    ANY = 'any',

    Variable;

/**
 * The object representation of a Variable consists the variable value and type. It also optionally includes the `id`
 * and a friendly `name` of the variable. The `id` and the `name` of a variable is usually managed and used when a
 * variable is made part of a {@link VariableList} instance.
 *
 * @typedef {Object} Variable~definition
 * @property {*=} [value] - The value of the variable that will be stored and will be typecast to the `type`
 * set in the variable or passed along in this parameter.
 * @property {String=} [type] - The type of this variable from the list of types defined at {@link Variable.types}.
 *
 * @example
 * {
 *     "id": "my-var-1",
 *     "name": "MyFirstVariable",
 *     "value": "Hello World",
 *     "type": "string"
 * }
 */
_.inherit((
    /**
     * A variable inside a collection is similar to variables in any programming construct. The variable has an
     * identifier name (provided by its id) and a value. A variable is optionally accompanied by a variable type. One
     * or more variables can be associated with a collection and can be referred from anywhere else in the collection
     * using the double-brace {{variable-id}} format.
     *
     * Properties can then use the `.toObjectResolved` function to procure an object representation of the property with
     * all the variable references replaced by corresponding values.
     * @constructor
     * @extends {Property}
     *
     * @param {Variable~definition=} [definition] - Specify the initial value and type of the variable.
     */
    Variable = function PostmanVariable (definition) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        Variable.super_.apply(this, arguments);

        _.extend(this, /** @lends Variable.prototype */ {
            /**
             * @type {Variable.types}
             */
            type: ANY,
            /**
             * @type {*}
             */
            value: undefined
        });

        (definition !== undefined) && this.update(definition);
    }), Property);

_.extend(Variable.prototype, /** @lends Variable.prototype */ {
    /**
     * Gets the value of the variable
     * @returns {Variable.types}
     */
    get: function () {
        return _.isFunction(this.value) ? this.cast(this.value()) : this.value;
    },

    /**
     * Sets the value of the variable
     * @param {*} value
     */
    set: function (value) {
        this.value = _.isFunction(value) ? value : this.cast(value);
    },

    /**
     * An alias of this.get and this.set
     * @param {*=} [value]
     * @returns {*}
     */
    valueOf: function (value) {
        arguments.length && this.set(value);
        return this.get();
    },

    /**
     * @returns {String}
     */
    toString: function () {
        var value = this.valueOf();
        return _.isFunction(value.toString) ? value.toString() : E;
    },

    /**
     * Typecasts a value to the {@link Variable.types} of this {@link Variable}. Returns the value of the variable
     * converted to the type specified in {@link Variable#type}.
     * @param {*} value
     * @returns {*}
     */
    cast: function (value) {
        return (Variable.types[this.type] || Variable.types.any)(value);
    },

    /**
     * Sets or gets the type of the value
     * @param {String} typeName
     * @returns {String} - returns the current type of the variable from the list of {@link Variable.types}
     */
    valueType: function (typeName, _nocast) {
        if (!typeName || !Variable.types[(typeName = typeName && typeName.toString().toLowerCase())]) {
            return this.type || ANY; // @todo: throw new Error('Invalid variable type.');
        }

        // set the new type if it is valid and cast the stored value
        if (typeName) {
            this.type = typeName;
            !_nocast && (this.value = this.cast(this.value));
        }

        return typeName;
    },

    /**
     * Updates the type and value of a variable from an object or JSON definition of the variable.
     *
     * @param {Variable~definition} options
     */
    update: function (options) {
        if (!_.isObject(options)) {
            return;
        }
        // set type and value.
        options.hasOwnProperty('type') && this.valueType(options.type, options.hasOwnProperty('value'));
        options.hasOwnProperty('value') && this.set(options.value);
    }
});

_.extend(Variable, /** @lends Variable */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'Variable',
    /**
     * The possible supported types of a variable is defined here. The keys defined here are the possible values of
     * {@link Variable#type}.
     *
     * Additional variable types can be supported by adding the type-casting function to this enumeration.
     * @enum {Function}
     * @readonly
     */
    types: {
        /**
         * When a variable's `type` is set to "string", it ensures that {@link Variable#get} converts the value of the
         * variable to a string before returning the data.
         */
        'string': String,
        /**
         * A boolean type of variable can either be set to `true` or `false`. Any other value set is converted to
         * Boolean when procured from {@link Variable#get}.
         */
        'boolean': Boolean,
        /**
         * A "number" type variable ensures that the value is always represented as a number. A non-number type value
         * is returned as `NaN`.
         */
        'number': Number,
        /**
         * Free-form type of a value. This is the default for any variable, unless specified otherwise. It ensures that
         * the variable can store data in any type and no conversion is done while using {@link Variable#get}.
         * @param val
         * @returns {*}
         */
        'any': function (val) {
            return val; // passthrough
        }
    },

    /**
     * @param {*} obj
     * @returns {Boolean}
     */
    isVariable: function (obj) {
        return obj && ((obj instanceof Variable) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', Variable._postman_propertyName));
    }
});

module.exports = {
    Variable: Variable
};
