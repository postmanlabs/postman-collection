var _ = require('../util').lodash,

    INSTRUCTION = {
        SET: 'set',
        UNSET: 'unset'
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
 * @typedef VariableChangeset~definition
 *
 * @property {Number|String} id
 * @property {String[]} key
 * @property {String} type
 * @property {*} value
 */

/**
 * @typedef {Array} VariableChangeset~serialized
 *
 * @property {Number|String} 0
 * @property {String[]} 1
 * @property {*} 2
 */


/**
 * An instruction representing a change to a variable.
 *
 * @constructor
 * @param {?VariableChangeset~definition|VariableChangeset~serialized} definition
 */
VariableChangeset = function VariableChangeset (definition) {
    // definition is a serialized changeset
    if (_.isArray(definition)) {
        definition = deserializeChangeset(definition);
    }

    // @todo: what do we do if there's no id?
    this.id = definition.id;

    this.update(definition);
};

_.assign(VariableChangeset.prototype, /** @lends VariableChangeset.prototype */ {
    /**
     * Updates the variable changeset.
     */
    update: function (definition) {
        _.mergeDefined(this, /** @lends VariableChangeset.prototype */ {
            /**
             * @property {String[]}
             */
            key: _.isArray(definition.key) ? definition.key.join('.') : definition.key,

            /**
             * @property {String}
             */
            type: definition.type,

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
    apply: function (scope) {
        if (!scope) {
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

});

module.exports = {
    VariableChangeset: VariableChangeset
};
