var _ = require('../util').lodash,
    Property = require('./property').Property,

    VariableChangeset = require('./variable-changeset').VariableChangeset,

    MODE = {
        RAW: 'raw',
        COMPRESSED: 'compressed'
    },

    VariableScopeDiff;

/**
 * @typedef VariableScopeDiff~definition
 *
 * @property {String} mode Diff mode - `compressed` or `raw`
 * @property {Object} compressed
 * @property {VariableChangeset~serialized[]} raw
 */
_.inherit((

    /**
     * @constructor
     *
     * @param {VariableScopeDiff~definition} definition
     */
    VariableScopeDiff = function VariableScopeDiff (definition) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        VariableScopeDiff.super_.call(this, definition);

        definition = definition || { mode: MODE.RAW };

        this._lastChangesetId = 0;

        if (definition.mode === MODE.COMPRESSED) {
            this.mode = MODE.COMPRESSED;
            this.compressed = {};
            _.forEach(definition.compressed, function (changeset) {
                this.registerChangeset(new VariableChangeset(changeset));
            }.bind(this));
        }
        else {
            this.mode = MODE.RAW; // convert non standard modes to `raw`
            this.raw = [];
            _.forEach(definition.raw, function (changeset) {
                this.registerChangeset(new VariableChangeset(changeset));
            }.bind(this));
        }
    }
), Property);

_.assign(VariableScopeDiff.prototype, {
    track: function (type, key, value) {
        if (!(type && key)) {
            return;
        }

        var id = this.getNextChangesetId(),
            changeset = new VariableChangeset({ id: id, key: key, type: type, value: value });

        this.registerChangeset(changeset);
    },

    /**
     * @private
     * @param {VariableChangeset} changeset
     */
    registerChangeset: function (changeset) {
        // update the last changeset id
        (changeset.id > this._lastChangesetId) && (this._lastChangesetId = changeset.id);

        var key = changeset.key;

        if (this.isCompressed()) {
            this.compressed[key] = changeset;
        }

        else {
            this.raw.push(changeset);
        }
    },

    /**
     * @private
     *
     * @returns {Boolean}
    */
    isCompressed: function () {
        return this.mode === MODE.COMPRESSED;
    },

    /**
     * @private
     *
     * @returns {Number}
     */
    getNextChangesetId: function () {
        return this._lastChangesetId + 1;
    },

    /**
     * @returns {VariableChangeset[]}
     */
    all: function () {
        var changesets;

        if (!this.isCompressed()) {
            changesets = this.raw;
        }

        else {
            changesets = _.reduce(this.compressed, function (acc, compressedChange) {
                acc.push(compressedChange);
                return acc;
            }, []);
        }

        return changesets || [];
    },


    /**
     * @private
     */
    each: function (iterator) {
        this.all().forEach(iterator);
    },

    /**
     *
     */
    apply: function (scope) {
        if (!scope) {
            return;
        }

        this.each(function (changeset) {
            changeset.apply(scope);
        });
    },

    import: function (diff) {
        diff.each(function (changeset) {
            this.registerChangeset(changeset);
        }.bind(this));
    },

    reset: function () {
        if (this.isCompressed()) {
            this.compressed = {};
        }
        else {
            this.raw = [];
        }
    },

    compress: function () {
        // already compressed
        if (this.isCompressed()) {
            return;
        }

        // copy all the changesets
        var changesets = this.all();

        // change mode to compressed
        this.mode = MODE.COMPRESSED;
        this.compressed = {};

        // now push all the changesets again, this will compress the changesets in the process
        changesets.forEach(function (changeset) {
            this.registerChangeset(changeset);
        }.bind(this));
    }
});

_.assign(VariableScopeDiff, {
    _postman_propertyName: 'VariableScopeDiff'
});

module.exports = {
    VariableScopeDiff: VariableScopeDiff
};
