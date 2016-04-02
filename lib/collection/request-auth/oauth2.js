var _ = require('../../util').lodash,

    OAUTH2 = 'oauth2';

module.exports = {
    name: OAUTH2,
    update: function (options) {
        _.extend(this, {
            addTokenTo : options.addTokenTo,
            callBackUrl : options.callBackUrl,
            authUrl: options.authUrl,
            accessTokenUrl: options.accessTokenUrl,
            clientId: options.clientId,
            clientSecret: options.clientSecret,
            scope: options.scope,
            requestAccessTokenLocally: options.requestAccessTokenLocally
        });
    },

    /**
     * Does nothing to the request, but in the future, we can support client credential flow.
     *
     * @param request
     * @returns {*}
     */
    authorize: function (request) {
        return request;
    }
};
