var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,
    PropertyList = require('./property-list').PropertyList,

    Header;
/**
 * @typedef Header~definition
 * @property {String} key The Header name (e.g: 'Content-Type')
 * @property {String} value The value of the header.
 *
 * @example Create a header
 * var Header = require('postman-collection').Header,
 *     header = new Header({
 *         key: 'Content-Type',
 *         value: 'application/xml'
 *     });
 *
 * console.log(header.toString()) // prints the string representation of the Header.
 */
_.inherit((
    /**
     * Represents an HTTP header, for requests or for responses.
     * @constructor
     * @extends {Property}
     *
     * @param {Header~definition|String} options Pass the initial definition of the header (key, value) as the options
     * parameter. In case a string is given, it is parsed to extract the header key and value.
     *
     * @example <caption>Parse a string of headers into an array of Header objects</caption>
     * var Header = require('postman-collection').Header,
     *     headerString = 'Content-Type: application/json\nUser-Agent: MyClientLibrary/2.0\n';
     *
     * var rawHeaders = Header.parse(headerString);
     * console.log(rawHeaders); // [{ 'Content-Type': 'application/json', 'User-Agent': 'MyClientLibrary/2.0' }]
     *
     * var headers = rawHeaders.map(function (h) {
     *     return new Header(h);
     * });
     *
     * assert headerString === Header.unparse(headers);
     */
    Header = function PostmanHeader (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        Header.super_.apply(this, arguments);

        if (_.isString(options)) {
            options = Header.parseSingle(options);
        }

        /**
         * The header Key
         * @type {String}
         */
        this.key = _.get(options, 'key') || '';
        /**
         * The header value
         * @type {String}
         */
        this.value = _.get(options, 'value') || '';
    }), PropertyBase);

_.extend(Header.prototype, /** @lends Header.prototype */ {
    /**
     * Converts the header to a single header string
     * @returns {String}
     */
    toString: function () {
        return this.key + ': ' + this.value;
    }
});

_.extend(Header, /** @lends Header */ {

    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'Header',

    /**
     * Specify the key to be used while indexing this object
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyIndexKey: 'key',

    /**
     * Parses a multi line header string into an array of {@link Header~definition}.
     *
     * @param headerString
     * @returns {Array}
     */
    parse: function (headerString) {
        var headers = [],
            regexes = {
                header: /^(\S+):(.*)$/gm,
                fold: /\r\n([ \t])/g,
                trim: /^\s*(.*\S)?\s*$/
            },
            match = regexes.header.exec(headerString);
        headerString = headerString.toString().replace(regexes.fold, '$1');

        while (match) {
            headers.push({
                key: match[1],
                value: match[2].replace(regexes.trim, '$1')
            });
            match = regexes.header.exec(headerString);
        }
        return headers;
    },

    /**
     * Parses a single Header.
     * @param header
     * @returns {{key: string, value: string}}
     */
    parseSingle: function (header) {
        var parsed;
        parsed = header.split(':');
        return {
            key: _.trim(parsed[0]),
            value: _.trim(parsed[1])
        };
    },

    /**
     * Stringifies an Array or {@link PropertyList} of Headers into a single string.
     *
     * @param {Array|PropertyList<Header>} headers
     * @returns {string}
     */
    unparse: function (headers) {
        if (!_.isArray(headers) && !PropertyList.isPropertyList(headers)) {
            throw new Error('It is only possible to unparse PropertyList or Array of headers.');
        }

        return headers.map(function (header) {
            return header.key + ': ' + header.value;
        }).join('\n');
    }
});

module.exports = {
    Header: Header
};
