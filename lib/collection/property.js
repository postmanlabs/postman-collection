var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,
    Version = require('./version').Version,

    Property; // constructor

_.inherit((
    /**
     * This forms the base of properties **that are identifiable**. Identifiable implies that it expects the following
     * in property definition parameter
     * - id
     * - name
     * - version
     * - description
     * @constructor
     * @extends {PropertyBase}
     *
     * @param {Object} options
     */
    Property = function PostmanProperty (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        Property.super_.apply(this, arguments);
        if (!options) { return; } // in case definition object is missing, there is no point moving forward

        // The definition can have an `info` object that stores the identification of this property. If that is present,
        // we use it instead of the definition root.
        var src = options.info || options,
            version = (options.info && options.info.version) ? new Version(options.info.version) : undefined;

        _.merge(this, /** @lends Property.prototype */ {
            /*jshint -W069 */
            // @todo: this is not a good way to create id if duplication check is required. decide.
            /**
             * Store the id of this property.
             *
             * @note The property can also be present in the `postman_id` meta in case it is not specified in the
             * object. An auto-generated property is used wherever one is not specified
             * @type {String}
             */
            id: src.id || (this._ ? this._['postman_id'] : undefined),
            /*jshint +W069 */
            /**
             * Name of the property
             * @type {String}
             */
            name: src.name,
            /**
             * A flag for properties that can be disabled when put within a list
             * @type {Boolean}
             */
            disabled: (options && _.has(options, 'disabled')) ? !!options.disabled : undefined,

            /**
             * If a version exists in an info block, it is set here
             * @type {*}
             */
            version: version
        });
    }), PropertyBase);

module.exports = {
    Property: Property
};
