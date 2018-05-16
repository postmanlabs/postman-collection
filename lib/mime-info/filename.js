var util = require('../util'),
    _ = util.lodash,

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
    UTF8 = 'utf8',

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
     * Regex to match file base name and extension name
     * Group 1 will be matched to the base name
     * Group 2 will be matched to the extension name
     */
    fileNameSplitRegex = /^(.+?\.?)(?:\.([^.]*$)|$)/,

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
     * @param {string} val - The string which needs to be checked
     */
    getLatin = function (val) {
        return String(val).replace(nonLatinCharMatchRegex, '?');
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
     * HashMap for decoding string with supported characterSet
     *
     * @private
     */
    characterDecoders = {
        'iso-8859-1': function (encodedString) {
            return getLatin(encodedString);
        },
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
     * @param {string} encodedFileName
     * @param {string} charset
     * @returns {string} Returns the decoded filename
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
     * @param {string} fileName
     * @returns {object} Returns the file base name and extension name
     */
    splitFileName = function (fileName) {
        var fileNameSplitMatches;
        if (!fileName) {
            return;
        }
        fileNameSplitMatches = fileNameSplitRegex.exec(fileName);
        if (!(fileNameSplitMatches && fileNameSplitMatches[1])) {
            return;
        }
        return {
            name: fileNameSplitMatches[1],
            ext: fileNameSplitMatches[2] || E
        };
    };

module.exports = {
    /**
    * Parses Content disposition header, and returns file name and extension
    *
    * @param {String} dispositionHeader -Content-disposition Header from the response
    * @returns {Object} Returns file base name and extension name
    */
    getFileNameFromDispositionHeader: function (dispositionHeader) {
        var encodedFileName,
            fileName;

        if (!dispositionHeader) {
            return;
        }
        // Get filename* value from the dispositionHeader
        encodedFileName = encodedFileNameRegex.exec(dispositionHeader);
        if (encodedFileName) {
            fileName = decodeFileName(encodedFileName[2], encodedFileName[1]);
        }
        // If filename* is not present or unparseable, then we are checking for filename in header
        if (!fileName) {
            fileName = fileNameRegex.exec(dispositionHeader);
            fileName && (fileName = fileName[1]);
            if (fileName && fileName[0] === doubleQuotes) {
                // remove quotes and escapes
                fileName = fileName
                    .substr(1, fileName.length - 2)
                    .replace(quotedPairRegex, TOKEN_$1);
            }
        }
        // splits file base name and extension name
        return splitFileName(fileName);
    }
};
