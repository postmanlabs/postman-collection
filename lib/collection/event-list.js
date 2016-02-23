var _ = require('../util').lodash,
    PropertyList = require('./property-list').PropertyList,
    Event = require('./event').Event,

    EventList;

_.inherit((
    EventList = function PostmanEventList (parent, populate) {
        // this constructor is intended to inherit and as such the super constructor is required to be executed
        EventList.super_.call(this, Event, parent, populate);
    }), PropertyList);

_.extend(EventList.prototype, /** @lends EventList.prototype */ {
    /**
     * Returns an array of listeners filtered by the listener name
     *
     * @param {String} name
     * @returns {Array<event>}
     */
    listeners: function (name) {
        var all;

        // we first procure all matching events from this list
        all = this.listenersOwn(name);

        this.eachParent(function (parent) {
            var parentEvents;

            // we check that the parent is not immediate mother. then we check whether the non immediate mother has a
            // valid `events` store and only if this store has events with specified listener, we push them to the
            // array we are compiling for return
            (parent !== this.__parent) && EventList.isEventList(parent.events) &&
                (parentEvents = parent.events.listenersOwn(name)) && parentEvents.length &&
                all.push.apply(all, parentEvents);
        }, this);

        return all;
    },

    /**
     * Returns all events with specific listeners only within this list. Refer to {@link EventList#listeners} for
     * procuring all inherited events
     *
     * @param {string} name
     * @returns {Event}
     */
    listenersOwn: function (name) {
        return this.filter(function (event) {
            return (event.listen === name);
        });
    }
});

_.extend(EventList, /** @lends EventList */ {
    isEventList: function (obj) {
        return obj instanceof EventList;
    }
});

module.exports = {
    EventList: EventList
};
