var _ = require('../util').lodash,
    Property = require('./property').Property,
    SSHAuth = require('./ssh-auth').SSHAuth,

    DEFAULT_SSH_FORWARD_PORT = 22,
    DEFAULT_KEEP_ALIVE_INTERVEL = 0,
    DEFAULT_KEEP_ALIVE_COUNT_MAX = 3,
    DEFAULT_SSH_TIMEOUT = 20000,

    SSHConfig;

_.inherit((

    /**
     * A SSH config definition which represents the configuration for a SSH Tunnel.
     * @constructor
     * @extends {Property}
     * @param {SSHConfig~definition=} [options] - sepcifies object containing info required to establish a ssh tunnel
    */

    SSHConfig = function SSHConfig (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        SSHConfig.super_.call(this, options);

        // Assign defaults before moving further
        _.assign(this, /** @lends SSHConfig */ {

            /**
             * Represents wheater the port should be forwarded on SSH server, if false the traffic through
             * tunnel will be sent to the default ssh port.
             * @type {Boolean}
             */
            enablePortForwarding: false,

            /**
             * Port the traffic will be forwarded to on the SSH server, by default traffic will be sent to
             * the port ssh server is listening on (DEFAULT: 22)
             * @type {Integer}
             */
            forwardPort: DEFAULT_SSH_FORWARD_PORT,

            /**
             * Authentication Information rquired to establish a SSH Connection
             * @type {SSHAuth}
             */
            auth: new SSHAuth(),

            /**
             * How often (in milliseconds) to send SSH-level keepalive packets to the server, set to 0 to disable.
             * Default: 0
             * @type {Integer}
             */
            keepaliveInterval: DEFAULT_KEEP_ALIVE_INTERVEL,

            /**
             * How many consecutive, unanswered SSH-level keepalive packets that can be sent to the server before
             * disconnection
             * Default : 3
             * @type {Integer}
             */
            keepaliveCountMax: DEFAULT_KEEP_ALIVE_COUNT_MAX,

            /**
             * How long (in milliseconds) to wait for the SSH handshake to complete.
             * Default :  20000
             * @type {Integer}
             */
            readyTimeout: DEFAULT_SSH_TIMEOUT
        });

        this.update(options);
    }), Property);

_.assign(SSHConfig.prototype, /** @lends SSHConfig.prototype */ {
    /**
     * Defines whether this property instances requires an id
     * @private
     * @readOnly
     * @type {Boolean}
     */
    _postman_propertyRequiresId: true,

    /**
     * Updates the proerties of SSHConfig object based on the options provided
     * @param {SSHConfig~definition} options
     */

    update: function (options) {
        if (!_.isObject(options)) {
            return;
        }

        var forwardPort = _.get(options, 'forwardPort') >> 0,
            keepaliveInterval = _.get(options, 'keepaliveInterval'),
            keepaliveCountMax = _.get(options, 'keepaliveCountMax'),
            readyTimeout = _.get(options, 'readyTimeout');

        _.isBoolean(options.enablePortForwarding) && (this.enablePortForwarding = options.enablePortForwarding);
        SSHAuth.isSSHAuth(options.auth) && (this.auth.update(options.auth));
        forwardPort && (this.forwardPort = options.forwardPort);
        (keepaliveInterval >> 0 || keepaliveInterval === 0) && (this.keepaliveInterval = options.keepaliveInterval);
        (keepaliveCountMax >> 0 || keepaliveCountMax === 0) && (this.keepaliveCountMax = options.keepaliveCountMax);
        (readyTimeout >> 0 || readyTimeout === 0) && (this.readyTimeout = options.readyTimeout);

    }
});

_.assign(SSHConfig, /** @lends SSHConfig */ {
    /**
     * Defines the name of this property for internal use
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'SSHConfig',

    /**
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isSSHConfig: function (obj) {
        return Boolean(obj) && ((obj instanceof SSHConfig) ||
        _.inSuperChain(obj.constructor, '_postman_propertyName', SSHConfig._postman_propertyName));
    }
});

module.exports = {
    SSHConfig: SSHConfig
};
