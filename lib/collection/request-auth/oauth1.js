var _ = require('../../util').lodash,
    RequestBody = require('../request-body').RequestBody,
    oAuth1 = require('node-oauth1'),

    EMPTY = '',
    OAUTH1 = 'oauth1',

    OAUTH1_PARAMS = {
        oauthConsumerKey: 'oauth_consumer_key',
        oauthToken: 'oauth_token',
        oauthSignatureMethod: 'oauth_signature_method',
        oauthTimestamp: 'oauth_timestamp',
        oauthNonce: 'oauth_nonce',
        oauthVersion: 'oauth_version',
        oauthSignature: 'oauth_signature'
    };

module.exports = {
    name: OAUTH1,
    update: function (options) {
        _.assign(this, {
            consumerKey: options.consumerKey,
            consumerSecret: options.consumerSecret,
            token: options.token,
            tokenSecret: options.tokenSecret,
            signatureMethod: options.signatureMethod,
            timestamp: options.timestamp || options.timeStamp,
            nonce: options.nonce,
            version: options.version,
            realm: options.realm,
            addParamsToHeader: options.addParamsToHeader,
            addEmptyParamsToSign: options.addEmptyParamsToSign,
            encodeOAuthSign: options.encodeOAuthSign,
            autoAddParam: options.autoAddParam
        });
    },

    /**
     * Inserts an OAuth1 header into the request headers.
     *
     * @param {Request} request
     * @returns {*}
     */
    authorize: function (request) {
        var self = this,
            helperParams = self,
            signatureParams,
            header;

        if (!helperParams ||
            !helperParams.consumerKey ||
            !helperParams.consumerSecret) { return request; } // Nothing to do if no parameters are present.

        // Remove existing headers and params (if any)
        request.removeHeader('Authorization');
        request.removeQueryParams(_.values(OAUTH1_PARAMS));
        request.body && request.body.urlencoded && request.body.urlencoded.remove(function (param) {
            return _.includes(_.values(OAUTH1_PARAMS), param.key);
        });

        // Generate a new nonce and timestamp
        helperParams.nonce = helperParams.nonce || oAuth1.nonce(11).toString();
        helperParams.timestamp = helperParams.timestamp || oAuth1.timestamp().toString();

        // Ensure that empty parameters are not added to the signature
        if (!helperParams.addEmptyParamsToSign) {
            helperParams = _.reduce(helperParams, function (accumulator, value, key) {
                if (_.isString(value) && (value.trim() === EMPTY)) {
                    return accumulator;
                }
                accumulator[key] = value;
                return accumulator;
            }, {});
        }

        // Generate a list of parameters associated with the signature.
        signatureParams = self.sign({
            url: request.url.getOAuth1BaseUrl(),
            method: request.method,
            queryParams: request.url.query && request.url.query.count() ? request.url.query.map(function (qParam) {
                return {
                    key: qParam.key,
                    value: qParam.value
                };
            }) : [],

            // todo: WTF! figure out a better way
            // Body params only need to be included if they are URL encoded.
            // http://oauth.net/core/1.0a/#anchor13
            bodyParams: (request.body &&
                request.body.mode === RequestBody.MODES.urlencoded &&
                request.body.urlencoded &&
                request.body.urlencoded.count &&
                request.body.urlencoded.count()) ? request.body.urlencoded.map(function (formParam) {
                    return {
                        key: formParam.key,
                        value: formParam.value
                    };
                }) : [],
            helperParams: helperParams
        });

        // The OAuth specification says that we should add parameters in the following order of preference:
        // 1. Auth Header
        // 2. Body parameters
        // 3. Query parameters
        //
        // http://oauth.net/core/1.0/#consumer_req_param
        if (helperParams.addParamsToHeader) {
            header = oAuth1.getAuthorizationHeader(helperParams.realm, _.map(signatureParams, function (param) {
                return [param.key, param.value];
            }));
            request.addHeader({
                key: 'Authorization',
                value: header,
                system: true
            });
        }
        else if (/PUT|POST/.test(request.method) &&
                (request.body && request.body.mode === RequestBody.MODES.urlencoded)) {
            _.forEach(signatureParams, function (param) {
                request.body.urlencoded.add(param);
            });
        }
        else {
            request.addQueryParams(signatureParams);
        }

        return request;
    },

    /**
     * Generates a oAuth1.
     *
     * @param {Object} params
     * @param {String} params.url OAuth 1.0 Base URL
     * @param {String} params.method Request method
     * @param {Object[]} params.helperParams The auth parameters stored with the `Request`
     * @param {Object[]} params.queryParams An array of query parameters
     * @param {Object[]} params.bodyParams An array of request body parameters (in case of url-encoded bodies)
     *
     * @returns {*}
     */
    sign: function (params) {
        var url = params.url,
            method = params.method,
            helperParams = params.helperParams,
            queryParams = params.queryParams,
            bodyParams = params.bodyParams,
            signatureParams,
            message,
            accessor = {},
            allParams,
            signature;

        signatureParams = [
            { key: OAUTH1_PARAMS.oauthConsumerKey, value: helperParams.consumerKey },
            { key: OAUTH1_PARAMS.oauthToken, value: helperParams.token },
            { key: OAUTH1_PARAMS.oauthSignatureMethod, value: helperParams.signatureMethod },
            { key: OAUTH1_PARAMS.oauthTimestamp, value: helperParams.timestamp },
            { key: OAUTH1_PARAMS.oauthNonce, value: helperParams.nonce },
            { key: OAUTH1_PARAMS.oauthVersion, value: helperParams.version }
        ];

        signatureParams = _.filter(signatureParams, function (param) {
            return helperParams.addEmptyParamsToSign || param.value;
        });

        allParams = [].concat(signatureParams, queryParams, bodyParams);
        message = {
            action: url,
            method: method,
            parameters: _.map(allParams, function (param) {
                return [param.key, param.value];
            })
        };

        if (helperParams.consumerSecret) {
            accessor.consumerSecret = helperParams.consumerSecret;
        }
        if (helperParams.tokenSecret) {
            accessor.tokenSecret = helperParams.tokenSecret;
        }
        signature = oAuth1.SignatureMethod.sign(message, accessor);
        if (helperParams.encodeOAuthSign) {
            signature = encodeURIComponent(signature);
        }
        signatureParams.push({ key: OAUTH1_PARAMS.oauthSignature, value: signature });
        return signatureParams;
    }
};
