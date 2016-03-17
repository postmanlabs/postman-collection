var _ = require('../util').lodash,
    Property = require('./property').Property,

    FormParam;

_.inherit((
    /**
     * Represents a Form Data parameter, which can exist in request body.
     * @constructor
     *
     * @param {Object|String} options Pass the initial definition of the form data parameter (key, value) as the
     *                        options parameter.
     */
    FormParam = function PostmanFormParam (options) {
        this.key = _.get(options, 'key') || '';
        this.value = _.get(options, 'value') || '';
    }), Property);

_.extend(FormParam.prototype, /** @lends FormParam.prototype */ {
    /**
     * Converts the FormParameter to a single param string
     * @returns {String}
     */
    toString: function () {
        return this.key + '=' + this.value;
    }
});

_.extend(FormParam, /** @lends FormParam */ {

    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'FormParam',

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
