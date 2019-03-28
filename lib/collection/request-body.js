var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,
    PropertyList = require('./property-list').PropertyList,
    VariableList = require('./variable-list').VariableList,
    QueryParam = require('./query-param').QueryParam,
    FormParam = require('./form-param').FormParam,

    RequestBody,

    EMPTY = '';

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

_.assign(RequestBody.prototype, /** @lends RequestBody.prototype */ {
    /**
     * Set the content of this request data
     *
     * @param {Object} options
     */
    update: function (options) {
        _.isString(options) && (options = { mode: 'raw', raw: options });
        if (!options.mode) { return; } // need a valid mode @todo raise error?

        var mode = RequestBody.MODES[options.mode.toString().toLowerCase()] || RequestBody.MODES.raw,
            urlencoded = options.urlencoded,
            transform = options.transform,
            formdata = options.formdata,
            file = options.file,
            raw = options.raw;

        // Handle URL Encoded data
        if (options.urlencoded) {
            _.isString(options.urlencoded) && (urlencoded = QueryParam.parse(options.urlencoded));
            urlencoded = new PropertyList(QueryParam, this, urlencoded);
        }

        // Handle Form data
        if (options.formdata) {
            formdata = new PropertyList(FormParam, this, formdata);
        }

        // Handle File
        if (_.isString(options.file)) {
            // @todo Variable#type file ?
            file = { src: options.file };
        }

        // Handle Transform mode data
        // @todo add tests
        if (options.transform) {
            transform = {
                // @todo bail out if type is empty?
                type: transform.type,
                version: transform.version,
                content: transform.content || EMPTY,
                params: transform.params || {},
                // @todo add Variable#type `file`
                resources: new VariableList(this, transform.resources || [])
            };
        }

        // If mode is raw but options does not give raw content, set it to empty string
        (mode === RequestBody.MODES.raw && !raw) && (raw = '');

        // If mode is urlencoded but options does not provide any content, set it to an empty property list
        (mode === RequestBody.MODES.urlencoded && !urlencoded) && (urlencoded = new PropertyList(QueryParam, this, []));

        // If mode is urlencoded but options does not provide any content, set it to an empty property list
        (mode === RequestBody.MODES.formdata && !formdata) && (formdata = new PropertyList(FormParam, this, []));

        _.assign(this, /** @lends RequestBody.prototype */ {

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
            formdata: formdata,

            /**
             * Holds a reference to a file which should be read as the RequestBody. It can be a file path (when used
             * with Node) or a unique ID (when used with the browser).
             *
             * @note The reference stored here should be resolved by a resolver function (which should be provided to
             * the Postman Runtime).
             */
            file: file,

            /**
             * Transform data properties for this request are held in this field.
             *
             * @type {Object}
             */
            transform: transform,

            /**
             * Indicates whether to include body in request or not.
             *
             * @type {Boolean}
             */
            disabled: options.disabled
        });
    },

    /**
     * Stringifies and returns the request body.
     *
     * @note FormData is not supported yet.
     * @returns {*}
     */
    toString: function () {
        // Formdata. Goodluck.
        if (this.mode === RequestBody.MODES.formdata || this.mode === RequestBody.MODES.file) {
            // @todo formdata structure is predictable (boundary, part headers)
            // @todo for files, clone ReadStream?
            return EMPTY;
        }
        // Transform. @formdata Am I a Joke To You? (;-_-)
        if (this.mode === RequestBody.MODES.transform) {
            return EMPTY;
        }
        if (this.mode === RequestBody.MODES.urlencoded) {
            return PropertyList.isPropertyList(this.urlencoded) ? QueryParam.unparse(this.urlencoded.all()) :
                ((this.urlencoded && _.isFunction(this.urlencoded.toString)) ? this.urlencoded.toString() : EMPTY);
        }

        if (this.mode === RequestBody.MODES.raw) {
            return (this.raw && _.isFunction(this.raw.toString)) ? this.raw.toString() : EMPTY;
        }
        return EMPTY;
    },

    /**
     * If the request body is set to a mode, but does not contain data, then we should not be sending it.
     *
     * @returns {Boolean}
     */
    isEmpty: function () {
        var mode = this.mode,
            data = mode && this[mode];

        // Handle file mode.
        if (mode === RequestBody.MODES.file) {
            return !(data && (data.src || data.content));
        }

        // Handle transform mode.
        if (mode === RequestBody.MODES.transform) {
            return !(data && data.type);
        }

        return !data || !(_.isString(data) ? data.length : (_.isFunction(data.count) && data.count()));
    }
});

_.assign(RequestBody, /** @lends RequestBody **/{
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
        file: 'file',
        formdata: 'formdata',
        raw: 'raw',
        transform: 'transform',
        urlencoded: 'urlencoded'
    }
});

module.exports = {
    RequestBody: RequestBody
};
