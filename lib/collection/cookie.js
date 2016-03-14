var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,

    Cookie,

    PAIR_SPLIT_REGEX = /; */,

    /**
     * Enum for all the Cookie attributes.
     * @readonly
     * @enum {string} CookieAttributes
     */
    cookieAttributes = {
        httponly: 'httpOnly',
        secure: 'secure',
        domain: 'domain',
        path: 'path',
        'max-age': 'maxAge',
        session: 'session',
        expires: 'expires'
    };

_.inherit((
    /**
     * A Postman Cookie definition that comprehensively represents an HTTP Cookie.
     * @constructor
     * @extends {PropertyBase}
     *
     * @param {Object} options Pass the initial definition of the Cookie.
     */
    Cookie = function PostmanCookie (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        Cookie.super_.call(this, options);
        if (!options) { return; } // in case definition object is missing, there is no point moving forward

        _.isString(options) && (options = Cookie.parse(options));

        this.update(options);
    }), PropertyBase);

_.extend(Cookie.prototype, /** @lends Cookie.prototype */ {
    update: function (options) {
        _.extend(this, /** @lends Cookie.prototype */ {
            /**
             * The name of the cookie.
             * @type {String}
             */
            name: options.name,
            /**
             * Expires sets an expiry date for when a cookie gets deleted. It should either be a date object or
             * timestamp string of date.
             * @type {Date|String}
             *
             * @note
             * The value for this option is a date in the format Wdy, DD-Mon-YYYY HH:MM:SS GMT such as
             * "Sat, 02 May 2009 23:38:25 GMT". Without the expires option, a cookie has a lifespan of a single session.
             * A session is defined as finished when the browser is shut down, so session cookies exist only while the
             * browser remains open. If the expires option is set to a date that appears in the past, then the cookie is
             * immediately deleted in browser.
             *
             * @todo Accept date object and convert stringified date (timestamp only) to date object
             */
            expires: _.isString(options.expires) ? new Date(options.expires) : options.expires,

            /**
             * Max-age sets the time in seconds for when a cookie will be deleted.
             * @type {Number}
             */
            maxAge: _.has(options, 'maxAge') ? Number(options.maxAge) : undefined,

            /**
             * Indicates the domain(s) for which the cookie should be sent.
             * @type {String}
             *
             * @note
             * By default, domain is set to the host name of the page setting the cookie, so the cookie value is sent
             * whenever a request is made to the same host name. The value set for the domain option must be part of the
             * host name that is sending the Set-Cookie header. The SDK does not perform this check, but the underlying
             * client that actually sends the request could do it automatically.
             */
            domain: options.domain,

            /**
             * @type {String}
             *
             * @note
             * On server, the default value for the path option is the path of the URL that sent the Set-Cookie header.
             */
            path: options.path,

            /**
             * A secure cookie will only be sent to the server when a request is made using SSL and the HTTPS protocol.
             * The idea that the contents of the cookie are of high value and could be potentially damaging to transmit
             * as clear text.
             * @type: {Boolean}
             */
            secure: _.has(options, 'secure') ? Boolean(options.secure) : undefined,

            /**
             * The idea behind HTTP-only cookies is to instruct a browser that a cookie should never be accessible via
             * JavaScript through the document.cookie property. This feature was designed as a security measure to help
             * prevent cross-site scripting (XSS) attacks perpetrated by stealing cookies via JavaScript.
             * @type: {Boolean}
             */
            httpOnly: _.has(options, 'httpOnly') ? Boolean(options.httpOnly) : undefined,

            /**
             * @type: {Boolean}
             */
            hostOnly: _.has(options, 'hostOnly') ? Boolean(options.hostOnly) : undefined,

            /**
             * Indicates whether this is a Session Cookie.
             * @type: {Boolean}
             */
            session: _.has(options, 'session') ? Boolean(options.session) : undefined,

            /**
             * @note The commonly held belief is that cookie values must be URL-encoded, but this is a fallacy even
             * though it is the de facto implementation. The original specification indicates that only three types of
             * characters must be encoded: semicolon, comma, and white space. The specification indicates that URL
             * encoding may be used but stops short of requiring it. The RFC makes no mention of encoding whatsoever.
             * Still, almost all implementations perform some sort of URL encoding on cookie values.
             * @type {String}
             */
            value: options.value ? _.ensureEncoded(options.value) : undefined,

            /**
             * Any extra parameters that are not strictly a part of the Cookie spec go here.
             * @type {Array}
             */
            extensions: options.extensions || undefined
        });
    }
});

_.extend(Cookie, /** @lends Cookie */ {
    /**
     * Cookie header parser
     *
     * @param str
     * @returns {*} A plain cookie options object, use it to create a new Cookie
     */
    parse: function (str) {
        if (!_.isString(str)) {
            return str;
        }

        var obj = {},
            pairs = str.split(PAIR_SPLIT_REGEX),
            nameval;

        nameval = Cookie.splitParam(pairs.shift()); // The first kvp is the name and value
        obj.name = nameval.key;
        obj.value = nameval.value;

        pairs.forEach(function (pair) {
            var keyval = Cookie.splitParam(pair),
                value = keyval.value,
                keyLower = keyval.key.toLowerCase();

            if (cookieAttributes[keyLower]) {
                obj[cookieAttributes[keyLower]] = value;
            }
            else {
                obj.extensions = obj.extensions || [];
                obj.extensions.push(keyval);
            }
        });
        // Handle the hostOnly flag
        if (!obj.domain) {
            obj.hostOnly = true;
        }
        return obj;
    },

    /**
     * Splits a Cookie parameter into a key and a value
     *
     * @private
     * @param param
     * @returns {{key: *, value: (boolean|*)}}
     */
    splitParam: function (param) {
        var split = param.split('='),
            key, value;
        key = split[0].trim();
        value = (split[1]) ? split[1].trim() : true;

        if (_.isString(value) && '"' === value[0]) {
            value = value.slice(1, -1);
        }

        return { key: key, value: value };
    }
});

module.exports = {
    Cookie: Cookie
};
