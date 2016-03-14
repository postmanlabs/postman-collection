var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,
    PropertyList = require('./property-list').PropertyList,

    Header;

_.inherit((
    /**
     * Represents an HTTP header, for requests or for responses.
     * @constructor
     * @extends {Property}
     *
     * @param {Object} options Pass the initial definition of the header (key, value) as the options parameter.
     */
    Header = function PostmanHeader (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        Header.super_.apply(this, arguments);

        if (_.isString(options)) {
            options = Header.parseSingle(options);
        }

        this.key = options.key || '';
        this.value = options.value || '';
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
     * Parses a multi line header string into individual header key-value pairs.
     *
     * @param headerString
     * @returns {Object}
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

    parseSingle: function (header) {
        var parsed;
        parsed = header.split(':');
        return {
            key: _.trim(parsed[0]),
            value: _.trim(parsed[1])
        };
    },

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
