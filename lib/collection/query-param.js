var _ = require('../util').lodash,
    urlEncoder = require('postman-url-encoder'),

    Property = require('./property').Property,
    PropertyList = require('./property-list').PropertyList,

    AMPERSAND = '&',
    STRING = 'string',
    EQUALS = '=',
    EMPTY = '',
    BRACE_START = '{{',
    BRACE_END = '}}',
    REGEX_BRACE_START = /%7B%7B/g,
    REGEX_BRACE_END = /%7D%7D/g,

    QueryParam;

/**
 * @typedef QueryParam~definition
 * @property {String} key The name ("key") of the query parameter.
 * @property {String} value The value of the parameter.
 */
_.inherit((

    /**
     * Represents a URL query parameter, which can exist in request URL or POST data.
     *
     * @constructor
     * @extends {Property}
     * @param {FormParam~definition|String} options Pass the initial definition of the query parameter. In case of
     * string, the query parameter is parsed using {@link QueryParam.parseSingle}.
     */
    QueryParam = function PostmanQueryParam (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        QueryParam.super_.apply(this, arguments);

        this.update(options);
    }), Property);

_.assign(QueryParam.prototype, /** @lends QueryParam.prototype */ {
    /**
     * Converts the QueryParameter to a single param string.
     *
     * @returns {String}
     */
    toString: function () {
        return QueryParam.unparseSingle(this);
    },

    /**
     * Updates the key and value of the query parameter
     *
     * @param {String|Object} param
     * @param {String} param.key
     * @param {String=} [param.value]
     */
    update: function (param) {
        _.assign(this, /** @lends QueryParam.prototype */ _.isString(param) ? QueryParam.parseSingle(param) : {
            key: _.get(param, 'key'), // we do not replace falsey with blank string since null has a meaning
            value: _.get(param, 'value')
        });
        _.has(param, 'system') && (this.system = param.system);
    },

    valueOf: function () {
        return _.isString(this.value) ? this.value : EMPTY;
    }
});

_.assign(QueryParam, /** @lends QueryParam */ {

    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'QueryParam',

    /**
     * Declare the list index key, so that property lists of query parameters work correctly
     *
     * @type {String}
     */
    _postman_propertyIndexKey: 'key',

    /**
     * Query params can have multiple values, so set this to true.
     *
     * @type {Boolean}
     */
    _postman_propertyAllowsMultipleValues: true,

    /**
     * Parse a query string into an array of objects, where each object contains a key and a value.
     *
     * @param {String} query
     * @returns {Array}
     */
    parse: function (query) {
        return _.isString(query) ? query.split(AMPERSAND).map(QueryParam.parseSingle) : [];
    },

    /**
     * Parses a single query parameter.
     *
     * @param {String} param
     * @param {Number} idx
     * @param {String[]} all - array of all params, in case this is being called while parsing multiple params.
     * @returns {{key: string|null, value: string|null}}
     */
    parseSingle: function (param, idx, all) {
        // helps handle weird edge cases such as "/get?a=b&&"
        if (param === EMPTY && // if param is empty
            _.isNumber(idx) && // this and the next condition ensures that this is part of a map call
            _.isArray(all) &&
            idx !== (all && (all.length - 1))) { // not last parameter in the array
            return { key: null, value: null };
        }

        var index = (typeof param === STRING) ? param.indexOf(EQUALS) : -1,
            paramObj = {};

        // this means that there was no value for this key (not even blank, so we store this info) and the value is set
        // to null
        if (index < 0) {
            paramObj.key = param.substr(0, param.length);
            paramObj.value = null;
        }
        else {
            paramObj.key = param.substr(0, index);
            paramObj.value = param.substr(index + 1);
        }

        return paramObj;
    },

    /**
     * Create a query string from array of parameters (or object of key-values). This function ensures that
     * the double braces "{{" and "}}" are not URL-encoded on unparsing, which allows for variable-substitution.
     *
     * @param {Array|Object} params
     * @param {Object=} options
     * @param {?Boolean} [options.encode=false] - Enables URL encoding of the parameters
     * @param {?Boolean} [options.ignoreDisabled=false] - Removes disabled query parameters when set to true.
     * @returns {string}
     */
    unparse: function (params, options) {
        if (!params) { return EMPTY; }

        var str,
            encode = options && options.encode,
            ignoreDisabled = options && options.ignoreDisabled;

        // Convert hash maps to an array of params
        if (!_.isArray(params) && !PropertyList.isPropertyList(params)) {
            return _.reduce(params, function (result, value, key) {
                result && (result += AMPERSAND);
                return result + QueryParam.unparseSingle({ key: key, value: value }, encode);
            }, EMPTY);
        }

        // construct a query parameter string from the list, with considerations for disabled values
        str = params.reduce(function (result, param) {
            // If disabled parameters are to be ignored, bail out here
            if (ignoreDisabled && (param.disabled === true)) { return result; }

            // If the current unparsed result is non empty, append an ampersand
            result && (result += AMPERSAND);

            return result + QueryParam.unparseSingle(param, encode);
        }, EMPTY);

        encode && (str = str.replace(REGEX_BRACE_START, BRACE_START).replace(REGEX_BRACE_END, BRACE_END));

        return str;
    },

    /**
     * Takes a query param and converts to string
     *
     * @param {Object} obj
     * @param {Boolean} encode
     * @returns {String}
     */
    unparseSingle: function (obj, encode) {
        if (!obj) { return EMPTY; }

        var key = obj.key,
            value = obj.value;

        if (value === undefined) {
            return EMPTY;
        }

        if (key === null) {
            key = EMPTY;
        }

        if (value === null) {
            return encode ? urlEncoder.encode(key) : key;
        }

        if (encode) {
            key = urlEncoder.encode(key);
            value = urlEncoder.encode(value);
        }

        return key + EQUALS + value;
    }
});

module.exports = {
    QueryParam: QueryParam
};
