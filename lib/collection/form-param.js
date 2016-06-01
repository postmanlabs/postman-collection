var _ = require('../util').lodash,
    Property = require('./property').Property,

    FormParam;

/**
 * @typedef FormParam~definition
 * @property {String} key The name ("key") of the form data parameter.
 * @property {String} value The value of the parameter.
 * @example <caption>Constructing an event</caption>
 * var Event = require('postman-collection').Event,
 *     rawEvent = {
 *         listen: 'test',
 *         script: 'tests["response code is 401"] = responseCode.code === 401'
 *     },
 *     myEvent;
 * myEvent = new Event(rawEvent);
 */
_.inherit((
    /**
     * Represents a Form Data parameter, which can exist in request body.
     * @constructor
     *
     * @param {FormParam~definition} options Pass the initial definition of the form data parameter.
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
     * @todo implement this, not implemented yet.
     * @param formdata {String}
     * @returns {Array}
     */
    parse: function (/* formdata */) {}
});

module.exports = {
    FormParam: FormParam
};
