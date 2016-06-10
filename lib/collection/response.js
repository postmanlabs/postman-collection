var util = require('../util'),
    _ = util.lodash,
    fileType = require('file-type'),
    mimeType = require('mime-types'),
    mimeFormat = require('../mime-format'),
    Property = require('./property').Property,
    Request = require('./request').Request,
    Header = require('./header').Header,
    Cookie = require('./cookie').Cookie,
    PropertyList = require('./property-list').PropertyList,

    /**
     * @private
     * @const
     * @type {string}
     */
    E = '',
    /**
     * @private
     * @const
     * @type {string}
     */
    DOT = '.',
    /**
     * @private
     * @const
     * @type {string}
     */
    DEFAULT_RESPONSE_FILENAME = 'response',

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
        this.update(options || {});
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
            headers: new PropertyList(Header, this, (options.headers || options.header)), // @todo pluralise

            /**
             * @type {String}
             */
            body: options.body,
            /**
             * @private
             *
             * @type {Buffer|UInt8Array}
             */
            stream: options.body && !_.isString(options.body) && _.isObject(options.body) ?
                options.body : options.stream,
            /**
             * @type {PropertyList<Cookie>}
             */
            cookies: new PropertyList(Cookie, this, (options.cookies || options.cookie)), // @todo pluralise

            /**
             * Time taken for the request to complete.
             *
             * @type {Number}
             */
            responseTime: options.responseTime,

            /**
             * @private
             * @type {Number}
             */
            responseSize: options.stream && options.stream.byteLength
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

    /**
     * @private
     *
     * @param {String} contentType
     *
     * @returns {Object}
     *
     * @note example object returned
     * {
     *   source: string // 'header', 'content', 'default' or 'forced'
     *   type: string // the content type of response
     *   ext: string // extension of file that stores this type of data
     *   name: string // file name
     *   format: string // 'text', 'audio', 'video', 'image' ...
     *   syntax: string // 'ecmascript', 'json', 'xml', 'raw', ...
     *   detected: {} // same as root object, but based on what is detected from content
     * }
     *
     * @todo write unit tests
     */
    mime: function (contentType, contentDisposition) {
        var detected = fileType(this.stream || this.body), // detect the mime from response body
            source = 'forced',
            mime;

        // if no overrides provided, we take the values from headers
        !contentDisposition && (contentDisposition = this.headers.one('content-disposition'));
        if (!contentType) {
            contentType = this.headers.one('content-type') && this.headers.one('content-type').value;
            source = 'header';
        }

        // if content type is not found in header, we fall back to the mime type detected
        if (!contentType && detected) {
            contentType = detected.mime;
            source = 'content';
        }

        // if styill not found, then we use default text
        if (!contentType) {
            contentType = 'text/plain';
            source = 'default';
        }

        mime = Response.mimeInfo(contentType, contentDisposition);
        mime.source = source;
        mime.detected = detected && Response.mimeInfo(detected.mime, contentDisposition);

        return mime;
    },

    /**
     * @private
     *
     * @returns {String}
     * @todo write unit tests
     */
    dataURI: function () {
        var mime = this.mime();

        // if there is no mime detected, there is no accurate way to render this thing
        if (!this.mime) {
            return E;
        }

        // we create the body string first from stream and then fallback to body
        return 'data:' + mime.type + ';base64, ' + (((this.stream != null) &&
            util.bufferOrArrayBufferToBase64(this.stream)) || ((this.body != null) && util.btoa(this.body)) || E);
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
     * @private
     *
     * @param {String|Header} type
     * @param {String|Header} disposition
     * @returns {Object}
     *
     * @todo write unit tests
     */
    mimeInfo: function (type, disposition) {
        Header.isHeader(type) && (type = type.value);
        Header.isHeader(disposition) && (disposition = disposition.value);

        if (!(type && _.isString(type))) { return; }

        var info = {},
            format = mimeFormat.lookup(type);

        info.type = type;
        info.ext = mimeType.extension(type) || E;
        info.name = DEFAULT_RESPONSE_FILENAME; // @todo  return file name from disposition
        info.format = format.type;
        info.syntax = format.format;

        // build the file name from extension
        info.filename = info.name;
        info.ext && (info.filename += (DOT + info.ext));

        return info;
    },

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
