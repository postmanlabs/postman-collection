/* global btoa */
var _ = require('lodash').noConflict(),
    util,

    ASCII_SOURCE = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    ASCII_SOURCE_LENGTH = ASCII_SOURCE.length,
    EMPTY = '';

/**
 * @module util
 * @private
 */
_.mixin( /** @lends util */ {

    /**
     * Creates an inheritance relation between the child and the parent, adding a 'super_' attribute to the
     * child, and setting up the child prototype.
     *
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
     * @returns {Prop|undefined}
     */
    createDefined: function (obj, name, Prop) {
        return _.has(obj, name) ? (new Prop(obj[name])) : undefined;
    },

    /**
     * Returns the value of a property if defined in object, else the default
     *
     * @param {Object} obj
     * @param {String} prop
     * @param {*} def
     *
     * @returns {*}
     */
    getOwn: function (obj, prop, def) {
        return _.has(obj, prop) ? obj[prop] : def;
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
    },

    /**
     * Generates a random string of given length (useful for nonce generation, etc).
     *
     * @param {Number} length
     */
    randomString: function (length) {
        length = length || 6;

        var result = [],
            i;

        for (i = 0; i < length; i++) {
            result[i] = ASCII_SOURCE[(Math.random() * ASCII_SOURCE_LENGTH) | 0];
        }
        return result.join(EMPTY);
    }
});

util = {
    lodash: _,
    /**
     *
     * @param {String} data
     *
     * @returns {String} [description]
     */
    btoa: ((typeof btoa !== 'function' && typeof Buffer === 'function') ? function (data) {
        return new Buffer(data).toString('base64');
    } : function (str) {
        return btoa(str);
    }), // @todo use browserify to normalise this

    /**
     * ArrayBuffer to String
     *
     * @param {ArrayBuffer} buffer
     * @returns {String}
     */
    arrayBufferToString: function (buffer) {
        var str = '',
            uArrayVal = new Uint8Array(buffer),

            i,
            ii;

        for (i = 0, ii = uArrayVal.length; i < ii; i++) {
            str += String.fromCharCode(uArrayVal[i]);
        }

        return str;
    },

    bufferOrArrayBufferToString: function (buffer) {
        if (!buffer || _.isString(buffer)) {
            return buffer || '';
        }

        var str = buffer.toString('utf8') || '';
        (str === '[object ArrayBuffer]') && (str = util.arrayBufferToString(buffer));
        return str;
    },

    bufferOrArrayBufferToBase64: function (buffer) {
        if (!buffer) {
            return '';
        }

        var base64;

        // handle when buffer is pure string
        if (_.isString(buffer)) {
            return util.btoa(buffer);
        }

        // check if tostring works
        base64 = buffer.toString('base64') || '';

        if (base64 === '[object ArrayBuffer]') {
            return util.btoa(util.arrayBufferToString(buffer));
        }

        return base64;
    },

    /**
     * Check whether a value is number-like
     * https://github.com/lodash/lodash/issues/1148#issuecomment-141139153
     * @return {Boolean}
     */
    isNumeric: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
};

module.exports = util;

