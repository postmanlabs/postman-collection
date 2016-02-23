var _ = require('../util').lodash,
    uuid = require('node-uuid'),
    Property = require('./property').Property,
    PropertyList = require('./property-list').PropertyList,
    EventList = require('./event-list').EventList,
    Item = require('./item').Item,
    RequestAuth = require('./request-auth').RequestAuth,

    ItemGroup;

_.inherit((
    /**
     * Defines a group of PostmanItems from a definition of items.
     * @constructor
     * @extends {Property}
     *
     * @param {Object} options
     */
    ItemGroup = function PostmanItemGroup (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        ItemGroup.super_.apply(this, arguments);
        if (!options) { return; } // in case definition object is missing, there is no point moving forward

        _.merge(this, /** @lends ItemGroup.prototype */ {
            /**
             * The list of child items or groups within this group.
             * @type {PropertyList<Item|ItemGroup>}
             */
            items: new PropertyList(ItemGroup._createNewGroupOrItem, this, options.item),

            /**
             * Authentication required for all items in this group.
             * @type {RequestAuth}
             */
            auth: _.createDefined(options, 'auth', RequestAuth),

            /**
             * List of global events
             * @type {EventList}
             * @memberOf Collection.prototype
             */
            events: new EventList(this, options.event)
        });

        // if id is not defined, then we create a new one
        !this.id && (this.id = uuid.v4());
    }), Property);

_.extend(ItemGroup.prototype, /** @lends ItemGroup.prototype */ {
    /**
     * Calls the callback for each item belonging to itself. If any ItemGroups are encountered,
     * they will call the callback on their own Items.
     * @draft - to decide whether to return recursive items
     *
     * @param {Function} callback
     */
    forEachItem: function forEachItem (callback) {
        this.items.each(function (item) {
            return ItemGroup.isItemGroup(item) ? item.forEachItem(callback) : callback(item, this);
        }, this);
    }
});

_.extend(ItemGroup, /** @lends ItemGroup */ {
    /**
     * Iterator function to update an itemgroup's item array with appropriate objects from definition
     * @private
     * @this {ItemGroup}
     *
     * @param {Object} item - the definition of an item or group
     * @returns {ItemGroup|Item}
     *
     * @note
     * This function is intended to be used in scope of an instance of a {@link ItemGroup).
     */
    _createNewGroupOrItem: function (item) {
        return item && (item.item && (new ItemGroup(item)) || (new Item(item)));
    },
    /**
     * Check whether an object is an instance of {@link ItemGroup}.
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isItemGroup: function (obj) {
        return obj && (obj instanceof ItemGroup);
    }
});

module.exports = {
    ItemGroup: ItemGroup
};
