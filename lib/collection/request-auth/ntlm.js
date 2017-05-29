var _ = require('lodash'),
    NTLM = 'ntlm';

module.exports = {
    name: NTLM,
    update: function (options) {
        _.assign(this, {
            username: options.username,
            password: options.password,
            domain: options.domain,
            workstation: options.workstation
        });
    },

    /**
     * Does nothing to the request, exists because we want to keep the API consistent.
     *
     * @note NTLM requests need intermediate signing information from the server, so we do not make any changes to
     * the request here.
     * @param {Request} request
     * @returns {*}
     */
    authorize: function (request) {
        return request;
    }
};
