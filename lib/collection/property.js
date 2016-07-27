var _ = require('../util').lodash,
    uuid = require('node-uuid'),
    PropertyBase = require('./property-base').PropertyBase,
    Description = require('./description').Description,
    Substitutor = require('../superstring').Substitutor,

    Property; // constructor

/**
 * @typedef Property~definition
 * @property {String=} [id]
 * @property {String=} [name]
 * @property {Boolean=} [disabled]
 */
_.inherit((
    /**
     * The Property class forms the base of all postman collection SDK elements. This is to be used only for SDK
     * development or to extend the SDK with additional functionalities. All SDK classes (constructors) that are
     * supposed to be identifyable (i.e. ones that can have a `name` and `id`) are derived from this class.
     *
     * For more information on what is the structure of the `definition` the function parameter, have a look at
     * {@link Property~definition}.
     *
     * > This is intended to be a private class except for those who want to extend the SDK itself and add more
     * > functionalities.
     *
     * @constructor
     * @extends {PropertyBase}
     *
     * @param {Property~definition=} [definition] Every constructor inherited from `Property` is required to call the
     * super constructor function. This implies that construction parameters of every inherited member is propagated
     * to be sent up to this point.
     *
     * @see Property~definition
     */
    Property = function PostmanProperty (definition) {
        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        Property.super_.apply(this, arguments);

        // The definition can have an `info` object that stores the identification of this property. If that is present,
        // we use it instead of the definition root.
        var src = definition && definition.info || definition;

        src && _.extend(this, /** @lends Property.prototype */ {
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
            disabled: (definition && _.has(definition, 'disabled')) ? !!definition.disabled : undefined
        });

        // @todo: this is not a good way to create id if duplication check is required. decide.
        // If this property is marked to require an ID, we generate one if not found.
        this._postman_requiresId && !this.id && (this.id = uuid.v4());
    }), PropertyBase);

_.extend(Property.prototype, /** @lends Property.prototype */ {
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
    },

    /**
     * Returns an object representation of the Property with its variable references substituted.
     * @private
     * @draft
     *
     * @param {?VariableList=} [variables] - One can specifically provide a VariableList for doing the substitution. In
     * the event one is not provided, the variables are taken from this object or one from the parent tree.
     * @param {Array<Object>} overrides - additional objects to lookup for variable values
     * @returns {Object|undefined}
     *
     * @throws {Error} If `variables` cannot be resolved up the parent chain.
     */
    toObjectResolved: function (variables, overrides) {
        var variableSourceObj = this;

        // We see if variables can be found in this object itself.
        !variables && (variables = variableSourceObj.variables);

        // We then check if variables can be procured from the parent tree
        while ((variableSourceObj = variableSourceObj.__parent)) {
            variables = variableSourceObj.variables;
        }

        if (!variables) { // worst case = no variable param and none detected in tree or object
            throw Error('Unable to resolve variables. Require a List type property for variable auto resolution.');
        }

        return variables ? variables.substitute(this.toJSON(), overrides) : undefined;
    }
});

_.extend(Property, /** @lends Property */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'Property',

    /**
     * This function accepts a string followed by a number of variable sources as arguments. One or more variable
     * sources can be provided and it will use the one that has the value in left-to-right order.
     *
     * @param {String} str
     * @param {VariableList|Object|Array.<VariableList|Object>} variables
     * @returns {String}
     */
    // @todo: improve algorithm via variable replacement caching
    replaceSubstitutions: function (str, variables) {
        // if there is nothing to replace, we move on
        if (!(str && _.isString(str))) { return str; }

        // if variables object is not an instance of substitutor then ensure that it is an array so that it becomes
        // compatible with the constructor arguments for a substitutor
        !Substitutor.isInstance(variables) && !_.isArray(variables) && (variables = _.tail(arguments));
        return Substitutor.box(variables, Substitutor.DEFAULT_VARS).parse(str).toString();
    },

    /**
     * This function accepts an object followed by a number of variable sources as arguments. One or more variable
     * sources can be provided and it will use the one that has the value in left-to-right order.
     *
     * @param {Object} obj
     * @param {Array.<VariableList|Object>} variables
     * @param {Boolean=} [mutate=false]
     * @returns {Object}
     */
    replaceSubstitutionsIn: function (obj, variables, mutate) {
        // if there is nothing to replace, we move on
        if (!(obj && _.isObject(obj))) {
            return obj;
        }

        // convert the variables to a substitutor object (will not reconvert if already substitutor)
        variables = Substitutor.box(variables, Substitutor.DEFAULT_VARS);

        return _.merge(mutate ? obj : {}, obj, function (objectValue, sourceValue) {
            return _.isString(sourceValue) ?  this.replaceSubstitutions(sourceValue, variables) : undefined;
        }, this);
    }
});

module.exports = {
    Property: Property
};
