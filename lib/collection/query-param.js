var _ = require('../util').lodash,
    Property = require('./property').Property,

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
        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        QueryParam.super_.apply(this, arguments);

        this.update(options);
    }), Property);

_.extend(QueryParam.prototype, /** @lends QueryParam.prototype */ {
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
        _.assign(this, _.isString(param) ? QueryParam.parseSingle(param) : {
            key: _.get(param, 'key') || '', // we do not replace falsey with blank string since null has a meaning
            value: _.get(param, 'value')
        });
    }
});

_.extend(QueryParam, /** @lends QueryParam */ {

    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'QueryParam',

    /**
     * Parse a query string into an array of objects, where each object contains a key and a value.
     *
     * @param query {String}
     * @returns {Array}
     */
    parse: function (query) {
        return _.isString(query) ? query.split('&').map(QueryParam.parseSingle) : [];
    },

    /**
     * Parses a single query parameter.
     *
     * @param param
     * @returns {{key: string, value: string}}
     */
    parseSingle: function (param) {
        var index = _.isString(param) ? param.indexOf('=') : -1,
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
        var qs,
            encode = options && options.encode;

        if (!_.isArray(params)) {
            params = _.reduce(params, function (accumulator, value, key) {
                accumulator.push({ key: key, value: value });
                return accumulator;
            }, []);
        }

        qs = (encode) ? _.reduce(params, function (accumulator, param) {
            accumulator.length && (accumulator += '&');
            accumulator += encodeURI(QueryParam.unparseSingle(param));
            return accumulator;
        }, '') : _.reduce(params, function (accumulator, param) {
            accumulator.length && (accumulator += '&');
            accumulator += QueryParam.unparseSingle(param);
            return accumulator;
        }, '');

        // Special handling to ensure "{{" and "}}" are not URL encoded in the final query-string.
        (options && options.encode) && (qs = qs.replace(/%7B%7B/g, '{{')) && (qs = qs.replace(/%7D%7D/g, '}}'));
        return qs;
    },
    /**
     * Takes a query param and converts to string
     *
     * @param {Object} obj
     * @returns {String}
     */
    unparseSingle: function (obj) {
        if (!obj) { return ''; }
        var unparsed = obj.key || '';
        // if the value is not null, then we add the value
        (obj.value != null) && (unparsed += ('=' + (obj.value || '')));
        return unparsed;
    }
});

module.exports = {
    QueryParam: QueryParam
};
