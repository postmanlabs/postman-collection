var _ = require('../util').lodash,
    Property = require('./property').Property,

    QueryParam;

_.inherit((
    /**
     * Represents a URL query parameter, which can exist in request URL or POST data.
     * @constructor
     * @extends {Property}
     *
     * @param {Object|String} options Pass the initial definition of the query parameter (key, value) as the
     *                        options parameter.
     */
    QueryParam = function PostmanQueryParam (options) {
        if (_.isString(options)) {
            options = QueryParam.parseSingle(options);
        }

        this.key = options.key || '';
        this.value = options.value || '';
    }), Property);

_.extend(QueryParam.prototype, /** @lends QueryParam.prototype */ {
    /**
     * Converts the QueryParameter to a single param string
     * @returns {String}
     */
    toString: function () {
        return this.key + '=' + this.value;
    },

    toJSON: function () {
        return { key: this.key, value: this.value };
    }
});

_.extend(QueryParam, /** @lends QueryParam */ {

    /**
     * Parse a query string into an array of objects, where each object contains a key and a value.
     *
     * @param query {String}
     * @returns {Array}
     */
    parse: function (query) {
        return _.isString(query) ? query.split('&').map(QueryParam.parseSingle) : [];
    },

    parseSingle: function (param) {
        var parsed;
        parsed = param.split('=');
        return {
            key: _.trim(parsed[0]),
            value: _.trim(parsed[1])
        };
    },

    /**
     * Create a query string from array of parameters (or object of key-values).
     *
     * @param params
     * @returns {string}
     */
    unparse: function (params) {
        var qs;

        if (!_.isArray(params)) {
            params = _.reduce(params, function (accumulator, value, key) {
                accumulator.push({ key: key, value: value });
                return accumulator;
            }, []);
        }

        qs = _.reduce(params, function (accumulator, param) {
            if (accumulator.length > 0) {
                accumulator += '&';
            }
            accumulator += encodeURI(param.key + '=' + param.value);
            return accumulator;
        }, '');

        // Special handling to ensure "{{" and "}}" are not URL encoded in the final query-string.
        qs = qs.replace('%7B%7B', '{{');
        qs = qs.replace('%7D%7D', '}}');
        return qs;
    }
});

module.exports = {
    QueryParam: QueryParam
};
