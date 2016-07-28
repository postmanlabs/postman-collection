var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,
    QueryParam = require('./query-param').QueryParam,
    PropertyList = require('./property-list').PropertyList,
    VariableList = require('./variable-list').VariableList,

    Url;

_.inherit((
    /**
     * Defines a URL
     * @constructor
     * @extends {PropertyBase}
     *
     * @param {Object|String} options
     */
    Url = function PostmanUrl (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        Url.super_.apply(this, arguments);

        // create the url properties
        this.update(options);
    }), PropertyBase);

_.extend(Url.prototype, /** @lends Url.prototype */ {
    /**
     * Set a URL
     * @draft
     *
     * @param {String|Object} url
     */
    update: function (url) {
        !url && (url = '');
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
            if (typeof query === 'string') {
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

        // expand string path name
        _.isString(path) && (path = path.split('/'));
        // expand host string
        _.isString(host) && (host = host.split('.'));

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
            query: query ?
                    new PropertyList(QueryParam, this, query) : new PropertyList(QueryParam, this, []),
            /**
             * @type {VariableList}
             */
            variables: new VariableList(this, variable || [])
        });
    },

    /**
     * Add query parameters to the URL.
     *
     * @param params {Object|String} Key value pairs to add to the URL.
     */
    addQueryParams: function (params) {
        params = _.isString(params) ? QueryParam.parse(params) : params;
        this.query.populate(params);
    },

    /**
     * Removes query parameters from the URL.
     *
     * @param params {Array<QueryParam>|Array<String>|String} Params should be an array of strings, or an array of
     * actual query parameters, or a string containing the parameter key.
     *
     * @note Input should *not* be a query string.
     */
    removeQueryParams: function (params) {
        params = _.isArray(params) ? _.map(params, function (param) {
            return param.key ? param.key : param;
        }) : [params];
        this.query.remove(function (param) {
            return _.contains(params, param.key);
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
     * @returns {string}
     */
    toString: function () {
        var rawUrl = '';

        if (this.protocol) {
            rawUrl = rawUrl + (_.endsWith(this.protocol, '://') ? this.protocol : this.protocol + '://');
        }

        if (this.auth && this.auth.user) { // If the user is not specified, ignore the password.
            rawUrl = rawUrl + ((this.auth.password) ?
                this.auth.user + ':' + this.auth.password : this.auth.user) + '@'; // ==> username:password@
        }

        if (this.host) {
            rawUrl = rawUrl + this.getHost();
        }

        if (this.port) {
            rawUrl = rawUrl + ':' + this.port.toString();
        }

        if (this.path) {
            rawUrl = rawUrl + this.getPath();
        }

        if (this.query && this.query.count()) {
            rawUrl = rawUrl + '?' + this.getQueryString();
        }

        if (this.hash) {
            rawUrl = rawUrl + '#' + this.hash;
        }

        return rawUrl;
    },

    /**
     * Returns the request path, with a leading '/'.
     *
     * @param options {Object=}
     * @param options.unresolved {Object} If set to true, path variables will not be processed
     *
     * @returns {string}
     */
    getPath: function (options) {
        var self = this,
            segmentArray = (options && options.unresolved) ? this.path : _.map(this.path, function (segment) {
                var value;
                if (_.startsWith(segment, ':')) {
                    value = self.variables.one(segment.slice(1));
                }
                return value ? value : segment;
            }),
            path = segmentArray.join('/');
        return _.startsWith(path, '/') ? path : '/' + path;
    },

    /**
     * Returns the stringified query string for this URL.
     *
     * @param {Object=} options
     * @param {Boolean} options.encode - Enables URL encoding when processing the query string.
     * @returns {String}
     */
    getQueryString: function (options) {
        if (this.query.count()) {
            return PropertyList.isPropertyList(this.query) ?
                QueryParam.unparse(this.query.all(), options) : this.query.toString();
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
        if (this.query.count()) {
            path = path + '?' + this.getQueryString();
        }
        return path;
    },

    getHost: function () {
        return _.isArray(this.host) ? this.host.join('.') : this.host.toString();
    },

    /**
     * Returns a OAuth1.0-a compatible representation of the request URL, also called "Base URL".
     * For details, http://oauth.net/core/1.0a/#anchor13
     *
     * todo: should we ignore the auth parameters of the URL or not? (the standard does not mention them)
     * we currently are.
     */
    getOAuth1BaseUrl: function () {
        var protocol = this.protocol || 'http',
            port = this.port ? this.port.toString() : undefined,
            host = ((port === '80' ||
                     port === '443' ||
                     port === undefined) && this.host.join('.')) || this.host.join('.') + ':' + port,
            path = this.getPath();

        protocol = (_.endsWith(protocol, '://') ? protocol : protocol + '://');
        return protocol.toLowerCase() + host.toLowerCase() + path.toLowerCase();
    }
});

_.extend(Url, /** @lends Url */ {

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
     * @param url {String}
     * @returns {Object}
     */
    parse: function (url) {
        url = _.trim(url);
        var p = {
            raw: url
        };

        // extract the protocol
        p.protocol = _.get(url.match(/^([^:]+):\/\/([^\?#\/:]+|$)/), '[1]');
        _.isString(p.protocol) && (url = url.substr(p.protocol.length + 3)); // remove that damn protocol from url

        // extract the host
        p.host = _.get(url.match(/^([^\?#\/]+)/), '[1]');

        // if host exists there are a lot you can extract from it
        if (_.isString(p.host)) {
            url = url.substr(p.host.length); // remove host from url

            if (p.auth = _.get(p.host.match(/^([^@]+)@/), '[1]')) {
                p.host = p.host.substr(p.auth.length + 1); // remove auth from host
                p.auth = p.auth.split(':');
                p.auth = {
                    user: p.auth[0],
                    password: p.auth[1]
                };
            }

            // extract the port from the host
            p.port = _.get(p.host.match(/:([^:]*)$/), '[1]');
            p.port && (p.host = p.host.substring(0, p.host.length - p.port.length - 1)); // remove port from url

            p.host = _.trim(p.host, '.').split('.'); // split host by subdomains
        }

        // extract the path
        p.path = _.get(url.match(/.*?(?=\?|#|$)/), '[0]');
        if (_.isString(p.path)) {
            url = url.substr(p.path.length);
            p.path && (p.path = p.path.replace(/^\/((.+))$/, '$1')); // remove leading slash for valid path
            // if path is blank string, we set it to undefined, if '/' then single blank string array
            p.path = !p.path ? undefined : (p.path === '/' ? [''] : p.path.split('/'));
        }

        // extract the query string
        p.query = _.get(url.match(/^\?([^#]+)/), '[1]');
        _.isString(p.query) && ((url = url.substr(p.query.length + 1)), (p.query = QueryParam.parse(p.query)));

        // extract the hash
        p.hash = _.get(url.match(/#(.+)$/), '[1]');
        return p;
    }
});

module.exports = {
    Url: Url
};
