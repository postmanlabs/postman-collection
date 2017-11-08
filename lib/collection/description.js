var _ = require('../util').lodash,
    marked = require('8fold-marked'),
    sanitizeHtml = require('sanitize-html'),
    escapeHtml = require('escape-html'),

    E = '',
    DEFAULT_MIMETYPE = 'text/plain',
    MARKDOWN_DEFAULT_OPTIONS = {
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false
    },
    HTML_DEFAULT_OPTIONS = {
        allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'nl', 'li', 'b', 'i',
            'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td',
            'pre', 'img', 'abbr', 'address', 'section', 'article', 'aside', 'dd', 'dl', 'dt', 'tfoot'],
        allowedAttributes: {
            a: ['href'],
            img: ['src', 'width', 'height', 'alt'],
            td: ['align'],
            th: ['align']
        }
    },

    Description;

// Set the default markdown options
marked.setOptions(MARKDOWN_DEFAULT_OPTIONS);

/**
 * @typedef Description~definition
 * @property {String} content
 * @property {String} format
 */
/**
 * This is one of the properties that are (if provided) processed by all other properties. Any property can have an
 * instance of `Description` property assigned to it with the key name `description` and it should be treated as
 * something that "describes" the property within which it belongs. Usually this property is used to generate
 * documentation and other contextual information for a property in a Collection.
 *
 * @constructor
 *
 * @param {Description~definition|String} [definition] The content of the description can be passed as a string when it
 * is in `text/plain` format or otherwise be sent as part of an object adhering to the {@link Description~definition}
 * structure having `content` and `format`.
 *
 * @example <caption>Add a description to an instance of Collection</caption>
 *  var SDK = require('postman-collection'),
 *     Collection = SDK.Collection,
 *     Description = SDK.Description,
 *     mycollection;
 *
 * // create a blank collection
 * myCollection = new Collection();
 * myCollection.description = new Description({
 *     content: '&lt;h1&gt;Hello World&lt;/h1&gt;&lt;p&gt;I am a Collection&lt;/p&gt;',
 *     type: 'text/html'
 * });
 *
 * // alternatively, you could also use the `.describe` method of any property to set or update the description of the
 * // property.
 * myCollection.describe('Hey! This is a cool collection.');
 */
Description = function PostmanPropertyDescription (definition) {
    // if the definition is a string, it implies that this is a get of URL
    _.isString(definition) && (definition = {
        content: definition,
        type: DEFAULT_MIMETYPE
    });

    // populate the description
    definition && this.update(definition);
};

_.assign(Description.prototype, /** @lends Description.prototype */ {
    /**
     * Updates the content of this description property.
     *
     * @param {String|Description~definition} content
     * @param {String=} [type]
     * @todo parse version of description
     */
    update: function (content, type) {
        _.isObject(content) && ((type = content.type), (content = content.content));
        _.assign(this, /** @lends Description.prototype */ {
            /**
             * The raw content of the description
             *
             * @type {String}
             */
            content: content,

            /**
             * The mime-type of the description.
             *
             * @type {String}
             */
            type: type || DEFAULT_MIMETYPE
        });
    },

    /**
     * Processes the Description with the appropriate formatter as defined by {@link Description.type}
     *
     * @returns {String}
     */
    toString: function () {
        var formatter = Description.format[_.isString(this.type) && this.type.toLowerCase()];
        return (formatter ? formatter : escapeHtml)(this.content || E);
    },

    /**
     * Creates a JSON representation of the Description (as a plain Javascript object).
     *
     * @returns {{content: *, type: *, version: (string|*|string)}}
     */
    toJSON: function () {
        return {
            content: this.content,
            type: this.type
        };
    }
});

_.assign(Description, /** @lends Description */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'Description',

    /**
     * The default and supported description format handlers.
     * @readOnly
     * @enum {Function}
     */
    format: {
        /**
         * Escapes HTML characters in the description content, and returns the result.
         *
         * @param {String} content
         * @returns {String}
         */
        'text/plain': function (content) {
            return escapeHtml(content); // do not allow HTML
        },

        /**
         * Returns HTML string generated after rendering raw markdown.
         *
         * @param {String} content
         * @returns {String}
         */
        'text/markdown': function (content) {
            return sanitizeHtml(marked(content));
        },

        /**
         * Removes blacklisted HTML tags from the Description.
         *
         * @param {String} content
         * @returns {String}
         */
        'text/html': function (content) {
            return sanitizeHtml(content, HTML_DEFAULT_OPTIONS);
        }
    },

    /**
     * Checks whether a property is an instance of Description object.
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isDescription: function (obj) {
        return Boolean(obj) && ((obj instanceof Description) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', Description._postman_propertyName));
    }
});

module.exports = {
    Description: Description
};
