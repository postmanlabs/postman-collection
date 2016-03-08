var _ = require('../util').lodash,
    Property = require('./property').Property,
    PropertyList = require('./property-list').PropertyList,
    Url = require('./url').Url,
    Header = require('./header').Header,
    RequestBody = require('./request-body').RequestBody,
    RequestAuth = require('./request-auth').RequestAuth,

    Request;

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
             * @type {Array<Header>}
             */
            headers: options.header ? new PropertyList(Header, this, options.header) : undefined,
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
     * @param header {PostmanHeader| {key: String, value: String}} Can be a {PostmanHeader} object,
     *                      or a raw header object.
     */
    addHeader: function (header) {
        this.headers.add(header);
    },

    /**
     * Removes a header from the request.
     *
     * @param toRemove {String|PostmanHeader} A header object to remove, or a string containing the header key.
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
     * //TODO: Rename this? @shamasis
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
     * Creates a clone of this request
     *
     * @returns {Request}
     */
    clone: function () {
        return new Request(this.toJSON());
    },

    authorize: function () {
        var clonedReq = this.clone();
        return RequestAuth.authorize(clonedReq);
    }
});

module.exports = {
    Request: Request
};
