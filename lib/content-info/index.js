var fileType = require('file-type'),
    mimeType = require('mime-types'),
    mimeFormat = require('mime-format'),
    CONTENT_TYPE = 'Content-Type',
    CONTENT_DISPOSITION = 'Content-Disposition',
    util = require('../util'),
    _ = util.lodash,

    /**
     * @private
     * @const
     * @type {String}
     */
    E = '',

    /**
     * @private
     * @const
     * @type {String}
     */
    DOT = '.',

    /**
     * @private
     * @const
     * @type {Number}
     */
    Number_16 = 16,

    /**
     * @private
     * @const
     * @type {Number}
     */
    Number_NEGATIVE_1 = -1,

    /**
     * @private
     * @const
     * @type {Number}
     */
    Number_0 = 0,

    /**
     * @private
     * @const
     * @type {Number}
     */
    Number_1 = 1,

    /**
     * @private
     * @const
     * @type {Number}
     */
    Number_2 = 2,

    /**
     * @private
     * @const
     * @type {String}
     */
    UTF8 = 'utf8',

    /**
     * @private
     * @const
     * @type {String}
     */
    TEXT_PLAIN = 'text/plain',

    /**
     * @private
     * @const
     * @type {String}
     */
    doubleQuotes = '"',

    /**
     * @private
     * @const
     * @type {String}
     */
    TOKEN_$1 = '$1',

    /**
     * @private
     * @const
     * @type {String}
     */
    TOKEN_QUESTION_MARK = '?',

    /**
     * @private
     * @const
     * @type {String}
     */
    BINARY = 'binary',

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
    *
    * egHeader: inline; filename=testResponse.json
    * egHeader: inline; filename="test Response.json"
    */
    // eslint-disable-next-line max-len
    fileNameRegex = /;[ \t]*(?:filename)[ \t]*=[ \t]*("(?:[\x20!\x23-\x5b\x5d-\x7e\x80-\xff]|\\[\x20-\x7e])*"|[!#$%&'*+.0-9A-Z^_`a-z|~-]+)[ \t]*/,

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
    *
    * egHeader: attachment;filename*=utf-8''%E4%BD%A0%E5%A5%BD.txt
    */
    // eslint-disable-next-line max-len
    encodedFileNameRegex = /;[ \t]*(?:filename\*)[ \t]*=[ \t]*([A-Za-z0-9!#$%&+\-^_`{}~]+)'.*'((?:%[0-9A-Fa-f]{2}|[A-Za-z0-9!#$&+.^_`|~-])+)[ \t]*/,

    /**
    * @private
    *
    * RegExp to match quoted-pair in RFC 2616
    *
    * quoted-pair = "\" CHAR
    * CHAR        = <any US-ASCII character (octets 0 - 127)>
    *
    */
    quotedPairRegex = /\\([ -~])/g,

    /**
     * @private
     * Regex to match all the hexadecimal number inside encoded string
     */
    hexCharMatchRegex = /%([0-9A-Fa-f]{2})/g,

    /**
     * @private
     * Regex to match non-latin characters
     */
    nonLatinCharMatchRegex = /[^\x20-\x7e\xa0-\xff]/g,

    /**
     * Replaces non-latin characters with '?'
     *
     * @private
     * @param {String} val - The string which needs to be checked
     */
    getLatin = function (val) {
        return String(val).replace(nonLatinCharMatchRegex, TOKEN_QUESTION_MARK);
    },

    /**
     * Decodes the hexcode to charCode
     *
     * @private
     * @param {String} str - The matched string part of a hexadecimal number
     * @param {String} hex - The hexadecimal string which needs to be converted to charCode
     * @returns {String} String with decoded hexcode values
     */
    decodeHexcode = function (str, hex) {
        return String.fromCharCode(parseInt(hex, Number_16));
    },

    /**
     * HashMap for decoding string with supported characterSet
     *
     * @private
     */
    characterDecoders = {
        'iso-8859-1': getLatin,
        'utf-8': function (encodedString) {
            if (!supportsBuffer) {
                return;
            }
            return Buffer.from(encodedString, BINARY).toString(UTF8);
        }
    },

    /**
     * Decodes the given filename with given charset
     * The supported charset are iso-8859-1 and utf-8
     *
     * @private
     * @param {String} encodedFileName - The encoded filename which needs to be decoded
     * @param {String} charset - The character set which used in filename encoding
     * @returns {String} Returns the decoded filename
     */
    decodeFileName = function (encodedFileName, charset) {
        if (!encodedFileName) {
            return;
        }

        if (!characterDecoders[charset]) {
            return;
        }

        // Decodes the hexadecimal numbers to charCode
        var binary = encodedFileName.replace(hexCharMatchRegex, decodeHexcode);

        return characterDecoders[charset](binary);
    },

    /**
     * Splits the file base name and extension name
     *
     * @private
     * @param {String} fileName - The filename which needs to be split
     * @returns {Object} Returns the file base name and extension name
     */
    splitFileName = function (fileName) {
        var dotIndex = fileName.lastIndexOf(DOT);

        if (dotIndex === Number_NEGATIVE_1 || dotIndex === Number_0 || dotIndex === fileName.length) {
            return {
                name: fileName,
                ext: E
            };
        }

        return {
            name: fileName.slice(Number_0, dotIndex),
            ext: fileName.slice(dotIndex + Number_1)
        };
    },

    /**
     * Takes the content-type header value and performs the mime sniffing with known mime types.
     * If content-type header is not present, detects the mime type from the response stream or response body
     * If content-type is not provided and not able to detect, then text/plain is taken as default
     *
     * @private
     * @param {String} contentType - The value of content type header
     * @param {Stream} responseStream - The response stream, for which content-info should be determined
     * @param {String} responseBody
     * @returns {Object} mime information from response headers
     */
    getMimeInfo = function (contentType, responseStream, responseBody) {
        var normalized,
            detected;

        if (!contentType) {
            detected = fileType(responseStream || responseBody);
            detected && (contentType = detected.mime);
        }

        // if contentType is not detected
        if (!contentType) {
            contentType = TEXT_PLAIN;
        }

        normalized = mimeFormat.lookup(contentType);

        return {
            mimeType: normalized.type, // sanitised mime type base
            format: normalized.format, // format specific to the type returned
            charset: normalized.charset || UTF8,
            defaultExtension: mimeType.extension(normalized.source) || E
        };
    },

    /**
    * Parses Content disposition header, and returns file name and extension
    *
    * @private
    * @param {String} dispositionHeader -Content-disposition Header from the response
    * @returns {Object} Returns file base name and extension name
    */
    getFileNameFromDispositionHeader = function (dispositionHeader) {
        if (!dispositionHeader) {
            return;
        }

        var encodedFileName,
            fileName;

        // Get filename* value from the dispositionHeader
        encodedFileName = encodedFileNameRegex.exec(dispositionHeader);

        if (encodedFileName) {
            fileName = decodeFileName(encodedFileName[Number_2], encodedFileName[Number_1]);
        }

        // If filename* is not present or unparseable, then we are checking for filename in header
        if (!fileName) {
            fileName = fileNameRegex.exec(dispositionHeader);
            fileName && (fileName = fileName[Number_1]);
            if (fileName && fileName[Number_0] === doubleQuotes) {
                // remove quotes and escapes
                fileName = fileName
                    .substr(Number_1, fileName.length - Number_2)
                    .replace(quotedPairRegex, TOKEN_$1);
            }
        }

        // splits file base name and extension name
        return splitFileName(fileName);
    };


module.exports = {

    /**
    * From response object, mime info and filename of the response content is taken
    *
    * @param {Object} response - response object of the postman
    * @returns {Object} - Return contentInfo of the response
    */
    contentInfo: function (response) {
        var contentType = response.headers.get(CONTENT_TYPE),
            contentDisposition = response.headers.get(CONTENT_DISPOSITION),
            mimeInfo = {},
            fileName = {};

        mimeInfo = getMimeInfo(contentType, response.stream, response.body);
        fileName = getFileNameFromDispositionHeader(contentDisposition);

        return _.assign(mimeInfo, fileName);
    },

    // Regex is returned in the module to perform regex unit test cases
    Regex: {
        fileNameRegex: fileNameRegex,
        encodedFileNameRegex: encodedFileNameRegex,
        quotedPairRegex: quotedPairRegex,
        hexCharMatchRegex: hexCharMatchRegex,
        nonLatinCharMatchRegex: nonLatinCharMatchRegex
    }
};
