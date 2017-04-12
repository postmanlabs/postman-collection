var _ = require('../util').lodash,
    Property = require('./property').Property,
    PropertyList = require('./property-list').PropertyList,
    Url = require('./url').Url,
    ProxyConfig = require('./proxy-config').ProxyConfig,
    Certificate = require('./certificate').Certificate,
    Header = require('./header').Header,
    RequestBody = require('./request-body').RequestBody,
    RequestAuth = require('./request-auth').RequestAuth,

    Request;

/**
 * @typedef Request~definition
 * @property {String|Url} url The URL of the request. This can be a {@link Url~definition} or a string.
 * @property {String} method The request method, e.g: "GET" or "POST".
 * @property {Array<Header~definition>} header The headers that should be sent as a part of this request.
 * @property {RequestBody~definition} body The request body definition.
 * @property {RequestAuth~definition} auth The authentication/signing information for this request.
 * @property {ProxyConfig~definition} proxy The proxy information for this request.
 * @property {Certificate~definition} certificate The certificate information for this request.
 */
_.inherit((

    /**
     * A Postman HTTP request object
     * @constructor
     * @extends {Property}
     *
     * @param {Object} options
     */
    Request = function PostmanRequest (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        Request.super_.apply(this, arguments);

        // in case definition object is missing, create an empty one
        options = options || {};

        // if the definition is a string, it implies that this is a get of URL
        (typeof options === 'string') && (options = {
            url: options
        });

        // Create the default properties
        _.assign(this, /** @lends Request.prototype */ {
            /**
             * @type {Url}
             */
            url: new Url(),

            /**
             * @type {PropertyList<Header>}
             */
            headers: new PropertyList(Header, this, options.header),

            /**
             * @type {String}
             */
            method: (options.method || 'GET').toUpperCase()
        });

        this.update(options);
    }), Property);

_.assign(Request.prototype, /** @lends Request.prototype */ {

    /**
     * Updates the different properties of the request.
     *
     * @param {Object} options
     */
    update: function (options) {
        // Nothing to do
        if (!options) { return; }

        // The existing url is updated.
        options.url && this.url.update(options.url);

        // The existing list of headers must be cleared before adding the given headers to it.
        options.header && this.headers.repopulate(options.header);

        // Only update the method if one is provided.
        options.method && (this.method = (options.method));

        // The rest of the properties are not assumed to exist so we merge in the defined ones.
        _.mergeDefined(this, /** @lends Request.prototype */ {
            /**
             * @type {RequestBody|undefined}
             */
            body: _.createDefined(options, 'body', RequestBody),

            /**
             * @type {RequestAuth}
             */
            auth: _.createDefined(options, 'auth', RequestAuth),

            /**
             * @type {ProxyConfig}
             */
            proxy: options.proxy && new ProxyConfig(options.proxy),

            /**
             * @type {Certificate|undefined}
             */
            certificate: options.certificate && new Certificate(options.certificate)
        });
    },

    /**
     * Returns an object where the key is a header name and value is the header value.
     *
     * @param options {Object=}
     * @param options.ignoreCase {Boolean} When set to "true", will ensure that all the header keys are lower case.
     * @param options.enabled {Boolean} Only get the enabled headers
     *
     * @note If multiple headers are present in the same collection with same name, but different case
     * (E.g "x-forward-port" and "X-Forward-Port", and `options.ignoreCase` is set to true, the result will contain
     * the value of the header which occurs the last.
     */
    getHeaders: function getHeaders (options) {
        var headers = {},
            self = this;

        options = options || {};
        _.forEach(self.headers.all(), function (header) {
            if (options.enabled && header.disabled) { return; }
            headers[options.ignoreCase ? header.key.toLowerCase() : header.key] = header.value;
        });
        return headers;
    },

    /**
     * Calls the given callback on each Header object contained within the request.
     *
     * @param callback
     */
    forEachHeader: function forEachHeader (callback) {
        this.headers.all().forEach(function (header) {
            return callback(header, this);
        }, this);
    },

    /**
     * Adds a header to the PropertyList of headers.
     *
     * @param header {Header| {key: String, value: String}} Can be a {Header} object,
     *                      or a raw header object.
     */
    addHeader: function (header) {
        this.headers.add(header);
    },

    /**
     * Removes a header from the request.
     *
     * @param toRemove {String|Header} A header object to remove, or a string containing the header key.
     * @param options
     * @param options.ignoreCase {Boolean} If set to true, ignores case while removing the header.
     */
    removeHeader: function (toRemove, options) {
        toRemove = _.isString(toRemove) ? toRemove : toRemove.key;

        options = options || {};

        if (!toRemove) { // Nothing to remove :(
            return;
        }

        options.ignoreCase && (toRemove = toRemove.toLowerCase());

        this.headers.remove(function (header) {
            var key = options.ignoreCase ? header.key.toLowerCase() : header.key;
            return key === toRemove;
        });
    },

    /**
     * Updates or inserts the given header.
     *
     * @param header
     */
    upsertHeader: function (header) {
        if (!(header && header.key)) { return; }  // if no valid header is provided, do nothing

        var existing = this.headers.find({ key: header.key });

        if (!existing) {
            return this.headers.add(header);
        }

        existing.value = header.value;
    },

    /**
     * Add query parameters to the request.
     *
     * @todo: Rename this?
     * @param params {Array<QueryParam>|String}
     */
    addQueryParams: function (params) {
        this.url.addQueryParams(params);
    },

    /**
     * Removes parameters passed in params.
     *
     * @param params {String|Array}
     */
    removeQueryParams: function (params) {
        this.url.removeQueryParams(params);
    },

    /**
     * Converts the Request to a plain JavaScript object, which is also how the request is
     * represented in a collection file.
     *
     * @returns {{url: (*|string), method: *, header: (undefined|*), body: *, auth: *, certificate: *}}
     */
    toJSON: function () {
        var body,
            auth,
            proxy,
            certificate,
            url;

        auth = (this.auth && this.auth.type) ? this.auth.toJSON() : undefined;
        proxy = this.proxy ? this.proxy.toJSON() : undefined;
        certificate = this.certificate ? this.certificate.toJSON() : undefined;
        body = this.body ? this.body.toJSON() : undefined;
        url = (this.url.variables && this.url.variables.count()) ? this.url.toJSON() : this.url.toString();
        return {
            // Only expand the URL if it contains Path Variables.
            url: url,
            method: this.method,
            header: this.headers && this.headers.count() ? this.headers.toJSON() : undefined,
            body: body,
            auth: auth,
            certificate: certificate,
            proxy: proxy,
            description: this.description && this.description.toJSON ? this.description.toJSON() : undefined
        };
    },

    /**
     * Creates a clone of this request
     *
     * @returns {Request}
     */
    clone: function () {
        return new Request(this.toJSON());
    },

    /**
     * Creates a copy of this request, with the appropriate auth headers or parameters added.
     *
     * @note This function does not take care of resolving variables.
     * @returns {Request}
     */
    authorize: function () {
        var clonedReq = this.clone();
        return RequestAuth.authorize(clonedReq);
    }
});

_.assign(Request, /** @lends Request */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'Request',

    /**
     * Check whether an object is an instance of {@link ItemGroup}.
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isRequest: function (obj) {
        return Boolean(obj) && ((obj instanceof Request) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', Request._postman_propertyName));
    }
});

module.exports = {
    Request: Request
};
