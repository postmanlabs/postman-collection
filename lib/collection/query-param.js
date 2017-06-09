var _ = require('../util').lodash,
    urlEncoder = require('postman-url-encoder'),

    Property = require('./property').Property,

    AMPERSAND = '&',
    STRING = 'string',
    EQUALS = '=',
    EMPTY = '',

    QueryParam;

/**
 * @typedef QueryParam~definition
 * @property {String} key The name ("key") of the query parameter.
 * @property {String} value The value of the parameter.
 */
_.inherit((

    /**
     * Represents a URL query parameter, which can exist in request URL or POST data.
     * @constructor
     * @extends {Property}
     *
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
     * Converts the QueryParameter to a single param string
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
            key: _.get(param, 'key') || EMPTY, // we do not replace falsey with blank string since null has a meaning
            value: _.get(param, 'value')
        });
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
     * @param query {String}
     * @returns {Array}
     */
    parse: function (query) {
        return _.isString(query) ? query.split(AMPERSAND).map(QueryParam.parseSingle) : [];
    },

    /**
     * Parses a single query parameter.
     *
     * @param param
     * @param idx
     * @param all - array of all params, in case this is being called while parsing multiple params.
     * @returns {{key: string|null, value: string|null}}
     */
    parseSingle: function (param, idx, all) {
        // helps handle weird edge cases such as "/get?a=b&&"
        if (param === EMPTY &&  // if param is empty
            _.isNumber(idx) &&  // this and the next condition ensures that this is part of a map call
            _.isArray(all) &&
            idx !== (all && (all.length - 1))) {  // not last parameter in the array
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
     * @param params
     * @param {Object=} options
     * @param {Boolean} options.encode - Enables URL encoding of the parameters
     * @returns {string}
     */
    unparse: function (params, options) {
        var encode = options && options.encode,
            str;

        if (!params) { return EMPTY; }

        str = params.map(function (param) {
            return QueryParam.unparseSingle(param, encode);
        }).join(AMPERSAND);

        (encode) && (str = str.replace(/%7B%7B/g, '{{')) && (str = str.replace(/%7D%7D/g, '}}'));

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
