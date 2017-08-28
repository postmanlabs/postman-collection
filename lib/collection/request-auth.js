var _ = require('../util').lodash,
    Property = require('./property').Property,
    VariableList = require('./variable-list').VariableList,

    RequestAuth;

/**
 * This defines the definition of the authentication method to be used.
 *
 * @typedef RequestAuth~definition
 * @property {String=} type The Auth type to use. Check the names in {@link AuthTypes}
 */
_.inherit((

    /**
     * A Postman Auth definition that comprehensively represents different types of auth mechanisms available.
     *
     * @constructor
     * @extends {Property}
     *
     * @param {RequestAuth~definition} options Pass the initial definition of the Auth.
     */
    RequestAuth = function PostmanRequestAuth (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        RequestAuth.super_.call(this, options);

        if (_.has(options, 'type')) {
            this.use(options.type);
        }

        // load all possible auth parameters from options
        _.forEach(_.omit(options, 'type'), this.update.bind(this));
    }), Property);

_.assign(RequestAuth.prototype, /** @lends RequestAuth.prototype */ {
    /**
     * Update the parameters of a specific authentication type. If none is provided then it uses the one marked as to be
     * used.
     *
     * @param {VariableList|Array|Object} options
     * @param {String=} [type=this.type]
     */
    update: function (options, type) {
        // update must have options
        if (!_.isObject(options)) { return; }
        // validate type parameter and/or choose default from existing type.
        if (!_.isString(type) || (type === 'type')) { type = this.type; }

        var parameters = this[type];

        // in case the type holder is not created, we create one and send the population variables
        if (!VariableList.isVariableList(parameters)) {
            // @todo optimise the handling of legacy object type auth parameters
            parameters = this[type] = new VariableList(this);
        }

        // we simply assimilate the new options either it is an array or an object
        if (_.isArray(options) || VariableList.isVariableList(options)) {
            parameters.assimilate(options);
        }
        else {
            parameters.syncFromObject(options, false, false); // params: no need to track and no need to prune
        }
    },

    /**
     * Sets the authentication type to be used by this item.
     *
     * @param {String} type
     * @param {Object=} options - note that options set here would replace all existing options for the particular auth
     */
    use: function (type, options) {
        // no auth name can be "type", else will have namespace collision with type selector
        if (!_.isString(type) || type === 'type') {
            return;
        }

        this.type = type; // set the type

        // if options is provided or a variable list was not created for the type, we create one
        if (!VariableList.isVariableList(this[type]) || options) {
            this[type] = new VariableList(this, options);
        }
    },

    /**
     * Fetches the currently selected AuthType.
     *
     * @return {Object|undefined}
     * @deprecated Use .parameters() instead
     */
    current: function () {
        return this[this.type] ? this[this.type].toObject() : undefined;
    },

    /**
     * Returns the parameters of the selected auth type
     *
     * @returns {VariableList}
     */
    parameters: function () {
        return this[this.type];
    }
});

_.assign(RequestAuth, /** @lends RequestAuth */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'RequestAuth'
});

module.exports = {
    RequestAuth: RequestAuth
};
