var _ = require('../util').lodash,
    Property = require('./property').Property,
    Script = require('./script').Script,

    Event;

/**
 * @typedef Event~definition
 * @property {String} listen
 * @property {Script} script
 */
_.inherit((
    /**
     * A Postman event definition that refers to an event to be listened to and a script reference or definition to be
     * executed.
     * @constructor
     * @extends {Property}
     *
     * @param {Event~definition} definition Pass the initial definition of the event (name, id, listener name, etc) as
     * the options parameter.
     */
    Event = function PostmanEvent (definition) {
        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        Event.super_.call(this, definition);
        // set initial values of this event
        definition && this.update(definition);
    }), Property);

_.extend(Event.prototype, /** @lends Event.prototype */ {
    /**
     * Update an event
     * @param {Event~definition} options
     */
    update: function (definition) {
        if (!definition) {
            return;
        }

        _.merge(this, /** @lends Event.prototype */ {
            /**
             * Name of the event that this instance is intended to listen to.
             * @type {String}
             */
            listen: _.isString(definition.listen) ? definition.listen.toLowerCase() : undefined,
            /**
             * The script that is to be executed when this event is triggered.
             * @type {Script}
             */
            script: _.isString(definition.script) ? definition.script : new Script(definition.script)
        });
    }
});

_.extend(Event, /** @lends Event */ {

    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'Event'
});

module.exports = {
    Event: Event
};
