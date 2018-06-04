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

        // this.update(definition);

        if (options && options.compressed) {
            this._postman_compressed = true;
            this.compressed = {};
        }
        else {
            this.raw = [];
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
    }
});

module.exports = {
    ChangeTracker: ChangeTracker
};
