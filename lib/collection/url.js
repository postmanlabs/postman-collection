var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,
    QueryParam = require('./query-param').QueryParam,
    PropertyList = require('./property-list').PropertyList,
    VariableList = require('./variable-list').VariableList,

    E = '',
    PROTOCOL_HTTPS = 'https',
    PROTOCOL_HTTP = 'http',
    HTTPS_PORT = '443',
    HTTP_PORT = '80',
    PATH_SEPARATOR = '/',
    PATH_VARIABLE_IDENTIFIER = ':',
    PORT_SEPARATOR = ':',
    DOMAIN_SEPARATOR = '.',
    PROTOCOL_SEPARATOR = '://',
    AUTH_SEPARATOR = ':',
    AUTH_CREDENTIALS_SEPARATOR = '@',
    QUERY_SEPARATOR = '?',
    SEARCH_SEPARATOR = '#',

    DEFAULT_PROTOCOL = PROTOCOL_HTTP + PROTOCOL_SEPARATOR,

    GET_0 = '[0]',
    GET_1 = '[1]',
    MATCH_1 = '$1',

    regexes = {
        // @todo: According to the IETF RFC #3986, '.' is a valid part of the protocol. Figure out a way to support it
        extractProtocol: /^([^:?]+):\/\/([^?#/:]*|$)/,
        extractHost: /^([^?#/]+)/,
        extractHostAuth: /^([^@]+)@/,
        extractPort: /:([^:]*)$/,
        extractPath: /.*?(?=\?|#|$)/,
        trimPath: /^\/((.+))$/,
        extractQuery: /^\?([^#]+)/,
        extractSearch: /#(.+)$/,
        splitDomain: /\.(?![^{]*\}{2})/g
    },

    Url;

_.inherit((

    /**
     * Defines a URL.
     *
     * @constructor
     * @extends {PropertyBase}
     * @param {Object|String} options
     */
    Url = function PostmanUrl (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        Url.super_.apply(this, arguments);

        // create the url properties
        this.update(options);
    }), PropertyBase);

_.assign(Url.prototype, /** @lends Url.prototype */ {
    /**
     * Set a URL.
     *
     * @draft
     * @param {String|Object} url
     */
    update: function (url) {
        !url && (url = E);
        var parsedUrl = _.isString(url) ? Url.parse(url) : url,
            auth = parsedUrl.auth,
            protocol = parsedUrl.protocol,
            port = parsedUrl.port,
            path = parsedUrl.path,
            hash = parsedUrl.hash,
            host = parsedUrl.host,
            query = parsedUrl.query,
            variable = parsedUrl.variable;

        // convert object based query string to array
        // @todo: create a key value parser
        if (query) {
            if (_.isString(query)) {
                query = QueryParam.parse(query);
            }

            if (!_.isArray(query) && _.keys(query).length) {
                query = _.map(_.keys(query), function (key) {
                    return {
                        key: key,
                        value: query[key]
                    };
                });
            }
        }

        // backward compatibility with path variables being storing thins with `id`
        if (_.isArray(variable)) {
            variable = _.map(variable, function (v) {
                _.isObject(v) && (v.key = v.key || v.id); // @todo Remove once path variables are deprecated
                return v;
            });
        }

        // expand string path name
        if (_.isString(path)) {
            path && (path = path.replace(regexes.trimPath, MATCH_1)); // remove leading slash for valid path
            // if path is blank string, we set it to undefined, if '/' then single blank string array
            path = path ? (path === PATH_SEPARATOR ? [E] : path.split(PATH_SEPARATOR)) : undefined;
        }

        // expand host string
        _.isString(host) && (host = host.split(regexes.splitDomain));

        _.assign(this, /** @lends Url.prototype */ {
            /**
             * @type {String}
             */
            auth: auth,

            /**
             * @type {String}
             */
            protocol: protocol,

            /**
             * @type {String}
             */
            port: port || undefined,

            /**
             * @type {Array<String>}
             */
            path: path,

            /**
             * @type {String}
             */
            hash: hash || undefined,

            /**
             * @type {Array<String>}
             */
            host: host,

            /**
             * @type {PropertyList<QueryParam>}
             */
            query: new PropertyList(QueryParam, this, query || []),

            /**
             * @type {VariableList}
             */
            variables: new VariableList(this, variable || [])
        });
    },

    /**
     * Add query parameters to the URL.
     *
     * @param {Object|String} params Key value pairs to add to the URL.
     */
    addQueryParams: function (params) {
        params = _.isString(params) ? QueryParam.parse(params) : params;
        this.query.populate(params);
    },

    /**
     * Removes query parameters from the URL.
     *
     * @param {Array<QueryParam>|Array<String>|String} params Params should be an array of strings, or an array of
     * actual query parameters, or a string containing the parameter key.
     * @note Input should *not* be a query string.
     */
    removeQueryParams: function (params) {
        params = _.isArray(params) ? _.map(params, function (param) {
            return param.key ? param.key : param;
        }) : [params];
        this.query.remove(function (param) {
            return _.includes(params, param.key);
        });
    },

    /**
     * Unparses a {PostmanUrl} into a string.
     *
     * @deprecated Please use {@link Url#toString} instead of this
     * @returns {string}
     */
    getRaw: function () {
        return this.toString();
    },

    /**
     * Unparses a {PostmanUrl} into a string.
     *
     * @param {Boolean=} forceProtocol - Forces the URL to have a protocol
     * @returns {string}
     */
    toString: function (forceProtocol) {
        var rawUrl = E,
            protocol = this.protocol;

        forceProtocol && !protocol && (protocol = DEFAULT_PROTOCOL);

        if (protocol) {
            rawUrl += (_.endsWith(protocol, PROTOCOL_SEPARATOR) ? protocol : protocol + PROTOCOL_SEPARATOR);
        }

        if (this.auth && this.auth.user) { // If the user is not specified, ignore the password.
            rawUrl = rawUrl + ((this.auth.password) ?
                // ==> username:password@
                this.auth.user + AUTH_SEPARATOR + this.auth.password : this.auth.user) + AUTH_CREDENTIALS_SEPARATOR;
        }

        if (this.host) {
            rawUrl += this.getHost();
        }

        if (this.port) {
            rawUrl += PORT_SEPARATOR + this.port.toString();
        }

        if (this.path) {
            rawUrl += this.getPath();
        }

        if (this.query && this.query.count()) {
            rawUrl += QUERY_SEPARATOR + this.getQueryString({ ignoreDisabled: true });
        }

        if (this.hash) {
            rawUrl += SEARCH_SEPARATOR + this.hash;
        }

        return rawUrl;
    },

    /**
     * Returns the request path, with a leading '/'.
     *
     * @param {Object=} options
     * @param {Object} options.unresolved If set to true, path variables will not be processed
     * @returns {string}
     */
    getPath: function (options) {
        var self = this,
            // eslint-disable-next-line max-len
            segmentArray = (options && options.unresolved) ? this.path : _.transform(this.path, function (res, segment) {
                var variable;
                // check if the segment has path variable prefix followed by the variable name.
                if (_.startsWith(segment, PATH_VARIABLE_IDENTIFIER) && segment !== PATH_VARIABLE_IDENTIFIER) {
                    variable = self.variables.one(segment.slice(1)); // remove path variable prefix.
                }

                variable = variable && variable.valueOf && variable.valueOf();
                res.push(_.isString(variable) ? variable : segment);
            }, []),
            path = segmentArray.join(PATH_SEPARATOR);
        return PATH_SEPARATOR + path; // add leading slash
    },

    /**
     * Returns the stringified query string for this URL.
     *
     * @param {?Object} [options={}]
     * @param {?Boolean} options.encode - Enables URL encoding when processing the query string.
     * @param {?Boolean} options.ignoreDisabled - Prevents disabled query parameters from showing up in the unparsed
     * result.
     * @returns {String}
     */
    getQueryString: function (options) {
        if (this.query.count()) {
            return QueryParam.unparse(this.query.all(), options);
        }
        return '';
    },

    /**
     * Returns the complete path, including the query string.
     *
     * @example /something/postman?hi=notbye
     *
     * @returns {*|string}
     */
    getPathWithQuery: function () {
        var path = this.getPath();
        this.query.count() && (path += (QUERY_SEPARATOR + this.getQueryString()));
        return path;
    },

    /**
     * Returns the host only
     *
     * @returns {string}
     */
    getHost: function () {
        if (!this.host) {
            return '';
        }
        return _.isArray(this.host) ? this.host.join(DOMAIN_SEPARATOR) : this.host.toString();
    },

    /**
     * Returns the host *and* port (if any), separated by a ":"
     *
     * @param {Object} options
     * @param {Boolean} options.forcePort
     * @returns {String}
     */
    getRemote: function (options) {
        var forcePort = options && options.forcePort,
            host = this.getHost(),
            port = this.port && this.port.toString();

        if (forcePort && !port) {
            port = this.protocol && (this.protocol === PROTOCOL_HTTPS) ? HTTPS_PORT : HTTP_PORT;
        }

        return port ? (host + PORT_SEPARATOR + port) : host;
    },

    /**
     * Returns a OAuth1.0-a compatible representation of the request URL, also called "Base URL".
     * For details, http://oauth.net/core/1.0a/#anchor13
     *
     * todo: should we ignore the auth parameters of the URL or not? (the standard does not mention them)
     * we currently are.
     */
    getOAuth1BaseUrl: function () {
        var protocol = this.protocol || PROTOCOL_HTTP,
            port = this.port ? this.port.toString() : undefined,
            host = ((port === HTTP_PORT ||
                port === HTTPS_PORT ||
                port === undefined) && this.host.join(DOMAIN_SEPARATOR)) || (this.host.join(DOMAIN_SEPARATOR) +
                    PORT_SEPARATOR + port),
            path = this.getPath();

        protocol = (_.endsWith(protocol, PROTOCOL_SEPARATOR) ? protocol : protocol + PROTOCOL_SEPARATOR);
        return protocol.toLowerCase() + host.toLowerCase() + path;
    }
});

_.assign(Url, /** @lends Url */ {

    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'Url',

    /**
     * Parses a string to a PostmanUrl, decomposing the URL into it's constitutent parts, such as
     * path, host, port, etc.
     *
     * @param {String} url
     * @returns {Object}
     */
    parse: function (url) {
        url = _.trim(url);
        var pathVariables,
            p = {
                raw: url
            };

        // extract the protocol
        p.protocol = _.get(url.match(regexes.extractProtocol), GET_1);
        _.isString(p.protocol) && (url = url.substr(p.protocol.length + 3)); // remove that damn protocol from url

        // extract the host
        p.host = _.get(url.match(regexes.extractHost), GET_1);

        // if host exists there are a lot you can extract from it
        if (_.isString(p.host)) {
            url = url.substr(p.host.length); // remove host from url

            if ((p.auth = _.get(p.host.match(regexes.extractHostAuth), GET_1))) {
                p.host = p.host.substr(p.auth.length + 1); // remove auth from host
                p.auth = p.auth.split(AUTH_SEPARATOR);
                p.auth = {
                    user: p.auth[0],
                    password: p.auth[1]
                };
            }

            // extract the port from the host
            p.port = _.get(p.host.match(regexes.extractPort), GET_1);
            p.port && (p.host = p.host.substring(0, p.host.length - p.port.length - 1)); // remove port from url

            p.host = _.trim(p.host, DOMAIN_SEPARATOR).split(regexes.splitDomain); // split host by subdomains
        }

        // extract the path
        p.path = _.get(url.match(regexes.extractPath), GET_0);
        if (_.isString(p.path)) {
            url = url.substr(p.path.length);
            p.path && (p.path = p.path.replace(regexes.trimPath, MATCH_1)); // remove leading slash for valid path
            // if path is blank string, we set it to undefined, if '/' then single blank string array
            p.path = p.path ? (p.path === PATH_SEPARATOR ? [E] : p.path.split(PATH_SEPARATOR)) : undefined;
        }

        // extract the query string
        p.query = _.get(url.match(regexes.extractQuery), GET_1);
        _.isString(p.query) && ((url = url.substr(p.query.length + 1)), (p.query = QueryParam.parse(p.query)));

        // extract the hash
        p.hash = _.get(url.match(regexes.extractSearch), GET_1);

        // extract path variables
        pathVariables = _.transform(p.path, function (res, segment) {
            // check if the segment has path variable prefix followed by the variable name.
            if (_.startsWith(segment, PATH_VARIABLE_IDENTIFIER) && segment !== PATH_VARIABLE_IDENTIFIER) {
                res.push({ key: segment.slice(1) }); // remove path variable prefix.
            }
        }, []);
        p.variable = pathVariables.length ? pathVariables : undefined;

        return p;
    },

    /**
     * Checks whether an object is a Url
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isUrl: function (obj) {
        return Boolean(obj) && ((obj instanceof Url) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', Url._postman_propertyName));
    }
});

module.exports = {
    Url: Url
};
