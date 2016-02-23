var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,
    PropertyList = require('./property-list').PropertyList,
    QueryParam = require('./query-param').QueryParam,
    FormParam = require('./form-param').FormParam,

    RequestData;

_.inherit((
    /**
     * RequestData holds data related to the request body. By default, it provides a nice wrapper for url-encoded,
     * form-data, and raw types of request bodies.
     *
     * @constructor
     * @extends {PropertyBase}
     *
     * @param {Object} options
     */
    RequestData = function PostmanRequestData (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        RequestData.super_.apply(this, arguments);
        if (!options) { return; } // in case definition object is missing, there is no point moving forward

        this.update(options);
    }), PropertyBase);

_.extend(RequestData.prototype, /** @lends RequestData.prototype */ {
    /**
     * Set the content of this request data
     *
     * @param options
     */
    update: function (options) {
        if (!options.mode) { return; } // need a valid mode @todo raise error?

        var mode = RequestData.MODES[options.mode.toString().toLowerCase()] || RequestData.MODES.raw,
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
        (mode === RequestData.MODES.raw && !raw) && (raw = '');

        _.extend(this, /** @lends RequestData.prototype */ {

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

    toJSON: function () {
        var json = {};

        _.forOwn(this, function (value, key) {
            value = PropertyList.isPropertyList(value) ? value.map(function (param) {
                return _.clone(param);
            }) : value;
            value && (json[key] = value);
        });
        return json;
    },

    toString: function () {
        if (this.mode === RequestData.MODES.raw) {
            return this.raw.toString();
        }

        if (this.mode === RequestData.MODES.urlencoded) {
            return PropertyList.isPropertyList(this.urlencoded) ? QueryParam.unparse(this.urlencoded.all()) :
                this.urlencoded;
        }

        // Formdata. Goodluck.
        throw new Error('Form data stringification is not implemented yet.');
    }
});

_.extend(RequestData, /** @lends RequestData **/{
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
    RequestData: RequestData
};
