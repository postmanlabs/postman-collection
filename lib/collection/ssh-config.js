var _ = require('../util').lodash,
    Property = require('./property').Property,
    SshAuth = require('./ssh-auth').SshAuth,

    DEFAULT_SSH_FORWARD_PORT = 22,
    DEFAULT_KEEP_ALIVE_INTERVAL = 0,
    DEFAULT_KEEP_ALIVE_COUNT_MAX = 3,
    DEFAULT_SSH_TIMEOUT = 20000,

    SshConfig;

_.inherit((

    /**
     * A SSH config definition which represents the configuration for a SSH Tunnel.
     *
     * @constructor
     * @extends {Property}
     * @param {SshConfig~definition=} [options] - sepcifies object containing info required to establish a ssh tunnel
    */
    SshConfig = function SshConfig (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        SshConfig.super_.call(this, options);

        // Assign defaults before moving further
        _.assign(this, /** @lends SshConfig */ {

            /**
             * Represents wheater the port should be forwarded on SSH server, if false the traffic through
             * tunnel will be sent to the default ssh port.
             * @type {Boolean}
             * @default false
             */
            enablePortForwarding: false,

            /**
             * Port the traffic will be forwarded to on the SSH server, by default traffic will be sent to
             * the port ssh server is listening on (DEFAULT: 22)
             * @type {Integer}
             * @default 22
             */
            forwardPort: DEFAULT_SSH_FORWARD_PORT,

            /**
             * Authentication Information rquired to establish a SSH Connection
             * @type {SshAuth}
             */
            auth: new SshAuth(),

            /**
             * How often (in milliseconds) to send SSH-level keepalive packets to the server, set to 0 to disable.
             * Default: 0
             * @type {Integer}
             * @default 0
             */
            keepAliveInterval: DEFAULT_KEEP_ALIVE_INTERVAL,

            /**
             * How many consecutive, unanswered SSH-level keepalive packets that can be sent to the server before
             * disconnection
             * Default : 3
             * @type {Integer}
             * @default 3
             */
            keepAliveCountMax: DEFAULT_KEEP_ALIVE_COUNT_MAX,

            /**
             * How long (in milliseconds) to wait for the SSH handshake to complete.
             * @type {Integer}
             * @default 20000
             */
            readyTimeOut: DEFAULT_SSH_TIMEOUT
        });

        this.update(options);
    }), Property);

_.assign(SshConfig.prototype, /** @lends SshConfig.prototype */ {
    /**
     * Defines whether this property instances requires an id
     * @private
     * @readOnly
     * @type {Boolean}
     */
    _postman_propertyRequiresId: true,

    /**
     * Updates the proerties of SshConfig object based on the options provided
     * @param {SshConfig~definition} options
     * @param {Boolean} options.enablePortForwarding
     * @param {Integer} options.forwardPort
     * @param {SshAuth} options.auth
     * @param {Integer} options.keepAliveInterval
     * @param {Integer} options.keepAliveCountMax
     * @param {Integer} options.readyTimeOut
     */

    update: function (options) {
        if (!_.isObject(options)) {
            return;
        }

        var forwardPort = options.forwardPort,
            keepAliveInterval = options.keepAliveInterval,
            keepAliveCountMax = options.keepAliveCountMax,
            readyTimeOut = options.readyTimeOut,
            auth = options.auth;

        this.auth.update(SshAuth.isSshAuth(auth) ? auth : new SshAuth(auth));

        _.isBoolean(options.enablePortForwarding) && (this.enablePortForwarding = options.enablePortForwarding);
        _.isInteger(forwardPort) && (forwardPort > 0) && (this.forwardPort = options.forwardPort);
        _.isNumber(keepAliveInterval) && (this.keepAliveInterval = options.keepAliveInterval);
        _.isNumber(keepAliveCountMax) && (this.keepAliveCountMax = options.keepAliveCountMax);
        _.isNumber(readyTimeOut) && (this.readyTimeOut = options.readyTimeOut);
    }
});

_.assign(SshConfig, /** @lends SshConfig */ {
    /**
     * Defines the name of this property for internal use
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'SshConfig',

    /**
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isSshConfig: function (obj) {
        return Boolean(obj) && ((obj instanceof SshConfig) ||
        _.inSuperChain(obj.constructor, '_postman_propertyName', SshConfig._postman_propertyName));
    }
});

module.exports = {
    SshConfig: SshConfig
};
