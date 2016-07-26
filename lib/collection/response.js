var util = require('../util'),
    _ = util.lodash,
    fileType = require('file-type'),
    mimeType = require('mime-types'),
    mimeFormat = require('mime-format'),
    httpReasons = require('http-reasons'),
    parseJSON = require('parse-json'),
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
            status: options.status ? options.status : httpReasons.lookup(options.code).name,

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
            stream: options.body && !_.isString(options.body) && _.isObject(options.body) ?
                options.body : options.stream,
            /**
             * @type {PropertyList<Cookie>}
             */
            cookies: new PropertyList(Cookie, this, options.cookie),

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
        return httpReasons.lookup(this.code).name;
    },

    /**
     * Get the response body as a string/text.
     * @returns {String|undefined}
     */
    text: function () {
        return (this.stream ? util.bufferOrArrayBufferToString(this.stream) : this.body);
    },

    /**
     * Get the response body as a JavaScript object. Note that it throws an error if the response is not a valid JSON
     *
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
    json: function () {
        return parseJSON(this.text(), DEFAULT_RESPONSE_FILENAME);
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
    },

    /**
     * Get the response size
     * @return {Number}
     * @todo write unit tests
     */
    size: function () {
        var sizeInfo = {},
            contentEncoding = Header.headerValue(this.headers, 'Content-Encoding'),
            contentLength = Header.headerValue(this.headers, 'Content-Length');

        // if 'Content-Length' header is present and encoding is of type gzip/deflate
        if (contentLength && /^(gzip|deflate)$/.test(contentEncoding) && util.isNumeric(contentLength)) {
            sizeInfo.body = _.parseInt(contentLength, 10);
        }
        // else size of body is added
        else {
            sizeInfo.body = this.stream ? this.stream.byteLength : (this.body && this.body.length || 0);
        }

        // size of header is added
        sizeInfo.header = Header.size(this.headers, this.code, this.reason());
        return sizeInfo;
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
    }
});

module.exports = {
    Response: Response
};
