var _ = require('../util').lodash,
    marked = require('marked'),
    sanitizeHtml = require('sanitize-html'),
    escapeHtml = require('escape-html'),

    DEFAULT_MIMETYPE = 'text/plain',
    MARKDOWN_DEFAULT_OPTIONS = {
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
    },
    HTML_DEFAULT_OPTIONS = {
        allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'nl', 'li', 'b', 'i',
            'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td',
            'pre'],
        allowedAttributes: {
            a: ['href']
        }
    },

    Description;

// Set the default markdown options
marked.setOptions(MARKDOWN_DEFAULT_OPTIONS);

/**
 * This property provides a convenient way to represent the description of a Property.
 *
 * @param def {Object|String} Definition of this Description object
 * @constructor
 */
Description = function PostmanPropertyDescription (def) {
    // in case definition object is missing, there is no point moving forward
    if (!def) { return; }

    // if the definition is a string, it implies that this is a get of URL
    _.isString(def) && (def = {
        content: def,
        type: DEFAULT_MIMETYPE
    });

    /**
     * The raw content of the description
     *
     * @type {String}
     * @lends Description.prototype
     */
    this.content = def.content;
    /**
     * The mime-type of the description.
     *
     * @type {String}
     * @lends Description.prototype
     */
    this.type = def.type || DEFAULT_MIMETYPE;
    /**
     * A description can have multiple versions associated with it.
     *
     * @private
     * @type {*}
     * @lends Description.prototype
     */
    this.version = def.version;
};

_.extend(Description.prototype, /** @lends Description.prototype */ {

    /**
     * Processes the Description with the appropriate formatter as defined by {@link Description.type}
     *
     * @returns {String}
     */
    toString: function () {
        var formatter = Description.format[_.isString(this.type) && this.type.toLowerCase()];
        return formatter ? formatter(this.content) : escapeHtml(this.content);
    }
});

_.extend(Description, /** @lends Description */ {
    /**
     * The default and supported description format handlers.
     * @readOnly
     * @enum {Function}
     */
    format: {
        /**
         * Escapes HTML characters in the description content, and returns the result.
         *
         * @param content
         * @returns {String}
         */
        'text/plain': function (content) {
            return escapeHtml(content); // do not allow HTML
        },

        /**
         * Returns HTML string generated after rendering raw markdown.
         *
         * @param content
         * @returns {String}
         */
        'text/markdown': function (content) {
            return marked(content); // it is sanitised html anyway!
        },

        /**
         * Removes blacklisted HTML tags from the Description.
         *
         * @param content
         * @returns {String}
         */
        'text/html': function (content) {
            return sanitizeHtml(content, HTML_DEFAULT_OPTIONS);
        }
    }
});

module.exports = {
    Description: Description
};
