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
     * @const
     * @type {String}
     */
    utf8 = 'utf-8',

    /**
     * @private
     * @const
     * @type {String}
     */
    iso88591 = 'iso-8859-1',

    /**
     * @private
     * @type {Boolean}
     */
    supportsBuffer = (typeof Buffer !== undefined) && _.isFunction(Buffer.byteLength),

    /**
    * @private
    * RegExp for extracting filename from content-disposition header
    *
    * RFC 2616 grammar
    * parameter     = token "=" ( token | quoted-string )
    * token         = 1*<any CHAR except CTLs or separators>
    * separators    = "(" | ")" | "<" | ">" | "@"
    *               | "," | ";" | ":" | "\" | <">
    *               | "/" | "[" | "]" | "?" | "="
    *               | "{" | "}" | SP | HT
    * quoted-string = ( <"> *(qdtext | quoted-pair ) <"> )
    * qdtext        = <any TEXT except <">>
    * quoted-pair   = "\" CHAR
    * CHAR          = <any US-ASCII character (octets 0 - 127)>
    * TEXT          = <any OCTET except CTLs, but including LWS>
    * LWS           = [CRLF] 1*( SP | HT )
    * CRLF          = CR LF
    * CR            = <US-ASCII CR, carriage return (13)>
    * LF            = <US-ASCII LF, linefeed (10)>
    * SP            = <US-ASCII SP, space (32)>
    * HT            = <US-ASCII HT, horizontal-tab (9)>
    * CTL           = <any US-ASCII control character (octets 0 - 31) and DEL (127)>
    * OCTET         = <any 8-bit sequence of data>
    */
    // Regex used
    // /;[ \t]*(?:filename)[ \t]*=[ \t]*("(?:[\x20!\x23-\x5b\x5d-\x7e\x80-\xff]|\\[\x20-\x7e])*
    // "|[!#$%&'*+.0-9A-Z^_`a-z|~-]+)[ \t]*/
    fileNameRegex = new RegExp([';[ \\t]*(?:filename)[ \\t]*=[ \\t]*("(?:[\\x20!\\x23-\\x5b\\x5d-\\x7e\\x80-\\xff]',
        '|\\\\[\\x20-\\x7e])*"|[!#$%&\'*+.0-9A-Z^_`a-z|~-]+)[ \\t]*'].join('')),

    /**
    * @private
    * RegExp for extracting filename* from content-disposition header
    *
    * RFC 5987 grammar
    * parameter     = reg-parameter / ext-parameter
    * ext-parameter = parmname "*" LWSP "=" LWSP ext-value
    * parmname      = 1*attr-char
    * ext-value     = charset  "'" [ language ] "'" value-chars
                   ; like RFC 2231's <extended-initial-value>
                   ; (see [RFC2231], Section 7)
    * charset       = "UTF-8" / "ISO-8859-1" / mime-charset
    * mime-charset  = 1*mime-charsetc
    * mime-charsetc = ALPHA / DIGIT
                   / "!" / "#" / "$" / "%" / "&"
                   / "+" / "-" / "^" / "_" / "`"
                   / "{" / "}" / "~"
                   ; as <mime-charset> in Section 2.3 of [RFC2978]
                   ; except that the single quote is not included
                   ; SHOULD be registered in the IANA charset registry
    * language      = <Language-Tag, defined in [RFC5646], Section 2.1>
    * value-chars   = *( pct-encoded / attr-char )
    * pct-encoded   = "%" HEXDIG HEXDIG
                   ; see [RFC3986], Section 2.1
    * attr-char     = ALPHA / DIGIT
                   / "!" / "#" / "$" / "&" / "+" / "-" / "."
                   / "^" / "_" / "`" / "|" / "~"
                   ; token except ( "*" / "'" / "%" )
    */
    // Regex used
    // /;[ \t]*(?:filename\*)[ \t]*=[ \t]*([A-Za-z0-9!#$%&+\-^_`{}~]+)'.*'
    // ((?:%[0-9A-Fa-f]{2}|[A-Za-z0-9!#$&+.^_`|~-])+)[ \t]*/
    encodedFileNameRegex = new RegExp([';[ \\t]*(?:filename\\*)[ \\t]*=[ \\t]*([A-Za-z0-9!#$%&+\\-^_`{}~]+)\'',
        '.*\'((?:%[0-9A-Fa-f]{2}|[A-Za-z0-9!#$&+.^_`|~-])+)[ \\t]*'].join('')),

    /**
    * @private
    *
    * RegExp to match quoted-pair in RFC 2616
    *
    * quoted-pair = "\" CHAR
    * CHAR        = <any US-ASCII character (octets 0 - 127)>
    *
    */
    QuotedPairRegex = /\\([ -~])/g,

    /**
     * @private
     * Regex to match file base name and extension name
     * Group 1 will be matched to the base name
     * Group 2 will be matched to the extension name
     */
    fileNameSplitRegex = /^(.+?\.?)(?:\.([^.]*$)|$)/,

    /**
     * @private
     * Regex to match all the hexadecimal number inside encoded string
     */
    HexCharMatchREGEXP = /%([0-9A-Fa-f]{2})/g,

    /**
     * @private
     * Regex to match non-latin characters
     */
    NonLatinCharMatchRegexp = /[^\x20-\x7e\xa0-\xff]/g,

    /**
     * Replaces non-latin characters with '?'
     *
     * @private
     * @param {string} val - The string which needs to be checked
     */
    getLatin = function (val) {
        return String(val).replace(NonLatinCharMatchRegexp, '?');
    },

    /**
     * Decodes the hexcode to charCode
     *
     * @private
     * @param {string} str
     * @param {string} hex
     * @returns {string} String with decoded hexcode values
     */
    decodeHexcode = function (str, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    },

    /**
     * Decodes the given filename with given charset
     * The supported charset are iso-8859-1 and utf-8
     *
     * @private
     * @param {string} encodedFileName
     * @param {string} charset
     * @returns {string} Returns the decoded filename
     */
    decodeFileName = function (encodedFileName, charset) {
        // Decodes the hexadecimal numbers to charCode
        var binary = encodedFileName.replace(HexCharMatchREGEXP, decodeHexcode),
            value;
        switch (charset) {
            case iso88591:
                value = getLatin(binary);
                break;
            case utf8:
                value = new Buffer(binary, 'binary').toString('utf8');
                break;
            default:
                return false;
        }
        return value;
    },

    /**
    * Parses Content disposition header, and returns file name and extension, a fallback of default file name
    * and extension from content type is returned if dispositionHeader or file name is not present
    *
    * @private
    * @param {String} dispositionHeader -Content-disposition Header from the response
    * @param {string} contentType -The sanitized content type
    * @returns {Object}
    */
    parseContentDispositionHeader = function (dispositionHeader, contentType) {
        var defaultFileNameObj = {
                name: DEFAULT_RESPONSE_FILENAME,
                ext: mimeType.extension(contentType) || E
            },
            encodedFileName,
            fileNameSplitMatches,
            fileName;
        if (!dispositionHeader) {
            return defaultFileNameObj;
        }
        encodedFileName = encodedFileNameRegex.exec(dispositionHeader);
        if (encodedFileName) {
            fileName = decodeFileName(encodedFileName[2], encodedFileName[1]);
        }
        else {
            fileName = fileNameRegex.exec(dispositionHeader)[1];
            if (fileName[0] === '"') {
                // remove quotes and escapes
                fileName = fileName
                    .substr(1, fileName.length - 2)
                    .replace(QuotedPairRegex, '$1');
            }
        }
        if (!fileName) {
            return defaultFileNameObj;
        }

        fileNameSplitMatches = fileNameSplitRegex.exec(fileName);
        // Returns default file name if filename is empty in dispositionHeader
        if (!fileNameSplitMatches || !fileNameSplitMatches[1]) {
            return defaultFileNameObj;
        }
        return {
            name: fileNameSplitMatches[1],
            ext: fileNameSplitMatches[2] || E
        };
    },

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
            info = {},
            fileNameObj = parseContentDispositionHeader(disposition, normalised.source);
        _.assign(info, {
            type: normalised.type, // sanitised mime type base
            format: normalised.format, // format specific to the type returned
            name: fileNameObj.name,
            ext: fileNameObj.ext,
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
