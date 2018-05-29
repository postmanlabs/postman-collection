var util = require('../util'),
    _ = util.lodash,
    fileType = require('file-type'),
    mimeType = require('mime-types'),
    mimeFormat = require('mime-format'),
    httpReasons = require('http-reasons'),
    LJSON = require('liquid-json'),
    Property = require('./property').Property,
    PropertyBase = require('./property-base').PropertyBase,
    Request = require('./request').Request,
    Header = require('./header').Header,
    CookieList = require('./cookie-list').CookieList,
    HeaderList = require('./header-list').HeaderList,
    contentInfo = require('../content-info').contentInfo,

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
     * @type {String}
     */
    HEADER = 'header',

    /**
     * @private
     * @const
     * @type {String}
     */
    BODY = 'body',

    /**
     * @private
     * @const
     * @type {String}
     */
    GZIP = 'gzip',

    /**
     * @private
     * @const
     * @type {String}
     */
    CONTENT_ENCODING = 'Content-Encoding',

    /**
     * @private
     * @const
     * @type {String}
     */
    CONTENT_LENGTH = 'Content-Length',

    /**
     * @private
     * @const
     * @type {string}
     */
    DEFAULT_RESPONSE_FILENAME = 'response',

    /**
     * @private
     * @const
     * @type {string}
     */
    UTF8 = 'utf8',

    /**
     * @private
     * @const
     * @type {string}
     */
    BUFFER = 'Buffer',

    /**
     * @private
     * @const
     * @type {string}
     */
    FUNCTION = 'function',

    /**
     * @private
     * @const
     * @type {String}
     */
    HTTP_X_X = 'HTTP/X.X ',

    /**
     * @private
     * @type {Boolean}
     */
    supportsBuffer = (typeof Buffer !== undefined) && _.isFunction(Buffer.byteLength),

    /**
     * Normalises an input Buffer or buffer.toJSON() into a Buffer or ArrayBuffer.
     *
     * @private
     * @param {Buffer|Object} stream - An instance of Buffer of an object representation of Buffer(Buffer.toJSON())
     * @returns {Buffer|ArrayBuffer|undefined}
     */
    normaliseStream = function (stream) {
        if (stream && stream.type === BUFFER && _.isArray(stream.data)) {
            // @todo Add tests for Browser environments, where ArrayBuffer is returned instead of Buffer
            return typeof Buffer === FUNCTION ? new Buffer(stream.data) : new Uint8Array(stream.data).buffer;
        }
        return stream;
    },

    Response; // constructor

/**
 * @typedef Response~definition
 * @property {Number} code - define the response code
 * @property {String=} [reason] - optionally, if the response has a non-standard response code reason, provide it here
 * @property {Array<Header~definition>} [header]
 * @property {Array<Cookie~definition>} [cookie]
 * @property {String} [body]
 * @property {Buffer|ByteArray} [stream]
 * @property {Number} responseTime
 *
 * @todo pluralise `header`, `cookie`
 */
_.inherit((

    /**
     * Response holds data related to the request body. By default, it provides a nice wrapper for url-encoded,
     * form-data, and raw types of request bodies.
     *
     * @constructor
     * @extends {Property}
     *
     * @param {Response~definition} options
     */
    Response = function PostmanResponse (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        Response.super_.apply(this, arguments);
        this.update(options || {});
    }), Property);

_.assign(Response.prototype, /** @lends Response.prototype */ {
    update: function (options) {
        // options.stream accepts new Buffer() as well as new Buffer().toJSON()
        var stream = normaliseStream(options.stream);

        _.mergeDefined((this._details = _.clone(httpReasons.lookup(options.code))), {
            name: _.choose(options.reason, options.status),
            code: options.code,
            standardName: this._details.name
        });

        _.mergeDefined(this, /** @lends Response.prototype */ {
            /**
             * @type {Request}
             */
            originalRequest: options.originalRequest ? new Request(options.originalRequest) : undefined,

            /**
             * @type {String}
             * @deprecated use .reason()
             */
            status: this._details.name,

            /**
             * @type {Number}
             */
            code: options.code,

            /**
             * @type {HeaderList}
             */
            headers: new HeaderList(this, options.header),

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
                options.body : stream,

            /**
             * @type {CookieList}
             */
            cookies: new CookieList(this, options.cookie),

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
            responseSize: stream && stream.byteLength
        });
    }
});

_.assign(Response.prototype, /** @lends Response.prototype */ {
    /**
     * Defines that this property requires an ID field
     * @private
     * @readOnly
     */
    _postman_propertyRequiresId: true,

    /**
     * Convert this response into a JSON serialisable object. The _details meta property is omitted.
     *
     * @returns {Object}
     */
    toJSON: function () {
        var response = PropertyBase.toJSON(this);

        response._details && (delete response._details);
        return response;
    },

    /**
     * Get the http response reason phrase based on the current response code.
     *
     * @returns {String|undefined}
     */
    reason: function () {
        return this.status || httpReasons.lookup(this.code).name;
    },

    /**
     * Creates a JSON representation of the current response details, and returns it.
     *
     * @returns {Object} A set of response details, including the custom server reason.
     * @private
     */
    details: function () {
        if (!this._details || this._details.code !== this.code) {
            this._details = _.clone(httpReasons.lookup(this.code));
            this._details.code = this.code;
            this._details.standardName = this._details.name;
        }
        return _.clone(this._details);
    },

    /**
     * Get the response body as a string/text.
     *
     * @returns {String|undefined}
     */
    text: function () {
        return (this.stream ? util.bufferOrArrayBufferToString(this.stream, this.mime().charset) : this.body);
    },

    /**
     * Get the response body as a JavaScript object. Note that it throws an error if the response is not a valid JSON
     *
     * @param {Function=} [reviver]
     * @param {Boolean} [strict=false] Specify whether JSON parsing will be strict. This will fail on comments and BOM
     * @example
     * // assuming that the response is stored in a collection instance `myCollection`
     * var response = myCollection.items.one('some request').responses.idx(0),
     *     jsonBody;
     * try {
     *     jsonBody = response.json();
     * }
     * catch (e) {
     *     console.log("There was an error parsing JSON ", e);
     * }
     * // log the root-level keys in the response JSON.
     * console.log('All keys in json response: ' + Object.keys(json));
     *
     * @returns {Object}
     */
    json: function (reviver, strict) {
        return LJSON.parse(this.text(), reviver, strict);
    },

    /**
    * Extracts mime type, format, charset, extension and filename of the response content
    * A fallback of default filename is given, if filename is not present in header
    *
    * @returns {ResponseContentInfo} - contentInfo for the response
    */
    contentInfo: function () {
        return contentInfo(this);
    },

    /**
     * @private
     *
     * @param {String|Header} contentType - override the content-type of the response using this parameter before
     * computing the mime  type.
     * @param {String|Header} contentDisposition - override the content-disposition of the response before calculating
     * mime info.
     *
     * @returns {Object}
     *
     * @note example object returned
     * {
     *   source: string // 'header', 'content', 'default' or 'forced'
     *   type: normalised.type, // sanitised mime type base
     *   format: normalised.format, // format specific to the type returned
     *   name: DEFAULT_RESPONSE_FILENAME, // @todo - get from disposition
     *   ext: mimeType.extension(normalised.source) || E, // file extension from sanitised content type
     *   filename: name + ext,
     *   // also storing some meta info for possible debugging
     *   _originalContentType: type, // the user provided mime type
     *   _sanitisedContentType: normalised.source, // sanitised mime type
     *   _accuratelyDetected: !normalised.orphan // this being true implies worse case (raw render)
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
            source = HEADER;
        }

        // if content type is not found in header, we fall back to the mime type detected
        if (!contentType && detected) {
            contentType = detected.mime;
            source = BODY;
        }

        // if still not found, then we use default text
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
     * Converts the response to a dataURI that can be used for storage or serialisation. The data URI is formed using
     * the following syntax `data:<content-type>;baseg4, <base64-encoded-body>`.
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
        return 'data:' + mime._sanitisedContentType + ';base64, ' + ((!_.isNil(this.stream) &&
            util.bufferOrArrayBufferToBase64(this.stream)) || (!_.isNil(this.body) && util.btoa(this.body)) || E);
    },

    /**
     * Get the response size by computing the same from content length header or using the actual response body.
     *
     * @returns {Number}
     * @todo write unit tests
     */
    size: function () {
        var sizeInfo = {
                body: 0,
                header: 0,
                total: 0
            },

            contentEncoding = this.headers.get(CONTENT_ENCODING),
            contentLength = this.headers.get(CONTENT_LENGTH),
            isCompressed = false,
            byteLength;

        // if server sent encoded data, we should first try deriving length from headers
        if (_.isString(contentEncoding)) {
            // desensitise case of content encoding
            contentEncoding = contentEncoding.toLowerCase();
            // eslint-disable-next-line lodash/prefer-includes
            isCompressed = (contentEncoding.indexOf('gzip') > -1) || (contentEncoding.indexOf('deflate') > -1);
        }

        // if 'Content-Length' header is present and encoding is of type gzip/deflate, we take body as declared by
        // server. else we need to compute the same.
        if (contentLength && isCompressed && util.isNumeric(contentLength)) {
            sizeInfo.body = _.parseInt(contentLength, 10);
        }
        // if there is a stream defined which looks like buffer, use it's data and move on
        else if (this.stream) {
            byteLength = this.stream.byteLength;
            sizeInfo.body = util.isNumeric(byteLength) ? byteLength : 0;
        }
        // otherwise, if body is defined, we try get the true length of the body
        else if (!_.isNil(this.body)) {
            sizeInfo.body = supportsBuffer ? Buffer.byteLength(this.body.toString()) : this.body.toString().length;
        }

        // size of header is added
        // https://tools.ietf.org/html/rfc7230#section-3.1.2
        // status-line = HTTP-version SP status-code SP reason-phrase CRLF
        sizeInfo.header = (HTTP_X_X + this.code + ' ' + this.reason() + '\r\n').length + this.headers.contentSize();

        // compute the approximate total body size by adding size of header and body
        sizeInfo.total = (sizeInfo.body || 0) + (sizeInfo.header || 0);
        return sizeInfo;
    },

    /**
     * Returns the response encoding defined as header or detected from body.
     *
     * @private
     * @returns {Object} - {format: string, source: string}
     */
    encoding: function () {
        var contentEncoding = this.headers.get(CONTENT_ENCODING),
            body = this.stream || this.body,
            source;

        if (contentEncoding) {
            source = HEADER;
        }

        // if the encoding is not found, we check
        else if (body) { // @todo add detection for deflate
            // eslint-disable-next-line lodash/prefer-matches
            if (body[0] === 0x1F && body[1] === 0x8B && body[2] === 0x8) {
                contentEncoding = GZIP;
            }

            if (contentEncoding) {
                source = BODY;
            }
        }

        return {
            format: contentEncoding,
            source: source
        };
    }
});

_.assign(Response, /** @lends Response */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'Response',

    /**
     * Check whether an object is an instance of {@link ItemGroup}.
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isResponse: function (obj) {
        return Boolean(obj) && ((obj instanceof Response) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', Response._postman_propertyName));
    },

    /**
     * Converts the response object from the request module to the postman responseBody format
     *
     * @param {Object} response The response object, as received from the request module
     * @param {Object} cookies
     * @returns {Object} The transformed responseBody
     * @todo Add a key: `originalRequest` to the returned object as well, referring to response.request
     */
    createFromNode: function (response, cookies) {
        return new Response({
            cookie: cookies,
            body: response.body.toString(),
            stream: response.body,
            header: response.headers,
            code: response.statusCode,
            status: response.statusMessage,
            responseTime: response.elapsedTime
        });
    },

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

        // validate that the content type exists
        if (!(type && _.isString(type))) { return; }

        var normalised = mimeFormat.lookup(type),
            info = {};

        _.assign(info, {
            type: normalised.type, // sanitised mime type base
            format: normalised.format, // format specific to the type returned
            name: DEFAULT_RESPONSE_FILENAME, // @todo - get from disposition
            ext: mimeType.extension(normalised.source) || E, // file extension from sanitised content type
            charset: normalised.charset || UTF8,

            // also storing some meta info for possible debugging
            _originalContentType: type, // the user provided mime type
            _sanitisedContentType: normalised.source, // sanitised mime type
            _accuratelyDetected: !normalised.orphan // this being true implies worse case (raw render)
        });

        // build the file name from extension
        info.filename = info.name;
        info.ext && (info.filename += (DOT + info.ext));

        return info;
    }
});

module.exports = {
    Response: Response
};
