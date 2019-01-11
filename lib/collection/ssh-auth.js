var _ = require('../util').lodash,
    Property = require('./property').Property,
    E = '',
    DEFAULT_SSH_PORT = 22,

    SshAuth;

/**
 * A SSH Auth definition which represents the auth configuration requried to establish a ssh connection
 * @constructor
 * @extends {Property}
 * @param {SshAuth~definition=} [options] - specifies object containing auth information required to
 * establish a ssh connection
 */

_.inherit((
    SshAuth = function SshAuth (options) {
        SshAuth.super_.call(this, options);

        _.assign(this, /** @lends SshAuth */ {
            /**
             * SSH server ip
             * @type {String}
             */
            host: undefined,

            /**
             * Port the ssh server is listening on
             * @type {Integer}
             */
            port: DEFAULT_SSH_PORT,

            /**
             * Username of the user one want to login as
             * @type {String}
             */
            username: E,

            /**
             * Password of the user one want to login as
             * @type {String}
             */
            userPassword: E,

            /**
             * Private key for the user
             */
            privateKeyPath: E,

            /**
             * Passphrase for the private key if encrypted
             * @type {String}
             */
            passPhrase: E
        });

        this.update(options);
    }
), Property);

_.assign(SshAuth.prototype, /** @lends SshAuth.prototype */ {
    /**
     * Defines whether this property instances requires an id
     * @private
     * @readOnly
     * @type {Boolean}
     */

    _postman_propertyRequiresId: true,

    /**
     * Updates the properties of the proxy object based on the options provided.
     *
     * @param {ProxyConfig~definition} options The proxy object structure.
     */

    update: function (authOptions) {

        if (!_.isObject(authOptions)) {
            return;
        }

        var port = _.get(authOptions, 'port') >> 0;

        port && (this.port = authOptions.port);
        _.isString(authOptions.host) && (this.host = authOptions.host);
        _.isString(authOptions.username) && (this.username = authOptions.username);
        _.isString(authOptions.userPassword) && (this.userPassword = authOptions.userPassword);
        _.isString(authOptions.privateKeyPath) && (this.privateKeyPath = authOptions.privateKeyPath);
        _.isString(authOptions.passPhrase) && (this.passPhrase = authOptions.passPhrase);
    }
});

_.assign(SshAuth, /** @lends SshAuth */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'SshAuth',

    /**
     * Check whether an object is an instance of PostmanItem.
     *
     * @param {*} obj
     * @returns {Boolean}
     */

    isSshAuth: function (obj) {
        return Boolean(obj) && ((obj instanceof SshAuth) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', SshAuth._postman_propertyName));
    }
});

module.exports = {
    SshAuth: SshAuth
};