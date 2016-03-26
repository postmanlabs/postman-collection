var _ = require('../util').lodash,
    Property = require('./property').Property,
    PropertyList = require('./property-list').PropertyList,
    EventList = require('./event-list').EventList,
    Request = require('./request').Request,
    Response = require('./response').Response,

    Item;

_.inherit((
    /**
     * A Postman Collection Item that holds your request definition, responses and other stuff. An Item essentially is
     * a HTTP request definition along with the sample responses and test scripts clubbed together. One or more of these
     * items can be grouped together and placed in an {@link ItemGroup} and as such forms a {@link Collection} of
     * requests.
     *
     * @constructor
     * @extends {Property}
     *
     * @param {Item~definition=} [definition]
     */
    Item = function PostmanItem (definition) {
        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        Item.super_.apply(this, arguments);

        _.merge(this, /** @lends Item.prototype */ {
            /**
             * The request in this item
             * @type {Request}
             */
            request: definition && (new Request(definition.request)),
            /**
             * List of sample responses
             * @type {PropertyList<Response>}
             */
            responses: new PropertyList(Response, this, definition && definition.response),
            /**
             * Events of this item
             * @type {EventList}
             */
            events: new EventList(this, definition && definition.event)
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
