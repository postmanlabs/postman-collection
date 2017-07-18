var _ = require('../../util').lodash,
    crypto = require('crypto-js'),
    DIGEST = 'digest';

module.exports = {
    name: DIGEST,
    update: function (options) {
        _.assign(this, {
            username: options.username,
            realm: options.realm,
            password: options.password,
            nonce: options.nonce,
            nonceCount: options.nonceCount,
            algorithm: options.algorithm,
            qop: options.qop,
            clientNonce: options.clientNonce,
            opaque: options.opaque
        });
    },

    /**
     * Adds a Digest Authorization header to the request.
     *
     * @todo Decide whether we want to try to support auth-int. It most probably cannot be supported inside the SDK.
     * @param {Request} request
     * @returns {*}
     */
    authorize: function (request) {
        var params = this,
            header;

        if (!params ||
            !params.username ||
            !params.realm) { return request; } // Nothing to do if no parameters are present.

        request.removeHeader('Authorization', { ignoreCase: true });

        params.method = request.method;
        params.uri = request.url.getPathWithQuery();
        header = this.sign(params);
        request.addHeader({
            key: 'Authorization',
            value: header,
            system: true
        });
        return request;
    },

    /**
     * Computes the Digest Authentication header from the given parameters.
     *
     * @param {Object} params
     * @param {String} params.algorithm
     * @param {String} params.username
     * @param {String} params.realm
     * @param {String} params.password
     * @param {String} params.method
     * @param {String} params.nonce
     * @param {String} params.nonceCount
     * @param {String} params.clientNonce
     * @param {String} params.opaque
     * @param {String} params.qop
     * @param {String} params.uri
     * @returns {String}
     */
    sign: function (params) {
        var algorithm = params.algorithm,
            username = params.username,
            realm = params.realm,
            password = params.password,
            method = params.method,
            nonce = params.nonce,
            nonceCount = params.nonceCount,
            clientNonce = params.clientNonce,
            opaque = params.opaque,
            qop = params.qop,
            uri = params.uri,

            // RFC defined terms, http://tools.ietf.org/html/rfc2617#section-3
            A0,
            A1,
            A2,
            hashA1,
            hashA2,

            reqDigest,
            headerParams;

        if (algorithm === 'MD5-sess') {
            A0 = crypto.MD5(username + ':' + realm + ':' + password).toString();
            A1 = A0 + ':' + nonce + ':' + clientNonce;
        }
        else {
            A1 = username + ':' + realm + ':' + password;
        }

        if (qop === 'auth-int') {
            // Cannot be implemented here.
            throw new Error('Digest Auth with "qop": "auth-int" is not supported.');
        }
        else {
            A2 = method + ':' + uri;
        }

        hashA1 = crypto.MD5(A1).toString();
        hashA2 = crypto.MD5(A2).toString();

        if (qop === 'auth' || qop === 'auth-int') {
            reqDigest = crypto.MD5([hashA1, nonce, nonceCount, clientNonce, qop, hashA2].join(':')).toString();
        }
        else {
            reqDigest = crypto.MD5([hashA1, nonce, hashA2].join(':')).toString();
        }

        headerParams = ['username="' + username + '"',
            'realm="' + realm + '"',
            'nonce="' + nonce + '"',
            'uri="' + uri + '"'
        ];

        if (qop === 'auth' || qop === 'auth-int') {
            headerParams.push('qop=' + qop);
        }

        if (qop === 'auth' || qop === 'auth-int' || algorithm === 'MD5-sess') {
            headerParams.push('nc=' + nonceCount);
            headerParams.push('cnonce="' + clientNonce + '"');
        }

        headerParams.push('response="' + reqDigest + '"');
        headerParams.push('opaque="' + opaque + '"');

        return 'Digest ' + headerParams.join(', ');
    }
};
