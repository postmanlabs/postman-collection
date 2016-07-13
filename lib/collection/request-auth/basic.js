var _ = require('../../util').lodash,
    btoa = require('btoa'),

    BASIC = 'basic';

module.exports = {
    name: BASIC,
    update: function (options) {
        _.extend(this, {
            username: options.username,
            password: options.password
        });
    },

    /**
     * Inserts a Basic Auth header into the request headers.
     *
     * @param request
     * @returns {*}
     */
    authorize: function (request) {
        var params = request.auth ? request.auth[BASIC] : undefined;

        if (!params || !params.username) { return request; } // Nothing to do if no parameters are present.

        request.removeHeader('Authorization', { ignoreCase: true });
        request.addHeader({
            key: 'Authorization',
            value: 'Basic ' + btoa(params.username + ':' + params.password),
            system: true
        });
        return request;
    }
};
