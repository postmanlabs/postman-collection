const REGEX_EXTRACT_VARS = /{{[^{}]*[.:/?#@&\]][^{}]*}}/g,

    HASH_SEPARATOR = '#',
    PATH_SEPARATOR = '/',
    PORT_SEPARATOR = ':',
    AUTH_SEPARATOR = '@',
    QUERY_SEPARATOR = '?',
    DOMAIN_SEPARATOR = '.',
    PROTOCOL_SEPARATOR = '://',
    AUTH_SEGMENTS_SEPARATOR = ':',
    QUERY_SEGMENTS_SEPARATOR = '&',
    PROTOCOL_SEPARATOR_WITH_BACKSLASH = ':\\\\',

    STRING = 'string',
    SAFE_REPLACE_CHAR = '_',
    CLOSING_SQUARE_BRACKET = ']',
    URL_PROPERTIES_ORDER = ['protocol', 'auth', 'host', 'port', 'path', 'query', 'hash'];

/**
 * Tracks replacements done on a string and expose utility to patch replacements.
 *
 * @note due to performance reasons, it doesn't store the original string or
 * perform ops on the string.
 *
 * @private
 * @constructor
 */
function ReplacementTracker () {
    this.replacements = [];
    this._offset = 0;
    this._length = 0;
}

/**
 * Add new replacement to track.
 *
 * @param {String} value
 * @param {Number} index
 */
ReplacementTracker.prototype.add = function (value, index) {
    this.replacements.push({
        value,
        index: index - this._offset
    });

    this._offset += value.length - 1; // - 1 replaced character
    this._length++;
};

/**
 * Returns the total number of replacements.
 *
 * @returns {Number}
 */
ReplacementTracker.prototype.count = function () {
    return this._length;
};

/**
 * Finds the lower index of replacement position for a given value using inexact
 * binary search.
 *
 * @param {Number} index
 * @returns {Number}
 */
ReplacementTracker.prototype._findLowerIndex = function (index) {
    var length = this.count(),
        start = 0,
        end = length - 1,
        mid;

    while (start <= end) {
        mid = (start + end) >> 1; // divide by 2

        if (this.replacements[mid].index >= index) {
            end = mid - 1;
        }
        else {
            start = mid + 1;
        }
    }

    return start >= length ? -1 : start;
};

/**
 * Patches a given string by apply all the applicable replacements done in the
 * given range.
 *
 * @param {String} input
 * @param {Number} beginIndex
 * @param {Number} endIndex
 * @returns {String}
 */
ReplacementTracker.prototype._applyInString = function (input, beginIndex, endIndex) {
    var index,
        replacement,
        replacementIndex,
        replacementValue,
        offset = 0,
        length = this.count();

    // bail out if no replacements are done in the given range OR empty string
    if (!input || (index = this._findLowerIndex(beginIndex)) === -1) {
        return input;
    }

    do {
        replacement = this.replacements[index];
        replacementIndex = replacement.index;
        replacementValue = replacement.value;

        // bail out if all the replacements are done in the given range
        if (replacementIndex >= endIndex) {
            break;
        }

        replacementIndex = offset + replacementIndex - beginIndex;
        input = input.slice(0, replacementIndex) + replacementValue + input.slice(replacementIndex + 1);
        offset += replacementValue.length - 1;
    } while (++index < length);

    return input;
};

/**
 * Patches a given string or array of strings by apply all the applicable
 * replacements done in the given range.
 *
 * @param {String|String[]} input
 * @param {Number} beginIndex
 * @param {Number} endIndex
 * @returns {String|String[]}
 */
ReplacementTracker.prototype.apply = function (input, beginIndex, endIndex) {
    var i,
        ii,
        length,
        _endIndex,
        _beginIndex,
        value = input;

    // apply replacements in string
    if (typeof input === STRING) {
        return this._applyInString(input, beginIndex, endIndex);
    }

    // apply replacements in the splitted string (Array)
    _beginIndex = beginIndex;

    // traverse all the segments until all the replacements are patched
    for (i = 0, ii = input.length; i < ii; ++i) {
        value = input[i];
        _endIndex = _beginIndex + (length = value.length);

        // apply replacements applicable for individual segment
        input[i] = this._applyInString(value, _beginIndex, _endIndex);
        _beginIndex += length + 1; // + 1 separator
    }

    return input;
};

/**
 * Normalize the given string by replacing the variables which includes
 * reserved characters in its name.
 * The replaced characters are added to the given replacement tracker instance.
 *
 * @private
 * @param {String} str
 * @param {ReplacementTracker} replacements
 * @returns {String}
 */
function normalizeVariables (str, replacements) {
    var normalizedString = '',
        pointer = 0, // pointer till witch the string is normalized
        variable,
        match,
        index;

    // find all the instances of {{<variable>}} which includes reserved chars
    // "Hello {{user#name}}!!!"
    //  ↑ (pointer = 0)
    while ((match = REGEX_EXTRACT_VARS.exec(str)) !== null) {
        // {{user#name}}
        variable = match[0];

        // starting index of the {{variable}} in the string
        // "Hello {{user#name}}!!!"
        //        ↑ (index = 6)
        index = match.index;

        // [pointer, index) string is normalized + the safe replacement character
        // "Hello " + "_"
        normalizedString += str.slice(pointer, index) + SAFE_REPLACE_CHAR;

        // track the replacement done for the {{variable}}
        replacements.add(variable, index);

        // update the pointer
        // "Hello {{user#name}}!!!"
        //                     ↑ (pointer = 19)
        pointer = index + variable.length;
    }

    // avoid slicing the string in case of no matches
    if (pointer === 0) {
        return str;
    }

    // whatever left in the string is normalized as well
    if (pointer < str.length) {
        // "Hello _" + "!!!"
        normalizedString += str.slice(pointer);
    }

    return normalizedString;
}

/**
 * Update replaced characters in the URL object with its original value.
 *
 * @private
 * @param {Object} url
 * @param {ReplacementTracker} replacements
 */
function applyReplacements (url, replacements) {
    var i,
        ii,
        prop;

    // traverse each URL property in the given order
    for (i = 0, ii = URL_PROPERTIES_ORDER.length; i < ii; ++i) {
        prop = url[URL_PROPERTIES_ORDER[i]];

        // bail out if the given property is not set (undefined or '')
        if (!(prop && prop.value)) {
            continue;
        }

        prop.value = replacements.apply(prop.value, prop.beginIndex, prop.endIndex);
    }

    return url;
}

/**
 * Parses the input string by decomposing the URL into constituent parts,
 * such as path, host, port, etc.
 *
 * @private
 * @param {String} urlString
 * @returns {Object}
 */
function parse (urlString) {
    // trim leading whitespace characters
    urlString = String(urlString).trimLeft();

    var url = {
            protocol: { value: undefined, beginIndex: 0, endIndex: 0 },
            auth: { value: undefined, beginIndex: 0, endIndex: 0 },
            host: { value: undefined, beginIndex: 0, endIndex: 0 },
            port: { value: undefined, beginIndex: 0, endIndex: 0 },
            path: { value: undefined, beginIndex: 0, endIndex: 0 },
            query: { value: undefined, beginIndex: 0, endIndex: 0 },
            hash: { value: undefined, beginIndex: 0, endIndex: 0 }
        },
        parsedUrl = {
            raw: urlString,
            protocol: undefined,
            auth: undefined,
            host: undefined,
            port: undefined,
            path: undefined,
            query: undefined,
            hash: undefined
        },
        replacements = new ReplacementTracker(),
        pointer = 0,
        length,
        index,
        port;

    // bail out if input string is empty
    if (!urlString) {
        return parsedUrl;
    }

    // normalize the given string
    urlString = normalizeVariables(urlString, replacements);
    length = urlString.length;

    // 1. url.hash
    if ((index = urlString.indexOf(HASH_SEPARATOR)) !== -1) {
        // extract from the back
        url.hash.value = urlString.slice(index + 1);
        url.hash.beginIndex = pointer + index + 1;
        url.hash.endIndex = pointer + length;

        urlString = urlString.slice(0, (length = index));
    }

    // 2. url.query
    if ((index = urlString.indexOf(QUERY_SEPARATOR)) !== -1) {
        // extract from the back
        url.query.value = urlString.slice(index + 1).split(QUERY_SEGMENTS_SEPARATOR);
        url.query.beginIndex = pointer + index + 1;
        url.query.endIndex = pointer + length;

        urlString = urlString.slice(0, (length = index));
    }

    // 3. url.protocol
    if ((index = urlString.indexOf(PROTOCOL_SEPARATOR)) !== -1) {
        // extract from the front
        url.protocol.value = urlString.slice(0, index);
        url.protocol.beginIndex = pointer;
        url.protocol.endIndex = pointer + index;

        urlString = urlString.slice(index + 3);
        length -= index + 3;
        pointer += index + 3;
    }
    // protocol can be separated using :\\ as well
    else if ((index = urlString.indexOf(PROTOCOL_SEPARATOR_WITH_BACKSLASH)) !== -1) {
        // extract from the front
        url.protocol.value = urlString.slice(0, index);
        url.protocol.beginIndex = pointer;
        url.protocol.endIndex = pointer + index;

        urlString = urlString.slice(index + 3);
        length -= index + 3;
        pointer += index + 3;
    }

    // 4. url.path
    urlString = urlString.replace(/\\/g, '/'); // sanitize path
    if ((index = urlString.indexOf(PATH_SEPARATOR)) !== -1) {
        // extract from the back
        url.path.value = urlString.slice(index + 1).split(PATH_SEPARATOR);
        url.path.beginIndex = pointer + index + 1;
        url.path.endIndex = pointer + length;

        urlString = urlString.slice(0, (length = index));
    }

    // 5. url.auth
    if ((index = urlString.lastIndexOf(AUTH_SEPARATOR)) !== -1) {
        // extract from the front
        url.auth.value = urlString.slice(0, index);
        url.auth.beginIndex = pointer;
        url.auth.endIndex = pointer + index;

        urlString = urlString.slice(index + 1);
        length -= index + 1;
        pointer += index + 1;

        // separate username:password
        if ((index = url.auth.value.indexOf(AUTH_SEGMENTS_SEPARATOR)) !== -1) {
            url.auth.value = [url.auth.value.slice(0, index), url.auth.value.slice(index + 1)];
        }
        else {
            url.auth.value = [url.auth.value];
        }
    }

    // 6. url.port
    if ((index = urlString.lastIndexOf(PORT_SEPARATOR)) !== -1 &&
        // eslint-disable-next-line lodash/prefer-includes
        (port = urlString.slice(index + 1)).indexOf(CLOSING_SQUARE_BRACKET) === -1
    ) {
        // extract from the back
        url.port.value = port;
        url.port.beginIndex = pointer + index + 1;
        url.port.endIndex = pointer + length;

        urlString = urlString.slice(0, (length = index));
    }

    // 7. url.host
    if (urlString) {
        url.host.value = urlString.split(DOMAIN_SEPARATOR);
        url.host.beginIndex = pointer;
        url.host.endIndex = pointer + length;
    }

    // apply replacements back, if any
    replacements.count() && applyReplacements(url, replacements);

    // finally, prepare parsed url
    parsedUrl.protocol = url.protocol.value;
    parsedUrl.auth = url.auth.value;
    parsedUrl.host = url.host.value;
    parsedUrl.port = url.port.value;
    parsedUrl.path = url.path.value;
    parsedUrl.query = url.query.value;
    parsedUrl.hash = url.hash.value;

    return parsedUrl;
}

module.exports = parse;
