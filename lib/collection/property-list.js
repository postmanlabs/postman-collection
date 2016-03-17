var _ = require('../util').lodash,
    PropertyBase = require('./property-base').PropertyBase,

    __PARENT = '__parent',
    DEFAULT_INDEX_ATTR = 'id',

    PropertyList;

_.inherit((
    /**
     * @constructor
     *
     * @todo
     * - document stuff
     */
    PropertyList = function PostmanPropertyList (type, parent, populate, options) {
        _.assignLocked(this, __PARENT, parent); // save reference to parent
        _.extend(this, /** @lends PropertyList.prototype */ {
            /**
             * @private
             * @type {Array}
             */
            members: this.members || [],
            /**
             * @private
             * @type {Object}
             */
            reference: this.reference || {},
            /**
             * @private
             * @type {function}
             */
            Type: type,
            /**
             * Holds holds the attribute to index this PropertyList by. Default: 'id'
             *
             * @private
             * @type {function}
             */
            indexBy: (options && options.indexBy) || DEFAULT_INDEX_ATTR
        });

        // prepopulate
        populate && this.populate(populate);
    }), PropertyBase);

_.extend(PropertyList.prototype, /** @lends PropertyList.prototype */ {

    /**
     * Indicates that this element contains a number of other elements.
     * @private
     */
    _postman_isGroup: true,

    /**
     * Insert an element at the end of this list. When a reference member specified via second parameter is found, the
     * member is inserted at an index before the reference member.
     *
     * @param {PropertyList.Type} item
     * @param {PropertyList.Type|String} [before]
     */
    insert: function (item, before) {
        if (!_.isObject(item)) { return; } // do not proceed on empty param

        var duplicate = this.indexOf(item);

        // remove from previous list
        PropertyList.isPropertyList(item[__PARENT]) && (item[__PARENT] !== this) && item[__PARENT].remove(item);
        // inject the parent reference
        _.assignHidden(item, __PARENT, this);

        // ensure that we do not double insert things into member array
        (duplicate > -1) && this.members.splice(duplicate, 1);
        // find the position of the reference element
        before && (before = this.indexOf(before));

        // inject to the members array ata position or at the end in case no item is there for reference
        (before > -1) ? this.members.splice(before, 0, item) : this.members.push(item);
        item[this.indexBy] && (this.reference[item[this.indexBy]] = item); // store reference by id
    },

    /**
     * Insert an element at the end of this list. When a reference member specified via second parameter is found, the
     * member is inserted at an index after the reference member.
     *
     * @param {PropertyList.Type} item
     * @param {PropertyList.Type|String} [after]
     */
    insertAfter: function (item, after) {
        // convert item to positional reference
        return this.insert(item, this.idx(this.indexOf(after) + 1));
    },

    /**
     * Adds or moves an item to the end of this list
     * @param {PropertyList.Type} item
     */
    append: function (item) {
        return this.insert(item);
    },

    /**
     * Adds or moves an item to the beginning of this list
     * @param {PropertyList.Type} item
     */
    prepend: function (item) {
        return this.insert(item, this.idx(0));
    },

    /**
     * Add an item or item definition to this list
     * @param {Object|PropertyList.Type} item
     *
     * @todo
     * - remove item from original parent if already it has a parent
     * - validate that the original parent's constructor matches this parent's constructor
     */
    add: function (item) {
        if (!item) { return; } // do not proceed on empty param
        // create new instance of the item based on the type specified if it is not already
        this.insert((item.constructor === this.Type) ? item : new this.Type(item));
    },

    /**
     * Removes all elements from the PropertyList for which the predicate returns truthy.
     * @param predicate {Function|String|Type}
     * @param context {Object} Optional context to bind the predicate to.
     */
    remove: function (predicate, context) {
        var match; // to be used if predicate is an ID

        !context && (context = this);
        // if predicate is id, then create a function to remove that from array
        if (_.isString(predicate) && this.reference[predicate]) {
            match = predicate;
            predicate = function (item) {
                return item && (item[this.indexBy] === match);
            };
        }
        // in case an object reference is sent, prepare it for removal
        else if (predicate instanceof this.Type) {
            match = predicate;
            predicate = function (item) {
                return (item === match);
            };
        }

        _.isFunction(predicate) && _.remove(this.members, function (item) {
            if (predicate.apply(context, arguments)) {
                (this.reference[item[this.indexBy]] === item) &&
                (delete this.reference[item[this.indexBy]]); // delete id reference
                delete item[__PARENT]; // unlink from its parent
                return true;
            }
        }, this);
    },

    /**
     * Load one or more items
     *
     * @param {Object|Array} items
     */
    populate: function (items) {
        // if Type supports parsing of string headers then do it before adding it.
        _.isString(items) && _.isFunction(this.Type.parse) && (items = this.Type.parse(items));
        // add a single item or an array of items.
        _.each(_.isArray(items) ? items : [items], this.add, this);
    },

    /**
     * Removes all items in the list
     */
    clear: function () {
        this.each(this.remove.bind(this));
    },

    /**
     * Returns a map of all items
     * @returns {Object}
     */
    all: function () {
        return _.clone(this.members);
    },

    /**
     * Get Item in this list by `ID` reference
     *
     * @param {String} id
     * @returns {PropertyList.Type}
     */
    one: function (id) {
        return this.reference[id];
    },

    /**
     * Iterate on each item of this list
     */
    each: function (iterator, context) {
        _.each(this.members, iterator, context || this.__parent);
    },

    /**
     * @param {Function} rule
     */
    filter: function (rule, context) {
        return _.filter(this.members, rule, context);
    },

    /**
     * Iterates over the property list.
     *
     * @param iterator {Function} Function to call on each item.
     * @param context Optional context, defaults to the PropertyList itself.
     */
    map: function (iterator, context) {
        !context && (context = this);
        return _.map(this.members, iterator, context);
    },

    /**
     * Returns the length of the PropertyList
     *
     * @returns {Number}
     */
    count: function () {
        return this.members.length;
    },

    /**
     * Get a member of this list by it's index
     *
     * @param {Number} index
     * @returns {PropertyList.Type}
     */
    idx: function (index) {
        return this.members[index];
    },

    /**
     * Find the index of an item in this list
     *
     * @param {String|Object} item
     * @returns {Number}
     */
    indexOf: function (item) {
        return this.members.indexOf(_.isString(item) ? (item = this.one(item)) : item);
    },

    /**
     * Check whether an item exists in this list
     *
     * @param {String|PropertyList.Type} item
     * @returns {Boolean}
     */
    has: function (item) {
        return !!( _.isString(item) ? this.one(item) : this.filter(function (member) {
            return member === item;
        }).length);
    },

    /**
     * Iterates over all parents of the property list
     *
     * @param {Function} iterator
     * @param {Object=} [context]
     */
    eachParent: function (iterator, context) {
        // validate parameters
        if (!_.isFunction(iterator)) { return; }
        !context && (context = this);

        var parent = this.__parent,
            prev;

        // iterate till there is no parent
        while (parent) {
            // call iterator with the parent and previous parent
            iterator.call(context, parent, prev);

            // update references
            prev = parent;
            parent = parent.__parent;
        }
    },

    toJSON: function () {
        if (!this.count()) {
            return;
        }

        return _.map(this.members, function (member) {
            return _.reduce(member, function (accumulator, value, key) {
                if (value === undefined) { // true/false/null need to be preserved.
                    return accumulator;
                }

                // Handle plurality of PropertyLists in the SDK vs the exported JSON.
                // Basically, removes the trailing "s" from key if the value is a property list.
                if (value && value._postman_isGroup && _.endsWith(key, 's')) {
                    key = key.slice(0, -1);
                }

                // Handle 'PropertyBase's
                if (value && _.isFunction(value.toJSON)) {
                    accumulator[key] = value.toJSON();
                    return accumulator;
                }

                // Handle Strings
                if (_.isString(value)) {
                    accumulator[key] = value;
                    return accumulator;
                }

                // Everything else
                accumulator[key] = _.cloneElement(value);
                return accumulator;
            }, {});
        });
    }
});

_.extend(PropertyList, /** @lends PropertyList */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'PropertyList',
    /**
     * Checks whether an object is a PropertyList
     *
     * @param {*} obj
     * @returns {Boolean}
     */
    isPropertyList: function (obj) {
        return obj && ((obj instanceof PropertyList) ||
            _.inSuperChain(obj.constructor, '_postman_propertyName', PropertyList._postman_propertyName));
    }
});

module.exports = {
    PropertyList: PropertyList
};
