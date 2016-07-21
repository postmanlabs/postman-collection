var _ = require('../../util').lodash,
    Hawk = require('hawk'),

    HAWK = 'hawk';

module.exports = {
    name: 'hawk',
    update: function (options) {
        _.extend(this, {
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
     * @param request
     * @returns {*}
     */
    authorize: function (request) {
        var params = request.auth ? request.auth[HAWK] : undefined,
            result;

        if (!params || !params.authId || !params.authKey) {
            return request; // Nothing to do if no parameters are present.
        }

        params.nonce = params.nonce || _.randomString(6);
        // the hawk library will generate a correct one if this is NaN.
        params.timestamp = _.parseInt(params.timestamp);

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
            // Uncomment if we decide to allow users to specify a time-stamp. Very unlikely.
            // timestamp: params.timestamp,
            user: params.user,
            url: request.url.toString(),
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
     * @param params
     * @param params.credentials {Object} Contains hawk auth credentials, "id", "key" and "algorithm"
     * @param params.nonce {String}
     * @param params.ext {String} Extra data that may be associated with the request.
     * @param params.app {String} Application ID used in Oz authorization protocol
     * @param params.dlg {String} Delegation information (used in the Oz protocol)
     * @param params.user {String} User id
     * @param params.url {String} Complete request URL
     * @param params.method {String} Request method
     *
     * @returns {*}
     */
    sign: function (params) {
        return Hawk.client.header(params.url, params.method, params);
    }
};
