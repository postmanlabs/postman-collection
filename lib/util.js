var _ = require('lodash');

_.mixin({

    /**
     * Creates an inheritance relation between the child and the parent, adding a 'super_' attribute to the
     * child, and setting up the child prototype.
     *
     * @param child
     * @param base
     * @returns {*}
     */
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

    /**
     * Creates an array from a Javascript "arguments" object.
     * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/arguments
     *
     * @param args
     * @returns {Array.<T>}
     */
    args: function (args) {
        return Array.prototype.slice.call(args);
    },

    /**
     * Makes sure the given string is encoded only once.
     *
     * @param string
     * @returns {string}
     */
    ensureEncoded: function (string) {
        // Takes care of the case where the string is already encoded.
        return encodeURIComponent(decodeURIComponent(string));
    },

    /**
     * Creates a locked property on an object, which is not writable or enumerable.
     *
     * @param obj
     * @param name
     * @param prop
     * @returns {*}
     */
    assignLocked: function (obj, name, prop) {
        Object.defineProperty(obj, name, {
            value: prop,
            configurable: false,
            enumerable: false,
            writable: false
        });
        return obj;
    },

    /**
     * Creates a hidden property on an object, which can be changed, but is not enumerable.
     *
     * @param obj
     * @param name
     * @param prop
     * @returns {*}
     */
    assignHidden: function (obj, name, prop) {
        Object.defineProperty(obj, name, {
            value: prop,
            configurable: true,
            enumerable: false,
            writable: true
        });
        return obj;
    },

    /**
     * Creates a property on an object, with the given type.
     *
     * @param obj
     * @param name
     * @param Prop
     * @returns {undefined}
     */
    createDefined: function (obj, name, Prop) {
        return _.has(obj, name) ? (new Prop(obj[name])) : undefined;
    },

    /**
     * Creates a clone of an object, but uses the toJSON method if available.
     *
     * @param obj
     * @returns {*}
     */
    cloneElement: function (obj) {
        return _.cloneDeep(obj, function (value) {
            // falls back to default deepclone if object does not have explicit toJSON().
            if (value && _.isFunction(value.toJSON)) {
                return value.toJSON();
            }
        });
    },

    /**
     * Returns the match of a value of a property by traversing the prototype
     *
     * @param {Object} obj
     * @param {String} key
     * @param {*} value
     *
     * @returns {Boolean}
     */
    inSuperChain: function (obj, key, value) {
        return obj ? ((obj[key] === value) || _.inSuperChain(obj.super_, key, value)) : false;
    }
});

module.exports = {
    lodash: _
};
