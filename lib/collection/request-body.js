var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,
    PropertyList = require('./property-list').PropertyList,
    QueryParam = require('./query-param').QueryParam,
    FormParam = require('./form-param').FormParam,

    RequestBody;

_.inherit((
    /**
     * RequestBody holds data related to the request body. By default, it provides a nice wrapper for url-encoded,
     * form-data, and raw types of request bodies.
     *
     * @constructor
     * @extends {PropertyBase}
     *
     * @param {Object} options
     */
    RequestBody = function PostmanRequestBody (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        RequestBody.super_.apply(this, arguments);
        if (!options) { return; } // in case definition object is missing, there is no point moving forward

        this.update(options);
    }), PropertyBase);

_.extend(RequestBody.prototype, /** @lends RequestBody.prototype */ {
    /**
     * Set the content of this request data
     *
     * @param options
     */
    update: function (options) {
        if (!options.mode) { return; } // need a valid mode @todo raise error?

        var mode = RequestBody.MODES[options.mode.toString().toLowerCase()] || RequestBody.MODES.raw,
            raw = options.raw,
            urlencoded = options.urlencoded,
            formdata = options.formdata;

        // Handle URL Encoded data
        if (options.urlencoded) {
            _.isString(options.urlencoded) && (urlencoded = QueryParam.parse(options.urlencoded));
            urlencoded = urlencoded ? new PropertyList(QueryParam, this, urlencoded) : undefined;
        }

        // Handle Form data
        if (options.formdata) {
            if (!_.isArray(options.formdata)) {
                throw new Error('Form data must be an array.');
            }
            formdata = formdata ? new PropertyList(FormParam, this, options.formdata) : undefined;
        }

        // If mode is raw but options does not give raw content, set it to empty string
        (mode === RequestBody.MODES.raw && !raw) && (raw = '');

        _.extend(this, /** @lends RequestBody.prototype */ {

            /**
             * Indicates the type of request data to use.
             *
             * @type {String}
             */
            mode: mode,

            /**
             * If the request has raw body data associated with it, the data is held in this field.
             *
             * @type {String}
             */
            raw: raw,

            /**
             * Any URL encoded body params go here.
             *
             * @type {PropertyList<QueryParam>}
             */
            urlencoded: urlencoded,

            /**
             * Form data parameters for this request are held in this field.
             *
             * @type {PropertyList<FormParam>}
             */
            formdata: formdata
        });
    },

    toString: function () {
        if (this.mode === RequestBody.MODES.raw) {
            return this.raw.toString();
        }

        if (this.mode === RequestBody.MODES.urlencoded) {
            return PropertyList.isPropertyList(this.urlencoded) ? QueryParam.unparse(this.urlencoded.all()) :
                this.urlencoded;
        }

        // Formdata. Goodluck.
        if (this.mode === RequestBody.MODES.formdata) {
            // @todo: implement this
        }
    }
});

_.extend(RequestBody, /** @lends RequestBody **/{
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'RequestBody',

    /**
     * @enum {string} MODES
     */
    MODES: {
        raw: 'raw',
        formdata: 'formdata',
        urlencoded: 'urlencoded'
    }
});

module.exports = {
    RequestBody: RequestBody
};
