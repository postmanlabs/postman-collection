var _ = require('../util').lodash,
    Property = require('./property').Property,
    PropertyList = require('./property-list').PropertyList,
    EventList = require('./event-list').EventList,
    Item = require('./item').Item,
    RequestAuth = require('./request-auth').RequestAuth,

    ItemGroup;

/**
 * The following defines the object (or JSON) structure that one can pass to the ItemGroup while creating a new
 * ItemGroup instance. This is also the object structure returned when `.toJSON()` is called on an ItemGroup instance.
 *
 * @typedef ItemGroup~definition
 * @property {Array<ItemGroup~definition|Item~definition>=} [item]
 * @property {Array<RequestAuth~definition>=} [auth]
 * @property {Array<Event~definition>=} [event]
 *
 * @example
 * {
 *     "name": "Echo Get Requests",
 *     "id": "echo-get-requests",
 *     "item": [{
 *         "request": "https://postman-echo.com/get"
 *     }, {
 *         "request": "https://postman-echo.com/headers"
 *     }],
 *     "auth": {
 *         "type": "basic",
 *         "basic": {
 *             "username": "jean",
 *             "password": "{{somethingsecret}}"
 *         }
 *     },
 *     "event": [{
 *         "listen": "prerequest",
 *         "script: {
 *             "type": "text/javascript",
 *             "exec": "console.log(new Date())"
 *         }
 *     }]
 * }
 */
_.inherit((

    /**
     * An ItemGroup represents a composite list of {@link Item} or ItemGroup. In terms of Postman App, ItemGroup
     * represents a "Folder". This allows one to group Items into subsets that can have their own meaning. An
     * ItemGroup also allows one to define a subset of common properties to be applied to each Item within it. For
     * example, a `test` event defined on an ItemGroup is executed while testing any Item that belongs to that group.
     * Similarly, ItemGroups can have a common {@RequestAuth} defined so that every {@link Request}, when processed,
     * requires to be authenticated using the `auth` defined in the group.
     *
     * Essentially, {@link Collection} too is a special type of ItemGroup ;-).
     *
     * @constructor
     * @extends {Property}
     *
     * @param {ItemGroup~definition=} [definition] While creating a new instance of ItemGroup, one can provide the
     * initial configuration of the item group with the requests it contains, the authentication applied to all
     * requests, events that the requests responds to, etc.
     *
     * @example <caption>Add a new ItemGroup to a collection instance</caption>
     * var Collection = require('postman-collection').Collection,
     *     ItemGroup = require('postman-collection').ItemGroup,
     *     myCollection;
     *
     * myCollection = new Collection(); // create an empty collection
     * myCollection.add(new ItemGroup({ // add a folder called "blank folder"
     *     "name": "This is a blank folder"
     * }));
     */
    ItemGroup = function PostmanItemGroup (definition) {
        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        ItemGroup.super_.apply(this, arguments);

        _.mergeDefined(this, /** @lends ItemGroup.prototype */ {
            /**
             * This is a {@link PropertyList} that holds the list of {@link Item}s or {@link ItemGroup}s belonging to a
             * {@link Collection} or to an {@link ItemGroup}. Operation on an individual item in this list can be
             * performed using various functions available to a {@link PropertyList}.
             *
             * @type {PropertyList<(Item|ItemGroup)>}
             *
             * @example <caption>Fetch empty ItemGroups in a list loaded from a file</caption>
             * var fs = require('fs'), // needed to read JSON file from disk
             *     Collection = require('postman-collection').Collection,
             *     myCollection,
             *     emptyGroups;

             * // Load a collection to memory from a JSON file on disk (say, sample-collection.json)
             * myCollection = new Collection(JSON.stringify(fs.readFileSync('sample-collection.json').toString()));
             *
             * // Filter items in Collection root that is an empty ItemGroup
             * emptyGroups = myCollection.items.filter(function (item) {
             *     return item && item.items && (item.items.count() === 0);
             * });
             *
             * // Log the emptyGroups array to check it's contents
             * console.log(emptyGroups);
             */
            items: new PropertyList(ItemGroup._createNewGroupOrItem, this, definition && definition.item),

            /**
             * One can define the default authentication method required for every item that belongs to this list.
             * Individual {@link Request}s can override this in their own definitions. More on how to define an
             * authentication method is outlined in the {@link RequestAuth} property.
             *
             * @type {RequestAuth}
             *
             * @example <caption>Define an entire ItemGroup (folder) or Collection to follow Basic Auth</caption>
             * var fs = require('fs'),
             *     Collection = require('postman-collection').Collection,
             *     RequestAuth = require('postman-collection').RequestAuth,
             *     mycollection;
             *
             * // Create a collection having two requests
             * myCollection = new Collection();
             * myCollection.items.add([
             *     { name: 'GET Request', request: 'https://postman-echo.com/get?auth=basic' },
             *     { name: 'PUT Request', request: 'https://postman-echo.com/put?auth=basic' }
             * ]);
             *
             * // Add basic auth to the Collection, to be applied on all requests.
             * myCollection.auth = new RequestAuth({
             *     type: 'basic',
             *     username: 'postman',
             *     password: 'password'
             * });
             */
            auth: _.createDefined(definition, 'auth', RequestAuth),

            /**
             * In this list, one can define the {@link Script}s to be executed when an event is triggered. Events are
             * triggered before certain actions are taken on a Collection, Request, etc. For example, executing a
             * request causes the `prerequest` and the `test` events to be triggered.
             *
             * @type {EventList}
             * @memberOf Collection.prototype
             *
             * @example <caption>Executing a common test script for all requests in a collection</caption>
             * var fs = require('fs'), // needed to read JSON file from disk
             *     Collection = require('postman-collection').Collection,
             *     myCollection;
             *
             * // Load a collection to memory from a JSON file on disk (say, sample-collection.json)
             * myCollection = new Collection(JSON.stringify(fs.readFileSync('sample-collection.json').toString()));
             *
             * // Add an event listener to the collection that listens to the `test` event.
             * myCollection.events.add({
             *     listen: 'test',
             *     script: {
             *         exec: 'tests["Status code is 200"] = (responseCode.code === 200)'
             *     }
             * });
             */
            events: new EventList(this, definition && definition.event)
        });
    }), Property);

_.assign(ItemGroup.prototype, /** @lends ItemGroup.prototype */ {
    /**
     * Defines that this property requires an ID field
     * @private
     * @readonly
     */
    _postman_requiresId: true,

    /**
     * Calls the callback for each item belonging to itself. If any ItemGroups are encountered,
     * they will call the callback on their own Items.
     * @private
     *
     * @param {Function} callback
     */
    forEachItem: function forEachItem (callback) {
        this.items.each(function (item) {
            return ItemGroup.isItemGroup(item) ? item.forEachItem(callback) : callback(item, this);
        }, this);
    },

    /**
     * Calls the callback for each itemgroup belonging to itself. All ItemGroups encountered will also,
     * call the callback on their own ItemGroups.
     * @private
     *
     * @param {Function} callback
     */
    forEachItemGroup: function forEachItemGroup (callback) {
        this.items.each(function (item) {
            if (ItemGroup.isItemGroup(item)) {
                item.forEachItemGroup(callback);
                callback(item, this);
            }
        }, this);
    },

    /**
     * Finds the first item with the given name or id in the current ItemGroup.
     *
     * @param {String} idOrName
     */
    oneDeep: function (idOrName) {
        if (!_.isString(idOrName)) { return; }

        var item;

        this.items.each(function (eachItem) {
            if (eachItem.id === idOrName || eachItem.name === idOrName) {
                item = eachItem;
                return false; // we found something, so bail out of the for loop.
            }

            if (ItemGroup.isItemGroup(eachItem)) {
                item = eachItem.oneDeep(idOrName);
                return !item; // bail out of the for loop if we found anything
            }
        });

        return item;
    }
});

_.assign(ItemGroup, /** @lends ItemGroup */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'ItemGroup',

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
        if (Item.isItem(item) || ItemGroup.isItemGroup(item)) { return item; }

        return item && item.item ? new ItemGroup(item) : new Item(item);
    },

    /**
     * Check whether an object is an instance of {@link ItemGroup}.
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isItemGroup: function (obj) {
        return Boolean(obj) && ((obj instanceof ItemGroup) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', ItemGroup._postman_propertyName));
    }
});

module.exports = {
    ItemGroup: ItemGroup
};
