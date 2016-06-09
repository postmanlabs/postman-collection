var _ = require('../util').lodash,
    Property = require('./property').Property,
    PropertyList = require('./property-list').PropertyList,
    Url = require('./url').Url,
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

        // in case definition object is missing, there is no point moving forward
        if (!options) { return; }

        // if the definition is a string, it implies that this is a get of URL
        (typeof options === 'string') && (options = {
            url: options
        });

        _.merge(this, /** @lends Request.prototype */ {
            /**
             * @type {Url}
             */
            url: _.createDefined(options, 'url', Url),
            /**
             * @type {String}
             */
            method: (options.method || 'GET').toUpperCase(),
            /**
             * @type {PropertyList<Header>}
             */
            headers: new PropertyList(Header, this, options.header),
            /**
             * @type {RequestBody|undefined}
             */
            body: _.createDefined(options, 'body', RequestBody),
            /**
             * @type {RequestAuth}
             */
            auth: _.createDefined(options, 'auth', RequestAuth)
        });
    }), Property);

_.extend(Request.prototype, /** @lends Request.prototype */ {

    /**
     * Returns an object where the key is a header name and value is the header value.
     *
     * @param options
     * @param options.ignoreCase {Boolean} When set to "true", will ensure that all the header keys are lower case.
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
     * @returns {{url: (*|string), method: *, header: (undefined|*), body: *, auth: *}}
     */
    toJSON: function () {
        var body,
            auth,
            url;

        auth = (this.auth && this.auth.type) ? this.auth.toJSON() : undefined;
        body = this.body ? this.body.toJSON() : undefined;
        url = (this.url.variables && this.url.variables.count()) ? this.url.toJSON() : this.url.toString();
        return {
            // Only expand the URL if it contains Path Variables.
            url: url,
            method: this.method,
            header: this.headers && this.headers.count() ? this.headers.toJSON() : undefined,
            body: body,
            auth: auth,
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

_.extend(Request, /** @lends Request */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'Request'
});

module.exports = {
    Request: Request
};
