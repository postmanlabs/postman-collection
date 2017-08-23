var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,

    RequestAuthBase;

_.inherit((

    /**
     * A Postman Request Auth State, which is in charge of holding the intermediate parameters for
     * the supported auth mechanisms.
     *
     * @constructor
     * @extends {PropertyBase}
     */
    RequestAuthBase = function PostmanRequestAuthBase () {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        RequestAuthBase.super_.call(this, arguments);
    }), PropertyBase);

_.assign(RequestAuthBase, /** @lends RequestAuthBase */ {

    /**
     * @type {String}
     */
    _postman_propertyName: 'RequestAuthBase'
});

module.exports.RequestAuthBase = RequestAuthBase;
