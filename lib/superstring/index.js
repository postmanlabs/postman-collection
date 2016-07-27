var _ = require('../util').lodash,
    uuid = require('node-uuid'),
    E = '',

    SuperString, // constructor
    Substitutor; // constructor

/**
 * A string-like instance with additional functionalities to track string operations better
 *
 * @constructor
 * @private
 * @param {String} value
 */
SuperString = function SuperString (value) {
    this.value = _.isString(value) ? value : (_.isFunction(value.toString) && value.toString() || E);

    /**
     * The total number of times there was a successful substitution.
     * @type {number}
     */
    this.substitutions = 0;
    /**
     * Keeps a track of the number of tokens replaced in the last replace command
     *
     * @type {number}
     */
    this.replacements = 0;
};

_.extend(SuperString.prototype, /** @lends SuperString.prototype */ {
    /**
     * Equivalent to string replace but performs additional tracking of the number of tokens replaced
     *
     * @param {RegExp|String} regex
     * @param {Function|String} fn
     * @returns {SuperString}
     */
    replace: function (regex, fn) {
        var replacements = 0; // maintain a count of tokens replaced

        // to ensure we do not perform needless operations in the replacement, we use multiple replacement functions
        // after validating the parameters
        this.value = (this.value.replace(regex, _.isFunction(fn) ? function () {
            replacements += 1;
            return fn.apply(this, arguments);
        } : function () { // this case is returned when replacer is not a function (ensures we do not need to check it)
            replacements += 1;
            return fn;
        }));

        this.replacements = replacements; // store the last replacements
        this.substitutions += +replacements; // if any replacement is done, count that some substitution was made
        return this;
    },
    /**
     * @returns {String}
     */
    toString: function () {
        return this.value;
    },
    /**
     * @returns {String}
     */
    valueOf: function () {
        return this.value;
    }
});

/**
 * Perform replacement of tokens in a SuperString with values stored in keys of an array of objects.
 *
 * @constructor
 * @private
 * @param {Array} variables
 * @param {Object} defaults
 */
Substitutor = function (variables, defaults) {
    defaults && variables.push(defaults);
    this.variables = variables;
};

_.extend(Substitutor.prototype, /** @lends Substitutor.prototype */ {
    /**
     * Find a key from the array of variable objects provided to the substitutor
     *
     * @param {String} key
     * @returns {*}
     */
    find: function (key) {
        var arr = this.variables,
            obj,
            i,
            ii;

        for (i = 0, ii = arr.length; i < ii; i++) {
            obj = arr[i];
            // ensure that the item is an object
            if (!(obj && _.isObject(obj))) {
                continue;
            }

            // in case the object is a postman variable list, we give special attention
            if (obj.constructor._postman_propertyName === 'VariableList') {
                if (obj.has(key)) { return obj.one(key); }
            }
            // else we return the value from the plain object
            else if (obj.hasOwnProperty(key)) {
                return obj[key];
            }
        }
    },

    /**
     * @param {String} value
     * @returns {String}
     */
    parse: function (value) {
        // convert the value into a SuperString so that it can return tracking results during replacements
        value = new SuperString(value);

        // get an instance of a replacer function that would be used to replace ejs like variable replacement
        // tokens
        var replacer = Substitutor.replacer(this);

        // replace the value once and keep on doing it until all tokens are replaced or we have reached a limit of
        // replacements
        do {
            value = value.replace(Substitutor.REGEX_EXTRACT_VARS, replacer);
        } while (value.replacements && (value.substitutions < Substitutor.VARS_SUBREPLACE_LIMIT));

        // @todo: uncomment this code, and try to raise a warning in some way.
        // do a final check that if recursion limits are reached then replace with blank string
        // if (value.substitutions >= Substitutor.VARS_SUBREPLACE_LIMIT) {
        //     value = value.replace(Substitutor.REGEX_EXTRACT_VARS, E);
        // }

        return value;
    }
});

_.extend(Substitutor, /** @lends Substitutor */ {
    /**
     * Regular expression to be used in {String}.replace for extracting variable substitutions
     * @readOnly
     * @type {RegExp}
     */
    REGEX_EXTRACT_VARS: /\{\{([^{}]*?)}}/g,
    /**
     * Defines the number of times the variable substitution mechanism will repeat until all tokens are resolved
     *
     * @type {Number}
     */
    VARS_SUBREPLACE_LIMIT: 19,
    /**
     * Maintain a list of types that are native
     * @readOnly
     * @enum {String}
     */
    NATIVETYPES: {
        'string': true,
        'number': true,
        'boolean': true
    },

    /**
     * Holds the default variables that Postman supports.
     *
     * @type {Object}
     */
    DEFAULT_VARS: {
        $guid: function () {
            return uuid.v4();
        },
        $timestamp: function () {
            return Math.round(Date.now() / 1000);
        },
        $randomInt: function () {
            return ~~(Math.random() * (1000 + 1));
        }
    },

    /**
     * Create an instance of a substitutor or reuse one
     *
     * @param {Array|Substitutor} variables
     * @param {Object=} defaults An object containing default variables to substitute
     * @returns {Substitutor}
     */
    box: function (variables, defaults) {
        return (variables instanceof Substitutor) ? variables : new Substitutor(variables, defaults);
    },

    /**
     * Checks whether a variable is instance of substitutor
     *
     * @param {*} subject
     * @returns {Boolean}
     */
    isInstance: function (subject) {
        return (subject instanceof Substitutor);
    },

    /**
     * Get an instance of a function that is useful to be passed to a string replace function for extracting tokens
     * and replacing by substitutions
     * @private
     * @param {Substitutor} substitutor
     * @returns {Function}
     */
    replacer: function (substitutor) {
        return function (match, token) {
            var r = substitutor.find(token);
            r && _.isFunction(r) && (r = r());
            r && _.isFunction(r.toString) && (r = r.toString());
            return Substitutor.NATIVETYPES[(typeof r)] ? r : match;
        };
    }
});

module.exports = {
    SuperString: SuperString,
    Substitutor: Substitutor
};
