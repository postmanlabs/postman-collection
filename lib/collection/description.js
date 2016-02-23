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

Description = function PostmanPropertyDescription (def) {
    // in case definition object is missing, there is no point moving forward
    if (!def) { return; }

    // if the definition is a string, it implies that this is a get of URL
    _.isString(def) && (def = {
        content: def,
        type: DEFAULT_MIMETYPE
    });

    this.content = def.content;
    this.type = def.type || DEFAULT_MIMETYPE;
    this.version = def.version;
};

_.extend(Description.prototype, /** @lends Description.prototype */ {
    toString: function () {
        var formatter = Description.format[_.isString(this.type) && this.type.toLowerCase()];
        return formatter ? formatter(this.content) : escapeHtml(this.content);
    },

    toJSON: function () {
        var version = this.version;
        if (_.isObject(version)) {
            version = _.clone(version);
        }
        else {
            version = version.toString ? version.toString() : version;
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
     * Stores all the formatters
     * @private
     *
     * @type {Object<function>}
     */
    format: {
        'text/plain': function (content) {
            return escapeHtml(content); // do not allow HTML
        },

        'text/markdown': function (content) {
            return marked(content); // it is sanitised html anyway!
        },

        'text/html': function (content) {
            return sanitizeHtml(content, HTML_DEFAULT_OPTIONS);
        }
    }
});

module.exports = {
    Description: Description
};
