var _ = require('../util').lodash,
    Property = require('./property').Property,
    PropertyList = require('./property-list').PropertyList,
    EventList = require('./event-list').EventList,
    Request = require('./request').Request,
    Response = require('./response').Response,

    Item;

_.inherit((
    /**
     * A Postman Collection Item that holds your request definition, responses and other stuff
     * @constructor
     * @extends {Property}
     *
     * @param {Object} options
     */
    Item = function PostmanItem (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        Item.super_.apply(this, arguments);
        if (!options) { return; } // in case definition object is missing, there is no point moving forward

        _.merge(this, /** @lends Item.prototype */ {
            /**
             * The request in this item
             * @type {Request}
             */
            request: new Request(options.request),
            /**
             * List of sample responses
             * @type {PropertyList<Response>}
             */
            responses: new PropertyList(Response, this, options.response),
            /**
             * Events of this item
             * @type {EventList}
             */
            events: new EventList(this, options.event)
        });
    }), Property);

_.extend(Item.prototype, /** @lends Item.prototype */ {
    /**
     * Defines whether this property instances requires an id
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_requiresId: true,
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'Item',

    // TODO: Think about this name @shamasis
    processAuth: function () {
        return this.request.authorize();
    },

    /**
     * Returns Events corresponding to a particular event name. If no name is given, returns all events
     *
     * @param name {String}
     */
    getEvents: function (name) {
        if (!name) {
            return this.events.all(); // return all events if name is not provided.
        }
        return this.events.filter(function (ev) {
            return ev.listen === name;
        });
    }
});

_.extend(Item, /** @lends Item */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'Item',
    /**
     * Check whether an object is an instance of PostmanItem.
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isItem: function (obj) {
        return obj && ((obj instanceof Item) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', Item._postman_propertyName));
    }
});

module.exports = {
    Item: Item
};
