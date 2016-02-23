var _ = require('lodash');

_.mixin({

    inherit: function (child, base) {
        Object.defineProperty(child, 'super_', {
            value: _.isFunction(base) ? base : _.noop,
            configurable: false,
            enumerable: false,
            writable: false
        });

        child.prototype = Object.create((_.isFunction(base) ? base.prototype : base), {
            constructor: {
                value: child,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        return child;
    },

    args: function (args) {
        return Array.prototype.slice.call(args);
    },

    ensureEncoded: function (string) {
        // Takes care of the case where the string is already encoded.
        return encodeURIComponent(decodeURIComponent(string));
    },

    assignLocked: function (obj, name, prop) {
        Object.defineProperty(obj, name, {
            value: prop,
            configurable: false,
            enumerable: false,
            writable: false
        });
        return obj;
    },

    assignHidden: function (obj, name, prop) {
        Object.defineProperty(obj, name, {
            value: prop,
            configurable: true,
            enumerable: false,
            writable: true
        });
        return obj;
    },

    createDefined: function (obj, name, Prop) {
        return _.has(obj, name) ? (new Prop(obj[name])) : undefined;
    }
});

module.exports = {
    lodash: _
};
