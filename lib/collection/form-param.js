var _ = require('../util').lodash,

    FormParam;

/**
 * Represents a Form Data parameter, which can exist in request body.
 * @constructor
 *
 * @param {Object|String} options Pass the initial definition of the form data parameter (key, value) as the
 *                        options parameter.
 */
FormParam = function PostmanFormParam (options) {
    this.key = options.key || '';
    this.value = options.value || '';
};

_.extend(FormParam.prototype, /** @lends FormParam.prototype */ {
    /**
     * Converts the FormParameter to a single param string
     * @returns {String}
     */
    toString: function () {
        return this.key + '=' + this.value;
    },

    toJSON: function () {
        return { key: this.key, value: this.value };
    }
});

_.extend(FormParam, /** @lends FormParam */ {

    /**
     * Parse a form data string into an array of objects, where each object contains a key and a value.
     *
     * @param query {String}
     * @returns {Array}
     */
    parse: function (/* query */) {
        throw new Error('Not implemented.');
    }
});

module.exports = {
    FormParam: FormParam
};
