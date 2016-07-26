var util = require('../util'),
    _  = util.lodash,
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
     * @param {Header~definition|String} [value] - Pass the header definition as an object or the value of the header.
     * If the value is passed as a string, it should either be in `name:value` format or the second "name" parameter
     * should be used to pass the name as string
     * @param {String} [name] - optional override the header name or use when the first parameter is the header value as
     * string.
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
    Header = function PostmanHeader (options, name) {
        if (_.isString(options)) {
            options = _.isString(name) ? { key: name, value: options } : Header.parseSingle(options);
        }

        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        Header.super_.apply(this, arguments);

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

        /**
         * Indicates whether the header was added by internal SDK operations, such as authorizing a request.
         * @type {*|boolean}
         */
        _.has(options, 'system') && (this.system = options.system);
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
     * Specifies whether the index lookup of this property, when in a list is case insensitive or not
     * @private
     * @readOnly
     * @type {boolean}
     */
    _postman_propertyIndexCaseInsensitive: true,

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
     * @param {String} header
     * @returns {{key: string, value: string}}
     */
    parseSingle: function (header) {
        if (!_.isString(header)) { return { key: '', value: '' }; }

        var index = header.indexOf(':'),
            key,
            value;

        (index < 0) && (index = header.length);

        key = header.substr(0, index);
        value = header.substr(index + 1);

        return {
            key: _.trim(key),
            value: _.trim(value)
        };
    },

    /**
     * Stringifies an Array or {@link PropertyList} of Headers into a single string.
     *
     * @param {Array|PropertyList<Header>} headers
     * @param {String=} separator - Specify a string for separating each header, by default, '\n', but sometimes,
     * it might be more useful to use a carriage return ('\r\n')
     * @returns {string}
     */
    unparse: function (headers, separator) {
        if (!_.isArray(headers) && !PropertyList.isPropertyList(headers)) {
            return '';
        }

        return headers.map(function (header) {
            return header.key + ': ' + header.value;
        }).join(separator ? separator : '\n');
    },

    /**
     * Check whether an object is an instance of PostmanHeader.
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isHeader: function (obj) {
        return obj && ((obj instanceof Header) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', Header._postman_propertyName));
    },

    /**
     * Create a new header instance
     *
     * @param {Header~definition|String} [value] - Pass the header definition as an object or the value of the header.
     * If the value is passed as a string, it should either be in `name:value` format or the second "name" parameter
     * should be used to pass the name as string
     * @param {String} [name] - optional override the header name or use when the first parameter is the header value as
     * string.
     * @returns {Header}
     */
    create: function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(Header);
        return new (Header.bind.apply(Header, args))();
    },

    /**
     * Gets value from an Array or {@link PropertyList} of Headers by filtering through key.
     *
     * @param {Array|PropertyList<Header>} headers
     * @param {string} key
     * @returns {string}
     */
    headerValue: function (headers, key) {
        if (!_.isArray(headers) && !PropertyList.isPropertyList(headers)) {
            return undefined;
        }
        var header = headers.find(function (header) {
            return header.key === key;
        });
        return header ? header.value : undefined;
    },

    /**
     * Gets size of an Array or {@link PropertyList} of Headers.
     *
     * @param {Array|PropertyList<Header>} headers
     * @returns {Number}
     */
    size: function (headers, statusCode, reason) {
        if (!_.isArray(headers) && !PropertyList.isPropertyList(headers)) {
            return 0;
        }
        // https://tools.ietf.org/html/rfc7230#section-3.1.2
        // status-line = HTTP-version SP status-code SP reason-phrase CRLF
        var raw = 'HTTP/X.X' + ' ' + statusCode + ' ' + reason + '\r\n';
        raw += this.unparse(headers, '\r\n');
        raw += '\r\n\r\n';
        return raw.length;
    }
});

module.exports = {
    Header: Header
};
