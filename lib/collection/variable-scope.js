var _ = require('../util').lodash,
    Property = require('./property').Property,
    VariableList = require('./variable-list').VariableList,

    VariableScope;

_.inherit((
    /**
     * Create instances of environments and globals
     *
     * @constructor
     * @extends {Property}
     *
     * @param {Object} definition
     */
    VariableScope = function PostmanVariableScope (definition) {
        // in case the definition is an array (legacy format) or existing as list, we convert to actual format
        if (_.isArray(definition) || VariableList.isVariableList(definition)) {
            definition = { values: definition };
        }

        // this constructor is intended to inherit and as such the super constructor is required to be executed
        VariableScope.super_.call(this, definition);

        var values;

        // in case of empty definition simply create values and exit
        if (!(definition && definition.values)) {
            values = new VariableList(this);
        }
        // set the parent of the externally passed list to match the current
        else if (VariableList.isVariableList(definition.values)) {
            if (definition.values.__parent) { // cannot attach a list already part of another collection
                throw new Error('collection: unable to set a variable-list that already belongs to another scope.');
            }
            // change the parent
            // @todo - expose a setParent sugar function from PropertyList?
            _.assignLocked(definition.values, '__parent', this);
        }
        else {
            values = new VariableList(this, definition.values);
        }

        /**
         * @memberOf VariableScope.prototype
         * @type {VariableList}
         */
        this.values = values;
        values = null; // cleanup (just in case)
    }), Property);

_.extend(VariableScope.prototype, /** @lends VariableScope.prototype */ {
    /**
     * Defines whether this property instances requires an id
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_requiresId: true,

    /**
     * Using this function, one can sync the values of this variable list from a reference object.
     *
     * @param {Object} obj
     * @param {Boolean=} [track]
     *
     * @returns {Object}
     */
    syncVariablesFrom: function (obj, track) {
        return this.values.syncFromObject(obj, track);
    }
});

_.extend(VariableScope, /** @lends VariableScope */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     *
     * @note that this is directly accessed only in case of VariableScope from _.findValue lodash util mixin
     */
    _postman_propertyName: 'VariableScope',

    /**
     * Check whether an object is an instance of {@link VariableScope}.
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isVariableScope: function (obj) {
        return obj && ((obj instanceof VariableScope) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', VariableScope._postman_propertyName));
    }
});

module.exports = {
    VariableScope: VariableScope
};
