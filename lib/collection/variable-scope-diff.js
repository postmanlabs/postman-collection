var _ = require('../util').lodash,
    Property = require('./property').Property,
    VariableChangeset = require('./variable-changeset').VariableChangeset,

    /**
     * @private
     * @const
     * @type {Object}
     */
    MODE = {
        RAW: 'raw',
        COMPRESSED: 'compressed'
    },

    /**
     * Flattens all the changesets. Accounts for both the modes(compressed and raw). The changeset could be a JSON
     * definition or a VariableChangeset instance.
     *
     * @private
     *
     * @param {Object} root a VariableScopeDiff JSON definition or a VariableScopeDiff instance.
     */
    flattenChangesets = function (root) {
        var changesets;

        // root could be a JSON definition as well, so checking by `compressed` property
        // is more accurate than `isCompressed`
        if (root.compressed) {
            changesets = _.reduce(root.compressed, function (acc, compressedChange) {
                acc.push(compressedChange);
                return acc;
            }, []);
        }
        else if (root.raw) {
            changesets = root.raw;
        }

        return changesets || [];
    },

    VariableScopeDiff;

/**
 * @typedef VariableScopeDiff~definition
 *
 * @property {String} mode Diff mode - `compressed` or `raw`
 * @property {Object} [compressed] compressed set of changesets organized by key
 * @property {Array.<VariableChangeset~serialized>} [raw] raw list of changesets
 *
 * @example <caption>JSON definition of a VariableScopeDiff</caption>
 * {
 *   "mode": "raw",
 *   "raw": [
 *      ["1", ["name"], "Bob"]
 *   ]
 * }
 *
 * @example <caption>JSON definition of a VariableScopeDiff in compressed mode</caption>
 * {
 *   "mode": "compressed",
 *   "compressed": {
 *      "name": ["1", ["name"], "Bob"]
 *   }
 * }
 */
_.inherit((

    /**
     * A `VariableScopeDiff` is a place to track a set of variable changes - see {@link VariableChangeset}. This could
     * be used in a {@link VariableScope} for tracking changes. `VariableScopeDiff` gives you helpers to manage a set of
     * changesets, like compressing them, iterating over them or applying them on a different `VariableScope`.å
     *
     * @constructor
     *
     * @param {VariableScopeDiff~definition} [definition]
     * @param {Object} [options]
     */
    VariableScopeDiff = function VariableScopeDiff (definition, options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        VariableScopeDiff.super_.call(this, definition);

        // initialize a default definition
        definition = definition || {};

        // look for compression mode in options
        // if not found, detect from definition
        // if not found, fall back to default `raw` mode
        var mode = (options && options.compress) ? MODE.COMPRESSED : definition.mode || MODE.RAW,
            changesets;

        this.mode = mode;

        // initialize changeset buckets
        if (mode === MODE.COMPRESSED) {
            /**
             * Holds compressed set of variable changesets.
             *
             * @private
             * @memberOf VariableScope.prototype
             */
            this.compressed = {};
        }
        else {
            /**
             * Holds set of raw variable changesets.
             *
             * @private
             * @memberOf VariableScope.prototype
             */
            this.raw = [];
        }

        // load changesets from definition
        // the definition and the selected mode might be different
        // so we always look to restore both possibilities
        changesets = flattenChangesets(definition);

        // import changesets
        _.forEach(changesets, this.registerChangeset.bind(this));
    }
), Property);

_.assign(VariableScopeDiff.prototype, /** @lends VariableScopeDiff.prototype */ {

    /**
     * Logs a changeset. Handles bucketing changesets based on selected mode.
     *
     * @private
     * @param {VariableChangeset} changeset
     */
    registerChangeset: function (changeset) {
        if (!changeset) {
            return;
        }

        // convert changeset to instance if not one
        changeset = VariableChangeset.isVariableChangeset(changeset) ? changeset :
            new VariableChangeset(changeset);

        var key = changeset.key;

        if (this.isCompressed()) {
            this.compressed[key] = changeset;
        }

        else {
            this.raw.push(changeset);
        }
    },

    /**
     * Track a variable change.
     *
     * @param {String} type change type, one of ['set', 'unset']
     * @param {String} key key for the change
     * @param {*} [value] value, only for `set` changes
     */
    track: function (type, key, value) {
        // bail out
        if (!(type && key)) {
            return;
        }

        var changeset = new VariableChangeset({ key: key, type: type, value: value });

        this.registerChangeset(changeset);
    },

    /**
     * Checks if the changeset compression is enabled.
     *
     * @private
     *
     * @returns {Boolean}
    */
    isCompressed: function () {
        return this.mode === MODE.COMPRESSED;
    },

    /**
     * Iterates over all the tracked changesets.
     *
     * @private
     * @param {Function} iterator
     */
    each: function (iterator) {
        this.all().forEach(iterator);
    },

    /**
     * Returns a flat array of all the tracked changesets.
     *
     * @returns {Array.<VariableChangeset>}
     */
    all: function () {
        return flattenChangesets(this);
    },

    /**
     * Returns the count of all the tracked changesets.
     *
     * @returns {Number}
     */
    count: function () {
        return this.all().length;
    },

    /**
     * Applies the tracked changes on a given variable scope.
     *
     * @param {VariableScope} scope
     */
    applyOn: function (scope) {
        if (!scope) {
            return;
        }

        this.each(function (changeset) {
            changeset.applyOn(scope);
        });
    },

    /**
     * Imports a tracked changes from another diff instance.
     *
     * @param {VariableScopeDiff|VariableScopeDiff~definition} diff
     */
    import: function (diff) {
        var changesets = flattenChangesets(diff);

        changesets.forEach(function (changeset) {
            if (!changeset) {
                return;
            }

            // clone the changeset
            changeset = VariableChangeset.isVariableChangeset(changeset) ? changeset.toJSON() : changeset;

            this.registerChangeset(changeset);
        }.bind(this));
    },

    /**
     * Reset tracked changes.
     */
    reset: function () {
        if (this.isCompressed()) {
            this.compressed = {};
        }
        else {
            this.raw = [];
        }
    },

    /**
     * Change the tracking mode to `compressed`. And compress tracked changes as well.
     */
    compress: function () {
        // already compressed
        if (this.isCompressed()) {
            return;
        }

        // copy all the changesets
        var changesets = flattenChangesets(this);

        // change mode to compressed
        this.mode = MODE.COMPRESSED;
        this.compressed = {};

        // now push all the changesets again, this will compress the changesets in the process
        changesets.forEach(this.registerChangeset.bind(this));
    }
});

_.assign(VariableScopeDiff, {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'VariableScopeDiff',

    /**
     * Check whether an object is an instance of {@link VariableScopeDiff}.
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isVariableScopeDiff: function (obj) {
        return Boolean(obj) && ((obj instanceof VariableScopeDiff) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', VariableScopeDiff._postman_propertyName));
    }
});

module.exports = {
    VariableScopeDiff: VariableScopeDiff
};
