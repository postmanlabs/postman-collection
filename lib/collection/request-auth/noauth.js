var _ = require('lodash');

module.exports = {
    name: 'noauth',
    update: function (options) {
        // Store options in case they were passed. If someone had passed
        // an invalid auth type, the options they send will end up here.
        _.assign(this.noauth || (this.noauth = {}), options);
    },

    /**
     * Does nothing to the request, exists because we want to keep the API consistent.
     *
     * @param {Request} request
     * @returns {*}
     */
    authorize: function (request) {
        return request;
    }
};
