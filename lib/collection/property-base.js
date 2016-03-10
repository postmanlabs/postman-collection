var _ = require('../util').lodash,
    Description = require('./description').Description,
    PropertyList = require('./property-list').PropertyList,

    PropertyBase; // constructor

/**
 * Base of all properties in Postman Collection. It defines the root for all standalone properties for postman
 * collection. It expects a property definition as parameter and the base is primarily interested in
 * - property names that start with underscore.
 * @constructor
 * @private
 *
 * @param {Object} options
 */
PropertyBase = function PropertyBase (options) {
    // In case definition object is missing, there is no point moving forward. Also if the definition is basic string
    // we do not need to do anything with it.
    if (!options || typeof options === 'string') { return; }

    // call the meta extraction functions to create the object where all keys that are prefixed with underscore can be
    // stored. more details on that can be retrieved from the propertyExtractMeta function itself.
    // @todo: make this a closed function to do getter and setter which is non enumerable
    var meta = _(options && options.info || options)
        .pick(PropertyBase.propertyIsMeta).mapKeys(PropertyBase.propertyUnprefixMeta).value();

    _.merge(this, /** @lends PropertyBase.prototype */ {
        /**
         * A detailed description of this property. The description can be written in plain text, html or markdown as
         * mentioned in {@link Description}.format enumeration.
         * @type {Description}
         */
        description: _.createDefined(options, 'description', Description)
    });

    _.keys(meta).length && (this._ = meta);
};

_.extend(PropertyBase.prototype, {
    toJSON: function () {
        return _.reduce(this, function (accumulator, value, key) {
            if (value === undefined) { // true/false/null need to be preserved.
                return accumulator;
            }

            // Handle plurality of PropertyLists in the SDK vs the exported JSON.
            // Basically, removes the trailing "s" from key if the value is a property list.
            if (PropertyList.isPropertyList(value) && _.endsWith(key, 's')) {
                key = key.slice(0, -1);
            }

            // Handle 'Property's
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
            accumulator[key] = _.clone(value);
            return accumulator;
        }, {});
    }
});

_.extend(PropertyBase, /** @lends Base */  {
    /**
     * Filter funcion to check whether a key starts with underscore or not. These usually are the meta properties. It
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
