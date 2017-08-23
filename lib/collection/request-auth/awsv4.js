var _ = require('../../util').lodash,
    RequestBody = require('../request-body').RequestBody,
    signer = require('aws4'),

    AWSV4 = 'awsv4',

    // These auto-added headers interfere with the AWS Auth signing process.
    // Ideally, they're not supposed to be a part of the signature calculation
    NON_SIGNABLE_HEADERS = ['cache-control', 'postman-token'];

module.exports = {
    name: AWSV4,
    update: function (options) {
        _.assign(this, {
            accessKey: options.accessKey,
            secretKey: options.secretKey,
            sessionToken: options.sessionToken,
            region: options.region,
            service: options.service
        });
    },

    /**
     * Processes a request for AWS Signature (V4) authentication. It inserts an "Authorization" header, a
     * header for "X-Amz-Date". The original values of the headers (if any) are overwritten.
     *
     * @param {Request} request
     * @returns {*}
     */
    authorize: function (request) {
        var self = this,
            params = this,
            mode,
            signedData;

        if (!params) { return request; } // Nothing to do if no parameters are present.

        // Clean up the request (if needed)
        request.removeHeader('Authorization', { ignoreCase: true });
        request.removeHeader('X-Amz-Date', { ignoreCase: true });
        request.removeHeader('X-Amz-Security-Token', { ignoreCase: true });
        if (!request.getHeaders({ ignoreCase: true })['content-type']) {
            // Since AWS v4 requires a content type header to be set, add one.
            mode = _.get(request, 'body.mode');
            request.addHeader({
                key: 'Content-Type',
                value: (mode === RequestBody.MODES.formdata) ?
                    'multipart/form-data' : 'application/x-www-form-urlencoded',
                system: true
            });
        }
        signedData = self.sign({
            credentials: {
                accessKeyId: params.accessKey,
                secretAccessKey: params.secretKey,
                sessionToken: params.sessionToken || undefined
            },
            host: request.url.getRemote(),
            path: request.url.getPathWithQuery(),
            service: params.service || params.serviceName || 'execute-api', // AWS API Gateway is the default service.
            region: params.region || 'us-east-1',
            method: request.method,
            body: request.body ? request.body.toString() : undefined,
            headers: _.transform(request.getHeaders({ enabled: true }), function (accumulator, value, key) {
                if (!_.includes(NON_SIGNABLE_HEADERS, key.toLowerCase())) {
                    accumulator[key] = value;
                }
            }, {})
        });

        _.forEach(signedData.headers, function (value, key) {
            // TODO: figure out a better way of handling errors.
            if (!_.includes(['content-length', 'content-type', 'host'], key.toLowerCase())) {
                request.upsertHeader({
                    key: key,
                    value: value,
                    system: true
                });
            }
        });
        return request;
    },

    /**
     * Generates the signature, and returns the Authorization, X-Amz-Date and Content-Type headers.
     * AWS v4 auth mandates that a content type header be present in each request.
     *
     * @param {Object} params
     * @param {Object} params.credentials Should contain the AWS credentials, "accessKeyId" and "secretAccessKey"
     * @param {String} params.host Contains the host name for the request
     * @param {String} params.path Contains the complete path, with query string as well, e.g: /something/kane?hi=ho
     * @param {String} params.service The name of the AWS service
     * @param {String} params.region AWS region
     * @param {String} params.method Request method
     * @param {String} params.body Stringified request body
     * @param {Object} params.headers Each key should be a header key, and the value should be a header value
     */
    sign: function (params) {
        return signer.sign(params, params.credentials);
    }
};
