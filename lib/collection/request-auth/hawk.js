var _ = require('../../util').lodash,
    Hawk = require('hawk'),

    HAWK = 'hawk';

module.exports = {
    name: HAWK,
    update: function (options) {
        _.assign(this, {
            authId: options.authId,
            authKey: options.authKey,
            algorithm: options.algorithm,
            user: options.user,
            nonce: options.nonce,
            extraData: options.extraData,
            appId: options.appId,
            delegation: options.delegation,
            timestamp: options.timestamp
        });
    },

    /**
     * Inserts a Hawk Auth header into the request headers.
     *
     * @param {Request} request
     * @returns {*}
     */
    authorize: function (request) {
        var params = this,
            result;

        if (!params || !params.authId || !params.authKey) {
            return request; // Nothing to do if no parameters are present.
        }

        params.nonce = params.nonce || _.randomString(6);
        params.timestamp = _.parseInt(params.timestamp) ||
            // Hawk has this function in their Node distribution, but not in the browsers :/
            (_.isFunction(Hawk.utils.nowSecs) ? Hawk.utils.nowSecs() : Hawk.utils.now());

        request.removeHeader('Authorization', { ignoreCase: true });
        result = this.sign({
            credentials: {
                id: params.authId,
                key: params.authKey,
                algorithm: params.algorithm
            },
            nonce: params.nonce,
            timestamp: params.timestamp,
            ext: params.extraData,
            app: params.app,
            dlg: params.delegation,
            user: params.user,
            url: request.url.toString(true), // force toString to add a protocol to the URL.
            method: request.method
        });
        request.addHeader({
            key: 'Authorization',
            value: result.field,
            system: true
        });
        return request;
    },

    /**
     * Computes signature and Auth header for a request.
     *
     * @param {Object} params
     * @param {Object} params.credentials Contains hawk auth credentials, "id", "key" and "algorithm"
     * @param {String} params.nonce
     * @param {String} params.ext Extra data that may be associated with the request.
     * @param {String} params.app Application ID used in Oz authorization protocol
     * @param {String} params.dlg Delegation information (used in the Oz protocol)
     * @param {String} params.user User id
     * @param {String} params.url Complete request URL
     * @param {String} params.method Request method
     *
     * @returns {*}
     */
    sign: function (params) {
        return Hawk.client.header(params.url, params.method, params);
    }
};
