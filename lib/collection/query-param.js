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
        if (_.isString(options)) {
            options = QueryParam.parseSingle(options);
        }

        this.key = _.get(options, 'key') || '';
        this.value = _.get(options, 'value') || '';
    }), Property);

_.extend(QueryParam.prototype, /** @lends QueryParam.prototype */ {
    /**
     * Converts the QueryParameter to a single param string
     * @returns {String}
     */
    toString: function () {
        return this.key + '=' + this.value;
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
        var parsed;
        parsed = param.split('=');
        return {
            key: _.trim(parsed[0]),
            value: _.trim(parsed[1])
        };
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
            if (accumulator.length > 0) {
                accumulator += '&';
            }
            accumulator += encodeURI(param.key + '=' + param.value);
            return accumulator;
        }, '') : _.reduce(params, function (accumulator, param) {
            if (accumulator.length > 0) {
                accumulator += '&';
            }
            accumulator += (param.key + '=' + param.value);
            return accumulator;
        }, '');

        // Special handling to ensure "{{" and "}}" are not URL encoded in the final query-string.
        (options && options.encode) && (qs = qs.replace(/%7B%7B/g, '{{')) && (qs = qs.replace(/%7D%7D/g, '}}'));
        return qs;
    }
});

module.exports = {
    QueryParam: QueryParam
};
