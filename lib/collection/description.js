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
 * This is one of the properties that are (if provided) processed by all other properties. Any property can have an
 * instance of `Description` property assigned to it with the key name `description` and it should be treated as
 * something that "describes" the property within which it belongs. Usually this property is used to generate
 * documentatation and other contextual information for a property in a Collection.
 * @constructor
 *
 * @param def {Object|String} Definition of this Description object
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
Description = function PostmanPropertyDescription (def) {
    // if the definition is a string, it implies that this is a get of URL
    _.isString(def) && (def = {
        content: def,
        type: DEFAULT_MIMETYPE
    });

    // in case definition object is missing, there is no point moving forward
    if (!def) { return; }

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
     * Updates the content of this description property.
     *
     * @param {String} content
     * @param {type=} [type]
     */
    update: function (content, type) {
        this.content = content;
        type && (this.type = type);
        !this.type && (this.type = DEFAULT_MIMETYPE);
    },

    /**
     * Processes the Description with the appropriate formatter as defined by {@link Description.type}
     *
     * @returns {String}
     */
    toString: function () {
        var formatter = Description.format[_.isString(this.type) && this.type.toLowerCase()];
        return formatter ? formatter(this.content) : escapeHtml(this.content);
    },

    /**
     * Creates a JSON representation of the Description (as a plain Javascript object).
     *
     * @returns {{content: *, type: *, version: (string|*|string)}}
     */
    toJSON: function () {
        var version = this.version;
        if (_.isObject(version)) {
            version = _.clone(version);
        }
        else {
            version = version && version.toString ? version.toString() : version;
        }

        return {
            content: this.content,
            type: this.type,
            version: version
        };
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
    },

    /**
     * Checks whether a property is an instance of Description object.
     *
     * @param {*} prop
     * @returns {Boolean}
     */
    isDescription: function (prop) {
        return prop instanceof Description;
    }
});

module.exports = {
    Description: Description
};
