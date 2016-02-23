var _ = require('../util').lodash,
    Property = require('./property').Property,

    ERR_MSG_HANDLER_PARAM = ' authentication handler definition or handler name missing.',
    ERR_MSG_HANDLER_UPDATE = ' authentication handler definition must have `update` function.',

    /**
     * Enum for all the Auth types
     * @readonly
     * @enum {string}
     * @memberOf RequestAuth
     */
    authenticationTypes = {
        /**
         * Handler used for the AWS Signature v4 authentication.
         */
        awsv4: require('./request-auth/awsv4'),
        /**
         * HTTP Basic Authentication Handler.
         */
        basic: require('./request-auth/basic'),
        /**
         * HTTP Digest Authentication Handler
         */
        digest: require('./request-auth/digest'),
        /**
         * Hawk Authentication Handler
         */
        hawk: require('./request-auth/hawk'),
        /**
         * Handler used in case Authentication set in an {@link ItemGroup} needs to be overridden to
         * a no-op.
         */
        noauth: require('./request-auth/noauth'),
        /**
         * A handler for OAuth 1.0a protocol.
         */
        oauth1: require('./request-auth/oauth1'),
        /**
         * OAuth2 Handler stores information such as callback URL, etc. However, the token added to the request
         * is not stored here, since it is a part of headers or URL parameters.
         */
        oauth2: require('./request-auth/oauth2')
    },

    RequestAuth;

_.inherit((
    /**
     * A Postman Auth definition that comprehensively represents different types of auth mechanisms available.
     *
     * @constructor
     * @extends {Property}
     *
     * @param {Object} options Pass the initial definition of the Auth.
     */
    RequestAuth = function PostmanRequestAuth (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        RequestAuth.super_.call(this, options);
        if (!options) { return; }  // in case definition object is missing there is no point moving forward

        _.extend(this, /** @lends RequestAuth.prototype */ {
            /**
             * @type {authTypes}
             */
            type: undefined
        });

        // load all possible auth parameters from options
        _.each(_.omit(options, 'type'), this.update.bind(this));
        this.use(options.type);
    }), Property);

_.extend(RequestAuth.prototype, /** @lends RequestAuth.prototype */ {
    /**
     * Update the parameters of a specific authentication type. If none is provided then it uses the one marked as to be
     * used.
     *
     * @param {Object} options
     * @param {AuthTypes=} [type]
     */
    update: function (options, type) {
        type = (type ? type.toString().toLowerCase() : this.type);
        // procure the handler of specific type and then call it's update method with the parameter definition as it's
        // scope.
        // @todo raise error on invalid type?
        RequestAuth.types[type] && RequestAuth.types[type].update.call((this[type] || (this[type] = {})), options);
    },
    /**
     * Sets the authentication type to be used by this item.
     *
     * @param {String} type
     */
    use: function (type) {
        // @todo: error/warning on invalid auth type?
        if (type === 'type') { // no auth name can be "type", else will have namespace collision with type selector
            return;
        }

        this.type = type; // set the type
        !_.isObject(this[type]) && (this[type] = {});
    },

    /**
     * Returns a plain javascript object that represents this auth.
     *
     * @returns {Object}
     */
    toJSON: function () {
        var json = {};

        _.forOwn(this, function (value, key) {
            json[key] = _.isObject(value) ? _.clone(value) : value;
        });
        return json;
    }
});

_.extend(RequestAuth, /** @lends RequestAuth */ {
    types: {},

    addType: function (handler, name) {
        // validate definition
        if (!_.isObject(handler) || !(name || handler.name)) {
            throw new Error(name + ' ' + ERR_MSG_HANDLER_PARAM);
        }
        if (!_.isFunction(handler.update)) {
            throw new Error(name + ERR_MSG_HANDLER_UPDATE);
        }

        // Create intermediate function to instantiate a new handler with the definition in prototype chain
        var AuthHandler = function AuthHandler () { },
            definition = _.clone(handler);

        // the string equivalent of the handler
        definition.toString = function () {
            return name || handler.name;
        };

        _.inherit(AuthHandler, definition); // inherit it from handler definition
        return (this.types[name] = new AuthHandler(handler, name));
    },

    /**
     * Authorize a Request, by adding required parameters such as headers, query-params, etc.
     *
     * @param request
     */
    authorize: function (request) {
        if (!request.auth || !request.auth.type) { return request; }

        var type = request.auth.type,
            handler = this.types[type];

        if (!handler || !handler.authorize) { // If no auth type is associated with a request, get outta here.
            // todo: should we throw an error?
            return request;
        }
        return handler.authorize.call(handler, request);
    }
});

// validate each authentication type and add them to auth
_.each(authenticationTypes, RequestAuth.addType.bind(RequestAuth));

module.exports = {
    RequestAuth: RequestAuth
};
