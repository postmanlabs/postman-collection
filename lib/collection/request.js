var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,
    Property = require('./property').Property,
    Url = require('./url').Url,
    ProxyConfig = require('./proxy-config').ProxyConfig,
    Certificate = require('./certificate').Certificate,
    HeaderList = require('./header-list').HeaderList,
    RequestBody = require('./request-body').RequestBody,
    RequestAuth = require('./request-auth').RequestAuth,

    Request,
    DEFAULT_REQ_METHOD = 'GET';

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
     * A Postman HTTP request object.
     *
     * @constructor
     * @extends {Property}
     * @param {Request~definition} options
     */
    Request = function PostmanRequest (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        Request.super_.apply(this, arguments);

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
             * @type {HeaderList}
             */
            headers: new HeaderList(this, options && options.header),

            // Although a similar check is being done in the .update call below, this handles falsy options as well.
            /**
             * @type {String}
             * @todo: Clean this up
             */
            // the negated condition is required to keep DEFAULT_REQ_METHOD as a fallback
            method: _.has(options, 'method') && !_.isNil(options.method) ?
                String(options.method).toUpperCase() : DEFAULT_REQ_METHOD
        });

        this.update(options);
    }), Property);

_.assign(Request.prototype, /** @lends Request.prototype */ {

    /**
     * Updates the different properties of the request.
     *
     * @param {Request~definition} options
     */
    update: function (options) {
        // Nothing to do
        if (!options) { return; }

        // The existing url is updated.
        _.has(options, 'url') && this.url.update(options.url);

        // The existing list of headers must be cleared before adding the given headers to it.
        options.header && this.headers.repopulate(options.header);

        // Only update the method if one is provided.
        _.has(options, 'method') && (this.method = _.isNil(options.method) ?
            DEFAULT_REQ_METHOD : String(options.method).toUpperCase());

        // The rest of the properties are not assumed to exist so we merge in the defined ones.
        _.mergeDefined(this, /** @lends Request.prototype */ {
            /**
             * @type {RequestBody|undefined}
             */
            body: _.createDefined(options, 'body', RequestBody),

            // auth is a special case, empty RequestAuth should not be created for falsy values
            // to allow inheritance from parent
            /**
             * @type {RequestAuth}
             */
            auth: options.auth ? new RequestAuth(options.auth) : undefined,

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
     * Sets authentication method for the request
     *
     * @param {?String|RequestAuth~definition} type
     * @param {VariableList~definition=} [options]
     *
     * @note This function was previously (in v2 of SDK) used to clone request and populate headers. Now it is used to
     * only set auth information to request
     *
     * @note that ItemGroup#authorizeUsing depends on this function
     */
    authorizeUsing: function (type, options) {
        if (_.isObject(type) && _.isNil(options)) {
            type = options.type;
            options = _.omit(options, 'type');
        }

        // null = delete request
        if (type === null) {
            _.has(this, 'auth') && (delete this.auth);
            return;
        }

        if (!RequestAuth.isValidType(type)) {
            return;
        }

        // create a new authentication data
        if (!this.auth) {
            this.auth = new RequestAuth(null, this);
        }
        else {
            this.auth.clear(type);
        }

        this.auth.use(type, options);
    },

    /**
     * Returns an object where the key is a header name and value is the header value.
     *
     * @param {Object=} options
     * @param {Boolean} options.ignoreCase When set to "true", will ensure that all the header keys are lower case.
     * @param {Boolean} options.enabled Only get the enabled headers
     *
     * @note If multiple headers are present in the same collection with same name, but different case
     * (E.g "x-forward-port" and "X-Forward-Port", and `options.ignoreCase` is set to true, the result will contain
     * the value of the header which occurs the last.
     */
    getHeaders: function getHeaders (options) {
        !options && (options = {});
        return this.headers.toObject(options.enabled, !options.ignoreCase);
    },

    /**
     * Calls the given callback on each Header object contained within the request.
     *
     * @param {Function} callback
     */
    forEachHeader: function forEachHeader (callback) {
        this.headers.all().forEach(function (header) {
            return callback(header, this);
        }, this);
    },

    /**
     * Adds a header to the PropertyList of headers.
     *
     * @param {Header| {key: String, value: String}} header Can be a {Header} object, or a raw header object.
     */
    addHeader: function (header) {
        this.headers.add(header);
    },

    /**
     * Removes a header from the request.
     *
     * @param {String|Header} toRemove A header object to remove, or a string containing the header key.
     * @param {Object} options
     * @param {Boolean} options.ignoreCase If set to true, ignores case while removing the header.
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
     * @param {Object} header
     */
    upsertHeader: function (header) {
        if (!(header && header.key)) { return; } // if no valid header is provided, do nothing

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
     * @param {Array<QueryParam>|String} params
     */
    addQueryParams: function (params) {
        this.url.addQueryParams(params);
    },

    /**
     * Removes parameters passed in params.
     *
     * @param {String|Array} params
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
        var obj = PropertyBase.toJSON(this);

        // remove header array if blank
        if (_.isArray(obj.header) && !obj.header.length) {
            delete obj.header;
        }

        return obj;
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
     * @deprecated discontinued in v3.x
     * @note This function does not take care of resolving variables.
     * @returns {Request}
     */
    authorize: function () {
        throw new Error('collection request.authorize() has been discontinued');
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
