var _ = require('../util').lodash,
    Property = require('./property').Property,
    Url = require('./url').Url,

    Script;

_.inherit((
    /**
     * Postman scripts that are executed upon events on a collection  / request such as test and pre request
     * @constructor
     * @extends {Property}
     *
     * @param {Object} options
     */
    Script = function PostmanScript (options) {
        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        Script.super_.apply(this, arguments);
        if (!options) { return; } // in case definition object is missing, there is no point moving forward

        // create the request property
        /**
         * @augments {Script.prototype}
         * @type {string}
         */
        this.type = options.type || 'text/javascript';
        options.hasOwnProperty('src') && (
            /**
             * @augments {Script.prototype}
             * @type {Url}
             */
            this.src = new Url(options.src)
        );

        if (!this.src && options.hasOwnProperty('exec')) {
            /**
             * @augments {Script.prototype}
             * @type {Array<string>}
             */
            this.exec = _.isString(options.exec) && options.exec.split(/\r?\n/g) || _.isArray(options.exec) &&
                options.exec || undefined;
        }
    }), Property);

_.extend(Script.prototype, /** @lends Script.prototype */ {
    /**
     * Converts the script lines array to a single source string
     * @returns {String}
     */
    toSource: function () {
        return this.exec ? this.exec.join('\n') : undefined;
    }
});

_.extend(Script, /** @lends Script */ {
    /**
     * Defines the name of this property for internal use.
     * @private
     * @readOnly
     * @type {String}
     */
    _postman_propertyName: 'Script'
});

module.exports = {
    Script: Script
};
