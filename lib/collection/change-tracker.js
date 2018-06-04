var _ = require('../util').lodash,
    Property = require('./property').Property,

    ADDED = 'added',
    UPDATED = 'updated',
    REMOVED = 'removed',

    ChangeTracker;

_.inherit((
    ChangeTracker = function Property (definition, options) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        ChangeTracker.super_.call(this, definition);

        definition = definition || {};

        if (options && options.compressed) {
            this._postman_compressed = true;
            this.compressed = definition.compressed || {};
        }
        else {
            this.raw = definition.raw || [];
        }
    }
), Property);

_.assign(ChangeTracker.prototype, {
    track: function (type, diff) {
        if (!(type && diff)) {
            return;
        }

        var change;

        switch (type) {
            case ADDED:
            case UPDATED:
                // @todo: move to a fast/higher entropy id generation algorithm
                change = [Date.now(), [diff.key], diff.value];
                break;
            case REMOVED:
                // @todo: move to a fast/higher entropy id generation algorithm
                change = [Date.now(), [diff.key]];
                break;
            default:
                throw new Error('ChangeTracker: Could not track change for type ' + type);
        }

        if (this._postman_compressed) {
            this.compressed[diff.key] = change;
        }

        else {
            this.raw.push(change);
        }
    },

    each: function (iterator) {
        var changes;

        if (!this._postman_compressed) {
            changes = this.raw;
        }

        else {
            changes = _.reduce(this.compressed, function (acc, compressedChange) {
                acc.push(compressedChange);
                return acc;
            }, []);
        }


        _.forEach(changes, iterator);

        // reset variable reference to help GC
        changes = null;
    },

    applyOn: function (scope) {
        this.each(function (change) {
            var key = ChangeTracker.getVariableKey(change);
            if (ChangeTracker.isRemoveChange(change)) {
                scope.unset(key);
            }
            else {
                scope.set(key, change[2]);
            }
        });
    },

    import: function (changeTracker) {
        // if both changes are compressed we could just merge the two
        if (this._postman_compressed && changeTracker._postman_compressed) {
            _.assign(this.compressed, changeTracker.compressed);
            return;
        }

        // if both changes are uncompressed we could just concat the two
        if (!this._postman_compressed && !changeTracker._postman_compressed) {
            this.raw = this.raw.concat(changeTracker.raw);
            return;
        }

        changeTracker.each(function (change) {
            // @todo: optimize this
            if (ChangeTracker.isAddOrUpdateChange(change)) {
                this.track(UPDATED, {
                    key: ChangeTracker.getVariableKey(change),
                    value: ChangeTracker.getVariableValue(change)
                });
            }
            else {
                this.track(REMOVED, { key: ChangeTracker.getVariableKey(change) });
            }
        }.bind(this));
    }
});

_.assign(ChangeTracker, {
    isAddOrUpdateChange: function (variableChange) {
        return variableChange.length > 2;
    },

    isRemoveChange: function (variableChange) {
        return variableChange.length <= 2;
    },

    getVariableKey: function (variableChange) {
        if (!(variableChange && variableChange[1])) {
            return '';
        }

        return variableChange[1].join('.');
    },

    getVariableValue: function (variableChange) {
        if (!(variableChange && variableChange[2])) {
            return '';
        }

        return variableChange[2];
    }
});

module.exports = {
    ChangeTracker: ChangeTracker
};
