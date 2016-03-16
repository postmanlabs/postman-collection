var _ = require('../util').lodash,
    Property = require('./property').Property,

    E = '',
    ANY = 'any',

    Variable;

_.inherit((
    /**
     * @constructor
     * @extends {Property}
     *
     * @param {Object} options
     */
    Variable = function PostmanVariable (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        Variable.super_.apply(this, arguments);

        _.extend(this, /** @lends Variable.prototype */ {
            /**
             * @type {valueTypes}
             */
            type: ANY,
            /**
             * @type {*}
             */
            value: undefined
        });

        (options !== undefined) && this.update(options);
    }), Property);

_.extend(Variable.prototype, /** @lends Variable.prototype */ {
    /**
     * Gets the value of the variable
     * @returns {Variable.type}
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
     * Typecasts a value to the {@link Variable.type} of this {@link Variable}.
     * @param {*} value
     * @returns {Variable.type}
     */
    cast: function (value) {
        return (Variable.type[this.type] || Variable.type.any)(value);
    },

    /**
     * Sets or gets the type of the value
     * @param {String} typeName
     * @returns {Variable.type}
     */
    valueType: function (typeName) {
        if (!typeName || !Variable.type[(typeName = typeName && typeName.toString().toLowerCase())]) {
            return this.type || ANY; // @todo: throw new Error('Invalid variable type.');
        }

        // set the new type if it is valid and cast the stored value
        if (typeName) {
            this.type = typeName;
            this.value = this.cast(this.value);
        }

        return typeName;
    },

    /**
     * Updates the type and value of a variable
     * @param {Object} options
     */
    update: function (options) {
        if (!_.isObject(options)) {
            return;
        }
        // set type and value.
        options.hasOwnProperty('type') && this.valueType(options.type);
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
     * Types of variables
     * @enum {Function}
     */
    type: {
        'string': String,
        'boolean': Boolean,
        'number': Number,
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
