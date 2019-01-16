var _ = require('../util').lodash,
    Property = require('./property').Property,
    E = '',
    DEFAULT_SSH_PORT = 22,

    SshAuth;

/**
 * The following is the object structure accepted as constructor parameter while calling `new SshAuth(...)`. It is
 * also the structure exported when {@link Property#toJSON}.
 * @typedef SshAuth~definition
 *
 * @property {String=} host
 * @property {Number=} port
 * @property {String=} username
 * @property {String=} password
 * @property {String=} privateKeyPath
 * @property {String=} passPhrase
 *
 * @example <caption>JSON definition of an example SshAuth object</caption>
 * {
 *       "host": "54.111.103.121",
 *       "port": "22",
 *       "username": "someuser",
 *       "password": "somepassword",
 *       "privateKeyPath": "/path/to/key/file",
 *       "passPhrase": "somepassphrase"
 * }
 */
_.inherit((

    /**
     * A SSH Auth definition which represents the auth configuration requried to establish a ssh connection
     *
     * @constructor
     * @extends {Property}
     * @param {SshAuth~definition=} [definition]
     *
     * @example <caption>Create a new SshAuth</caption>
     * var SshAuth = require('postman-collection').SshAuth,
     *     mySshAuth = new SshAuth({
     *          host: "54.111.103.121",
     *          port: "22"
     *          username: "someuser",
     *          password: "somepassword",
     *          privateKeyPath: "/path/to/key/file",
     *          passPhrase: "somepassphrase"
     *      });
     */
    SshAuth = function SshAuth (definition) {
        SshAuth.super_.call(this, definition);

        _.assign(this, /** @lends SshAuth */ {
            /**
             * SSH server ip
             * @type {String}
             */
            host: undefined,

            /**
             * Port the ssh server is listening on
             * @type {Number}
             */
            port: DEFAULT_SSH_PORT,

            /**
             * Username of the user one wants to login as
             * @type {String}
             */
            username: E,

            /**
             * Password of the user one want to login as
             * @type {String}
             */
            password: E,

            /**
             * Private key for the user
             */
            privateKeyPath: E,

            /**
             * Passphrase for the private key (if key is password protected)
             * @type {String}
             */
            passPhrase: E
        });

        this.update(definition);
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
     * Updates the properties of the SSHAuth object based on the options provided.
     *
     * @param {SSHAuth~definition} options The SSHAuth object structure.
     * @param {String} options.host
     * @param {Number} options.port
     * @param {String} options.username
     * @param {String} options.password
     * @param {String} options.privateKeyPath
     * @param {String} options.passPhrase
     */
    update: function (options) {
        if (!_.isObject(options)) {
            return;
        }
        var port = options.port;

        _.isInteger(port) && port > 0 && (this.port = options.port);
        _.isString(options.host) && (this.host = options.host);
        _.isString(options.username) && (this.username = options.username);
        _.isString(options.password) && (this.password = options.password);
        _.isString(options.privateKeyPath) && (this.privateKeyPath = options.privateKeyPath);
        _.isString(options.passPhrase) && (this.passPhrase = options.passPhrase);
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
     * Check whether an object is an instance of SshAuth.
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
