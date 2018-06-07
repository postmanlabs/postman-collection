var _ = require('../util').lodash,
    Property = require('./property').Property,

    /**
     * @private
     * @const
     * @type {Object}
     */
    INSTRUCTION = {
        SET: 'set',
        UNSET: 'unset'
    },

    /**
     * @private
     * @const
     * @type {String}
     */
    POSTMAN_PROPERTY_NAME = '_postman_propertyName',

    /**
     * @private
     * @const
     * @type {String}
     */
    VARIABLE_SCOPE = 'VariableScope',

    /**
     * Checks if the instance is a VariableScope. Defined here to avoid importing VariableScope and causing a
     * circular dependency.
     *
     * @private
     * @param {*} obj the object that needs to be validated
     */
    isVariableScope = function (obj) {
        return Boolean(obj) && (_.inSuperChain(obj.constructor, POSTMAN_PROPERTY_NAME,
            VARIABLE_SCOPE));
    },

    /**
     * Converts a variable changeset in the form of a JSON Delta stanza to an object format.
     *
     * @private
     * @param {VariableChangeset~serialized} serialized A serialized variable changeset
     */
    deserializeChangeset = function (serialized) {
        // bail out - empty or invalid
        if (!(serialized && serialized.length > 1)) {
            return {};
        }

        var deserialized = {
            id: serialized[0],
            key: serialized[1],
            type: INSTRUCTION.UNSET // set default changeset type to `unset`
        };

        // if the serialized changeset has three parameters, it represents a set changeset
        // @note: The third parameter should be honoured if present even if it is `nil` or `falsy`
        if (serialized.length > 2) {
            deserialized.type = INSTRUCTION.SET;
            deserialized.value = serialized[2];
        }

        return deserialized;
    },

    VariableChangeset;

/**
 * JSON definition for a variable changeset.
 *
 * @typedef VariableChangeset~definition
 *
 * @property {String} id changeset id
 * @property {String} type changeset type, one of ['set', 'unset']
 * @property {String} key variable key
 * @property {*} value variable value
 *
 * @example <caption>JSON definition of a VariableChangeset</caption>
 * {
 *   "id": "raw",
 *   "type": "set",
 *   "key": "name",
 *   "value": "Bob"
 * }
 */

/**
 * A serialized version of JSON changeset. This format is extended from the JSON delta specification.
 *
 * This format allows capturing variable creates, updates and deletes in a very minimal and consistent format.
 * It has 3 parts.
 *  ID
 *  Key path
 *  Value
 *
 * This format diverges from the original JSON delta format by adding an id segment. This is to allow mapping meta data
 * to changes later.
 *
 * For example ['1', ['name'], 'Bob'] represents an update on the variable `name` to `Bob`. This can be extended for
 * other types of changes as well. So ['1', ['description'], 'Hi there!'] could mean an addition if `description`
 * is not present already.
 *
 * Unset, or delete of a variable can be captured by not specifying the `value` segment. e.g. ['1', ['age']] would mean
 * a delete for the variable `age`.
 *
 *
 * See {@link http://json-delta.readthedocs.io/en/latest/philosophy.html} for more info.
 *
 * @typedef {Array} VariableChangeset~serialized
 *
 * @property {Number|String} 0
 * @property {String[]} 1
 * @property {*} 2
 */
_.inherit((

    /**
     * An instruction representing a change to a variable.
     *
     * @constructor
     * @param {VariableChangeset~definition|VariableChangeset~serialized} [definition]
     */
    VariableChangeset = function VariableChangeset (definition) {
        definition = definition || {};

        // definition is a serialized changeset
        if (_.isArray(definition)) {
            definition = deserializeChangeset(definition);
        }

        // this constructor is intended to inherit and as such the super constructor is required to be executed
        VariableChangeset.super_.call(this, definition);

        // import definition
        this.update(definition);
    }
), Property);

_.assign(VariableChangeset.prototype, /** @lends VariableChangeset.prototype */ {
    /**
     * Defines that this property requires an ID field
     * @private
     * @readOnly
     */
    _postman_propertyRequiresId: true,

    /**
     * Updates the variable changeset.
     *
     * @param {VariableChangeset~definition} definition
     */
    update: function (definition) {
        _.mergeDefined(this, /** @lends VariableChangeset.prototype */ {
            /**
             * @property {String[]}
             */
            key: _.isArray(definition.key) ? definition.key.join('.') : definition.key || '',

            /**
             * @property {String}
             */
            type: definition.type || INSTRUCTION.UNSET,

            /**
             * @property {*}
             */
            value: definition.type === INSTRUCTION.SET ? definition.value : undefined
        });
    },

    /**
     * Applies the changeset on a variable scope
     *
     * @param {VariableScope} scope
     */
    applyOn: function (scope) {
        if (!(scope && isVariableScope(scope))) {
            return;
        }

        var op = this.type;

        switch (op) {
            case INSTRUCTION.SET:
                scope.set(this.key, this.value);
                break;
            case INSTRUCTION.UNSET:
                scope.unset(this.key);
                break;
            default:
                break; // unknown type, do nothing
        }
    },

    /**
     * Serializes the variable changeset.
     *
     * @returns {VariableChangeset~serialized}
     */
    toJSON: function () {
        var serialized = [this.id, this.key.split('.')];

        // add value only if the instruction is a `set` instruction
        (this.type === INSTRUCTION.SET) && (serialized.push(this.value));

        return serialized;
    }
});

_.assign(VariableChangeset, /** @lends VariableChangeset */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'VariableChangeset',

    /**
     * Check whether an object is an instance of {@link VariableChangeset}.
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isVariableChangeset: function (obj) {
        return Boolean(obj) && ((obj instanceof VariableChangeset) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', VariableChangeset._postman_propertyName));
    }
});

module.exports = {
    VariableChangeset: VariableChangeset
};
