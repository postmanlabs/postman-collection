var _ = require('../util').lodash,
    PropertyList = require('./property-list').PropertyList,
    Cookie = require('./cookie').Cookie,

    CookieList;

_.inherit((

    /**
     * A type of {@link PropertyList}, CookieList helps to manage a list of {@link Cookie}s.
     * This is mostly a utility, the real Cookie functionality is exposed by {@link CookieJar}.
     *
     * @constructor
     * @extends {PropertyList}
     */
    CookieList = function PostmanCookieList (parent, populate) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        CookieList.super_.call(this, Cookie, parent, populate);
    }), PropertyList);

_.assign(CookieList, /** @lends CookieList */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'CookieList',

    /**
     * Checks if the given object is an CookieList.
     *
     * @param obj
     * @returns {boolean}
     */
    isCookieList: function (obj) {
        return obj && ((obj instanceof CookieList) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', CookieList._postman_propertyName));
    }
});

module.exports = {
    CookieList: CookieList
};
