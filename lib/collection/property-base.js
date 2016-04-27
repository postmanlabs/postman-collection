var _ = require('../util').lodash,
    Description = require('./description').Description,

    PropertyBase; // constructor

/**
 * @typedef PropertyBase~definition
 * @property {String|Description} [description]
 */
/**
 * Base of all properties in Postman Collection. It defines the root for all standalone properties for postman
 * collection.
 * @constructor
 * @private
 *
 * @param {PropertyBase~definition} definition
 */
PropertyBase = function PropertyBase (definition) {
    // In case definition object is missing, there is no point moving forward. Also if the definition is basic string
    // we do not need to do anything with it.
    if (!definition || typeof definition === 'string') { return; }

    // call the meta extraction functions to create the object where all keys that are prefixed with underscore can be
    // stored. more details on that can be retrieved from the propertyExtractMeta function itself.
    // @todo: make this a closed function to do getter and setter which is non enumerable
    var meta = _(definition && definition.info || definition)
        .pick(PropertyBase.propertyIsMeta).mapKeys(PropertyBase.propertyUnprefixMeta).value();

    _.merge(this, /** @lends PropertyBase.prototype */ {
        /**
         * The `description` property holds the detailed documentation of any property. The description can be written
         * in plain text, html or markdown as mentioned in {@link Description.format} enumeration. It is recommended
         * that this property be updated using the [describe](#describe) function.
         *
         * @type {Description}
         * @see Property#describe
         *
         * @example <caption>Accessing descriptions of all root items in a collection</caption>
         * var fs = require('fs'), // needed to read JSON file from disk
         *     Collection = require('postman-collection').Collection,
         *     myCollection;
         *
         * // Load a collection to memory from a JSON file on disk (say, sample-collection.json)
         * myCollection = new Collection(JSON.stringify(fs.readFileSync('sample-collection.json').toString()));
         *
         * // Log the description of all root items
         * myCollection.item.all().forEach(function (item) {
         *     console.log(item.name || 'Untitled Item');
         *     item.description && console.log(item.description.toString());
         * });
         */
        description: _.createDefined(definition, 'description', Description)
    });

    _.keys(meta).length && (this._ = meta);
};

_.extend(PropertyBase.prototype, /** @lends PropertyBase.prototype */ {

    /**
     * Returns the JSON representation of a property, which conforms to the way it is defined in a collection.
     * You can use this method to get the instantaneous representation of any property, including a {@link Collection}.
     */
    toJSON: function () {
        return _.reduce(this, function (accumulator, value, key) {
            if (value === undefined) { // true/false/null need to be preserved.
                return accumulator;
            }

            // Handle plurality of PropertyLists in the SDK vs the exported JSON.
            // Basically, removes the trailing "s" from key if the value is a property list.
            if (value && value._postman_propertyIsList && _.endsWith(key, 's')) {
                key = key.slice(0, -1);
            }

            // Handle 'PropertyBase's
            if (value && _.isFunction(value.toJSON)) {
                accumulator[key] = value.toJSON();
                return accumulator;
            }

            // Handle Strings
            if (_.isString(value)) {
                accumulator[key] = value;
                return accumulator;
            }

            // Everything else
            accumulator[key] = _.cloneElement(value);
            return accumulator;
        }, {});
    }
});

_.extend(PropertyBase, /** @lends Base */  {

    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'PropertyBase',

    /**
     * Filter function to check whether a key starts with underscore or not. These usually are the meta properties. It
     * returns `true` if the criteria is matched.
     *
     * @param {*} value
     * @param {String} key
     *
     * @returns {boolean}
     */
    propertyIsMeta: function (value, key) {
        return _.startsWith(key, '_') && (key !== '_');
    },

    /**
     * Map function that removes the underscore prefix from an object key.
     *
     * @param {*} value
     * @param {String} key
     *
     * @returns {String}
     */
    propertyUnprefixMeta: function (value, key) {
        return _.trimLeft(key, '_');
    }
});

module.exports = {
    PropertyBase: PropertyBase
};
