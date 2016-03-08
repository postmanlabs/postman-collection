var _ = require('../util').lodash,
    uuid = require('node-uuid'),
    PropertyBase = require('./property-base').PropertyBase,
    Description = require('./description').Description,
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
            /**
             * The `id` of the property is a unique string that identifies this property and can be used to refer to
             * this property from relevant other places. It is a good practice to define the id or let the system
             * auto generate a UUID if one is not defined for properties that require an `id`.
             * @type {String}
             *
             * @note The property can also be present in the `postman_id` meta in case it is not specified in the
             * object. An auto-generated property is used wherever one is not specified
             */
            id: src.id || (this._ ? this._['postman_id'] : undefined),
            /*jshint +W069 */
            /**
             * A property can have a distinctive and human-readable name. This is to be used to display the name of the
             * property within Postman, Newman or other runtimes that consume collection. In certain cases, the absence
             * of name might cause the runtime to use the `id` as a fallback.
             *
             * @type {String}
             */
            name: src.name,
            /**
             * This (optional) flag denotes whether this property is disabled or not. Usually, this is helpful when a
             * property is part of a {@link PropertyList}. For example, in a PropertyList of {@link Header}s, the ones
             * that are disabled can be filtered out and not processed.
             * @type {Boolean}
             * @optional
             */
            disabled: (options && _.has(options, 'disabled')) ? !!options.disabled : undefined,

            /**
             * The (optional) version of this property, expressed in [semver](http://semver.org/) format.
             * @type {Version}
             * @optional
             */
            version: version
        });

        // @todo: this is not a good way to create id if duplication check is required. decide.
        // If this property is marked to require an ID, we generate one if not found.
        this._postman_requiresId && !this.id && (this.id = uuid.v4());
    }), PropertyBase);

_.extend(Property.prototype, /** @lends Property.prototype */ {
    toJSON: function () {
        return _.reduce(this, function (accumulator, value, key) {
            if (!value) {
                return accumulator;
            }

            // Handle 'Property's
            if (_.isFunction(value.toJSON)) {
                accumulator[key] = value.toJSON();
                return accumulator;
            }

            // Handle Strings
            if (_.isString(value)) {
                accumulator[key] = value;
                return accumulator;
            }

            // Everything else
            accumulator[key] = _.clone(value);
            return accumulator;
        }, {});
    },

    /**
     * This function allows to describe the property for the purpose of detailed identification or documentation
     * generation. This function sets or updates the `description` child-property of this property.
     *
     * @param {String} content The content of the description can be provided here as a string. Note that it is expected
     * that if the content is formatted in any other way than simple text, it should be specified in the subsequent
     * `type` parameter.
     * @param {String=} [type="text/plain"] The type of the content can be one of the values mentioned in
     * {@link Description.format} enumeration - namely `text/plain`, `text/markdown` or `text/html`.
     *
     * @example <caption>Add a description to an instance of Collection</caption>
     *  var Collection = require('postman-collection').Collection,
     *     mycollection;
     *
     * // create a blank collection
     * myCollection = new Collection();
     * myCollection.describe('Hey! This is a cool collection.');
     *
     * console.log(myCollection.description.toString()); // read the description
     */
    describe: function (content, type) {
        (Description.isDescription(this.description) ? this.description : (this.description = new Description()))
            .update(content, type);
    }
});

module.exports = {
    Property: Property
};
