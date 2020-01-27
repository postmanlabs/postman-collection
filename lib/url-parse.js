var REGEX_EXTRACT_VARS = /\{\{(?:[^{}]*?)}}/g,
    RESERVED_CHARS = /[.:/?#@&\]]/g,

    HASH_SEPARATOR = '#',
    PATH_SEPARATOR = '/',
    PORT_SEPARATOR = ':',
    AUTH_SEPARATOR = '@',
    QUERY_SEPARATOR = '?',
    DOMAIN_SEPARATOR = '.',
    PROTOCOL_SEPARATOR = '://',
    AUTH_SEGMENTS_SEPARATOR = ':',
    QUERY_SEGMENTS_SEPARATOR = '&',

    STRING = 'string',
    SAFE_REPLACE_CHAR = '_',
    CLOSING_SQUARE_BRACKET = ']',
    URL_PROPERTIES_ORDER = ['protocol', 'auth', 'host', 'port', 'path', 'query', 'hash'];

/**
 * Normalize the given string by replacing the reserved characters in variable
 * name.
 * The replaced characters are added to the given replacement array.
 *
 * @private
 * @param {String} str
 * @param {Array} replacements
 * @returns {String}
 */
function normalizeVariables (str, replacements) {
    var pointer = 0, // pointer till witch the string is normalized
        normalizedString = '',
        strLength = str.length,
        variable,
        charAt,
        match,
        start,
        end;

    // find all the instances of {{<variable>}} in the given string
    // "Hello {{user:name}}!!!"
    //  ↑ (pointer = 0)
    while ((match = REGEX_EXTRACT_VARS.exec(str)) !== null) {
        // {{user:name}}
        variable = match[0];

        // starting index of the {{variable}} in the string
        // "Hello {{user:name}}!!!"
        //        ↑ (start = 6)
        start = match.index;

        // ending index of the {{variable}} in the string
        // "Hello {{user:name}}!!!"
        //                    ↑ (end = 19)
        end = start + variable.length;

        // [pointer, start) string is normalized
        // "" + "Hello "
        normalizedString += str.slice(pointer, start);

        // update the pointer
        // "Hello {{user:name}}!!!"
        //        ↑ (pointer = 6)
        pointer = start;

        // find all the reserved characters in {{va:r?i#a@b/le}}
        while ((match = RESERVED_CHARS.exec(variable)) !== null) {
            // absolute position of the reserved character
            // "Hello {{user:name}}!!!"
            //              ↑ (charAt = 12)
            charAt = start + match.index;

            // add the reserved character and its position to replacements array
            replacements.push({
                index: charAt,
                char: str[charAt]
            });

            // [pointer, charAt) string is normalized + the safe replacement character
            // "Hello " + "{{user" + "_"
            normalizedString += str.slice(pointer, charAt) + SAFE_REPLACE_CHAR;

            // update the pointer
            // "Hello {{user:name}}!!!"
            //               ↑ (pointer = 13)
            pointer = charAt + 1;
        }

        // [pointer, end) string is normalized
        // "Hello {{user_" + "name}}"
        normalizedString += str.slice(pointer, end);

        // update the pointer
        // "Hello {{user:name}}!!!"
        //                    ↑ (pointer = 19)
        pointer = end;
    }

    // whatever left in the string is normalized as well
    if (pointer < strLength) {
        // "Hello {{user_name}}" + "!!!"
        normalizedString += str.slice(pointer);
    }

    return normalizedString;
}

/**
 * Update replaced characters in the URL object with its original value.
 *
 * @private
 * @param {Object} url
 * @param {Array} replacements
 */
function applyReplacements (url, replacements) {
    var totalReplacements = replacements.length,
        replacementCounter = 0,
        replacementIndex,
        replacement,
        propertyName,
        propertyValue,
        valueSegment,
        beginIndex,
        endIndex,
        pointer,
        index,
        length,
        i,
        j,
        ii,
        jj;

    // traverse each URL property in the given order
    for (i = 0, ii = URL_PROPERTIES_ORDER.length; i < ii; ++i) {
        propertyName = URL_PROPERTIES_ORDER[i];

        // bail out if the given property is not set (undefined or '')
        if (!(url[propertyName] && url[propertyName].value)) {
            continue;
        }

        // indexes of the property value
        beginIndex = url[propertyName].beginIndex;
        endIndex = url[propertyName].endIndex;

        // for the given property, traverse until all its replacements are patched
        while (replacementCounter < totalReplacements) {
            propertyValue = url[propertyName].value;
            replacement = replacements[replacementCounter];
            replacementIndex = replacement.index;

            // bail out if the replacement index is not in the property range
            if (!(replacementIndex >= beginIndex && replacementIndex < endIndex)) {
                break;
            }

            // patch property value of type string
            if (typeof propertyValue === STRING) {
                // relative position in property value
                index = replacementIndex - beginIndex;
                url[propertyName].value = propertyValue.slice(0, index) +
                    replacement.char + propertyValue.slice(index + 1);

                // there might be more replacements needed for this property,
                // increment replacement counter and continue
                ++replacementCounter;
                continue;
            }


            // patch property value splitted into multiple segments
            j = 0;
            jj = propertyValue.length;
            // absolute position in the raw string
            pointer = beginIndex;

            // traverse until all the segments are patched
            while (j < jj && pointer < endIndex) {
                valueSegment = propertyValue[j];
                length = valueSegment.length;
                // update pointer position
                pointer += length;

                // move to next segment until replacementIndex is in the rage of
                // current segment
                if (replacementIndex > pointer) {
                    // next segment
                    ++j;
                    // update pointer because of the separator character
                    ++pointer;
                    continue;
                }

                // relative position in property value's segment
                index = length - (pointer - replacementIndex);
                propertyValue[j] = valueSegment.slice(0, index) +
                    replacement.char + valueSegment.slice(index + 1);

                // there might be more replacements needed for this segment,
                // reset the pointer to the beginning
                pointer -= length;

                // update replacement and continue
                if (++replacementCounter < totalReplacements) {
                    replacement = replacements[replacementCounter];
                    replacementIndex = replacement.index;
                    continue;
                }

                // bail out if no replacements are done for this property
                break;
            }
        }
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
            raw: { value: undefined, beginIndex: 0, endIndex: 0 },
            protocol: { value: undefined, beginIndex: 0, endIndex: 0 },
            auth: { value: undefined, beginIndex: 0, endIndex: 0 },
            host: { value: undefined, beginIndex: 0, endIndex: 0 },
            port: { value: undefined, beginIndex: 0, endIndex: 0 },
            path: { value: undefined, beginIndex: 0, endIndex: 0 },
            query: { value: undefined, beginIndex: 0, endIndex: 0 },
            hash: { value: undefined, beginIndex: 0, endIndex: 0 }
        },
        length = urlString.length,
        replacements = [],
        pointer = 0,
        index,
        port;

    // bail out if input string is empty
    if (!length) {
        return {
            raw: '',
            protocol: undefined,
            auth: undefined,
            host: undefined,
            port: undefined,
            path: undefined,
            query: undefined,
            hash: undefined
        };
    }

    // url.raw
    url.raw.value = urlString;
    url.raw.beginIndex = 0;
    url.raw.endIndex = length;

    // normalize URL string with {{variables}} by replacing the reserved
    // characters in variable name with a safe character
    urlString = normalizeVariables(urlString, replacements);

    // url.hash
    if ((index = urlString.indexOf(HASH_SEPARATOR)) !== -1) {
        // extract from the back
        url.hash.value = urlString.slice(index + 1);
        url.hash.beginIndex = pointer + index + 1;
        url.hash.endIndex = pointer + length;

        urlString = urlString.slice(0, (length = index));
    }

    // url.query
    if ((index = urlString.indexOf(QUERY_SEPARATOR)) !== -1) {
        // extract from the back
        url.query.value = urlString.slice(index + 1).split(QUERY_SEGMENTS_SEPARATOR);
        url.query.beginIndex = pointer + index + 1;
        url.query.endIndex = pointer + length;

        urlString = urlString.slice(0, (length = index));
    }

    // url.protocol
    if ((index = urlString.indexOf(PROTOCOL_SEPARATOR)) !== -1) {
        // extract from the front
        url.protocol.value = urlString.slice(0, index);
        url.protocol.beginIndex = pointer;
        url.protocol.endIndex = pointer + index;

        urlString = urlString.slice(index + 3);
        length -= index + 3;
        pointer += index + 3;
    }

    // url.path
    urlString = urlString.replace('\\', '/'); // sanitize path
    if ((index = urlString.indexOf(PATH_SEPARATOR)) !== -1) {
        // extract from the back
        url.path.value = urlString.slice(index + 1).split(PATH_SEPARATOR);
        url.path.beginIndex = pointer + index + 1;
        url.path.endIndex = pointer + length;

        urlString = urlString.slice(0, (length = index));
    }

    // url.auth
    if ((index = urlString.indexOf(AUTH_SEPARATOR)) !== -1) {
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

    // url.port
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

    // url.host
    if (urlString) {
        url.host.value = urlString.split(DOMAIN_SEPARATOR);
        url.host.beginIndex = pointer;
        url.host.endIndex = pointer + length;
    }

    // apply replacements back if present
    replacements.length && applyReplacements(url, replacements);

    return {
        raw: url.raw.value,
        protocol: url.protocol.value,
        auth: url.auth.value,
        host: url.host.value,
        port: url.port.value,
        path: url.path.value,
        query: url.query.value,
        hash: url.hash.value
    };
}

module.exports = parse;
