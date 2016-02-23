var _ = require('../util').lodash,
    Property = require('./property').Property,
    Script = require('./script').Script,

    Event;

_.inherit((
    /**
     * A Postman event definition that refers to an event to be listened to and a script reference or definition to be
     * executed.
     * @constructor
     * @extends {Property}
     *
     * @param {Object} options Pass the initial definition of the event (name, id, listener name, etc) as the
     * options parameter.
     * @param {String=} [listen] - optional parameter to override the event name to be listened to (handy when creating
     * an event from an array map iterator.)
     */
    Event = function PostmanEvent (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        Event.super_.call(this, options);
        if (!options) { return; } // in case definition object is missing, there is no point moving forward

        // @todo: error if no name?
        _.merge(this, /** @lends Event.prototype */ {
            /**
             * Name of the event that this instance is intended to listen to.
             * @type {String}
             */
            listen: _.isString(options.listen) ? options.listen.toLowerCase() : undefined,
            /**
             * The script that is to be executed when this event is triggered.
             * @type {Script}
             */
            script: _.isString(options.script) ? options.script : new Script(options.script),
            /**
             * A flag for events that can be disabled when put within a list
             * @type {Boolean}
             */
            disabled: (options && _.has(options, 'disabled')) ? !!options.disabled : undefined
        });
    }), Property);

_.extend(Event.prototype, /** @lends Event.prototype */ {

    /**
     * Converts the event to its plain JSON representation.
     */
    toJSON: function () {
        var json = {
            listen: this.listen,
            script: _.isString(this.script) ? this.script : this.script.toJSON()
        };
        _.has(this, 'disabled') && (json.disabled = this.disabled);

        return json;
    }
});

module.exports = {
    Event: Event
};
