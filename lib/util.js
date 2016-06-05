var _ = require('lodash').noConflict(),
    Base64;
/**
 * @module util
 * @private
 */
_.mixin(/** @lends util */{

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


Base64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  encode: function(e) {
      var t = "";
      var n, r, i, s, o, u, a;
      var f = 0;
      e = Base64._utf8_encode(e);
      while (f < e.length) {
          n = e.charCodeAt(f++);
          r = e.charCodeAt(f++);
          i = e.charCodeAt(f++);
          s = n >> 2;
          o = (n & 3) << 4 | r >> 4;
          u = (r & 15) << 2 | i >> 6;
          a = i & 63;
          if (isNaN(r)) {
              u = a = 64
          } else if (isNaN(i)) {
              a = 64
          }
          t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
      }
      return t
  },
  decode: function(e) {
      var t = "";
      var n, r, i;
      var s, o, u, a;
      var f = 0;
      e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (f < e.length) {
          s = this._keyStr.indexOf(e.charAt(f++));
          o = this._keyStr.indexOf(e.charAt(f++));
          u = this._keyStr.indexOf(e.charAt(f++));
          a = this._keyStr.indexOf(e.charAt(f++));
          n = s << 2 | o >> 4;
          r = (o & 15) << 4 | u >> 2;
          i = (u & 3) << 6 | a;
          t = t + String.fromCharCode(n);
          if (u != 64) {
              t = t + String.fromCharCode(r)
          }
          if (a != 64) {
              t = t + String.fromCharCode(i)
          }
      }
      t = Base64._utf8_decode(t);
      return t
  },
  _utf8_encode: function(e) {
      e = e.replace(/\r\n/g, "\n");
      var t = "";
      for (var n = 0; n < e.length; n++) {
          var r = e.charCodeAt(n);
          if (r < 128) {
              t += String.fromCharCode(r)
          } else if (r > 127 && r < 2048) {
              t += String.fromCharCode(r >> 6 | 192);
              t += String.fromCharCode(r & 63 | 128)
          } else {
              t += String.fromCharCode(r >> 12 | 224);
              t += String.fromCharCode(r >> 6 & 63 | 128);
              t += String.fromCharCode(r & 63 | 128)
          }
      }
      return t
  },
  _utf8_decode: function(e) {
      var t = "";
      var n = 0;
      var r = c1 = c2 = 0;
      while (n < e.length) {
          r = e.charCodeAt(n);
          if (r < 128) {
              t += String.fromCharCode(r);
              n++
          } else if (r > 191 && r < 224) {
              c2 = e.charCodeAt(n + 1);
              t += String.fromCharCode((r & 31) << 6 | c2 & 63);
              n += 2
          } else {
              c2 = e.charCodeAt(n + 1);
              c3 = e.charCodeAt(n + 2);
              t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
              n += 3
          }
      }
      return t
  }
};

module.exports = {
    lodash: _,
    base64: Base64
};
