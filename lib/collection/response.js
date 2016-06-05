var _ = require('../util').lodash,
    base64 = require('../util').base64,
    fileType = require('file-type'),
    mime = require('mime-types'),
    Property = require('./property').Property,
    Request = require('./request').Request,
    Header = require('./header').Header,
    Cookie = require('./cookie').Cookie,
    PropertyList = require('./property-list').PropertyList,

    Response;

_.inherit((
    /**
     * Response holds data related to the request body. By default, it provides a nice wrapper for url-encoded,
     * form-data, and raw types of request bodies.
     *
     * @constructor
     * @extends {Property}
     *
     * @param {Object} options
     */
    Response = function PostmanResponse (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        Response.super_.apply(this, arguments);
        if (!options) { return; } // in case definition object is missing, there is no point moving forward

        this.update(options);
    }), Property);

_.extend(Response.prototype, /** @lends Response.prototype */ {
    update: function (options) {
        _.extend(this, /** @lends Response.prototype */ {
            /**
             * @type {Request}
             */
            originalRequest: options.originalRequest ? new Request(options.originalRequest) : undefined,

            /**
             * @type {String}
             * @deprecated use .reason()
             */
            status: options.status ? options.status : Response.HTTP_REASON_PHRASES[options.code],

            /**
             * @type {Number}
             */
            code: options.code,

            /**
             * @type {PropertyList<Header>}
             */
            headers: new PropertyList(Header, this, options.header),

            /**
             * @type {String}
             */
            body: options.body,
            /**
             * @private
             *
             * @type {Buffer|UInt8Array}
             */
            rawBody: options.body && !_.isString(options.body) && _.isObject(options.body) ? options.body : undefined,
            /**
             * @type {PropertyList<Cookie>}
             */
            cookies: new PropertyList(Cookie, this, options.cookie),

            /**
             * Time taken for the request to complete.
             *
             * @type {Number}
             */
            responseTime: options.responseTime
        });
    }
});

_.extend(Response.prototype, /** @lends Response.prototype */ {
    /**
     * Get the http response reason phrase based on the current response code.
     * @returns {String|undefined}
     */
    reason: function () {
        return this.status || Response.HTTP_REASON_PHRASES[this.code];
    },

    mime: function (contentType) {
        var responseBody = this.rawBody == null ? new Uint8Array() : this.rawBody,
            body;

            body = {
                mimeSource: 'header',
                mime: this.headers.one('content-type') && this.headers.one('content-type').value || contentType,
                detected: fileType(responseBody) || {}
            };

        // if content type is not resolved, we use the mime to determine the same
        if (!body.mime) {
            body.mime = body.detected.mime;
            body.mimeSource = 'content';

            // if even mime is not detected, we set it as text/plain
            if (!body.mime) {
                body.mime = 'text/plain';
                body.mimeSource = 'default';
            }
        }

        // set the extension and base
        body.ext = mime.extension(body.mime) || '';
        body.base = body.mime.replace(/^([\s\S]+)\/[\s\S]+/g, '$1') || null;

        // set base format for detected mime type
        body.detected.base = body.detected.mime && body.detected.mime.replace(/^([\s\S]+)\/[\s\S]+/g, '$1') || null;

        return body;
    }
});

_.extend(Response, /** @lends Response */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'Response',

    /**
     * Enum for all the HTTP Reason phrases
     *
     * @private
     * @readonly
     * @enum {string}
     * @memberOf Response
     */
    HTTP_REASON_PHRASES: {
        100: 'Continue',
        101: 'Switching Protocols',
        102: 'Processing',

        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        203: 'Non-authoritative Information',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',
        207: 'Multi-Status',
        208: 'Already Reported',
        226: 'IM Used',

        300: 'Multiple Choices',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        305: 'Use Proxy',
        307: 'Temporary Redirect',
        308: 'Permanent Redirect',

        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Payload Too Large',
        414: 'Request-URI Too Long',
        415: 'Unsupported Media Type',
        416: 'Requested Range Not Satisfiable',
        417: 'Expectation Failed',
        418: 'I\'m a teapot',
        421: 'Misdirected Request',
        422: 'Unprocessable Entity',
        423: 'Locked',
        424: 'Failed Dependency',
        426: 'Upgrade Required',
        428: 'Precondition Required',
        429: 'Too Many Requests',
        431: 'Request Header Fields Too Large',
        451: 'Unavailable For Legal Reasons',
        499: 'Client Closed Request',

        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported',
        506: 'Variant Also Negotiates',
        507: 'Insufficient Storage',
        508: 'Loop Detected',
        510: 'Not Extended',
        511: 'Network Authentication Required',
        599: 'Network Connect Timeout Error'
    }
});

module.exports = {
    Response: Response
};
